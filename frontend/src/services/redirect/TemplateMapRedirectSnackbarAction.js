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

import Button from '@mui/material/Button'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { closeSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import { templateMapRedirectPath } from './TemplateMapRedirect'

const TemplateMapRedirectSnackbarAction = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()

  const handleRedirect = () => {
    dispatch(closeSnackbar)
    const url = templateMapRedirectPath(props.templateId)
    history(url, { replace: true })
  }

  return (
    <Button
      color="secondary"
      size="small"
      onClick={handleRedirect}
      data-test="snackbar-redirect-action-button"
    >
      {t('common.open')}
    </Button>
  )
}

export default TemplateMapRedirectSnackbarAction

export const getTemplateMapRedirectSnackbarAction = templateId => (
  <TemplateMapRedirectSnackbarAction templateId={templateId} />
)
