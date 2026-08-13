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

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { TASK_CELL_COLOUR, TASK_STATUS } from '../../constants'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'
import RoadmapConstants from '../helpers/roadmap-constants'
import {
  getEndDate,
  getStartDate,
  isPEDBeforeASD,
  isPlannedEndDateOverdue,
  isPlannedStartDateOverdue,
} from '../helpers/task-dates-helper'

import Chevron from './Chevron'
import {
  getBridgeColour,
  getBridgeLeftPosition,
  getNearestEndDateInTree,
  getNearestStartDateInTree,
  getRoadmapTasksLeftScroll,
  getTaskLeftPosition,
  getTaskWidth,
} from './roadmap-tasks-helpers'
import RenderIfVisible from '../../improved-taskmap/taskmap-helpers/render-if-visible'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import dayjs from 'dayjs'
import RoadmapBreadCrumb from './RoadmapBreadCrumb'
import { isSameDay } from '../../../services/helpers/date-helper'
import { getTaskCellColour } from '../../../services/helpers/task/task-status-colour-helper'
import { softFilterTasks } from '../../../services/helpers/task/filter-tasks'
import {
  receiveTaskSuccess,
  updateTaskDetails,
} from '../../task-map/selected-task/selected-task-actions'
import { getAllSubTasks } from '../helpers/roadmap-helpers'
import RoadmapPin from './RoadmapPin'
import RoadmapTask from './RoadmapTask'

