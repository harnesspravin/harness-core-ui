/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import { Button, ButtonVariation, Layout, ModalDialog, useToaster } from '@harness/uicore'
import { fullYamlPathRegex } from '@common/utils/StringUtils'
import { useStrings } from 'framework/strings'
import { GitSyncForm, GitSyncFormFields } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useCreateGitRepo } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'

export interface GitSyncSetupModalProps {
  hideModal: () => void
}

export const GitSyncSetupModal: FC<GitSyncSetupModalProps> = ({ hideModal }) => {
  const { orgIdentifier, projectIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: createGitRepo } = useCreateGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier
    }
  })

  const handleSubmit = useCallback(
    async (formValues: GitSyncFormFields) => {
      // get file name and root folder path from filePath field
      const fullPath = formValues?.filePath
      const pathNodes = fullPath?.split('/').filter((node: string) => !!node) // remove empty
      const yamlFileName = '/' + pathNodes?.pop()
      const yamlFilePath = pathNodes?.length ? '/' + pathNodes?.join('/') + '/' : ''

      const requestData = {
        repoIdentifier: formValues.repo || '',
        repoReference: formValues.repo,
        branch: formValues.branch || '',
        filePath: yamlFileName,
        rootFolder: yamlFilePath,
        connectorReference:
          typeof formValues.connectorRef === 'string' ? formValues.connectorRef : formValues.connectorRef?.value
      }

      try {
        await createGitRepo(requestData)

        hideModal()
      } catch (error) {
        showError(getErrorMessage(error), 0, getString('cf.selectFlagRepo.createRepoError'))
      }
    },
    [createGitRepo, getString, hideModal, showError]
  )

  return (
    <Formik<GitSyncFormFields>
      initialValues={{
        repo: '',
        branch: '',
        connectorRef: '',
        filePath: ''
      }}
      onSubmit={handleSubmit}
      validationSchema={Yup.object({
        repo: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
        branch: Yup.string().trim().required(getString('common.git.validation.branchRequired')),
        connectorRef: Yup.string().trim().required(getString('validation.sshConnectorRequired')),
        filePath: Yup.string()
          .trim()
          .required(getString('gitsync.gitSyncForm.yamlPathRequired'))
          .matches(fullYamlPathRegex, getString('gitsync.gitSyncForm.yamlPathInvalid'))
      })}
    >
      {formikProps => (
        <ModalDialog
          isOpen
          enforceFocus={false}
          title={getString('cf.gitSync.setUpGitConnection')}
          footer={
            <Layout.Horizontal spacing="small">
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('save')}
                intent="primary"
                onClick={() => formikProps.submitForm()}
              />
              <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={hideModal} />
            </Layout.Horizontal>
          }
          onClose={hideModal}
        >
          <FormikForm>
            <GitSyncForm formikProps={formikProps} isEdit={false} initialValues={{}} />
          </FormikForm>
        </ModalDialog>
      )}
    </Formik>
  )
}

export default GitSyncSetupModal
