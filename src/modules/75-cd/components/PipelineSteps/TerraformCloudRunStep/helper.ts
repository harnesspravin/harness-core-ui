/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup'
import { flatMap, isEmpty, omit } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import type { ListType } from '@common/components/List/List'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getConnectorSchema } from '../PipelineStepsUtil'
import type { TerraformCloudRunData, TerraformCloudRunFormData } from './types'

export const runTypeLabel = 'pipeline.terraformStep.runTypeLabel'
export const organizationLabel = 'orgLabel'
export const workspaceLabel = 'pipeline.terraformStep.workspaceName'
export const errorMessage = 'data.message'

export const getValue = (item: { label?: string; value?: string } | string | any): string => {
  return typeof item === 'string' ? (item as string) : item?.value
}

const getEntries = function <T>(object: T, prefix = ''): Array<any> {
  return flatMap(Object.entries(object), ([k, v]: { k: string; v: any }[]) =>
    Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}

export function getSanitizedflatObjectForVariablesView(object: Record<string, any>): Record<string, unknown> {
  // Omits 'name' , 'identifier' and 'timeout' values to avoid redundancy since they are already taken care of.
  const sanitizedObject = omit(object, ['name', 'timeout', 'identifier'])
  return getEntries(sanitizedObject).reduce((o, k) => ((o[k[0]] = k[1]), o), {})
}

export enum RunTypes {
  RefreshState = 'RefreshState',
  PlanOnly = 'PlanOnly',
  PlanAndApply = 'PlanAndApply',
  PlanAndDestroy = 'PlanAndDestroy',
  Plan = 'Plan',
  Apply = 'Apply'
}

export const variableTypes: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' },
  { label: 'Secret', value: 'Secret' }
]

export const processFormData = (values: TerraformCloudRunFormData): TerraformCloudRunData => {
  const targets = values.spec?.spec?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }
  return {
    ...values,
    spec: {
      ...values.spec,
      spec: {
        ...values.spec.spec,
        organization: getValue(values.spec?.spec?.organization),
        workspace: getValue(values.spec?.spec?.workspace),
        variables: Array.isArray(values.spec?.spec?.variables)
          ? values.spec?.spec?.variables.filter(variable => variable.value).map(({ id, ...variable }) => variable)
          : undefined,
        targets: targetMap
      }
    }
  }
}

export const processInitialValues = (values: TerraformCloudRunData): TerraformCloudRunFormData => {
  return {
    ...values,
    spec: {
      ...values.spec,
      spec: {
        ...values.spec.spec,
        organization:
          values.spec?.spec?.organization &&
          getMultiTypeFromValue(values.spec?.spec?.organization) === MultiTypeInputType.FIXED
            ? {
                label: values.spec?.spec?.organization.toString(),
                value: values.spec?.spec?.organization.toString()
              }
            : values.spec?.spec?.organization,
        workspace:
          values.spec?.spec?.workspace &&
          getMultiTypeFromValue(values.spec?.spec?.workspace) === MultiTypeInputType.FIXED
            ? {
                label: values.spec?.spec?.workspace.toString(),
                value: values.spec?.spec?.workspace.toString()
              }
            : values.spec?.spec?.workspace,
        variables: Array.isArray(values.spec?.spec?.variables)
          ? values.spec?.spec?.variables.map((variable: any) => ({
              ...variable,
              id: uuid()
            }))
          : [],
        targets: !(getMultiTypeFromValue(values.spec?.spec?.targets as string) === MultiTypeInputType.RUNTIME)
          ? Array.isArray(values.spec?.spec?.targets)
            ? (values.spec?.spec?.targets as string[]).map((target: string) => ({
                value: target,
                id: uuid()
              }))
            : [{ value: '', id: uuid() }]
          : values.spec?.spec?.targets
      }
    }
  }
}

const variableSchema = (
  getString: UseStringsReturn['getString']
): Yup.NotRequiredArraySchema<
  | {
      name: string
      value: string
      type: string
    }
  | undefined
> =>
  Yup.array().of(
    Yup.object({
      name: Yup.string().required(getString('common.validation.nameIsRequired')),
      value: Yup.string().required(getString('common.validation.valueIsRequired')),
      type: Yup.string().trim().required(getString('common.validation.typeIsRequired'))
    })
  )

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  stepViewType?: StepViewType
): Yup.ObjectSchema {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      runType: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString(runTypeLabel) })),
      spec: Yup.object()
        .when('runType', {
          is: val => !isEmpty(val),
          then: Yup.object().shape({
            connectorRef: getConnectorSchema(getString),
            organization: Yup.lazy((value): Yup.Schema<unknown> => {
              /* istanbul ignore next */ if (typeof value === 'string') {
                return Yup.string().required(
                  getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
                )
              }
              /* istanbul ignore next */ return Yup.object().test({
                test(valueObj: SelectOption): boolean | Yup.ValidationError {
                  if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
                    return this.createError({
                      message: getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
                    })
                  }
                  return true
                }
              })
            }),
            workspace: Yup.lazy((value): Yup.Schema<unknown> => {
              /* istanbul ignore next */ if (typeof value === 'string') {
                return Yup.string().required(
                  getString('common.validation.fieldIsRequired', { name: getString(workspaceLabel) })
                )
              }
              /* istanbul ignore next */ return Yup.object().test({
                test(valueObj: SelectOption): boolean | Yup.ValidationError {
                  if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
                    return this.createError({
                      message: getString('common.validation.fieldIsRequired', { name: getString(workspaceLabel) })
                    })
                  }
                  return true
                }
              })
            })
          })
        })
        .when('runType', {
          is: val => val !== RunTypes.RefreshState,
          then: Yup.object().shape({
            provisionerIdentifier: Yup.string().when('runType', {
              is: value => value !== 'Refresh',
              then: Yup.lazy((value): Yup.Schema<unknown> => {
                if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                  return IdentifierSchemaWithOutName(getString, {
                    requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
                    regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
                  })
                }
                /* istanbul ignore next */ return Yup.string().required(
                  getString('common.validation.provisionerIdentifierIsRequired')
                )
              })
            })
          })
        })
        .when('runType', {
          is: val => val === RunTypes.PlanOnly,
          then: Yup.object().shape({
            terraformVersion: Yup.string().when('runType', {
              is: value => value !== 'Refresh',
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('pipeline.terraformStep.terraformVersion')
                })
              )
            })
          })
        })
        .when('runType', {
          is: val => val === RunTypes.PlanOnly || val === RunTypes.Plan,
          then: Yup.object().shape({
            planType: Yup.mixed().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('commandLabel')
              })
            )
          })
        }),
      variables: variableSchema(getString)
    })
  })
}
