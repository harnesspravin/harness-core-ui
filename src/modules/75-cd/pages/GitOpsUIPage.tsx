import React from 'react'
// eslint-disable-next-line import/no-unresolved
import { mount } from 'gitopsui/MicroFrontendApp'
import { ChildAppMounter } from 'microfrontends/utils'

export default function GitOpsUIPage(): React.ReactElement {
  return <ChildAppMounter mount={mount} />
}
