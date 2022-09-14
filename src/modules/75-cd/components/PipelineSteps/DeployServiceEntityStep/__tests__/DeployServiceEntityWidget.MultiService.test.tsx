import React from 'react'
import { render, waitFor, findByText as findByTextGlobal, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import DeployServiceEntityWidget from '../DeployServiceEntityWidget'
import services from './services.json'
import metadata from './servicesMetadata.json'

const allowableTypes: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

const defaultFeatureFlagValues = { MULTI_SERVICE_INFRA: true, NG_SVC_ENV_REDESIGN: true }
const initialValues = { services: { values: [{ serviceRef: 'svc_1' }, { serviceRef: 'svc_2' }] } }

jest.mock('services/cd-ng', () => ({
  useGetServiceList: jest.fn(() => ({
    data: { data: { content: services } },
    loading: false
  })),
  useGetServicesYamlAndRuntimeInputs: jest.fn().mockReturnValue({ mutate: jest.fn(() => ({ data: metadata })) }),
  useCreateServiceV2: jest.fn().mockReturnValue({
    mutate: jest
      .fn()
      .mockResolvedValue({ status: 'SUCCESS', data: { service: { identifier: 'svc_4', name: 'Service 4' } } })
  }),
  useUpdateServiceV2: jest.fn().mockReturnValue({ mutate: jest.fn().mockResolvedValue({ status: 'SUCCESS' }) }),
  useGetEntityYamlSchema: jest.fn().mockReturnValue({ data: { data: {} } })
}))

describe('DeployServiceEntityWidget - multi services tests', () => {
  test('user can select multiple services', async () => {
    const onUpdate = jest.fn()
    const { container, findByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={defaultFeatureFlagValues}>
        <DeployServiceEntityWidget
          initialValues={{}}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    expect(container).toMatchSnapshot()

    const toggle = container.querySelector('.Toggle--input')!

    userEvent.click(toggle)
    // act(() => {
    // })

    const multi = await findByTestId('multi-select-dropdown-button')

    userEvent.click(multi)

    await waitFor(() => expect(document.body.querySelector('.bp3-menu')).toBeInTheDocument())

    const menu = document.body.querySelector<HTMLDivElement>('.bp3-menu')!
    const svc1 = await findByTextGlobal(menu, 'Service 1')
    userEvent.click(svc1)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenLastCalledWith({
        services: {
          metadata: {
            parallel: false
          },
          values: [
            {
              serviceInputs: {
                serviceDefinition: {
                  spec: {
                    artifacts: {
                      primary: {
                        spec: { connectorRef: '<+input>', imagePath: '<+input>', tag: '<+input>' },
                        type: 'DockerRegistry'
                      }
                    }
                  },
                  type: 'Kubernetes'
                }
              },
              serviceRef: 'svc_1'
            }
          ]
        }
      })
    })
  })

  test('user can delete selected service', async () => {
    const onUpdate = jest.fn()
    const { container, findByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={defaultFeatureFlagValues}>
        <DeployServiceEntityWidget
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const delBtn = await findByTestId('delete-service-svc_1')

    expect(container).toMatchSnapshot()
    userEvent.click(delBtn)

    const confirmationModal1 = await findByTextGlobal(
      document.body,
      'cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText'
    )

    const cancel = await findByTextGlobal(confirmationModal1.parentElement!.parentElement!, 'cancel')

    act(() => {
      userEvent.click(cancel)
    })

    act(() => {
      userEvent.click(delBtn)
    })

    const confirmationModal2 = await findByTextGlobal(
      document.body,
      'cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText'
    )

    const apply = await findByTextGlobal(confirmationModal2.parentElement!.parentElement!, 'applyChanges')
    userEvent.click(apply)

    expect(onUpdate).toHaveBeenLastCalledWith({
      services: {
        metadata: {
          parallel: false
        },
        values: [{ serviceRef: 'svc_2' }]
      }
    })

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())
  })

  test('user can deploy in parallel', async () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={defaultFeatureFlagValues}>
        <DeployServiceEntityWidget
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const apply = queryByAttribute('name', container, 'parallel')!
    userEvent.click(apply)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenLastCalledWith({
        services: {
          values: [
            {
              serviceRef: 'svc_1',
              serviceInputs: {
                serviceDefinition: {
                  spec: {
                    artifacts: {
                      primary: {
                        spec: { connectorRef: '<+input>', imagePath: '<+input>', tag: '<+input>' },
                        type: 'DockerRegistry'
                      }
                    }
                  },
                  type: 'Kubernetes'
                }
              }
            },
            { serviceRef: 'svc_2' }
          ],
          metadata: { parallel: true }
        }
      })
    })

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())
  })

  test('user can make service as runtime input', async () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={defaultFeatureFlagValues}>
        <DeployServiceEntityWidget
          initialValues={{}}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const toggle = container.querySelector('.Toggle--input')!

    act(() => {
      userEvent.click(toggle)
    })

    const fixedIcon = container.querySelector('.MultiTypeInput--btn')!
    userEvent.click(fixedIcon)

    const runtimeMenu = await findByTextGlobal(document.body, 'Runtime input')
    userEvent.click(runtimeMenu)

    await waitFor(() => {
      expect(onUpdate).toHaveBeenLastCalledWith({ services: { values: '<+input>', metadata: { parallel: false } } })
    })
  })
})