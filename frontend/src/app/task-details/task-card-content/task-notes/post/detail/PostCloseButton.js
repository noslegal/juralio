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

import { Close } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
} from '../../../../../../components/navigation/common/location-context-helper'

const PostCloseButton = props => {
  const history = useNavigate()
  const closePostView = () => {
    const url = props.isTemplate
      ? getTemplateTaskDetailsUrl(
          props.template.template.id,
          props.templateTask.id
        )
      : getTaskDetailsUrl(
          props.project.matterId,
          props.project.id,
          props.task.id
        )
    history(url)
  }

  const { t } = useTranslation()
  return (
    <Tooltip title={t('taskDetails.postCloseTooltip')}>
      <IconButton
        data-test="task-content-header-menu-close-button"
        onClick={closePostView}
        size="large"
      >
        <Close />
      </IconButton>
    </Tooltip>
  )
}

export default PostCloseButton
