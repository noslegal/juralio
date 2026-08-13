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
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CopyIcon from '../../../../../assets/images/ic-content-copy.svg'
import JuralioDialog from '../../../../../components/dialog/juralio-dialog/JuralioDialog'
import { getLocationParams } from '../../../../../services/helpers/route/route-helper'
import { getDeepestChildLevel } from '../../../../../services/helpers/task/task-util-helper'
import templateService from '../../../../../services/template/template-service'
import { CONFIG } from '../../../../constants'
import { TASK_OPERATION_DESTINATION } from '../../task-move/task-move-dialog/TaskOperationDestinationTypeDefinitions'
import { CopyDialogContent } from './CopyDialogContent'

/** Dialog to handle copying Task under parent or at Level A (new task at same peer level). */
const CopyTaskDialog = props => {
  const { t } = useTranslation()
  const [newName, setNewName] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [errorText, setErrorText] = useState('')
  const [option, setOption] = useState(t('copyTaskDialog.thisTemplate'))
  const [sourceTemplateId, setSourceTemplateId] = useState(undefined)
  const [targetTemplateId, setTargetTemplateId] = useState(undefined)
  const [
    targetTemplateLevelValidationMessage,
    setTargetTemplateLevelValidationMessage,
  ] = useState('')
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [anotherTemplateOption, setAnotherTemplateOption] = useState('')
  const [anotherTemplateValidation, setAnotherTemplateValidation] = useState('')
  const [templateTasks, setTemplateTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(undefined)

  useEffect(() => {
    if (props.cannotCopyHere()) {
      setOption(t('copyTaskDialog.anotherTemplate'))
    } else {
      props.mountHandler()
    }
    setNewName(getNewName())
    setSourceTemplateId(getLocationParams('template'))
  }, []) //eslint-disable-line

  useEffect(() => {
    if (targetTemplateId !== undefined) {
      if (props.cannotCopyHere()) {
        setErrorText(
          props.taskLevel === 1
            ? t('copyTaskDialog.templateCopyLevelAValidationMessage', {
                maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
              })
            : t('copyTaskDialog.templateCopySubtaskValidationMessage', {
                maxLevelACount: CONFIG.SUBTASK_LIMIT,
              })
        )
      }
      if (props.task.level === 1) {
        setAnotherTemplateOption(TASK_OPERATION_DESTINATION.LEVEL_A)
        if (
          templateTasks &&
          templateTasks?.tasks?.length === CONFIG.LEVEL_A_TASK_LIMIT
        ) {
          setAnotherTemplateValidation(
            t('copyTaskDialog.templateCopyMaxValidationMessage', {
              maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
            })
          )
        } else {
          setAnotherTemplateValidation('')
        }
      } else {
        setAnotherTemplateOption(TASK_OPERATION_DESTINATION.SUBTASK_OF)
      }

      setAnotherTemplateOption(
        props.task.level === 1
          ? TASK_OPERATION_DESTINATION.LEVEL_A
          : TASK_OPERATION_DESTINATION.SUBTASK_OF
      )
    }
  }, [targetTemplateId, templateTasks]) //eslint-disable-line

  const getNewName = () => {
    let newName = props.taskName
    const charCut = 70 - props.taskName.length
    if (props.taskName.length > 62) {
      newName = props.taskName.slice(0, charCut - 8)
    }
    if (targetTemplateId === undefined) {
      newName = t('copyTaskDialog.copyOf') + newName
    }
    return newName
  }

  const handleCopy = () => {
    if (newName) {
      setShowLoadingBar(true)
      if (anotherTemplateOption === TASK_OPERATION_DESTINATION.SUBTASK_OF) {
        props.copyTaskHandler(
          newName,
          selectedTask.id,
          anotherTemplateOption,
          targetTemplateId
        )
      } else {
        props.copyTaskHandler(
          newName,
          targetTemplateId,
          anotherTemplateOption,
          targetTemplateId
        )
      }
      return
    }
    setValidationMessage(t('commonValidationMessages.requiredField'))
  }

  const handleChange = e => {
    if (e.target.value.length > 0) {
      setValidationMessage('')
    }
    setNewName(e.target.value)
  }

  const handleSelectChange = e => {
    setOption(e.target.value)
    if (
      e.target.value === t('copyTaskDialog.here') ||
      e.target.value === t('copyTaskDialog.thisTemplate')
    ) {
      setTargetTemplateId(undefined)
      setAnotherTemplateOption('')

      if (props.cannotCopyHere()) {
        setErrorText(
          props.taskLevel === 1
            ? t('copyTaskDialog.templateCopyLevelAValidationMessage', {
                maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
              })
            : t('copyTaskDialog.templateCopySubtaskValidationMessage', {
                maxLevelACount: CONFIG.SUBTASK_LIMIT,
              })
        )
      }
    }
  }

  const handleTemplateChange = template => {
    setAnotherTemplateValidation('')
    setAnotherTemplateOption('')
    setTargetTemplateId(template.id)

    if (template.id) {
      templateService.getTemplate(template.id).then(response => {
        if (response.status === StatusCodes.OK) {
          setTemplateTasks(response.body)
        }
      })
    }
  }

  const handleAnotherTemplateDestinationChange = e => {
    setAnotherTemplateValidation('')
    if (
      templateTasks &&
      e.target.value === TASK_OPERATION_DESTINATION.LEVEL_A &&
      templateTasks?.tasks?.length === CONFIG.LEVEL_A_TASK_LIMIT
    ) {
      setAnotherTemplateValidation(
        t('copyTaskDialog.templateCopyMaxValidationMessage', {
          maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
        })
      )
    }
    setAnotherTemplateOption(e.target.value)
  }

  const handleAnotherTemplateTaskChange = task => {
    setAnotherTemplateValidation('')
    if (task.tasks.length === CONFIG.SUBTASK_LIMIT) {
      setAnotherTemplateValidation(
        t('copyTaskDialog.templateCopySubtaskValidationMessage', {
          maxLevelACount: CONFIG.SUBTASK_LIMIT,
        })
      )
    } else if (checkTaskDepthCapacity(task)) {
      setAnotherTemplateValidation(t('commonValidationMessages.taskDepthLimit'))
    }
    setSelectedTask(task)
  }

  const checkTaskDepthCapacity = task => {
    const childrenLevel =
      getDeepestChildLevel(props.task) - props.task.level + 1

    return childrenLevel + task.level > 6
  }

  const handleCreateTaskTemplateLevelAValidation = template => {
    const validationMessage =
      template.levelATaskCount === CONFIG.LEVEL_A_TASK_LIMIT &&
      option !== t('copyTaskDialog.anotherTemplate')
        ? t('copyTaskDialog.templateCopyMaxValidationMessage', {
            maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
          })
        : ''
    setTargetTemplateLevelValidationMessage(validationMessage)
  }

  const disableCopyButton =
    newName.length === 0 ||
    targetTemplateLevelValidationMessage.length > 0 ||
    errorText.length > 0 ||
    (option === t('copyTaskDialog.anotherTemplate') &&
      targetTemplateId === undefined) ||
    (anotherTemplateOption === '' &&
      option === t('copyTaskDialog.anotherTemplate')) ||
    (option === t('copyTaskDialog.anotherTemplate') &&
      anotherTemplateOption === TASK_OPERATION_DESTINATION.SUBTASK_OF &&
      selectedTask === undefined) ||
    anotherTemplateValidation.length > 0

  return (
    <JuralioDialog
      open={true}
      onClose={props.cancelHandler}
      fullScreen={props.fullScreen}
      titleText={t('copyTaskDialog.copyTask', {
        taskName: props.taskName,
      })}
      titleIcon={CopyIcon}
      handleAction={handleCopy}
      handleCancel={props.cancelHandler}
      actionLabel={t('common.copy')}
      disabled={disableCopyButton}
      showLoadingBar={!errorText.length && showLoadingBar}
      loadingText={t('copyTaskDialog.loadingText')}
    >
      <CopyDialogContent
        classes={props.classes}
        errorText={errorText}
        fullScreen={props.fullScreen}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleTemplateChange={handleTemplateChange}
        hasSubtasks={props.hasSubtasks}
        isTemplate={props.isTemplate}
        levelATaskValidation={handleCreateTaskTemplateLevelAValidation}
        newName={newName}
        option={option}
        selectedTemplateId={targetTemplateId}
        sourceTemplateId={sourceTemplateId}
        validationMessage={validationMessage}
        targetTemplateLevelValidationMessage={
          targetTemplateLevelValidationMessage
        }
        handleAnotherTemplateDestinationChange={
          handleAnotherTemplateDestinationChange
        }
        handleAnotherTemplateTaskChange={handleAnotherTemplateTaskChange}
        anotherTemplateValidation={anotherTemplateValidation}
        templateTasks={templateTasks}
        anotherTemplateOption={anotherTemplateOption}
        selectedTask={selectedTask}
      />
    </JuralioDialog>
  )
}

CopyTaskDialog.propTypes = {
  /** Name of task to be copied */
  taskName: PropTypes.string.isRequired,
  /** Cancel handler */
  cancelHandler: PropTypes.func.isRequired,
  /** Flag for mobile display */
  fullScreen: PropTypes.bool.isRequired,
  /** Enum to select post-copy behaviour */
  taskMenuContext: PropTypes.string.isRequired,
  /** Handler to copy this type of Task */
  copyTaskHandler: PropTypes.func.isRequired,
  /** Handler for when component is mounted*/
  mountHandler: PropTypes.func.isRequired,
  /** Flag for whether this is template related */
  isTemplate: PropTypes.bool,
}

export default CopyTaskDialog
