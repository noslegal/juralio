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

import { mdiFileWord } from '@mdi/js'
import { Divider, Tooltip } from '@mui/material'
import Menu from '@mui/material/Menu'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import JurMilestone from '../../../../assets/images/JurMilestone'
import { isInTemplate } from '../../../../components/navigation/common/location-context-helper'
//import useExperimentalSettings from '../../../../hooks/experimental-settings-hook'
import { flatTaskListFromTree } from '../../../../services/task/data-provider/task-list-data-provider'
import {
  CopyIcon,
  DateLinkingIcon,
  EditIcon,
} from '../../../../theme/navigation/CommonIcons'
import { TASK_MENU_CONTEXT, TASK_STATUS } from '../../../constants'
import { fetchProject } from '../../../project/project-actions'
import { hideTaskPreview } from '../../task-actions'
import TaskEditLinkDialog from '../../task-card-content/TaskLinks/TaskEditLinkDialog'
import ArchiveTaskContainer from '../../task-options/task-archive/ArchiveTaskContainer'
import CopyTaskContainer from '../../task-options/task-copy/CopyTaskContainer'
import MoveTaskContainer from '../../task-options/task-move/MoveTaskContainer'
import ShiftTaskDialog from '../../task-options/task-shift/ShiftTaskDialog'
import OperationMenuItem from './OperationMenuItem'
import StatusMenuItem from './StatusMenuItem'
import JurShift from '../../../../assets/images/JurShift'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ArchiveIcon from '@mui/icons-material/Archive'
import MoveIcon from '@mui/icons-material/CallMade'
import JurDeliverable from '../../../../assets/images/JurDeliverable'

const DIALOG_NAMES = {
  COPY: 'COPY',
  ARCHIVE: 'ARCHIVE',
  MOVE: 'MOVE',
  LINK: 'LINK',
  SHIFT: 'SHIFT',
}

