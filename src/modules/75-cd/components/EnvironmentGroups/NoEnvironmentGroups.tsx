/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Button, ButtonVariation, Container, Heading, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import { useGetFreeOrCommunityCD } from '@common/utils/utils'
import GetStartedWithCDButton from '@pipeline/components/GetStartedWithCDButton/GetStartedWithCDButton'
import EmptyContent from './images/NoEnvironmentGroup.svg'
import EmptySearch from './images/NoEnvironmentGroups-Search.svg'

export default function NoEnvironmentGroups({
  searchTerm,
  hasFilters,
  clearFilters,
  showModal
}: {
  searchTerm?: string
  hasFilters: boolean
  clearFilters: () => void
  showModal: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const isFreeOrCommunityCD = useGetFreeOrCommunityCD()

  return (
    <Container flex={{ align: 'center-center' }} height="75vh">
      {searchTerm ? (
        <Container flex style={{ flexDirection: 'column' }}>
          <img src={EmptySearch} width={220} height={220} />
          <Heading level={2}>{getString('common.noSearchResultsFound', { searchTerm })}</Heading>
          <Heading level={2} margin={{ bottom: 'large', top: 'small' }}>
            {getString('common.searchOther')}
          </Heading>
        </Container>
      ) : hasFilters ? (
        <Layout.Vertical spacing="small" flex>
          <Text
            margin={{ top: 'large', bottom: 'small' }}
            font={{ weight: 'bold', size: 'medium' }}
            color={Color.GREY_800}
          >
            {getString('common.filters.noMatchingFilterData')}
          </Text>
          <Button variation={ButtonVariation.LINK} onClick={clearFilters} minimal>
            {getString('common.filters.clearFilters')}
          </Button>
        </Layout.Vertical>
      ) : (
        <Container flex style={{ flexDirection: 'column' }}>
          <img src={EmptyContent} width={300} height={150} />
          <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
            {getString('common.environmentGroups.noEnvironmentGroups.label')}
          </Heading>
          {isFreeOrCommunityCD && <GetStartedWithCDButton />}
          <Button
            text={getString('common.environmentGroup.new')}
            icon="plus"
            onClick={showModal}
            variation={isFreeOrCommunityCD ? ButtonVariation.LINK : ButtonVariation.PRIMARY}
          />
        </Container>
      )}
    </Container>
  )
}
