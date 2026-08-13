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

import { FormControl, FormHelperText, Typography } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import TemplateSelect from '../../../../../components/inputs/template-select/TemplateSelect'
import { flatTaskListFromTree } from '../../../../../services/task/data-provider/task-list-data-provider'
import TaskMoveTaskSelect from '../../task-move/task-move-dialog/task-select/TaskMoveTaskSelect'
import { DestinationMenu } from '../../task-move/task-move-dialog/TaskMoveDestinationMenu'
import { TASK_OPERATION_DESTINATION } from '../../task-move/task-move-dialog/TaskOperationDestinationTypeDefinitions'

const useStyles = makeStyles()(theme => ({
  flexContainerCopy: {
    display: 'flex',
  },
  flexItemLabel: {
    flex: 1,
    marginTop: theme.spacing(1),
  },
  flexItemSelect: {
    flex: 3,
  },
  copySelect: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
}))

export const CopyTaskToTemplate = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div className={classes.flexContainerCopy}>
      <div className={classes.flexItemLabel}>
        <Typography variant="subtitle1">
          {t('copyTaskDialog.copyTaskTo')}
        </Typography>
      </div>
      <div className={classes.flexItemSelect}>
        <Select
          value={props.option}
          onChange={props.handleSelectChange}
          className={classes.copySelect}
          data-test="new-task-destination-type"
        >
          <MenuItem
            value={t('copyTaskDialog.thisTemplate')}
            data-test="thisTemplate"
          >
            <Typography variant="subtitle1">
              {t('copyTaskDialog.thisTemplate')}
            </Typography>
          </MenuItem>
          <MenuItem
            value={t('copyTaskDialog.anotherTemplate')}
            data-test="another-template"
          >
            <Typography variant="subtitle1">
              {t('copyTaskDialog.anotherTemplate')}
            </Typography>
          </MenuItem>
        </Select>
        {props.option === t('copyTaskDialog.anotherTemplate') && (
          <>
            <TemplateSelect
              key={props.selectedTemplateId}
              selectionChangeHandler={props.handleTemplateChange}
              templateId={props.selectedTemplateId}
              placeholder={t('copyTaskDialog.chooseATemplate')}
              templatesToExclude={[{ id: props.sourceTemplateId }]}
              handleCreateTaskTemplateLevelAValidation={
                props.levelATaskValidation
              }
            />
            <ValidationMessage
              targetTemplateLevelValidationMessage={
                props.targetTemplateLevelValidationMessage
              }
            />
          </>
        )}
        {props.selectedTemplateId !== undefined && (
          <>
            <DestinationMenu
              selectedMoveType={props.anotherTemplateOption}
              handleChange={props.handleAnotherTemplateDestinationChange}
              root={props.classes.destinationMenu}
              isTemplate={true}
              hideProject={true}
              allowMoveToPhase={true}
            />
            <FormControl error={props.anotherTemplateValidation}>
              <FormHelperText data-test="template-selection-validation-message">
                {props.anotherTemplateOption !==
                  TASK_OPERATION_DESTINATION.SUBTASK_OF &&
                  props.anotherTemplateValidation}
              </FormHelperText>
            </FormControl>
          </>
        )}
        {props.anotherTemplateOption ===
          TASK_OPERATION_DESTINATION.SUBTASK_OF && (
          <div style={{ paddingTop: '0px' }}>
            <TaskMoveTaskSelect
              selectedTask={props.selectedTask}
              validTargetTasks={flatTaskListFromTree(props.templateTasks)}
              error={props.anotherTemplateValidation}
              selectionChangeHandler={props.handleAnotherTemplateTaskChange}
              placeholderText={t('templates.chooseATemplateTask')}
            />
            <FormControl error={props.anotherTemplateValidation}>
              <FormHelperText data-test="template-selection-validation-message">
                {props.anotherTemplateValidation}
              </FormHelperText>
            </FormControl>
          </div>
        )}
      </div>
    </div>
  )
}

const ValidationMessage = props => {
  return props.targetTemplateLevelValidationMessage.length > 0 ? (
    <FormHelperText data-test="template-selection-validation-message">
      {props.targetTemplateLevelValidationMessage}
    </FormHelperText>
  ) : null
}
