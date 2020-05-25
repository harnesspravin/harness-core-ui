import { RouteInfo, ModuleName } from 'framework'
import React from 'react'
import i18n from './routes.i18n'

export const DXDashboard: RouteInfo = {
  path: '/dashboard',
  title: i18n.dashboard,
  pageId: 'dashboard',
  url: () => '/dashboard',
  component: React.lazy(() => import('./pages/dashboard/Dashboard')),
  module: ModuleName.DX
}
