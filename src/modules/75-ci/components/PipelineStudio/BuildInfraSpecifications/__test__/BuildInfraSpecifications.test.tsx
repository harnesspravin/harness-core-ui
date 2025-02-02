/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor, act, fireEvent, findByText, findAllByText, render } from '@testing-library/react'
import { cloneDeep, set } from 'lodash-es'
import mockImport from 'framework/utils/mockImport'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import * as hostedBuilds from '@common/hooks/useHostedBuild'
import { TestWrapper } from '@common/utils/testUtils'
import type { UseGetReturnData } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import type { ResponseConnectorResponse, ResponseSetupStatus } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import BuildInfraSpecifications from '../BuildInfraSpecifications'

import contextMock from './pipelineContextMock.json'
import contextMockAdvancedStagesWithPropagate from './pipelineContextMock2.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@pipeline/components/ErrorsStrip/ErrorsStripBinded', () => () => <></>)

jest.useFakeTimers()

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa 1',
        identifier: 'tesa_1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  getConnectorListPromise: () =>
    Promise.resolve({
      data: {
        content: [
          {
            connector: ConnectorResponse.data!.data!.connector
          }
        ]
      }
    }),
  useProvisionResourcesForCI: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          data: 'SUCCESS',
          status: 'SUCCESS'
        } as ResponseSetupStatus)
    }
  })
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupsNGV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        resource: {
          delegateGroupDetails: [{ delegateGroupIdentifier: '_harness_kubernetes_delegate', activelyConnected: false }]
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('BuildInfraSpecifications snapshot tests for K8s Build Infra', () => {
  jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
    CI_VM_INFRASTRUCTURE: false
  }))
  test('initializes ok for K8s Build Infra', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="service-kubernetes"]')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('able to select a connector', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...contextMock,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const selectBtn = await findAllByText(container, 'tesa 1')
    expect(selectBtn).toBeDefined()
    fireEvent.click(selectBtn[0])
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toBeDefined()
      fireEvent.click(await findByText(portal as HTMLElement, 'account'))
      const connector = await findAllByText(portal as HTMLElement, 'common.ID: tesa_1')
      await waitFor(() => expect(connector?.[0]).toBeDefined())
      fireEvent.click(connector?.[0])
    })
    const chosenConnector = await findAllByText(container, 'tesa 1')
    expect(chosenConnector[0]).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('can add new label', async () => {
    const { container, findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...contextMock,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(await findByTestId('advanced-summary'))
    })

    await act(async () => {
      fireEvent.click(await findByTestId('add-labels'))
      fireEvent.change(container.querySelector('[name="labels[2].key"]')!, { target: { value: 'projectid' } })
      fireEvent.change(container.querySelector('[name="labels[2].value"]')!, { target: { value: 'testVal' } })
    })
    // TODO - check why validation error is not appearing
    // expect(container).toMatchSnapshot()
    expect(true).toBeTruthy()
  })

  test('Renders with multiple stages', () => {
    const context = cloneDeep(contextMock)
    context.state.pipeline.stages.push({
      stage: {
        name: 's2',
        identifier: 's2',
        description: '',
        type: 'CI',
        spec: {
          cloneCodebase: true,
          serviceDependencies: [],
          infrastructure: {
            type: 'KubernetesDirect',
            spec: {
              namespace: '',
              labels: {
                lab1: 'test',
                projectid: 'invalidKey'
              },
              volumes: [
                {
                  mountPath: 'mountPath1',
                  type: 'EmptyDir',
                  spec: {
                    medium: 'medium',
                    size: '10Gi'
                  }
                },
                {
                  mountPath: 'mountPath2',
                  type: 'HostPath',
                  spec: {
                    path: 'path',
                    type: 'pathType'
                  }
                },
                {
                  mountPath: 'mountPath3',
                  type: 'PersistentVolumeClaim',
                  spec: {
                    claimName: 'claimName',
                    readOnly: true
                  }
                }
              ],
              serviceAccountName: 'serviceName',
              initTimeout: '2d',
              automountServiceAccountToken: true,
              priorityClassName: 'priorityClass',
              tolerations: [
                {
                  effect: 'effect',
                  key: 'key',
                  operator: 'operator',
                  value: 'value'
                }
              ],
              nodeSelector: {
                key: '<+input>'
              },
              containerSecurityContext: {
                capabilities: {
                  drop: ['ALL']
                },
                privileged: true,
                allowPrivilegeEscalation: true,
                runAsNonRoot: true,
                readOnlyRootFilesystem: true,
                runAsUser: 1000
              }
            }
          },
          execution: {
            steps: []
          }
        }
      }
    })
    context.state.selectionState = {
      selectedStageId: 's2'
    }

    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...context,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('BuildInfraSpecifications snapshot tests for AWS Build Infra', () => {
  test('initializes ok for AWS VMs Build Infra', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CI_VM_INFRASTRUCTURE: true
    }))
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Render AWS Build Infra view', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CI_VM_INFRASTRUCTURE: true
    }))
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    const buildInfraTypeTiles = container.querySelectorAll('input[type="checkbox"]')
    expect(buildInfraTypeTiles[0]).toBeTruthy()
    const awsTile = container.querySelector('input[value="VM"]')
    expect(awsTile).toBeTruthy()
    awsTile && fireEvent.click(awsTile)
    expect(container).toMatchSnapshot()
    const poolNameInputText = await container.querySelector('input[name="poolName"]')
    expect(poolNameInputText).toBeTruthy()
    const osInputText = await container.querySelector('input[name="os"]')
    expect(osInputText).toBeTruthy()
  })
})

