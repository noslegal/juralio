/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { StatusCodes } from 'http-status-codes'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import { fetchTemplates } from '../template-list-actions'
import templateService from '../../../services/template/template-service'
import TemplateJsonImportFileDialog from './TemplateJsonImportFileDialog'

const MAX_FILE_BYTES = 2_000_000

const ERROR_CODE_I18N = {
  PAYLOAD_TOO_LARGE: 'templateJsonImport.errorSizeExceeded',
  TASK_COUNT_EXCEEDED: 'templateJsonImport.errorTooManyTasks',
  TASK_NESTING_TOO_DEEP: 'templateJsonImport.errorNestingTooDeep',
  SCHEMA_VERSION_MISMATCH: 'templateJsonImport.errorSchemaMismatch',
  TOO_MANY_SUBTASKS: 'templateJsonImport.errorTooManySubtasks',
  TOO_MANY_PHASES: 'templateJsonImport.errorTooManyPhases',
  TOO_MANY_RESOURCES: 'templateJsonImport.errorTooManyResources',
  MILESTONE_HAS_SUBTASKS: 'templateJsonImport.errorMilestoneHasSubtasks',
  MILESTONE_IS_DELIVERABLE: 'templateJsonImport.errorMilestoneIsDeliverable',
  INVALID_PHASE_TYPE: 'templateJsonImport.errorInvalidPhaseType',
  INVALID_POST_TYPE: 'templateJsonImport.errorInvalidPostType',
  INVALID_POST_TIME: 'templateJsonImport.errorInvalidPostTime',
  INVALID_POST_URL: 'templateJsonImport.errorInvalidPostUrl',
  INVALID_CONTENT_TYPE: 'templateJsonImport.errorInvalidContentType',
  INVALID_PAYLOAD: 'templateJsonImport.errorInvalidPayload',
  MISSING_NAME: 'templateJsonImport.errorMissingName',
  NAME_TOO_LONG: 'templateJsonImport.errorNameTooLong',
  DESCRIPTION_TOO_LONG: 'templateJsonImport.errorDescriptionTooLong',
  TASK_MISSING_NAME: 'templateJsonImport.errorTaskMissingName',
  TASK_NAME_TOO_LONG: 'templateJsonImport.errorTaskNameTooLong',
  TASK_DESCRIPTION_TOO_LONG: 'templateJsonImport.errorTaskDescriptionTooLong',
  POST_MISSING_NAME: 'templateJsonImport.errorPostMissingName',
  POST_NAME_TOO_LONG: 'templateJsonImport.errorPostNameTooLong',
  POST_DESCRIPTION_TOO_LONG: 'templateJsonImport.errorPostDescriptionTooLong',
  POST_URL_TOO_LONG: 'templateJsonImport.errorPostUrlTooLong',
  RESOURCE_MISSING_NAME: 'templateJsonImport.errorResourceMissingName',
  RESOURCE_NAME_TOO_LONG: 'templateJsonImport.errorResourceNameTooLong',
  RESOURCE_URL_TOO_LONG: 'templateJsonImport.errorResourceUrlTooLong',
  IMPORT_FAILED: 'templateJsonImport.errorImportFailed',
}

const TemplateJsonImportDialogContainer = ({ cancelHandler }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [fileError, setFileError] = useState(null)

  const handleFilePicked = (fileSizeBytes, file) => {
    if (fileSizeBytes === null) {
      setFileError(null)
      return
    }
    if (
      !file.name.toLowerCase().endsWith('.json') ||
      (file.type && file.type !== 'application/json')
    ) {
      setFileError(t('templateJsonImport.errorInvalidFile'))
      return
    }
    if (fileSizeBytes > MAX_FILE_BYTES) {
      setFileError(t('templateJsonImport.errorSizeExceeded'))
    } else {
      setFileError(null)
    }
  }

  const handleSubmit = (file, templateName) => {
    const reader = new FileReader()
    reader.onload = async e => {
      const fileText = e.target.result

      let parsed
      try {
        parsed = JSON.parse(fileText)
      } catch {
        setFileError(t('templateJsonImport.errorInvalidFile'))
        return
      }

      if (!parsed.metadata || !Array.isArray(parsed.tasks)) {
        setFileError(t('templateJsonImport.errorInvalidFile'))
        return
      }

      if (parsed.metadata?.schemaVersion !== 1) {
        setFileError(t('templateJsonImport.errorSchemaMismatch'))
        return
      }

      setIsLoading(true)
      try {
        const response = await templateService.importTemplateFromJson({
          ...parsed,
          name: templateName,
        })

        if (response.status === StatusCodes.CREATED) {
          dispatch(fetchTemplates())
          dispatch(showSnackbar(t('templateJsonImport.successSnackbar')))
          navigate(`/template/${response.body.id}/overview`)
        } else {
          const errorCode = response.body?.errorCode
          const i18nKey =
            ERROR_CODE_I18N[errorCode] || 'templateJsonImport.errorGeneric'
          setFileError(t(i18nKey))
        }
      } catch {
        setFileError(t('templateJsonImport.errorGeneric'))
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <TemplateJsonImportFileDialog
      onSubmit={handleSubmit}
      onFilePicked={handleFilePicked}
      cancelHandler={cancelHandler}
      errorMessage={fileError}
      isLoading={isLoading}
    />
  )
}

TemplateJsonImportDialogContainer.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
}

export default TemplateJsonImportDialogContainer
