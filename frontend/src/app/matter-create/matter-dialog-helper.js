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

export const PROJECT_TYPE = {
  BLANK: 'BLANK',
  FROM_TEMPLATE: 'FROM_TEMPLATE',
  SPLIT: 'SPLIT',
}

export const MATTER_CREATION = {
  MATTER_TYPE: 'MATTER_TYPE',
  WORKFLOW_TYPE: 'WORKFLOW_TYPE',
  TEMPLATE_CHOICE: 'TEMPLATE_CHOICE',
  DEFAULT_LOADING_SCREEN: 'DEFAULT_LOADING_SCREEN',
  MATTER_DETAILS: 'MATTER_DETAILS',
}

export const getTitle = (t, classes, screen) => {
  switch (screen) {
    case MATTER_CREATION.MATTER_DETAILS:
      return (
        <div>
          <Typography className={classes.dialogHeaderTitle} variant="h6">
            {t('matterDetails.addDetails')}
          </Typography>
        </div>
      )
    case MATTER_CREATION.MATTER_TYPE:
      return (
        <div>
          <Typography className={classes.dialogHeaderTitle} variant="h6">
            {t('matterDetails.create')}
          </Typography>
        </div>
      )
    case MATTER_CREATION.WORKFLOW_TYPE:
      return (
        <div>
          <Typography className={classes.dialogHeaderTitle} variant="h6">
            {t('matterDetails.create')}
          </Typography>
        </div>
      )
    case MATTER_CREATION.PROJECT_TYPE:
      return (
        <Typography className={classes.dialogHeaderTitle} variant="h6">
          {t('matterDetails.dialogTitle')}
        </Typography>
      )
    case MATTER_CREATION.TEMPLATE_CHOICE:
      return (
        <div>
          <Typography className={classes.dialogHeaderTitle} variant="h6">
            {t('matterDetails.dialogTitle')}
          </Typography>
        </div>
      )
    case MATTER_CREATION.DEFAULT_LOADING_SCREEN:
      return (
        <div>
          <Typography className={classes.dialogHeaderTitle} variant="h6">
            {t('matterDetails.creating')}
          </Typography>
        </div>
      )
    default:
      return 'error'
  }
}

export const getCancelButtonText = (t, screen, props, templateList) => {
  switch (screen) {
    case MATTER_CREATION.MATTER_TYPE:
      return t('common.cancel')
    case MATTER_CREATION.WORKFLOW_TYPE:
      return t('common.cancel')
    case MATTER_CREATION.MATTER_DETAILS:
      return templateList?.length === 0 ? t('common.cancel') : t('common.back')
    default:
      return t('common.back')
  }
}

export const getConfirmButtonText = (t, screen) => {
  switch (screen) {
    case MATTER_CREATION.MATTER_DETAILS:
      return t('matterDialog.button')
    default:
      return t('common.next')
  }
}
