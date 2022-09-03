/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormInput, FormikForm, Text, Color } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isValueRuntimeInput } from '@common/utils/utils'

import type { AzureBlueprintProps } from '../AzureBlueprintTypes.types'
import { TemplateInputStep } from './TemplateInput'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const InputStepRef = (props: AzureBlueprintProps & { formik?: FormikContextType<any> }): JSX.Element => {
  const { inputSetData, readonly, path, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  return (
    <FormikForm>
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSetData?.template?.timeout as string) && (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeDurationField
              label={getString('pipelineSteps.timeoutLabel')}
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
              disabled={readonly}
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                allowableTypes,
                expressions,
                disabled: readonly
              }}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSetData?.template?.spec?.provisionerIdentifier as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.provisionerIdentifier`}
              label={getString('pipelineSteps.provisionerIdentifier')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              data-testid={`${path}.spec.provisionerIdentifier`}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSetData?.template?.spec?.configuration?.connectorRef as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormMultiTypeConnectorField
              label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
              type={Connectors.AWS}
              name={`${path}.spec.configuration.connectorRef`}
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              style={{ marginBottom: 10 }}
              multiTypeProps={{ expressions, allowableTypes }}
              disabled={readonly}
              width={300}
              setRefValue
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isValueRuntimeInput(inputSetData?.template?.spec?.configuration?.assignmentName as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              name={`${path}.spec.configuration.assignmentName`}
              label={getString('cd.azureBlueprint.assignmentName')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              data-testid={`${path}.spec.configuration.assignmentName`}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        inputSetData?.template?.spec?.configuration?.template && <TemplateInputStep {...props} />
      }
    </FormikForm>
  )
}

const AzureBlueprintInputStep = connect(InputStepRef)
export default AzureBlueprintInputStep