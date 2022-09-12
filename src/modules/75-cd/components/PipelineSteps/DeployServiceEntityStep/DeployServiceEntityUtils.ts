import { isEmpty, isNil } from 'lodash-es'
import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import type { ServiceYamlV2, ServicesMetadata, ServiceDefinition, NGServiceV2InfoConfig } from 'services/cd-ng'
import type { UseStringsReturn } from 'framework/strings'

export const ServiceRegex = /^.+stage\.spec\.service\.serviceRef$/
export const flexStart = 'flex-start'

export interface DeployServiceEntityData {
  service?: ServiceYamlV2
  services?: {
    metadata?: ServicesMetadata
    values?: ServiceYamlV2[] | string
  }
}

export interface ServiceData {
  service: NGServiceV2InfoConfig & { yaml: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceInputs?: any
}

export interface ServicesWithInputs {
  services: SelectOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceInputs: Record<string, any>
}

export interface FormState {
  services?: SelectOption[] | string
  service?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serviceInputs?: Record<string, any>
}

export interface DeployServiceEntityCustomProps {
  stageIdentifier: string
  deploymentType?: ServiceDefinition['type']
  gitOpsEnabled?: boolean
  allValues?: DeployServiceEntityData
}

export function isEditService(data: DeployServiceEntityData): boolean {
  if (data.service && !isEmpty(data.service.serviceRef)) {
    return true
  }
  return false
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema<FormState> {
  return Yup.object<FormState>()
    .test({
      name: 'service',
      test(value: FormState) {
        const message = getString('cd.pipelineSteps.serviceTab.serviceIsRequired')
        // check for service
        if (isNil(value.services) && !value.service) {
          return this.createError({ message, path: 'service' })
        }

        // check for services
        if (isNil(value.service) && !isNil(value.services)) {
          // services must have at least one row and every row must have a value defined
          if (Array.isArray(value.services)) {
            const hasValues =
              value.services.length > 0 &&
              value.services.every(row => typeof row.value === 'string' && row.value.length > 0)

            if (hasValues) {
              return true
            }
          }

          if (value.services) {
            return true
          }

          return this.createError({ message, path: 'services' })
        }

        return true
      }
    })
    .required(getString('cd.pipelineSteps.serviceTab.serviceIsRequired'))
}

export function getAllFixedServices(data: DeployServiceEntityData): string[] {
  if (data.service && getMultiTypeFromValue(data.service.serviceRef) === MultiTypeInputType.FIXED) {
    return [data.service.serviceRef as string]
  } else if (data.services && Array.isArray(data.services.values)) {
    return data.services.values.map(svc => svc.serviceRef).filter(Boolean) as string[]
  }

  return []
}

export function getAllFixedServicesFromValues(values: FormState): string[] {
  if (values.service && getMultiTypeFromValue(values.service) === MultiTypeInputType.FIXED) {
    return [values.service]
  } else if (Array.isArray(values.services)) {
    return values.services.map(opt => opt.value as string)
  }

  return []
}