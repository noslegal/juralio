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

import React, { useMemo } from 'react'
import {
  getNearestEndDateInTree,
  getNearestStartDateInTree,
  getTaskLeftPosition,
  getTaskWidth,
  shouldShowFloatingTaskCell,
} from './roadmap-tasks-helpers'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import RoadmapConstants from '../helpers/roadmap-constants'
import { getEndDate, getStartDate } from '../helpers/task-dates-helper'
import { getAllSubTasks } from '../helpers/roadmap-helpers'
import { getStatusColour } from '../../../services/helpers/task/task-status-colour-helper'
import TaskCell from '../../../components/data-display/task-cell/TaskCell'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const RoadmapTask = props => {
  const {
    task,
    timeScale,
    project,
    dragLeft,
    dragChange,
    tasks,
    filteredTasks,
    isCompact,
    matterId,
    projectId,
    draggingId,
    dragDetails,
  } = props

  task.parent = filteredTasks.find(t =>
    t.tasks.map(child => child.id).includes(task.id)
  )
  const flatTaskList = useMemo(() => flatTaskListFromTree(project), [project])
  let left = getTaskLeftPosition(
    task,
    timeScale,
    false,
    true,
    dragLeft,
    getNearestStartDateInTree(task, flatTaskList)
  )
  if (typeof left === 'number') {
    left = left + dragLeft //for dragging with no date
  }

  let populateEndDate = getNearestEndDateInTree(task, flatTaskList)
  let populateStartDate = getNearestStartDateInTree(task, flatTaskList)
  if (!populateStartDate) {
    populateStartDate = dayjs.utc().toDate()
  }
  let width =
    getTaskWidth(
      task,
      timeScale,
      false,
      null,
      populateStartDate,
      populateEndDate,
      false
    ) +
    dragChange -
    dragLeft
  if (width < RoadmapConstants.TASK_WIDTH) {
    width = RoadmapConstants.TASK_WIDTH
  }

  let _startDate = getStartDate(task, true, populateStartDate)
  let _endDate = getEndDate(task, true, populateEndDate)

  if (_startDate) {
    _startDate = new Date(_startDate)
  }
  const needsReplanning = _endDate < _startDate
  if (getEndDate(task, false) === null && task.level > 1) {
    _endDate = _startDate
  }
  if (_startDate && _endDate) {
    if (
      timeScale(_endDate) + dragChange - (timeScale(_startDate) + dragLeft) <
      RoadmapConstants.TASK_WIDTH
    ) {
      width = RoadmapConstants.TASK_WIDTH
    } else {
      width =
        timeScale(_endDate) +
        dragChange -
        (timeScale(_startDate) + dragLeft) +
        (needsReplanning ? RoadmapConstants.ROADMAP_END_PIN_OFFSET : 0)
    }
  }

  if (!_endDate && dragChange < RoadmapConstants.TASK_WIDTH) {
    width = RoadmapConstants.TASK_WIDTH
  }

  let isChildOfDraggingTask = false
  if (draggingId) {
    let subtasks = getAllSubTasks(tasks.find(t => t.id === draggingId)).map(
      t => t.id
    )
    isChildOfDraggingTask = subtasks.includes(task.id)
  }
  if (isChildOfDraggingTask) {
    if (
      (dragDetails.isStart && _startDate < new Date(dragDetails.date)) ||
      (!dragDetails.isStart && _startDate > new Date(dragDetails.date))
    ) {
      left = timeScale(dragDetails.date) + 'px'
    }
    if (
      !dragDetails.isStart &&
      new Date(getEndDate(task, false)) > new Date(dragDetails.date)
    ) {
      width = Math.max(
        timeScale(new Date(dragDetails.date)) -
          parseInt(typeof left === 'string' ? left.split('px')[0] : left),
        RoadmapConstants.TASK_WIDTH
      )
    }
  }

  const showFloating = shouldShowFloatingTaskCell(task, timeScale)
  return (
    <div
      id={task.id}
      key={task.id}
      className="roadmap-tasks"
      data-test={`roadmap-task-${task.id}`}
      style={{
        position: 'absolute',
        left: left,
        width: width,
        top: 20,
        zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
      }}
      taskid={task.id}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          display: 'flex',
          borderRadius: '4px',
          border:
            props.focusTaskId && props.focusTaskId === task.id
              ? `3px solid ${getStatusColour(task.status)}`
              : '3px solid rgba(0,0,0,0)',
          borderBottom:
            !props.isMinimap &&
            props.focusTaskId &&
            props.focusTaskId === task.id
              ? `2px solid ${getStatusColour(task.status)}`
              : '2px solid rgba(0,0,0,0)',
          boxShadow:
            !props.isMinimap &&
            props.focusTaskId &&
            props.focusTaskId === task.id &&
            `0px 0px 6px  ${getStatusColour(task.status)}`,
        }}
      >
        <TaskCell
          item={task}
          isAboveHeightThreshold={true}
          isHighlighted={
            props.highlightedTaskList &&
            props.highlightedTaskList !== null &&
            props.highlightedTaskList.find(i => i.id === task.id) !== undefined
          }
          colourMode={props.getColourMode(task)}
          isReadOnly={props.viewOnly}
          matterId={matterId}
          projectId={projectId}
          showOptions={!showFloating}
          displayContent={!showFloating}
          clickHandler={props.taskCardClickHandler}
          handleOptionsClick={props.handleOptionsClick}
          detailedView={props.detailedView}
          compactHeight={isCompact}
          viewOnly={props.viewOnly}
          noMargin={true}
          renderDates={true}
          selectedTask={null}
          hideHover={false}
          disableBackgroundColor={false}
          handleDateClick={() => {}}
        />
      </div>

      {showFloating && (
        <div
          key={task.id}
          style={{
            position: 'sticky',
            left: '0',
            width: RoadmapConstants.TASK_WIDTH,
            zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
            border: '3px solid rgba(0,0,0,0)',
            borderBottom: '2px solid rgba(0,0,0,0)',
          }}
        >
          <TaskCell
            item={task}
            isAboveHeightThreshold={true}
            isHighlighted={
              props.highlightedTaskList &&
              props.highlightedTaskList !== null &&
              props.highlightedTaskList.find(i => i.id === task.id) !==
                undefined
            }
            colourMode={props.getColourMode(task)}
            isReadOnly={false}
            matterId={matterId}
            projectId={projectId}
            clickHandler={props.taskCardClickHandler}
            handleOptionsClick={props.handleOptionsClick}
            showOptions={true}
            hideHover={true}
            disableBackgroundColor={true}
            detailedView={props.detailedView}
            compactHeight={isCompact}
            viewOnly={props.viewOnly}
            noMargin={true}
            renderDates={true}
            selectedTask={null}
            displayContent={true}
            handleDateClick={() => {}}
          />
        </div>
      )}
    </div>
  )
}

export default RoadmapTask
