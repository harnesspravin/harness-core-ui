import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { shouldShowError, useToaster } from '@harness/uicore'

import { useMutateAsGet } from '@common/hooks'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlParse } from '@common/utils/YamlHelperMethods'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { ServiceDefinition, useGetInfrastructureList, useGetInfrastructureYamlAndRuntimeInputs } from 'services/cd-ng'

import type { InfrastructureData, InfrastructureYaml } from '../types'

export interface UseGetInfrastructuresDataProps {
  environmentIdentifier: string
  infrastructureIdentifiers: string[]
  deploymentType: ServiceDefinition['type']
}

export interface UseGetInfrastructuresDataReturn {
  infrastructuresList: InfrastructureYaml[]
  infrastructuresData: InfrastructureData[]
  loadingInfrastructuresList: boolean
  loadingInfrastructuresData: boolean
  updatingInfrastructuresData: boolean
  refetchInfrastructuresList(): void
  refetchInfrastructuresData(): void
}

export function useGetInfrastructuresData({
  environmentIdentifier,
  infrastructureIdentifiers,
  deploymentType
}: UseGetInfrastructuresDataProps): UseGetInfrastructuresDataReturn {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  // State
  const [infrastructuresList, setInfrastructuresList] = useState<InfrastructureYaml[]>([])
  const [infrastructuresData, setInfrastructuresData] = useState<InfrastructureData[]>([])

  const {
    data: infrastructuresListResponse,
    error: infrastructuresListError,
    loading: loadingInfrastructuresList,
    refetch: refetchInfrastructuresList
  } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier,
      deploymentType
    }
  })

  const {
    data: infrastructuresDataResponse,
    error: infrastructuresDataError,
    initLoading: loadingInfrastructuresData,
    loading: updatingInfrastructuresData,
    refetch: refetchInfrastructuresData
  } = useMutateAsGet(useGetInfrastructureYamlAndRuntimeInputs, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    },
    body: { infrastructureIdentifiers },
    lazy: infrastructureIdentifiers.length === 0
  })

  const loading = loadingInfrastructuresList || loadingInfrastructuresData

  useEffect(() => {
    if (!loading) {
      let _infrastructuresList: InfrastructureYaml[] = []
      let _infrastructuresData: InfrastructureData[] = []

      /* istanbul ignore else */
      if (infrastructuresListResponse?.data?.content?.length) {
        _infrastructuresList = infrastructuresListResponse.data.content.map(
          infrastructureResponse =>
            ({
              name: defaultTo(infrastructureResponse.infrastructure?.name, ''),
              identifier: defaultTo(infrastructureResponse.infrastructure?.identifier, ''),
              description: infrastructureResponse.infrastructure?.description,
              tags: infrastructureResponse.infrastructure?.tags

              // TODO: Remove this any when you have a clearly defined type for infrastructure
            } as any)
        )
      }

      const yamlMetadataList = infrastructuresDataResponse?.data?.infrastructureYamlMetadataList
      /* istanbul ignore else */
      if (yamlMetadataList?.length) {
        _infrastructuresData = yamlMetadataList.map(row => {
          const infrastructureYaml = defaultTo(row.infrastructureYaml, '{}')
          const infrastructureDefinition =
            yamlParse<Pick<InfrastructureData, 'infrastructureDefinition'>>(infrastructureYaml).infrastructureDefinition
          infrastructureDefinition.yaml = infrastructureYaml
          const infrastructureInputs = yamlParse<Pick<InfrastructureData, 'infrastructureInputs'>>(
            defaultTo(row.inputSetTemplateYaml, '{}')
          ).infrastructureInputs

          /* istanbul ignore else */
          if (infrastructureDefinition) {
            const existsInList = _infrastructuresList.find(
              infrastructureInList => infrastructureInList.identifier === row.infrastructureIdentifier
            )

            if (!existsInList) {
              _infrastructuresList.unshift(infrastructureDefinition)
            }
          }

          return { infrastructureDefinition, infrastructureInputs }
        })
      }

      setInfrastructuresList(_infrastructuresList)
      setInfrastructuresData(_infrastructuresData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, infrastructuresListResponse?.data, infrastructuresDataResponse?.data?.infrastructureYamlMetadataList])

  useEffect(() => {
    /* istanbul ignore else */
    if (infrastructuresListError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(infrastructuresListError)) {
        showError(getRBACErrorMessage(infrastructuresListError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresListError])

  useEffect(() => {
    /* istanbul ignore else */
    if (infrastructuresDataError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(infrastructuresDataError)) {
        showError(getRBACErrorMessage(infrastructuresDataError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infrastructuresDataError])

  return {
    infrastructuresList,
    infrastructuresData,
    loadingInfrastructuresList,
    loadingInfrastructuresData,
    updatingInfrastructuresData,
    refetchInfrastructuresList,
    refetchInfrastructuresData
  }
}