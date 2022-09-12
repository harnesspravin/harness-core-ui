import React from 'react'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { get, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'

import type { FormikErrors } from 'formik'
import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { parse } from '@common/utils/YamlHelperMethods'
import { getServiceListPromise } from 'services/cd-ng'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'

import { DeployServiceEntityCustomProps, DeployServiceEntityData, ServiceRegex } from './DeployServiceEntityUtils'
import { DeployServiceEntityInputStep } from './DeployServiceEntityInputStep'
import DeployServiceEntityWidget from './DeployServiceEntityWidget'

const logger = loggerFor(ModuleName.CD)

export class DeployServiceEntityStep extends Step<DeployServiceEntityData> {
  protected type = StepType.DeployServiceEntity
  protected stepPaletteVisible = false
  protected stepName = 'Deploy Service'
  protected stepIcon: IconName = 'service'

  protected defaultValues: DeployServiceEntityData = {}
  lastFetched: number
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()
  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(ServiceRegex, this.getServiceListForYaml.bind(this))
  }

  protected async getServiceListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.serviceConfig.serviceRef', ''))
      if (obj.type === 'Deployment') {
        return getServiceListPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier
          }
        }).then(response => {
          const data =
            response?.data?.content?.map(service => ({
              label: service.service?.name || '',
              insertText: service.service?.identifier || '',
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return Promise.resolve([])
  }

  renderStep(props: StepProps<DeployServiceEntityData, DeployServiceEntityCustomProps>): React.ReactElement {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      readonly = false,
      allowableTypes,
      customStepProps
    } = props
    if (isTemplatizedView(stepViewType)) {
      return (
        <DeployServiceEntityInputStep
          initialValues={initialValues}
          readonly={readonly}
          inputSetData={inputSetData}
          allowableTypes={allowableTypes}
          {...(customStepProps as DeployServiceEntityCustomProps)}
        />
      )
    }

    return (
      <DeployServiceEntityWidget
        initialValues={initialValues}
        readonly={readonly}
        allowableTypes={allowableTypes}
        customStepProps={customStepProps}
        onUpdate={onUpdate}
        {...(customStepProps as DeployServiceEntityCustomProps)}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployServiceEntityData>): FormikErrors<DeployServiceEntityData> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.service?.serviceRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.service?.serviceRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.serviceRef = getString?.('cd.pipelineSteps.serviceTab.serviceIsRequired')
    }
    return errors
  }
}