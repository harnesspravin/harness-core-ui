/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { SyncStepData, SyncStepSpec } from './types'
import { flatObject } from '../Common/ApprovalCommons'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface SyncStepVariablesProps {
  initialValues: SyncStepData
  stageIdentifier: string
  onUpdate?(data: SyncStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: SyncStepData
}

export function SyncStepVariables({ variablesData, metadataMap, initialValues }: SyncStepVariablesProps): JSX.Element {
  return (
    <VariablesListTable<SyncStepSpec>
      className={pipelineVariableCss.variablePaddingL3}
      data={flatObject(variablesData.spec || {}) as unknown as SyncStepSpec}
      originalData={initialValues.spec || {}}
      metadataMap={metadataMap}
    />
  )
}
