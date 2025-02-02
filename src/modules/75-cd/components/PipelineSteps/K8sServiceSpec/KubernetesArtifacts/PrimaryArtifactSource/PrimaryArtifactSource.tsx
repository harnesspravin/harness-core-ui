/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { get, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { StoreType } from '@common/constants/GitSyncTypes'
import { useQueryParams } from '@common/hooks'
import type { SidecarArtifact } from 'services/cd-ng'
import { isTemplatizedView } from '@pipeline/utils/stepUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { KubernetesArtifactsProps } from '../../K8sServiceSpecInterface'
import { fromPipelineInputTriggerTab, getSidecarInitialValues } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

const ArtifactInputField = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const {
    projectIdentifier: _projectIdentifier,
    orgIdentifier: _orgIdentifier,
    accountId,
    pipelineIdentifier: _pipelineIdentifier
  } = useParams<PipelineType<InputSetPathProps> & { accountId: string }>()
  const { repoIdentifier, repoName, branch, storeType } = useQueryParams<GitQueryParams>()
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    getStageFromPipeline
  } = usePipelineContext()
  const { supportingGitSimplification } = useAppStore()
  const artifactSource = props.artifact ? artifactSourceBaseFactory.getArtifactSource(props.artifact.type) : null
  const runtimeMode = isTemplatizedView(props.stepViewType)
  const isArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts', false)
  const isPrimaryArtifactsRuntime = runtimeMode && !!get(props.template, 'artifacts.primary.sources', false)
  const isSidecarRuntime = runtimeMode && !!get(props.template, 'artifacts.sidecars', false)
  const selectedStage = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId).stage
  const pipelineIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.pipelineIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.pipeline')) ?? _pipelineIdentifier
  const projectIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.projectIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.project')) ?? _projectIdentifier
  const orgIdentifier =
    (props.childPipelineMetadata
      ? props.childPipelineMetadata.orgIdentifier
      : get(selectedStage?.stage as PipelineStageElementConfig, 'spec.org')) ?? _orgIdentifier

  useEffect(() => {
    /* instanbul ignore else */
    if (fromPipelineInputTriggerTab(props.formik, props.fromTrigger)) {
      const artifacTriggerData = getSidecarInitialValues(
        props.initialValues,
        props.formik,
        props.stageIdentifier,
        props.artifactPath as string
      )
      !isEmpty(artifacTriggerData) &&
        props.formik.setFieldValue(`${props.path}.artifacts.${props.artifactPath}`, artifacTriggerData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!artifactSource) {
    return null
  }
  return (
    <div key={(props.artifact as SidecarArtifact).identifier}>
      {artifactSource &&
        artifactSource.renderContent({
          ...props,
          isArtifactsRuntime,
          isPrimaryArtifactsRuntime,
          isSidecarRuntime,
          projectIdentifier,
          orgIdentifier,
          accountId,
          pipelineIdentifier,
          repoIdentifier: supportingGitSimplification && storeType === StoreType.REMOTE ? repoName : repoIdentifier,
          branch,
          isSidecar: true
        })}
    </div>
  )
}

export const PrimaryArtifactSource = (props: KubernetesArtifactsProps): React.ReactElement | null => {
  const primaryArtifactSource = props.template?.artifacts?.primary?.sources
  return (
    <div
      className={cx(css.nopadLeft, css.accordionSummary)}
      id={`Stage.${props.stageIdentifier}.Service.Artifacts.Sidecars`}
    >
      {Array.isArray(primaryArtifactSource) && !!primaryArtifactSource?.length && (
        <>
          {props.template?.artifacts?.primary?.sources?.map((primarySource, index) => {
            if (!primarySource) {
              return null
            }

            const artifactTemplate = get(primarySource, 'template')
            const isArtifactTemplatePresent = !isEmpty(artifactTemplate)

            const artifactPath = isArtifactTemplatePresent
              ? `primary.sources[${index}].template.templateInputs`
              : `primary.sources[${index}]`
            const updatedPrimarySource = isArtifactTemplatePresent
              ? {
                  ...primarySource,
                  ...artifactTemplate?.templateInputs
                }
              : primarySource

            const updatedInitialValues = isArtifactTemplatePresent
              ? produce(props.initialValues, draft => {
                  const identifierValue = get(props.initialValues?.artifacts, `primary.sources[${index}].identifier`)
                  if (identifierValue) {
                    set(draft, `artifacts.${artifactPath}.identifier`, `${identifierValue}.template.templateInputs`)
                  }
                })
              : props.initialValues

            return (
              <ArtifactInputField
                {...props}
                initialValues={updatedInitialValues}
                artifact={updatedPrimarySource}
                artifactPath={artifactPath}
                key={primarySource?.identifier}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
