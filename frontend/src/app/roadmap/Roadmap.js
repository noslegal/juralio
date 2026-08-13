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

import PropTypes from 'prop-types'
import React, { Fragment, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  DATE_VARIABLES,
  TASK_MENU_CONTEXT,
  TASK_STATUS,
} from '../../app/constants'
import TaskRenamePopover from '../../components/data-display/task-cell/TaskRenamePopover'
import TaskOperationsMenu from '../../components/icicle/desktop/menu/TaskOperationsMenu'
import { flatTaskListFromTree } from '../../services/task/data-provider/task-list-data-provider'
import ConfirmDateTimeChangeContainer from '../task-details/task-card-content/TaskDates/ConfirmDateTimeChangeContainer'
import ConfirmStatusChangeContainer from '../task-details/task-card-header/task-status-menu/ConfirmStatusChangeContainer'
import DateChangePopover from '../task-map/date-change/DateChangePopover'
import TaskmapFilterZeroState from '../task-map/zero-state/TaskmapFilterZeroState'
import RoadmapConstants from './helpers/roadmap-constants'

import { getRoadmapTasksLeftScroll } from './render/roadmap-tasks-helpers'
import RoadmapTasks from './render/RoadmapTasks'
import RoadmapZeroState from './RoadmapZeroState'
import UnblockedTasksDialog from '../task-details/task-card-content/TaskLinks/UnblockedTasksDialog'
import { triggerResetDialog } from '../../components/navigation/common/dialog-triggers/dialog-trigger-actions'

const useStyles = makeStyles()(() => ({
  root: {
    width: 'calc(100%)',
    height: '100%',
    marginLeft: RoadmapConstants.ROADMAP_LHS_MARGIN,
    marginRight: RoadmapConstants.ROADMAP_RHS_MARGIN,
    overflowY: 'scroll',
  },
}))

const decorateTaskWithProjectDetails = (task, project) => {
  task.projectId = project.id
  if (task.level === 1) {
    task.parent = { type: 'PROJECT' }
  }
}

