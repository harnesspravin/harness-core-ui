/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Breadcrumb } from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { FolderModel, useSearchFolders, useGetModelTags } from 'services/custom-dashboards'

export interface DashboardsContextProps {
  breadcrumbs: Breadcrumb[]
  includeBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  editableFolders: FolderModel[]
  modelTags: string[]
}

const DashboardsContext = React.createContext<DashboardsContextProps>({} as DashboardsContextProps)

export function DashboardsContextProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  const includeBreadcrumbs = (breadcrumbsToAdd: Breadcrumb[]): void => {
    setBreadcrumbs(breadcrumbsToAdd)
  }

  const { data: folderResponse } = useSearchFolders({
    queryParams: { accountId, page: 1, pageSize: 100, permission: PermissionIdentifier.EDIT_DASHBOARD }
  })

  const editableFolders = folderResponse?.resource || []

  const { data: modelTagsResponse } = useGetModelTags({ queryParams: { accountId } })
  const modelTags = useMemo(() => modelTagsResponse?.resource || [], [modelTagsResponse])

  return (
    <DashboardsContext.Provider
      value={{
        breadcrumbs,
        includeBreadcrumbs,
        editableFolders,
        modelTags
      }}
    >
      {props.children}
    </DashboardsContext.Provider>
  )
}

export function useDashboardsContext(): DashboardsContextProps {
  return useContext(DashboardsContext)
}