const RoadmapRow = props => {
  const {
    filteredTasks,
    dimensions,
    timeScale,
    isCompact,
    matterId,
    projectId,
    tasks,
    classes,
    rowHeight,
    additionalHeight,
  } = props
  const [isDragging, setIsDragging] = useState(false)
  const [showDragConfirmation, setShowDragConfirmation] = useState(false)
  const [isDraggingStart, setIsDraggingStart] = useState(true)
  const [dragChange, setDragChange] = useState(0)
  const [dragLeft, setDragLeft] = useState(0)
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const project = useSelector(state => state.project)
  const flatTaskList = useMemo(() => flatTaskListFromTree(project), [project])
  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )
  const [resetPins, setResetPins] = useState(false)
  useEffect(() => {
    if (resetPins) {
      setTimeout(() => setResetPins(false), 100)
    }
  }, [resetPins])
  const [hover, setHover] = useState(false)
  const [startDragNode, setStartDragNode] = useState(null)
  const [endDragNode, setEndDragNode] = useState(null)
  const filterLabels = useSelector(state => state.taskMapFilter.filterLabels)
  const jumpToTask = task => {
    const taskCellLeftPos =
      timeScale(new Date(getStartDate(task, true))) -
      RoadmapConstants.PIN_WIDTH / 2

    // calc increment
    // s = d / t
    const screenX = getRoadmapTasksLeftScroll()
    let distance = 0
    if (screenX > taskCellLeftPos) {
      distance = screenX - taskCellLeftPos
    } else {
      distance = taskCellLeftPos - screenX
    }
    const time = 10
    const speed = distance / time
    let interval
    let xPos = document.getElementById('roadmap-tasks-wrapper')?.scrollLeft

    const scrollToTargetedX = (targetXPos, increment) => {
      if (
        xPos < targetXPos - increment / 2 ||
        xPos > targetXPos + increment / 2
      ) {
        const doc = document.getElementById('roadmap-tasks-wrapper')
        if (doc) {
          if (xPos > targetXPos) {
            increment = -increment
          }
          const newXPos = doc.scrollLeft + increment
          xPos = newXPos
          doc.scrollLeft = newXPos
        }
      } else {
        clearInterval(interval)
      }
    }

    interval = setInterval(() => {
      scrollToTargetedX(taskCellLeftPos, speed)
    })
  }

  const getIsVisible = () => {
    const scrollLeft =
      props.leftScroll ||
      document.getElementById('roadmap-tasks-wrapper')?.scrollLeft ||
      0
    const windowWidth = window.innerWidth
    const windowRight = scrollLeft + windowWidth
    let pos = getTaskLeftPosition(props.task, timeScale, false, true)

    const taskLeft = typeof pos === 'string' ? pos.replace('px', '') : pos
    const width = parseFloat(getTaskWidth(props.task, timeScale))
    const taskRight = taskLeft + width
    if (scrollLeft < taskLeft && taskRight < windowRight) return true
    if (taskLeft < scrollLeft && scrollLeft < taskRight) return true
    if (windowRight < taskRight && taskLeft < windowRight) return true

    return false
  }

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setIsVisible(getIsVisible())
  }, [props.leftScroll, props.timePeriod]) //eslint-disable-line

  const renderChevron = (i, task, timeScale) => {
    if (!isVisible) {
      const screenX = getRoadmapTasksLeftScroll()
      const taskCellLeftPos =
        timeScale(new Date(getStartDate(task))) - RoadmapConstants.PIN_WIDTH / 2
      const taskCellWidth = getTaskWidth(task, timeScale)
      const screenWidth = dimensions.screen.width

      const taskIsOffRightOfScreen = screenX + screenWidth < taskCellLeftPos
      const taskIsOffLeftOfScreen = screenX > taskCellLeftPos + taskCellWidth
      if (taskIsOffRightOfScreen || taskIsOffLeftOfScreen) {
        return (
          <div
            style={{
              position: 'sticky',
              right: '0px',
            }}
          >
            <div
              style={{
                position: 'sticky',
                float: taskIsOffLeftOfScreen ? 'left' : 'right',
                zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
                display: 'flex',
                right: 0,
                left: 0,
              }}
              id={`chevron-${task.id}`}
              class={`chevron-${task.id}`}
            >
              <Chevron
                task={task}
                getBridgeColour={getBridgeColour}
                pointRight={taskIsOffRightOfScreen}
                jumpToTask={jumpToTask}
              />
            </div>
          </div>
        )
      }

      return null
    } else {
      return null
    }
  }

  const dispatch = useDispatch()

  const expandSubTasksToLevel = (task, level) => {
    dispatch(taskFilterActions.setExpandCollapse(true))
    const insetIndex = tasks.indexOf(task)
    const subTasks = getAllSubTasks(task).filter(t => t.level <= level)
    const taskListwithInsertedsubTasks = [
      ...tasks.slice(0, insetIndex + 1),
      ...subTasks,
      ...tasks.slice(insetIndex + 1, tasks.length),
    ]
    props.updateDisplayedTasks(
      taskListwithInsertedsubTasks.filter(
        (i, p) => taskListwithInsertedsubTasks.indexOf(i) === p
      )
    )
  }

  const collapseSubTasksToLevel = (task, level) => {
    //find task parent at level
    //get all subtasks for that task
    //filter them out
    dispatch(taskFilterActions.setExpandCollapse(false))
    const findParentAtLevel = (task, level) => {
      if (task.level === level) return task
      let parent = tasks.find(t => t.tasks.map(st => st.id).includes(task.id))
      if (parent) {
        if (parent.level === level) return parent
        return findParentAtLevel(parent, level)
      }
      return null
    }
    let parent = findParentAtLevel(task, level)
    let subtasks = getAllSubTasks(parent).map(t => t.id)
    props.updateDisplayedTasks(tasks.filter(t => !subtasks.includes(t.id)))
  }

  const collapseSubtasks = task => {
    dispatch(taskFilterActions.setExpandCollapse(false))
    const getSubTaskIds = task => {
      let foundIds = task.tasks.map(t => t.id)
      let subTaskIds = task.tasks.map(t => getSubTaskIds(t).flat())
      if (subTaskIds.length) {
        foundIds = [...foundIds.flat(), ...subTaskIds.flat()].flat()
      }
      return foundIds.flat()
    }
    props.updateDisplayedTasks(
      tasks.filter(t => !getSubTaskIds(task).includes(t.id))
    )
  }

  const { t } = useTranslation()

  const [pinHoverStart, setPinHoverStart] = useState(false)
  const [pinHoverEnd, setPinHoverEnd] = useState(false)

  const performDragEndResize = isStart => {
    let data = {}
    let date
    if (isStart) {
      //start
      let populateStartDate =
        getNearestStartDateInTree(props.task, flatTaskList) ||
        dayjs.utc().toDate()
      if (props.task.actualStartDate) {
        date = timeScale.invert(
          timeScale(
            new Date(getStartDate(props.task, true, populateStartDate))
          ) + dragLeft
        )
        data.actualStartDate = dayjs.utc(date).toDate()
      } else {
        date = timeScale.invert(
          timeScale(
            new Date(getStartDate(props.task, true, populateStartDate))
          ) + dragLeft
        )
        data.plannedStartDate = dayjs.utc(date).toDate()
      }
    } else {
      //end
      //in case of no end ddate  we need  to check every possible option
      //that can be used before defaulting to todays date
      let populateEndDate
      if (props.task.level > 1) {
        if (getNearestEndDateInTree(props.task, flatTaskList, false, true)) {
          if (getStartDate(props.task, false)) {
            populateEndDate = getStartDate(props.task, false)
          } else {
            populateEndDate = getNearestStartDateInTree(
              props.task,
              flatTaskList,
              false,
              true
            )
            if (populateEndDate === null) {
              populateEndDate = dayjs.utc().toDate()
            }
          }
        } else if (
          getNearestStartDateInTree(props.task, flatTaskList, false, true)
        ) {
          populateEndDate = getNearestStartDateInTree(
            props.task,
            flatTaskList,
            false,
            true
          )
        } else {
          populateEndDate = dayjs.utc().toDate()
        }
      } else {
        if (getStartDate(props.task, false)) {
          populateEndDate = getStartDate(props.task, false)
        } else {
          populateEndDate = dayjs.utc().toDate()
        }
      }
      if (props.task.actualEndDate) {
        date = timeScale.invert(
          timeScale(new Date(getEndDate(props.task, true, populateEndDate))) +
            dragChange
        )
        data.actualEndDate = dayjs.utc(date).toDate()
      } else {
        date = timeScale.invert(
          timeScale(new Date(getEndDate(props.task, true, populateEndDate))) +
            dragChange
        )
        data.plannedEndDate = dayjs.utc(date).endOf('day').toDate()
      }
    }
    dispatch(receiveTaskSuccess(props.task))
    dispatch(
      updateTaskDetails(
        matterId,
        projectId,
        props.task.id,
        data,
        false,
        false,
        false
      )
    ).then(() => {
      setDragChange(0)
      setDragLeft(0)
      setIsDragging(false)
    })
  }

  const renderBridge = (i, task) => {
    if (task.status === TASK_STATUS.NOT_REQUIRED || task.isMilestone) return ''
    if (
      task.status === TASK_STATUS.IN_PROGRESS &&
      task.plannedEndDate === null
    ) {
      return ''
    }
    let endDate = getEndDate(task, true)
    let startDate = getStartDate(task, true)
    let needsReplanning = false
    if (startDate && endDate) {
      needsReplanning = new Date(endDate) < new Date(startDate)
    }
    const isDashed = !getStartDate(task, false) || !getEndDate(task, false)
    let dashedColor1 = getTaskCellColour(task, TASK_CELL_COLOUR.NORMAL)
    let dashedColor2 = getTaskCellColour(task, TASK_CELL_COLOUR.FILTERED_IN)
    let isOverdue = false
    let left =
      getBridgeLeftPosition(
        task,
        timeScale,
        dragLeft,
        getNearestStartDateInTree(task, flatTaskList) || dayjs.utc().toDate(),
        getNearestEndDateInTree(task, flatTaskList)
      ) +
      dragLeft +
      (needsReplanning ? RoadmapConstants.ROADMAP_END_PIN_OFFSET : 0)
    if (isDragging && !isDraggingStart) {
      isOverdue = isPEDBeforeASD(task)
      if (isOverdue) {
        let newLeft = timeScale(getEndDate(task, false)) + dragChange
        if (newLeft < timeScale(getStartDate(task, false))) {
          left = newLeft
        } else {
          left = timeScale(getStartDate(task, false))
        }
      }
    }

    let renderedStartDate = getStartDate(
      task,
      true,
      getNearestStartDateInTree(task, flatTaskList)
    )

    let renderedEndDate = getEndDate(
      task,
      true,
      getNearestEndDateInTree(task, flatTaskList)
    )

    if (renderedStartDate) {
      renderedStartDate = new Date(renderedStartDate)
    } else {
      renderedStartDate = dayjs.utc().startOf('day').toDate()
    }
    let width = Math.abs(
      timeScale(renderedEndDate) +
        dragChange -
        (timeScale(renderedStartDate) + dragLeft)
    )

    let isChildOfDraggingTask = false
    if (props.draggingId) {
      let subtasks = getAllSubTasks(
        tasks.find(t => t.id === props.draggingId)
      ).map(t => t.id)
      isChildOfDraggingTask = subtasks.includes(props.task.id)
    }

    if (isChildOfDraggingTask) {
      if (
        (props.dragDetails.isStart &&
          timeScale.invert(left) < new Date(props.dragDetails.date)) ||
        (!props.dragDetails.isStart &&
          renderedStartDate > new Date(props.dragDetails.date))
      ) {
        let newLeft = timeScale(props.dragDetails.date)
        width = width - (newLeft - left)
        left = newLeft
        if (
          !props.dragDetails.isStart &&
          renderedStartDate > new Date(props.dragDetails.date)
        ) {
          let now = dayjs.utc().toDate()
          width =
            timeScale(new Date(now.getTime() + 1000 * 60 * 60)) - timeScale(now)
        }
      } else if (
        !props.dragDetails.isStart &&
        timeScale.invert(left + width) > new Date(props.dragDetails.date)
      ) {
        let newLeft = timeScale(props.dragDetails.date)
        width = Math.abs(newLeft - left)
      }
    }
    return (
      <div
        key={task.id}
        data-test="pin-bridge"
        style={{
          position: 'absolute',
          top: rowHeight + additionalHeight - (isCompact ? 30 : 40) - 4 + 'px',
          left: getStartDate(task, false) !== null ? left + 3 : left,
          height: RoadmapConstants.PIN_BRIDGE,
          width: width + 3,
          backgroundColor: getBridgeColour(task),
          backgroundSize: '40.00px 40.00px',
          zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
        }}
      >
        {isDashed && (
          <div style={{ marginTop: '5px', borderTop: '6px dashed #FCF8E8' }}>
            &nbsp;
          </div>
        )}
        &nbsp;
      </div>
    )
  }
  const showBridge = (startDate, endDate, index, task) => {
    let draggedEnd = timeScale.invert(timeScale(new Date(endDate)) + dragChange)
    if ((draggedEnd < startDate || endDate < startDate) && isDragging) {
      return ''
    }
    if (!isSameDay(startDate, endDate)) {
      return renderBridge(index, task)
    }
  }

  const MARGIN = isCompact
    ? RoadmapConstants.COMPACT_MARGIN
    : RoadmapConstants.MARGIN

  const dividerHeight = 40

  const onDragConfirm = () => {
    performDragEndResize(showDragConfirmation === 1)
    setStartDragNode(null)
    setEndDragNode(null)
    setShowDragConfirmation(false)
    setDragChange(0)
    setDragLeft(0)
    setIsDragging(false)
    setResetPins(true)
    props.setDraggingId(null)
    props.resetScale()
  }

  const renderRow = (task, index) => {
    task.parent = filteredTasks.find(t =>
      t.tasks.map(child => child.id).includes(task.id)
    )
    let left =
      timeScale(new Date(getStartDate(task))) - RoadmapConstants.PIN_WIDTH / 2
    const width = getTaskWidth(task, timeScale)
    if (left + width > dimensions.roadMapWidth) {
      left = left - (left + width - dimensions.roadMapWidth)
    }

    const getBackgroundColour = () => {
      switch (task.level) {
        case 1:
          return 'rgba(252,251,251,0.5)'
        case 2:
          return 'rgba(152, 147, 144, 0.1)'
        case 3:
          return 'rgba(152, 147, 144, 0.2)'
        case 4:
          return 'rgba(152, 147, 144, 0.3)'
        case 5:
          return 'rgba(152, 147, 144, 0.4)'
        case 6:
          return 'rgba(152, 147, 144, 0.5)'
        default:
          return ''
      }
    }

    let startDate = getStartDate(task, false)
    if (!startDate) {
      //up only?
      startDate = getNearestStartDateInTree(task, flatTaskList)
      if (!startDate) {
        startDate = getStartDate(task)
      }
    }
    let endDate = getEndDate(task, false)
    if (!endDate) {
      if (startDate) {
        endDate = dayjs(new Date(startDate))
      }
    }
    if (!endDate) {
      endDate = getNearestEndDateInTree(task, flatTaskList)
    }
    if (!endDate) {
      endDate = getEndDate(task)
    }

    return (
      <div
        id={task.id}
        key={task.id}
        className="roadmap-tasks"
        onMouseLeave={() => setHover(false)}
        onMouseEnter={() => setHover(true)}
        style={{
          position: 'absolute',
          top:
            index *
              (isCompact
                ? RoadmapConstants.COMPACT_HEIGHT_OFFSET
                : RoadmapConstants.REGULAR_HEIGHT_OFFSET) +
            RoadmapConstants.DIVIDER_HEIGHT +
            'px',
          left: 0,
          width: `${Math.max(dimensions.width, dimensions.roadMapWidth)}px`,
          height: `${rowHeight}px`,
          zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
          backgroundColor: getBackgroundColour(),
          borderBottom: 'solid 4px rgba(255, 255, 255, .125)',
        }}
        data-test={`roadmap-task-wrapper-${task.id}`}
        taskid={task.id}
      >
        <RenderIfVisible
          visibleOffset={3000}
          stayRendered={navigator.userAgent.includes('Cypress!')}
          initialVisible={navigator.userAgent.includes('Cypress!')}
        >
          <div style={{ top: '10px', position: 'absolute', width: '100%' }}>
            <RoadmapTask
              task={task}
              index={index}
              timeScale={timeScale}
              project={project}
              dragLeft={dragLeft}
              dragChange={dragChange}
              tasks={tasks}
              filteredTasks={filteredTasks}
              isCompact={isCompact}
              matterId={matterId}
              projectId={projectId}
              draggingId={props.draggingId}
              dragDetails={props.dragDetails}
              {...props}
            />
            {showBridge(startDate, endDate, index, task)}
            <RoadmapPin
              i={index}
              status={task.status}
              date={startDate ? dayjs(startDate).startOf('day') : startDate}
              error={isPlannedStartDateOverdue(task)}
              offset={0}
              task={task}
              isStartDate={true}
              dragValue={dragLeft}
              timeScale={timeScale}
              project={project}
              tasks={tasks}
              isDragging={isDragging}
              isDraggingStart={isDraggingStart}
              resetPins={resetPins}
              dragLeft={dragLeft}
              dragChange={dragChange}
              pinHoverStart={pinHoverStart}
              pinHoverEnd={pinHoverEnd}
              startDragNode={startDragNode}
              endDragNode={endDragNode}
              hover={hover}
              rowHeight={rowHeight}
              additionalHeight={additionalHeight}
              isCompact={isCompact}
              draggingId={props.draggingId}
              dragDetails={props.dragDetails}
              setIsDragging={setIsDragging}
              setIsDraggingStart={setIsDraggingStart}
              setResetPins={setResetPins}
              setDragLeft={setDragLeft}
              setDragChange={setDragChange}
              setPinHoverStart={setPinHoverStart}
              setPinHoverEnd={setPinHoverEnd}
              setStartDragNode={setStartDragNode}
              setShowDragConfirmation={setShowDragConfirmation}
              setEndDragNode={setEndDragNode}
              setDraggingId={props.setDraggingId}
              resizeOffScreenRight={props.resizeOffScreenRight}
              resizeOffScreenLeft={props.resizeOffScreenLeft}
              handleDrag={props.handleDrag}
              onDragConfirm={onDragConfirm}
              showDragConfirmation={showDragConfirmation}
              resetScale={props.resetScale}
              classes={classes}
              viewOnly={props.viewOnly}
            />
            <RoadmapPin
              i={index}
              status={task.status}
              date={endDate ? dayjs(endDate).endOf('day') : endDate}
              error={isPlannedEndDateOverdue(task)}
              offset={0}
              task={task}
              isStartDate={false}
              dragValue={dragChange}
              timeScale={timeScale}
              project={project}
              tasks={tasks}
              isDragging={isDragging}
              isDraggingStart={isDraggingStart}
              resetPins={resetPins}
              dragLeft={dragLeft}
              dragChange={dragChange}
              pinHoverStart={pinHoverStart}
              pinHoverEnd={pinHoverEnd}
              startDragNode={startDragNode}
              endDragNode={endDragNode}
              hover={hover}
              rowHeight={rowHeight}
              additionalHeight={additionalHeight}
              isCompact={isCompact}
              draggingId={props.draggingId}
              dragDetails={props.dragDetails}
              setIsDragging={setIsDragging}
              setIsDraggingStart={setIsDraggingStart}
              setResetPins={setResetPins}
              setDragLeft={setDragLeft}
              setDragChange={setDragChange}
              setPinHoverStart={setPinHoverStart}
              setPinHoverEnd={setPinHoverEnd}
              setStartDragNode={setStartDragNode}
              setShowDragConfirmation={setShowDragConfirmation}
              setEndDragNode={setEndDragNode}
              setDraggingId={props.setDraggingId}
              resizeOffScreenRight={props.resizeOffScreenRight}
              resizeOffScreenLeft={props.resizeOffScreenLeft}
              handleDrag={props.handleDrag}
              onDragConfirm={onDragConfirm}
              showDragConfirmation={showDragConfirmation}
              resetScale={props.resetScale}
              classes={classes}
              viewOnly={props.viewOnly}
            />
            {renderNoScroll(index, task)}
          </div>
        </RenderIfVisible>
      </div>
    )
  }

  const renderNoScroll = (index, task) => {
    const countLeaves = t =>
      t?.tasks?.length ? t.tasks.reduce((a, b) => 1 + countLeaves(b), 0) : 1
    let subtasks = softFilterTasks(
      getAllSubTasks(task),
      statusDone,
      statusNotStarted,
      statusNotRequired,
      taskMapFilter.statusMilestone,
      taskMapFilter.statusDeliverable,
      taskMapFilter.userFilter,
      taskMapFilter.id,
      filterLabels
    ).filter(t => !t.filteredOut)
    let maxLevel = subtasks.length
      ? subtasks
          .map(t => t.level)
          .sort()
          .reverse()[0]
      : task.level

    const isFullyExpanded = subtasks.every(t => tasks.includes(t))
    return (
      <div
        style={{
          height: `fit-content`,
          width: `${window.innerWidth - RoadmapConstants.LEFT_HAND_OFFSET}px`,
          position: 'sticky',
          left: 0,
          top: 0,
          zIndex: 1005,
        }}
      >
        {renderChevron(index, task, timeScale)}
        <RoadmapBreadCrumb
          level={task.level}
          maxLevel={maxLevel}
          task={task}
          open={expandSubTasksToLevel}
          close={collapseSubTasksToLevel}
          isFullyExpanded={isFullyExpanded}
        />
      </div>
    )
  }

  return renderRow(props.task, props.index)
}

export default RoadmapRow
