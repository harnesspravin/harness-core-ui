import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import PipelineCachedCopy from '../PipelineCachedCopy'
import { getDummyPipelineCanvasContextValue } from '../../__tests__/PipelineCanvasTestHelper'

jest.mock('services/pipeline-ng', () => ({
  createPipelinePromise: jest.fn().mockResolvedValue({ status: 'Success' })
}))

const contextValue = getDummyPipelineCanvasContextValue({
  isLoading: false,
  isReadonly: false
})
const cacheResponseContextValue: PipelineContextInterface = {
  ...contextValue,
  state: {
    ...contextValue.state,
    cacheResponse: {
      cacheState: 'VALID_CACHE',
      lastUpdatedAt: 1660213211337,
      ttlLeft: 5000
    }
  }
}

describe('Test Pipeline gitx cache Copy', () => {
  test('should render correctly', () => {
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ PIE_NG_GITX_CACHING: true }}>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display valid cache icon', async () => {
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ PIE_NG_GITX_CACHING: true }}>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const cacheCopyText = screen.getByText('pipeline.pipelineCachedCopy.cachedCopyText')
    expect(cacheCopyText).toBeTruthy()
    fireEvent.mouseOver(cacheCopyText)
    const refreshIcon = container.querySelector(`[data-icon="command-rollback"]`)
    const validcache = container.querySelector(`[data-icon="success-tick"]`)
    expect(refreshIcon).toBeDefined()
    expect(validcache).toBeDefined()
  })

  test('reload the data from cache', async () => {
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ PIE_NG_GITX_CACHING: true }}>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    fireEvent.click(container.querySelector(`[data-icon="command-rollback"]`) as HTMLElement)
    await waitFor(() => screen.getByText('pipeline.pipelineCachedCopy.reloadPipeline'))
    const confirmReload = screen.getByRole('button', {
      name: /confirm/i
    })
    const cancelButton = screen.getByRole('button', {
      name: /cancel/i
    })
    expect(confirmReload).toBeDefined()
    expect(cancelButton).toBeDefined()

    fireEvent.click(confirmReload)
    await waitFor(() => expect(cacheResponseContextValue.updatePipelineView).toHaveBeenCalled())
    await waitFor(() => expect(cacheResponseContextValue.fetchPipeline).toHaveBeenCalled())
  })
})
