/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Accordion,
  Layout,
  Button,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import * as Yup from 'yup'

import { get, set, isEmpty, defaultTo } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import type {
  ServerlessManifestDataType,
  ManifestTypes,
  ServerlessLambdaManifestLastStepPrevStepData
} from '../../ManifestInterface'
import {
  gitFetchTypeList,
  GitFetchTypes,
  GitRepoName,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import DragnDropPaths from '../../DragnDropPaths'

import { filePathWidth, getRepositoryName, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface ServerlessAwsLambdaManifestPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  editManifestModePrevStepData?: ServerlessLambdaManifestLastStepPrevStepData
}

function ServerlessAwsLambdaManifest({
  stepName,
  selectedManifest,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & ServerlessAwsLambdaManifestPropType): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const gitConnectionType: string = modifiedPrevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl =
    connectionType === GitRepoName.Account
      ? modifiedPrevStepData?.connectorRef
        ? modifiedPrevStepData?.connectorRef?.connector?.spec?.url
        : modifiedPrevStepData?.url
      : null

  const getInitialValues = (): ServerlessManifestDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues?.identifier,
        configOverridePath: initialValues?.spec?.configOverridePath,
        repoName: getRepositoryName(modifiedPrevStepData, initialValues),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : removeEmptyFieldsFromStringArray(specValues.paths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              }))
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      repoName: getRepositoryName(modifiedPrevStepData, initialValues),
      configOverridePath: undefined
    }
  }

  const submitFormData = (formData: ServerlessManifestDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData.connectorRef,
              gitFetchType: formData.gitFetchType,
              paths:
                typeof formData.paths === 'string'
                  ? formData.paths
                  : formData.paths.map((path: { path: string }) => path.path)
            }
          },
          configOverridePath: formData.configOverridePath
        }
      }
    }
    if (connectionType === GitRepoName.Account) {
      set(manifestObj, 'manifest.spec.store.spec.repoName', formData.repoName)
    }

    if (manifestObj.manifest?.spec?.store) {
      if (formData.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', formData.branch)
      } else if (formData.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', formData.commitId)
      }
    }
    handleSubmit(manifestObj)
  }

  const validationSchema = Yup.object().shape({
    ...ManifestIdentifierValidation(
      getString,
      manifestIdsList,
      initialValues?.identifier,
      getString('pipeline.uniqueName')
    ),
    branch: Yup.string().when('gitFetchType', {
      is: 'Branch',
      then: Yup.string().trim().required(getString('validation.branchName'))
    }),
    commitId: Yup.string().when('gitFetchType', {
      is: 'Commit',
      then: Yup.string().trim().required(getString('validation.commitId'))
    }),
    paths: Yup.lazy((value): Yup.Schema<unknown> => {
      if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
        return Yup.array().of(
          Yup.object().shape({
            path: Yup.string()
              .min(1)
              .required(getString('common.validation.fieldIsRequired', { name: getString('common.git.folderPath') }))
              .test(
                'Check prefix',
                getString('pipeline.manifestType.periodPrefixValidation', { name: getString('common.git.folderPath') }),
                (currPathValue: string) => {
                  return !(currPathValue && currPathValue.startsWith('.'))
                }
              )
          })
        )
      }
      return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
    }),
    repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
      if (
        connectionType === GitRepoName.Repo ||
        getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
      ) {
        return true
      }
      return !isEmpty(value) && value?.length > 0
    })
  })

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="serverlessAwsLambda"
        validationSchema={validationSchema}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: modifiedPrevStepData?.connectorRef
              ? getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? modifiedPrevStepData?.connectorRef
                : modifiedPrevStepData?.connectorRef?.value
              : modifiedPrevStepData?.identifier
              ? modifiedPrevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: ServerlessManifestDataType }) => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <div className={css.halfWidth}>
                    <FormInput.Text
                      name="identifier"
                      label={getString('pipeline.manifestType.manifestIdentifier')}
                      placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                      isIdentifier={true}
                    />
                  </div>
                  {!!(connectionType === GitRepoName.Account || accountUrl) && (
                    <GitRepositoryName
                      accountUrl={accountUrl}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fieldValue={formik.values.repoName}
                      changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                  <Layout.Horizontal spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                    <div className={css.halfWidth}>
                      <FormInput.Select
                        name="gitFetchType"
                        label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                        items={gitFetchTypeList}
                      />
                    </div>

                    {formik.values.gitFetchType === GitFetchTypes.Branch && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]: getMultiTypeFromValue(formik.values.branch) === MultiTypeInputType.RUNTIME
                        })}
                      >
                        <FormInput.MultiTextInput
                          multiTextInputProps={{ expressions, allowableTypes }}
                          label={getString('pipelineSteps.deploy.inputSet.branch')}
                          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                          name="branch"
                        />

                        {getMultiTypeFromValue(formik.values.branch) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formik.values.branch as string}
                            type="String"
                            variableName="branch"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => formik.setFieldValue('branch', value)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}

                    {formik.values.gitFetchType === GitFetchTypes.Commit && (
                      <div
                        className={cx(css.halfWidth, {
                          [css.runtimeInput]:
                            getMultiTypeFromValue(formik.values.commitId) === MultiTypeInputType.RUNTIME
                        })}
                      >
                        <FormInput.MultiTextInput
                          multiTextInputProps={{ expressions, allowableTypes }}
                          label={getString('pipeline.manifestType.commitId')}
                          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                          name="commitId"
                        />

                        {getMultiTypeFromValue(formik.values.commitId) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            value={formik.values.commitId as string}
                            type="String"
                            variableName="commitId"
                            showRequiredField={false}
                            showDefaultField={false}
                            onChange={value => formik.setFieldValue('commitId', value)}
                            isReadonly={isReadonly}
                          />
                        )}
                      </div>
                    )}
                  </Layout.Horizontal>
                  <div
                    className={cx({
                      [css.runtimeInput]: getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <DragnDropPaths
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      fieldPath="paths"
                      pathLabel={getString('common.git.folderPath')}
                      placeholder={getString('pipeline.manifestType.folderPathPlaceholder')}
                      defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                      dragDropFieldWidth={filePathWidth}
                      allowOnlyOneFilePath={true}
                    />
                    {getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        value={formik.values.paths}
                        type={getString('string')}
                        variableName={'paths'}
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={val => formik?.setFieldValue('paths', val)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                  <Accordion className={css.advancedStepOpen}>
                    <Accordion.Panel
                      id={getString('advancedTitle')}
                      addDomId={true}
                      summary={getString('advancedTitle')}
                      details={
                        <div
                          className={cx(css.halfWidth, {
                            [css.runtimeInput]:
                              getMultiTypeFromValue(formik.values.configOverridePath) === MultiTypeInputType.RUNTIME
                          })}
                        >
                          <FormInput.MultiTextInput
                            multiTextInputProps={{ expressions, allowableTypes }}
                            label={getString('pipeline.manifestType.serverlessConfigFilePath')}
                            placeholder={getString('pipeline.manifestType.serverlessConfigFilePathPlaceholder')}
                            name="configOverridePath"
                          />

                          {getMultiTypeFromValue(formik.values.configOverridePath) === MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values.configOverridePath as string}
                              type="String"
                              variableName="configOverridePath"
                              showRequiredField={false}
                              showDefaultField={false}
                              onChange={value => formik.setFieldValue('configOverridePath', value)}
                              isReadonly={isReadonly}
                            />
                          )}
                        </div>
                      }
                    />
                  </Accordion>
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(modifiedPrevStepData)}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ServerlessAwsLambdaManifest
