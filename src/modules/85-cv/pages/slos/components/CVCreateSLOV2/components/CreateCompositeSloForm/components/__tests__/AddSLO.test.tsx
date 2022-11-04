/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { Button } from '@harness/uicore'
import { act } from 'react-test-renderer'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { getDistribution } from '../AddSlos/AddSLOs.utils'
import { AddSLOs } from '../AddSlos/AddSLOs'
import { mockSLODashboardWidgetsData } from '../AddSlos/components/__tests__/SLOList.mock'

const serviceLevelObjectivesDetails = [
  {
    accountId: 'default',
    serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
    weightagePercentage: 50
  },
  {
    accountId: 'default',
    serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
    weightagePercentage: 50
  }
]

describe('Validate  AddSLO', () => {
  test('should validate getDistribution', () => {
    const updatedServiceLevelObjectivesDetails = getDistribution(30, 1, serviceLevelObjectivesDetails)
    const clonedServiceLevelObjectivesDetails = [...serviceLevelObjectivesDetails]
    clonedServiceLevelObjectivesDetails[0].weightagePercentage = 70
    clonedServiceLevelObjectivesDetails[1].weightagePercentage = 30
    expect(updatedServiceLevelObjectivesDetails).toEqual(clonedServiceLevelObjectivesDetails)
  })

  test('should render AddSLOs with no values', () => {
    const { getByText } = render(
      <TestWrapper>
        <AddSLOs />
      </TestWrapper>
    )
    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()
  })

  test('should be able to add new SLO', async () => {
    jest.spyOn(cvServices, 'useGetSLOHealthListView').mockReturnValue({
      data: mockSLODashboardWidgetsData,
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
    const { getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ serviceLevelObjectivesDetails }} onSubmit={jest.fn()}>
          {() => <AddSLOs />}
        </Formik>
      </TestWrapper>
    )

    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByText('cv.CompositeSLO.AddSLO'))
    })
    await waitFor(() => expect(document.querySelector('.bp3-drawer')).toBeInTheDocument())

    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[0]!)
    })
    act(() => {
      fireEvent.click(document.querySelectorAll('[type="checkbox"]')[1]!)
    })
    const addSloButton = document.querySelector('[data-testid="addSloButton"]')
    expect(addSloButton).not.toBeDisabled()
    act(() => {
      fireEvent.click(addSloButton!)
    })
    expect(getByText('SLO3')).toBeInTheDocument()
    expect(getByText('SLO4')).toBeInTheDocument()
  })

  test('should render AddSLOs with existing values values', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik initialValues={{ serviceLevelObjectivesDetails }} onSubmit={jest.fn()}>
          {formikProps => (
            <>
              <AddSLOs />
              <Button
                onClick={() => {
                  formikProps.setFieldValue('serviceLevelObjectivesDetails', [])
                }}
              >
                Update
              </Button>
            </>
          )}
        </Formik>
      </TestWrapper>
    )
    expect(getByText('cv.CompositeSLO.AddSLO')).toBeInTheDocument()
    const firstWeight = container.querySelector('[name="weightagePercentage"]')
    act(() => {
      userEvent.type(firstWeight!, '1')
    })
    act(() => {
      fireEvent.click(getByText('Update'))
    })
  })
})