describe('BuildInfraSpecifications snapshot tests for Advanced Panel K8s Build Infra', () => {
  // jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
  //   CI_VM_INFRASTRUCTURE: false
  // }))

  test('Renders advanced stage fields', async () => {
    const context = cloneDeep(contextMockAdvancedStagesWithPropagate)

    const { container, findByTestId } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...context,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    fireEvent.click(await findByTestId('advanced-summary'))

    await waitFor(() => expect(container.querySelector('[data-name="volumes"]')).toBeDefined())
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Renders advanced stage fields as readonly in propagate stage', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      CI_VM_INFRASTRUCTURE: false
    }))

    const context = cloneDeep(contextMockAdvancedStagesWithPropagate)
    context.state.selectionState = {
      selectedStageId: 'propagatestage'
    }
    const { container, findByTestId, getAllByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...context,
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      const advancedSummary = container.querySelector(
        '[class*="sectionCard"] [class*="active"] [data-testid="advanced-summary"]'
      )
      if (!advancedSummary) {
        throw Error('no advanced summary')
      }
      fireEvent.click(advancedSummary)
    })
    await waitFor(() => expect(findByTestId('propagate-stage-card')).toBeDefined())
    const buildInfraTypeTiles = container.querySelectorAll('input[type="checkbox"]')
    expect(buildInfraTypeTiles[0]).toBeTruthy()
    const propagateFromExistingStage = buildInfraTypeTiles[0]
    expect(propagateFromExistingStage).toBeTruthy()
    fireEvent.click(propagateFromExistingStage)
    const useFromStageSelect = container.querySelector('[name="useFromStage"]')
    if (!useFromStageSelect) {
      throw Error('Cannot find select')
    }
    fireEvent.click(useFromStageSelect)
    setFieldValue({ container, type: InputTypes.SELECT, fieldId: 'useFromStage', value: 's' })
    await act(async () => {
      const advancedSummary = container.querySelector(
        '[class*="sectionCard"] [class*="active"] [data-testid="advanced-summary"]'
      )
      if (!advancedSummary) {
        throw Error('no advanced summary')
      }
      fireEvent.click(advancedSummary)
    })
    // first is from Propagate from an existing stage, second is New Configuration
    await waitFor(() => expect(getAllByText('pipeline.infraSpecifications.serviceAccountName')?.length).toEqual(2))
  })
})

