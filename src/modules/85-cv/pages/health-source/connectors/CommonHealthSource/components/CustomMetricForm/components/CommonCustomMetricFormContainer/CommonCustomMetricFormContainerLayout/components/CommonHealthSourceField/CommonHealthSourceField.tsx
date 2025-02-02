import React, { useContext, useEffect, useState } from 'react'
import { FormInput, MultiTypeInputType, SelectOption, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { HealthSourceParamValuesRequest, useGetParamValues } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'

export interface CommonHealthSourceFieldProps {
  field: FieldMapping
  isConnectorRuntimeOrExpression?: boolean
  connectorIdentifier: string
  providerType: HealthSourceParamValuesRequest['providerType']
}

export default function CommonHealthSourceField(props: CommonHealthSourceFieldProps): JSX.Element {
  const { field, isConnectorRuntimeOrExpression, connectorIdentifier, providerType } = props
  const { isTemplate, expressions } = useContext(SetupSourceTabsContext)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [listOptions, setListOptions] = useState<SelectOption[]>([])
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { label, identifier, placeholder, type, isTemplateSupportEnabled } = field
  const shouldShowTemplatisedComponent = isTemplate && isTemplateSupportEnabled
  const shouldFetchDropdownOptions = !(isTemplate && isTemplateSupportEnabled && isConnectorRuntimeOrExpression)

  const { mutate: fetchParamValues, loading } = useGetParamValues({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const fetchParamValuesData = async (): Promise<void> => {
    const requestBody = {
      connectorIdentifier,
      providerType,
      paramName: identifier
    }
    try {
      const data = await fetchParamValues(requestBody)
      const paramValues = data?.resource?.paramValues || []
      const listOptionsData = paramValues.map(el => {
        return {
          label: el?.name as string,
          value: el?.value as string
        }
      })
      setListOptions(listOptionsData)
    } catch (errorData) {
      showError(getErrorMessage(errorData) as string)
    }
  }

  useEffect(() => {
    if (type === FIELD_ENUM.DROPDOWN && shouldFetchDropdownOptions) {
      fetchParamValuesData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchDropdownOptions, type])

  const renderField = (): JSX.Element => {
    switch (type) {
      case FIELD_ENUM.DROPDOWN:
        return (
          <>
            {shouldShowTemplatisedComponent ? (
              <FormInput.MultiTypeInput
                label={label}
                useValue
                name={identifier}
                selectItems={listOptions}
                data-testid={identifier}
                multiTypeInputProps={{
                  expressions,
                  allowableTypes: isConnectorRuntimeOrExpression
                    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            ) : (
              <FormInput.Select
                label={label}
                name={identifier}
                disabled={loading}
                placeholder={loading ? getString('loading') : placeholder}
                items={listOptions}
                data-testid={identifier}
              />
            )}
          </>
        )
      default:
        return <></>
    }
  }

  return <>{renderField()}</>
}
