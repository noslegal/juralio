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

import ErrorIcon from '@mui/icons-material/Error'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import InfoHelperText from '../../../../../components/data-display/info-helper-text/InfoHelperText'
import { DESKTOP_DIALOG_WIDTH, MAX_FIELD_LENGTHS } from '../../../../constants'
import { CopyTaskToTemplate } from './CopyTaskToTemplate'

const inputProps = {
  maxLength: MAX_FIELD_LENGTHS.TASK_NAME,
}
const styleEmpty = {}
const styleDialog = { width: DESKTOP_DIALOG_WIDTH }
const useStyles = makeStyles()(theme => ({
  copyDialog: {
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
  },
  newTaskName: {
    width: `calc(100% - ${theme.spacing(1)})`,
    height: theme.spacing(8),
  },
}))

export const CopyDialogContent = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const getGuidanceText = () => {
    if (props.isTemplate) {
      return props.hasSubtasks
        ? t('copyTaskDialog.descriptionForTemplateTaskWithSubtasks')
        : t('copyTaskDialog.descriptionForTemplateTaskWithoutSubtasks')
    }
    return props.hasSubtasks
      ? t('copyTaskDialog.descriptionWithSubtasks')
      : t('copyTaskDialog.descriptionWithoutSubtasks')
  }

  return (
    <DialogContent
      style={props.fullScreen ? styleEmpty : styleDialog}
      data-test="dialog-content"
    >
      <TextField
        className={classes.newTaskName}
        label={t('copyTaskDialog.enterNewTaskName')}
        autoFocus={true}
        value={props.newName}
        onChange={props.handleChange}
        error={props.validationMessage.length > 0}
        helperText={props.validationMessage}
        data-test="new-task-name-text-field"
        slotProps={{
          htmlInput: inputProps,
        }}
      />
      <DialogContentText data-test="dialog-prompt-text">
        {getGuidanceText()}
      </DialogContentText>
      {props.isTemplate && (
        <CopyTaskToTemplate
          isTemplate={props.isTemplate}
          classes={classes}
          option={props.option}
          handleSelectChange={props.handleSelectChange}
          selectedTemplateId={props.selectedTemplateId}
          handleTemplateChange={props.handleTemplateChange}
          sourceTemplateId={props.sourceTemplateId}
          levelATaskValidation={props.levelATaskValidation}
          targetTemplateLevelValidationMessage={
            props.targetTemplateLevelValidationMessage
          }
          handleAnotherTemplateDestinationChange={
            props.handleAnotherTemplateDestinationChange
          }
          anotherTemplateValidation={props.anotherTemplateValidation}
          templateTasks={props.templateTasks}
          anotherTemplateOption={props.anotherTemplateOption}
          selectedTask={props.selectedTask}
          handleAnotherTemplateTaskChange={
            props.handleAnotherTemplateTaskChange
          }
        />
      )}
      {props.errorText.length > 0 && (
        <InfoHelperText
          text={props.errorText}
          icon={ErrorIcon}
          dataTest="copy-task-error"
          error={true}
        />
      )}
    </DialogContent>
  )
}