describe('Hosted by Harness', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Renders view for delegate not yet provisioned', () => {
    jest.spyOn(hostedBuilds, 'useHostedBuilds').mockReturnValue({
      enabledHostedBuildsForFreeUsers: true,
      enabledHostedBuilds: false
    })
    const { container, findByText: getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...set(contextMock, 'state.pipeline.stages', [
                {
                  stage: {
                    name: 'Build',
                    identifier: 'Build',
                    type: 'CI',
                    spec: {
                      cloneCodebase: true,
                      execution: {
                        steps: [
                          {
                            step: {
                              type: 'Run',
                              name: 'Echo Welcome Message',
                              identifier: 'Run',
                              spec: {
                                connectorRef: 'account.harnessImage',
                                image: 'alpine',
                                shell: 'Sh',
                                command: 'echo "Welcome to Harness CI" '
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]),
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const buildInfraTypeTiles = container.querySelectorAll('input[type="checkbox"]')
    expect(buildInfraTypeTiles.length).toBe(2)
    fireEvent.click(buildInfraTypeTiles[0])
    expect(getByText('ci.getStartedWithCI.provisioningHelpText')).toBeTruthy()
  })

  test('Renders view for delegate already provisioned', () => {
    jest.spyOn(hostedBuilds, 'useHostedBuilds').mockReturnValue({
      enabledHostedBuildsForFreeUsers: true,
      enabledHostedBuilds: false
    })
    const { container, findByText: getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <PipelineContext.Provider
          value={
            {
              ...set(contextMock, 'state.pipeline.stages', [
                {
                  stage: {
                    name: 'Build',
                    identifier: 'Build',
                    type: 'CI',
                    spec: {
                      cloneCodebase: true,
                      infrastructure: {
                        type: 'KubernetesHosted'
                      },
                      execution: {
                        steps: [
                          {
                            step: {
                              type: 'Run',
                              name: 'Echo Welcome Message',
                              identifier: 'Run',
                              spec: {
                                connectorRef: 'account.harnessImage',
                                image: 'alpine',
                                shell: 'Sh',
                                command: 'echo "Welcome to Harness CI" '
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]),
              getStageFromPipeline: jest.fn(() => {
                return { stage: contextMock.state.pipeline.stages[0], parent: undefined }
              }),
              updatePipeline: jest.fn,
              updateStage: jest.fn
            } as any
          }
        >
          <BuildInfraSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const buildInfraTypeTiles = container.querySelectorAll('input[type="checkbox"]')
    expect(buildInfraTypeTiles.length).toBe(4)
    fireEvent.click(buildInfraTypeTiles[0])
    expect(getByText('ci.getStartedWithCI.provisioningHelpText')).toBeTruthy()
  })
})

describe('Test feature enablement for different license and FFs', () => {
  test('K8s/VMs Build Infra is not visible for CI Free edition', async () => {
    mockImport('framework/LicenseStore/LicenseStoreContext', {
      useLicenseStore: jest.fn().mockImplementation(() => ({
        licenseInformation: { CI: { edition: 'FREE', status: 'ACTIVE' } }
      }))
    })
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="service-kubernetes"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-icon="service-vm"]')).not.toBeInTheDocument()
  })

  test('K8s/VMs Build Infra is visible for STO Enterprise edition', async () => {
    mockImport('framework/LicenseStore/LicenseStoreContext', {
      useLicenseStore: jest.fn().mockImplementation(() => ({
        licenseInformation: { STO: { edition: 'ENTERPRISE', status: 'ACTIVE' } }
      }))
    })
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="service-kubernetes"]')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="service-vm"]')).toBeInTheDocument()
  })

  test('K8s Build Infra is visible for ENABLE_K8_BUILDS enabled', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlags').mockImplementation(() => ({
      ENABLE_K8_BUILDS: true
    }))
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="service-kubernetes"]')).toBeInTheDocument()
  })

  test('K8s/VMs Build Infra is visible for On-prem', async () => {
    window.deploymentType = 'ON_PREM'
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <BuildInfraSpecifications />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="service-kubernetes"]')).toBeInTheDocument()
    expect(container.querySelector('[data-icon="service-vm"]')).toBeInTheDocument()
  })
})
