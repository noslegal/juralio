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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const MaximumSubtasksMessage = props => {
  const { t } = useTranslation()

  return (
    <div data-test="maximum-subtasks-message">
      <Typography variant="caption" className={props.classes.subTaskHelp}>
        {t('help.maxNumberOfTasksAdvisory')}
      </Typography>
    </div>
  )
}

export default MaximumSubtasksMessage
