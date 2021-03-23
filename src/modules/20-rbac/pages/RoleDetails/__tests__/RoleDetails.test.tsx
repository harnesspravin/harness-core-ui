import React from 'react'
import { act, fireEvent, queryByAttribute, render, RenderResult } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { getResourceTypeHandlerMock, getResourceGroupTypeHandlerMock } from '@rbac/utils/RbacFactoryMockData'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import RoleDetails from '@rbac/pages/RoleDetails/RoleDetails'
import { ResourceTypeGroup } from '@rbac/interfaces/ResourceType'
import { permissionListMockData, resourceTypesMockData, roleMockData } from './mock'

jest.useFakeTimers()

const updateRole = jest.fn()
jest.mock('services/rbac', () => ({
  useGetRole: jest.fn().mockImplementation(() => {
    return { data: roleMockData, refetch: jest.fn(), error: null }
  }),
  useUpdateRole: jest.fn().mockImplementation(() => ({ mutate: updateRole })),
  useGetPermissionList: jest.fn().mockImplementation(() => {
    return { data: permissionListMockData, refetch: jest.fn(), error: null }
  }),
  useGetPermissionResourceTypesList: jest.fn().mockImplementation(() => {
    return { data: resourceTypesMockData, refetch: jest.fn(), error: null }
  })
}))

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource)),
  getResourceGroupTypeHandler: jest.fn().mockImplementation(resource => getResourceGroupTypeHandlerMock(resource)),
  getResourceGroupTypeList: jest
    .fn()
    .mockImplementation(() => [ResourceTypeGroup.PROJECT_RESOURCES, ResourceTypeGroup.ADMINSTRATIVE_FUNCTIONS])
}))

jest.mock('react-timeago', () => () => 'dummy date')

describe('Role Details Page', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <RoleDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Add Permissions', async () => {
      const organizationDelete = queryByAttribute('data-testid', container, 'checkBox-ORGANIZATION-delete')
      expect(organizationDelete).toBeTruthy()
      if (organizationDelete) fireEvent.click(organizationDelete)
      const organizationView = queryByAttribute('data-testid', container, 'checkBox-ORGANIZATION-view')
      expect(organizationView).toBeTruthy()
      if (organizationView) fireEvent.click(organizationView)

      const applyChanges = getByText('Apply Changes')
      expect(applyChanges).toBeTruthy()

      await act(async () => {
        fireEvent.click(applyChanges)
      })

      expect(updateRole).toHaveBeenCalledWith({
        identifier: 'identifier',
        name: 'name',
        permissions: [
          'core.project.delete',
          'core.organization.create',
          'core.organization.edit',
          'core.project.edit',
          'core.project.view',
          'core.project.create',
          'core.organization.delete'
        ],
        allowedScopeLevels: ['account'],
        description: 'description',
        tags: { ui: '', dev: '' }
      })
    }),
    test('Click on Resource Type', () => {
      const projectResources = queryByAttribute('data-testid', container, 'resourceCard-PROJECT_RESOURCES')
      act(() => {
        fireEvent.click(projectResources!)
      })
      expect(container).toMatchSnapshot()
    })
})