const TaskMenu = props => {
  const { t } = useTranslation()
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showMove, setShowMove] = useState(false)
  const [showCopy, setShowCopy] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [showShift, setShowShift] = useState(false)
  const [siblings, setSiblings] = useState([])
  const project = useSelector(state => state.project)
  const isExternal = useSelector(state => state.auth.data.details.isExternal)
  const isTemplate = isInTemplate(window.location.href)
  //const experimentalOptions = useExperimentalSettings()
  const showTaskLinkOption = false
  //experimentalOptions.loaded &&
  //!experimentalOptions.options.disableTaskLinking

  const [isNotRequiredTask, setIsNotRequiredTask] = useState(
    props.task.status === TASK_STATUS.NOT_REQUIRED
  )
  const isMilestone = props.task.isMilestone
  const isDeliverable = props.task.isDeliverable
  const hasPlannedDates =
    props.task.plannedStartDate || props.task.plannedEndDate
  const dispatch = useDispatch()

  useEffect(() => {
    if (!project.isLoaded) {
      if (!isTemplate) {
        dispatch(
          fetchProject(props.matterId, props.task.project.id, {
            includeFullHierarchy: true,
          })
        )
      }
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    let siblings = { tasks: [props.task] }

    if (project.tasks) {
      siblings = flatTaskListFromTree(project).find(t =>
        t.tasks.map(t2 => t2.id).includes(props.task.id)
      )
    }
    if (siblings === undefined) {
      siblings = {
        tasks: flatTaskListFromTree(project).filter(task => task.level === 1),
      }
    }

    siblings = siblings.tasks.filter(task => task.status !== TASK_STATUS.DONE)
    setSiblings(siblings)
  }, [project, props.task])

  useEffect(() => {
    setIsNotRequiredTask(props.task.status === TASK_STATUS.NOT_REQUIRED)
  }, [props.task.status])

  const isMenuOpen = () => {
    return (
      Boolean(props.anchor) &&
      !showMove &&
      !showCopy &&
      !showArchive &&
      !showLink
    )
  }

  const showDialog = dialogName => () => {
    switch (dialogName) {
      case DIALOG_NAMES.MOVE:
        setShowMove(true)
        break
      case DIALOG_NAMES.COPY:
        setShowCopy(true)
        break
      case DIALOG_NAMES.ARCHIVE:
        setShowArchive(true)
        break
      case DIALOG_NAMES.LINK:
        setShowLink(true)
        break
      case DIALOG_NAMES.SHIFT:
        setShowShift(true)
        break
      default:
        break
    }
  }

  const hideDialog = dialogName => () => {
    props.closeHandler()
    setShowMoreOptions(false)
    switch (dialogName) {
      case DIALOG_NAMES.MOVE:
        dispatch(hideTaskPreview())
        setShowMove(false)
        break
      case DIALOG_NAMES.COPY:
        dispatch(hideTaskPreview())
        setShowCopy(false)
        break
      case DIALOG_NAMES.ARCHIVE:
        dispatch(hideTaskPreview())
        setShowArchive(false)
        break
      case DIALOG_NAMES.LINK:
        dispatch(hideTaskPreview())
        setShowLink(false)
        break
      case DIALOG_NAMES.SHIFT:
        setShowShift(false)
        break
      default:
        break
    }
  }

  const renderStatusOptions = () => {
    const status = props.task.status
    // Menu does not accept a fragment as a child.
    return (
      <span>
        <StatusMenuItem
          taskState={TASK_STATUS.NOT_STARTED}
          currentStatus={status}
          updateHandler={props.updateHandler}
          vanityTaskState={
            props.task.isMilestone ? TASK_STATUS.NOT_STARTED_MILESTONE : null
          }
          disabled={props.viewOnly}
        />
        {!isMilestone && (
          <StatusMenuItem
            taskState={TASK_STATUS.IN_PROGRESS}
            currentStatus={status}
            updateHandler={props.updateHandler}
            disabled={props.viewOnly}
          />
        )}

        <StatusMenuItem
          taskState={TASK_STATUS.DONE}
          currentStatus={status}
          updateHandler={props.updateHandler}
          vanityTaskState={
            props.task.isMilestone ? TASK_STATUS.DONE_MILESTONE : null
          }
          disabled={props.viewOnly}
        />

        {!isMilestone && !isExternal && (
          <StatusMenuItem
            taskState={TASK_STATUS.NOT_REQUIRED}
            currentStatus={status}
            updateHandler={props.confirmNotRequiredHandler}
            disabled={props.viewOnly}
          />
        )}
        <Divider />
      </span>
    )
  }

  const renderRenameOption = () => {
    return (
      <OperationMenuItem
        handleClick={props.handleRenameClick}
        icon={EditIcon}
        operationType={'Rename'}
        task={props.task}
        disabled={props.viewOnly}
      />
    )
  }

  const renderDownloadOption = () => {
    return (
      <span>
        {!props.viewOnly && <Divider />}
        <OperationMenuItem
          handleClick={props.downloadHandler}
          iconPath={mdiFileWord}
          operationType={'DownloadWord'}
        />
      </span>
    )
  }

  const renderMilestoneOption = () => {
    if (isMilestone) {
      return (
        <OperationMenuItem
          handleClick={props.handleMilestoneConversion}
          icon={JurMilestone}
          operationType={'convertToTask'}
          disabled={props.viewOnly}
        />
      )
    }
    if (!isMilestone && props.task.tasks?.length > 0) {
      return (
        <OperationMenuItem
          handleClick={() => {}}
          icon={JurMilestone}
          operationType={'convertToMilestone'}
          disabled={true}
          tooltipText={t('operationMenuItem.cantConvertToMilestoneDetails')}
        />
      )
    }
    return (
      <OperationMenuItem
        handleClick={props.handleMilestoneConversion}
        icon={JurMilestone}
        operationType={'convertToMilestone'}
        disabled={props.viewOnly}
      />
    )
  }

  const renderDeliverableOption = () => {
    if (isDeliverable) {
      return (
        <OperationMenuItem
          handleClick={props.handleDeliverableConversion}
          icon={JurDeliverable}
          operationType={'convertToTask'}
          disabled={props.viewOnly}
        />
      )
    }
    return (
      <OperationMenuItem
        handleClick={props.handleDeliverableConversion}
        icon={JurDeliverable}
        operationType={'convertToDeliverable'}
        disabled={props.viewOnly}
      />
    )
  }

  const renderShiftOption = () => (
    <OperationMenuItem
      handleClick={showDialog(DIALOG_NAMES.SHIFT)}
      icon={JurShift}
      operationType={'Shift'}
      disabled={
        props.viewOnly ||
        props.task.status !== TASK_STATUS.NOT_STARTED ||
        !hasPlannedDates ||
        isMilestone
      }
      tooltipText={
        !hasPlannedDates &&
        !isMilestone &&
        props.task.status === TASK_STATUS.NOT_STARTED
          ? t('operationMenuItem.hasNoSetDates')
          : isMilestone
            ? t('operationMenuItem.noShiftMilestone')
            : props.task.status !== TASK_STATUS.NOT_STARTED
              ? t('operationMenuItem.onlyNSTasks')
              : ''
      }
    />
  )

  if (props.anchor && props.anchor.clientHeight === 0) return null // Prevent console error on update.
  return (
    <div>
      <Menu
        getContentAnchorEl={null}
        disableAutoFocusItem={true}
        anchorEl={props.anchor}
        anchorOrigin={props.anchorOrigin}
        open={isMenuOpen()}
        onClose={() => {
          props.closeHandler()
          setShowMoreOptions(false)
        }}
        slotProps={{
          list: { 'data-test': 'task-card-option-menu' },
        }}
      >
        <Tooltip
          title={t('matter.viewOnly')}
          disableHoverListener={!props.viewOnly}
          slotProps={{
            popper: {
              anchorEl: props.anchor,
              anchorOrigin: props.anchorOrigin,
            },
          }}
        >
          <span>
            {props.viewOnly && !isNotRequiredTask && renderDownloadOption()}
            {renderStatusOptions()}

            {!isNotRequiredTask && !props.hideRename && renderRenameOption()}
            {!isNotRequiredTask && !isExternal && renderShiftOption()}
          </span>
        </Tooltip>
        {!showMoreOptions && (
          <OperationMenuItem
            operationType={'More'}
            icon={MoreHorizIcon}
            handleClick={e => {
              setShowMoreOptions(true)
            }}
          />
        )}
        {showMoreOptions && !isExternal && (
          <OperationMenuItem
            handleClick={showDialog(DIALOG_NAMES.ARCHIVE)}
            icon={ArchiveIcon}
            operationType={'Archive'}
            disabled={props.viewOnly}
          />
        )}
        {showMoreOptions && !isNotRequiredTask && !isExternal && (
          <>
            <OperationMenuItem
              handleClick={showDialog(DIALOG_NAMES.MOVE)}
              icon={MoveIcon}
              operationType={'Move'}
              disabled={props.viewOnly}
            />
            <OperationMenuItem
              handleClick={showDialog(DIALOG_NAMES.COPY)}
              icon={CopyIcon}
              operationType={'Copy'}
              disabled={props.viewOnly}
            />
          </>
        )}
        {showMoreOptions &&
          siblings.length > 0 &&
          props.task.status !== TASK_STATUS.DONE &&
          props.task.status !== TASK_STATUS.NOT_REQUIRED &&
          props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP &&
          showTaskLinkOption && (
            <OperationMenuItem
              handleClick={showDialog(DIALOG_NAMES.LINK)}
              icon={DateLinkingIcon}
              operationType={
                props.task.datesLinkedToSiblings ? 'linkEdit' : 'Link'
              }
              disabled={props.viewOnly}
            />
          )}
        {showMoreOptions &&
          props.task.tasks &&
          props.task.status !== TASK_STATUS.NOT_REQUIRED &&
          props.task.level > 1 &&
          renderMilestoneOption()}
        {showMoreOptions &&
          props.task.tasks &&
          props.task.status !== TASK_STATUS.NOT_REQUIRED &&
          props.task.level > 1 &&
          renderDeliverableOption()}
        {!props.viewOnly &&
          showMoreOptions &&
          !isNotRequiredTask &&
          renderDownloadOption()}
      </Menu>
      {showMove && (
        <MoveTaskContainer
          matterId={props.matterId}
          task={props.task}
          display={showMove}
          cancelHandler={hideDialog(DIALOG_NAMES.MOVE)}
          taskMapContext={props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP}
          taskMenuContext={props.taskMenuContext}
          updateProject={props.updateProject}
        />
      )}
      {showCopy && (
        <CopyTaskContainer
          matterId={props.matterId}
          task={props.task}
          display={showCopy}
          cancelHandler={hideDialog(DIALOG_NAMES.COPY)}
          taskMenuContext={props.taskMenuContext}
          dontRedirect={props.dontRedirect}
          updateProject={props.updateProject}
        />
      )}
      {showArchive && (
        <ArchiveTaskContainer
          matterId={props.matterId}
          task={props.task}
          display={showArchive}
          cancelHandler={hideDialog(DIALOG_NAMES.ARCHIVE)}
          taskMenuContext={props.taskMenuContext}
          dontRedirect={props.dontRedirect}
          updateProjectTaskmap={props.updateProject}
        />
      )}
      {showShift && (
        <ShiftTaskDialog
          matterId={props.matterId}
          task={props.task}
          display={showShift}
          cancelHandler={hideDialog(DIALOG_NAMES.SHIFT)}
          closeHandler={hideDialog(DIALOG_NAMES.SHIFT)}
          taskMenuContext={props.taskMenuContext}
          dontRedirect={props.dontRedirect}
          updateProjectTaskmap={props.updateProject}
        />
      )}
      {showLink && props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP && (
        <TaskEditLinkDialog
          task={props.task}
          matterId={props.matterId}
          projectId={project.id}
          siblings={siblings}
          siblingTaskCount={
            siblings.filter(t => t.datesLinkedToSiblings === true).length || 0
          }
          updateProject={props.updateProject}
          handleCancel={hideDialog(DIALOG_NAMES.LINK)}
          handleClose={hideDialog(DIALOG_NAMES.LINK)}
        />
      )}
    </div>
  )
}

export default TaskMenu

TaskMenu.propTypes = {
  anchor: PropTypes.object,
  anchorOrigin: PropTypes.object,
  closeHandler: PropTypes.func.isRequired,
  confirmStatusChangeHandler: PropTypes.func.isRequired,
  confirmNotRequiredHandler: PropTypes.func.isRequired,
  downloadHandler: PropTypes.func.isRequired,
  handleRenameClick: PropTypes.func,
  matterId: PropTypes.string.isRequired,
  task: PropTypes.object.isRequired,
  taskMenuContext: PropTypes.string.isRequired,
  taskStates: PropTypes.array,
  updateHandler: PropTypes.func.isRequired,
}