const Roadmap = props => {
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [menuState, setMenuState] = useState(null)
  const [targetXPos, setTargetXPos] = useState(getRoadmapTasksLeftScroll())
  const [xPos, setXPos] = useState(0)
  const [renameState, setRenameState] = useState(null)
  const closeRenameHandler = () => setRenameState(null)
  const statusChangeTaskId = useSelector(
    state => state.statusChange.statusChangeTargetTaskId
  )
  const statusChangePayload = useSelector(
    state => state.statusChange.statusChangePayload
  )
  const showUnblockedTasksDialog = useSelector(
    state => state.dialogTriggers.UNBLOCKED_TASKS_DIALOG
  )

  const taskmap = useSelector(state => state.taskmap)
  const dateChangeSelection = useSelector(state => state.taskmap.dateType)
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const { project, data, dimensions, roadMapRef, setTodayXPos, rangeEnd } =
    props
  const { rangeStart, daysInRange, today } = data
  const dayWidth = dimensions.width / data.daysInRange
  const roadMapTasksRef = useRef(null)

  const handleOptionsClick = (e, task, ref) => {
    if (e && e.currentTarget) {
      e.persist()
      decorateTaskWithProjectDetails(task, project)
      const id = e.currentTarget?.id
      setMenuState({
        anchor: ref ? ref : id ? () => document.getElementById(id) : null,
        task: task,
      })
    } else {
      setMenuState(null)
    }
    e.stopPropagation()
  }

  const handleUnblockedDialogClose = () => {
    dispatch(triggerResetDialog())
    window.localStorage.removeItem('unblocked-tasks-list')
  }

  const handleRenameClick = (e, clickedCellData) => {
    if (menuState) {
      const taskCell =
        typeof menuState.anchor === 'function'
          ? menuState.anchor().closest('[data-task-cell]')
          : menuState.anchor.closest('[data-task-cell]')
      const taskName = taskCell.querySelector('h6')
      setRenameState({
        taskNameAnchor: () => document.getElementById(taskName.id),
        taskNameTask: clickedCellData,
      })
      setMenuState(null)
    }
    e.stopPropagation()
  }

  if (props.displayTasks?.filter(t => !t.filteredOut).length === 0) {
    return (
      <div className={classes.root} ref={roadMapRef}>
        {props.areFiltersOn ? <TaskmapFilterZeroState /> : <RoadmapZeroState />}
      </div>
    )
  }
  const closeMenuHandler = () => setMenuState(null)

  const confirmStatusChange = taskId =>
    props.updateTaskDetails(taskId, statusChangePayload)

  return (
    <Fragment>
      <div id="roadmap" className={classes.root} ref={roadMapRef}>
        <RoadmapTasks
          roadmapData={data}
          setTasks={props.setTasks}
          tasks={props.displayTasks}
          updateDisplayedTasks={props.setDisplayTasks}
          dimensions={dimensions}
          taskCardClickHandler={props.taskCardClickHandler}
          handleOptionsClick={handleOptionsClick}
          roadmapRef={roadMapRef}
          roadMapTasksRef={roadMapTasksRef}
          timePeriod={props.timePeriod}
          highlightedTaskList={props.highlightedTaskList}
          getColourMode={props.getColourMode}
          targetXPos={targetXPos}
          setTargetXPos={setTargetXPos}
          xPos={xPos}
          setXPos={setXPos}
          rangeEnd={rangeEnd}
          lastLocation={props.lastLocation}
          detailedView={detailedView}
          projectId={project.id}
          matterId={project.matterId}
          viewOnly={props.viewOnly}
          onScroll={props.onScroll}
          focusTaskId={props.focusTaskId}
          resizeOffScreenRight={props.resizeOffScreenRight}
          resizeOffScreenLeft={props.resizeOffScreenLeft}
          setDraggingId={props.setDraggingId}
          draggingId={props.draggingId}
          handleDrag={props.handleDrag}
          dragDetails={props.dragDetails}
          resetScale={props.resetScale}
        />
        <TaskOperationsMenu
          anchor={menuState?.anchor}
          handleRenameClick={handleRenameClick}
          isMatterAdmin={props.isMatterAdmin}
          isTemplate={false}
          matterId={project.matterId}
          onClose={closeMenuHandler}
          task={menuState?.task}
          taskMenuContext={TASK_MENU_CONTEXT.ROADMAP}
          viewOnly={props.viewOnly}
        />
        <TaskRenamePopover
          anchor={renameState ? renameState.taskNameAnchor : null}
          task={renameState ? renameState.taskNameTask : null}
          onClose={closeRenameHandler}
          updateNameHandler={props.updateNameHandler}
        />
        {dateChangeSelection && (
          <DateChangePopover
            fullType={
              taskmap.dateType === DATE_VARIABLES.END
                ? taskmap.selectedTask?.status === TASK_STATUS.DONE
                  ? DATE_VARIABLES.AED
                  : DATE_VARIABLES.PED
                : taskmap.selectedTask?.status === TASK_STATUS.IN_PROGRESS
                  ? DATE_VARIABLES.ASD
                  : DATE_VARIABLES.PSD
            }
          />
        )}
      </div>
      {statusChangeTaskId && (
        <ConfirmStatusChangeContainer
          confirmHandler={() => confirmStatusChange(statusChangeTaskId)}
          task={flatTaskListFromTree(project).find(
            t => t.id === statusChangeTaskId
          )}
        />
      )}
      <ConfirmDateTimeChangeContainer
        matterId={project.matterId}
        projectId={project.id}
        isTaskmap={false}
        tasks={flatTaskListFromTree(project)}
        onCancel={() => {}}
      />
      {showUnblockedTasksDialog && (
        <UnblockedTasksDialog
          task={props.task}
          blockerslist={JSON.parse(
            window.localStorage.getItem('unblocked-tasks-list')
          )}
          matterId={props.matterId}
          projectId={props.projectId}
          onClose={() => handleUnblockedDialogClose()}
        />
      )}
    </Fragment>
  )
}

Roadmap.propTypes = {
  taskCardClickHandler: PropTypes.func.isRequired,
}

export default Roadmap
