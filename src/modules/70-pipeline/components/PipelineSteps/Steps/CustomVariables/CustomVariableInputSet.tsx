/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, MultiTypeInputType, getMultiTypeFromValue, AllowedTypes, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { cloneDeep, defaultTo, get, isEmpty } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { CustomDeploymentNGVariable } from 'services/cd-ng'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { VariableType } from './CustomVariableUtils'
import css from './CustomVariables.module.scss'
export interface CustomVariablesData {
  variables: AllNGVariables[]
  isPropagating?: boolean
  canAddVariable?: boolean
}
export interface CustomVariableInputSetExtraProps {
  variableNamePrefix?: string
  domId?: string
  template?: CustomVariablesData
  path?: string
  allValues?: CustomVariablesData
  executionIdentifier?: string
  isDescriptionEnabled?: boolean
  allowedVarialblesTypes?: VariableType[]
  isDrawerMode?: boolean
}

export interface CustomVariableInputSetProps extends CustomVariableInputSetExtraProps {
  initialValues: CustomVariablesData
  onUpdate?: (data: CustomVariablesData) => void
  stepViewType?: StepViewType
  inputSetData?: InputSetData<CustomVariablesData>
  allowableTypes: AllowedTypes
  className?: string
}

export interface ConectedCustomVariableInputSetProps extends CustomVariableInputSetProps {
  formik: FormikProps<CustomVariablesData>
}

function CustomVariableInputSetBasic(props: ConectedCustomVariableInputSetProps): React.ReactElement {
  const {
    initialValues,
    template,
    path,
    variableNamePrefix = '',
    domId,
    inputSetData,
    formik,
    allowableTypes,
    className,
    allValues,
    isDrawerMode
  } = props
  const basePath = path?.length ? `${path}.variables` : 'variables'
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const formikVariables = defaultTo(get(formik?.values, basePath), [])
  // get doesn't return defaultValue if it gets null
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  // this was necessary due to absence of YAML validations in run pipeline form. Add such logic here only when absolutely unavoidable
  React.useEffect(() => {
    const mergeTemplateBaseValues = defaultTo(cloneDeep(template?.variables), [])

    let isYamlDirty = false
    mergeTemplateBaseValues.forEach((variable, index) => {
      const isVariablePresentIndex = formikVariables.findIndex(
        (fVar: AllNGVariables) => fVar.name === variable.name && fVar.type === variable.type
      )
      if (isVariablePresentIndex !== -1) {
        mergeTemplateBaseValues[index].value = formikVariables[isVariablePresentIndex].value
      } else {
        isYamlDirty = true
      }
    })

    if (isYamlDirty) {
      // !path signifies pipeline variables path and the second term is used to check the presence of stage in pipeline YAML
      const isEntityPresent = !path || get(formik.values, defaultTo(path, ''))
      isEntityPresent && formik.setFieldValue(basePath, clearRuntimeInput(mergeTemplateBaseValues))
    }
  }, [])

  return (
    <div className={cx(css.customVariablesInputSets, 'customVariables', className)} id={domId}>
      {initialValues.variables.length > 0 && (
        <section className={css.subHeader}>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('name')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('description')}
          </Text>
          <Text font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }} color={Color.GREY_500}>
            {getString('valueLabel')}
          </Text>
        </section>
      )}
      {template?.variables?.map?.(variable => {
        // find Index from values, not from template variables
        // because the order of the variables might not be the same
        const index = formikVariables.findIndex((fVar: AllNGVariables) => variable.name === fVar.name)

        const value = defaultTo(variable.value, '')
        if (getMultiTypeFromValue(value as string) !== MultiTypeInputType.RUNTIME) {
          return
        }
        const description = get(allValues, `variables[${index}].description`, '')
        return (
          <div key={`${variable.name}${index}`} className={css.variableListTable}>
            <Layout.Vertical>
              <Text
                font={{ variation: FontVariation.SMALL_BOLD, size: 'normal' }}
                color={Color.BLACK}
              >{`${variableNamePrefix}${variable.name}`}</Text>
              <Text font={{ size: 'small' }} color={Color.GREY_600}>
                {variable.type}
              </Text>
            </Layout.Vertical>
            <Text color={Color.GREY_500} lineClamp={3} font={{ variation: FontVariation.BODY }}>
              {isEmpty(description) ? '-' : description}
            </Text>
            <div className={css.valueRow}>
              {(variable.type as CustomDeploymentNGVariable['type']) === VariableType.Connector ? (
                <FormMultiTypeConnectorField
                  name={`${basePath}[${index}].value`}
                  label=""
                  placeholder={getString('common.entityPlaceholderText')}
                  disabled={inputSetData?.readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, disabled: inputSetData?.readonly, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  setRefValue
                  connectorLabelClass="connectorVariableField"
                  enableConfigureOptions={false}
                  isDrawerMode={isDrawerMode}
                  type={[]}
                />
              ) : variable.type === VariableType.Secret ? (
                <MultiTypeSecretInput
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  name={`${basePath}[${index}].value`}
                  disabled={inputSetData?.readonly}
                  label=""
                  templateProps={{
                    isTemplatizedView: true,
                    templateValue: get(template, `variables[${index}].value`)
                  }}
                />
              ) : (
                <>
                  <TextFieldInputSetView
                    className="variableInput"
                    name={`${basePath}[${index}].value`}
                    multiTextInputProps={{
                      textProps: { type: variable.type === 'Number' ? 'number' : 'text' },
                      allowableTypes,
                      expressions,
                      defaultValueToReset: ''
                    }}
                    label=""
                    disabled={inputSetData?.readonly}
                    template={template}
                    fieldPath={`variables[${index}].value`}
                    variableNamePath={`${basePath}[${index}].name`}
                  />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
const CustomVariableInputSet = connect<CustomVariableInputSetProps, CustomVariablesData>(CustomVariableInputSetBasic)

export { CustomVariableInputSet }
