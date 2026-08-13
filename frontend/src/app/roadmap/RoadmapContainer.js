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

import { Button, CircularProgress, Tooltip } from '@mui/material'
import debounce from 'lodash/debounce'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import RoadmapFtue from '../../components/data-display/ftue/roadmap/RoadmapFtue'
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import { filterTaskByLabel } from '../../components/icicle/desktop/helper/filter-tasks/filter-tasks'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
} from '../../components/navigation/common/location-context-helper'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import { fetchTaskmapContent } from '../../redux/ducks/improved-taskmap'
import {
  filterOutLabels,
  smartExpand,
  softFilterTasks,
} from '../../services/helpers/task/filter-tasks'
import { flatTaskListFromTree } from '../../services/task/data-provider/task-list-data-provider'
import taskService from '../../services/task/task-service'
import { getDetailsAttribute } from '../../services/user/user-data-service'
import {
  ACTIVITIES,
  MATTER_STATUS,
  TASK_CELL_COLOUR,
  TASK_MAP_VIEW_MODE_ENUM,
  TASK_MENU_CONTEXT,
  TASK_STATUS,
} from '../constants'
import MatterClosed from '../../components/data-display/matter-closed/MatterClosed'
import { fetchMatterDetails } from '../matter-details/matter-details-actions'
import {
  fetchProjectWithPostsAndTaskTeam,
  getNewTasks,
} from '../project/project-actions'
import { LOADING_SPINNER_SIZE } from '../task-map/IcicleCommon'
import {
  resetSelectedTask,
  updateTaskDetails,
} from '../task-map/selected-task/selected-task-actions'
import { taskFilterActions } from '../task-map/task-filter/task-filter-actions'
import TaskPreviewContainer from '../task-map/task-preview/TaskPreviewContainer'
import { generateRoadmapData } from './data-provider/roadmap-data-provider'
import {
  filterTasksByDeliverable,
  filterTasksByMilestone,
  filterTasksByUserId,
} from './helpers/filter-tasks'
import RoadmapConstants from './helpers/roadmap-constants'
import { useProject } from './helpers/roadmap-hooks'
import { useWindowDimensions } from './helpers/window-dimensions-hook'
import MiniMapContainer from './minimap/MinimapContainer'
import {
  getSubtasksToDisplay,
  isTaskOnScreen,
} from './render/roadmap-tasks-helpers'
import Roadmap from './Roadmap'
import { generateDataPoints, getTimescaleDivider } from './roadmap-zoom'
import { scaleTime } from 'd3-scale'
import {
  getEarliestDateFromTask,
  getLatestDateFromTask,
} from './data-provider/task-helper'
import RoadmapFilters from '../improved-taskmap/taskmap-filters/RoadmapFilters'
import BulkShiftDialog from '../task-details/task-options/task-shift/BulkShiftDialog'
import JurShift from '../../assets/images/JurShift'
import rawColours from '../../theme/raw-colours'

const roadmapContainerStyle = {
  //marginTop: '58px',
  height: '100%',
}
const roadmapScrollFrameStyle = {
  minWidth: '100%',
  minHeight: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
}
const loadingProgressCircleStyle = {
  textAlign: 'center',
  marginLeft: 'calc(50% - 100px)',
  marginTop: 'calc(20% - 100px)',
}
const minimapDimensions = { width: 100, height: 100 }
const getTaskFlatList = taskTree => {
  const walk = task => {
    flatList.push(task)
    if (!task.tasks || task.tasks.length === 0) return
    task.tasks.forEach(task => walk(task))
  }
  const flatList = []
  const subtasks = taskTree.tasks || []
  subtasks.forEach(task => walk(task))
  return flatList
}
const RoadmapContainer = props => {
  const { t } = useTranslation()
  const { height, width } = useWindowDimensions()
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)

  const [scrollingEvent, setScrollingEvent] = useState(false)
  const debounceScrollRef = useRef(
    debounce(() => setScrollingEvent(prev => !prev), 250)
  )
  const [todayXPos, setTodayXPos] = useState(0)
  const [highlightedTaskList, setHighlightedTaskList] = useState([])
  const [showMinimised, setShowMinimised] = useState(false)
  const [showBulkShift, setShowBulkShift] = useState(false)

  const [roadmapDimensions, setRoadmapDimensions] = useState({
    roadMapWidth: width - RoadmapConstants.DIVIDER_RHS_MARGIN - 120,
    width: width - 80,
    height: height - 126,
    roadMapHeight: document.getElementById('roadmap-tasks-wrapper')
      ?.scrollHeight,
    screen: {
      width: width,
      height: height,
    },
    miniMap: {
      id: 'minimap',
      width: 212,
      height: 116,
    },
  })
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const statusMilestone = useSelector(
    state => state.taskMapFilter.statusMilestone
  )
  const statusDeliverable = useSelector(
    state => state.taskMapFilter.statusDeliverable
  )
  const taskmap = useSelector(state => state.taskmap)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const statusNotRequired = useSelector(
    state => state.taskMapFilter.statusNotRequired
  )
  const filterUser = useSelector(state => state.taskMapFilter.userFilter)
  const filterLabels = useSelector(state => state.taskMapFilter.filterLabels)
  const expandCollapse = useSelector(
    state => state.taskMapFilter.expandCollapse
  )
  const matter = useSelector(state => state.matterDetails.matter)
  const currentTasks = useSelector(state => state.taskMapFilter.currentTasks)
  const lastLocation = useSelector(
    state => state.lastLocationRecorder.lastLocation
  )
  const selectedTask = useSelector(state => state.selectedTask)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const roadMapRef = useRef(null)
  const history = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const matterId = props.identifiers
    ? props.identifiers.matterId
    : getMatterIdFromLocation(location)
  const projectId = props.identifiers
    ? props.identifiers.projectId
    : getProjectIdFromLocation(location)

  const project = useProject(matterId, projectId)
  const isViewOnly = useIsViewOnly(matter)
  const [filteredProject, setFilteredProject] = useState(project)
  const [displayTasks, setDisplayTasks] = useState([])
  const areFiltersOn = statusDone || !statusNotStarted
  const doc_keyUp = e => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.code === 'Equal' || e.code === 'Minus')
    ) {
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  }
  const handleWheel = e => {
    // Windows & Linux: ctrl, Mac: meta
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', doc_keyUp, true)
    document.addEventListener('wheel', handleWheel, { passive: false })
  }, [])

  useEffect(() => {
    return () => {
      // Remove listener if component is removed
      document.removeEventListener('keydown', doc_keyUp, true)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useEffect(() => {
    dispatch(fetchMatterDetails(matterId))
    if (matter?.matterStatus === MATTER_STATUS.CLOSED) {
      return
    }
    dispatch(getNewTasks(matterId, projectId))
    dispatch(fetchTaskmapContent(matterId, projectId))
  }, [dispatch, matterId, projectId, matter?.matterStatus])

  const [hasJumped, setHasJumped] = useState(false)
  const getFocusTaskId = () => {
    let splitUrl = window.location.href.split('?')
    if (splitUrl.length > 1) {
      let urlParams = new URLSearchParams(
        '?' + window.location.href.split('?')[1]
      )
      return parseInt(urlParams.get('id'))
    }
    return null
  }
  const [focusTaskId, setFocusTaskId] = useState(getFocusTaskId())

  useEffect(() => {
    if (focusTaskId) {
      setTimeout(() => {
        setFocusTaskId(null)
      }, 3000)
    }
  }, [focusTaskId])

  const getAllSubTasksToFocusedTask = (task, focusedTask) => {
    const getTaskFlatList = task => {
      if (!task.tasks || !task.tasks.length) return []
      let pathUnder = []
      task.tasks.forEach(t => {
        pathUnder = [...pathUnder, t, ...getTaskFlatList(t, focusedTask)]
      })
      if (pathUnder.includes(focusedTask)) {
        return pathUnder
      } else {
        return []
      }
    }
    return getTaskFlatList(task)
  }

  const handleFocusedTaskId = taskList => {
    if (focusTaskId && taskList) {
      let flatTasks = getTaskFlatList(project)
      if (taskList.map(t => t.id).includes(focusTaskId)) {
        return taskList
      }
      const getRootParent = id => {
        let self = flatTasks.find(t => t.id === id)
        if (self) {
          let parent = flatTasks.find(t =>
            t.tasks.map(st => st.id).includes(id)
          )
          if (parent) {
            if (parent.level > 1) {
              return getRootParent(parent.id)
            } else {
              return parent.id
            }
          }
        }
      }
      let rootParent = getRootParent(focusTaskId)
      const parent = flatTasks.find(t => t.id === rootParent)
      const insertIndex = taskList.indexOf(parent)
      const focusTask = flatTasks.find(t => t.id === focusTaskId)
      const subTasks = getAllSubTasksToFocusedTask(parent, focusTask).filter(
        t => t.level <= focusTask.level
      )
      const taskListwithInsertedsubTasks = [
        ...taskList.slice(0, insertIndex + 1),
        ...subTasks,
        ...taskList.slice(insertIndex + 1, taskList.length),
      ]

      return taskListwithInsertedsubTasks
    }
  }

  useEffect(() => {
    if (displayTasks && focusTaskId && !hasJumped) {
      if (focusTaskId) {
        let elem = document.querySelector(
          `[data-test=roadmap-task-wrapper-${focusTaskId}]`
        )
        if (elem) {
          elem.scrollIntoView({ block: 'center' })
          setHasJumped(true)
        }
      }
    }
  }, [displayTasks, focusTaskId]) //eslint-disable-line

  const depArray = [
    taskMapFilter.email,
    taskMapFilter.filterOptions.taskMemberOf,
    taskMapFilter.filterOptions.following,
    taskMapFilter.filterOptions.logicOperator,
    taskMapFilter.statusMilestone,
  ]

  useEffect(() => {
    if (
      lastLocation?.split('/')[4] !== projectId &&
      lastLocation?.split('/')[4] !== undefined
    ) {
      dispatch(taskFilterActions.resetAllFilters())
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    filteredTasks()
    // eslint-disable-next-line
  }, [
    // eslint-disable-next-line
    ...depArray,
    statusMilestone,
    statusDeliverable,
    filterUser,
    filterLabels,
  ])

  useEffect(() => {
    setRoadmapDimensions({
      ...roadmapDimensions,
      screen: {
        width: width,
        height: height,
      },
    })
  }, [width, height]) // eslint-disable-line
  const [timePeriod, setTimePeriod] = useState(0)
  const setDisplayTasksAndUpdateFilter = tasks => {
    dispatch(taskFilterActions.setCurrentTasks(tasks))
    setDisplayTasks(
      softFilterTasks(
        [...tasks],
        statusDone,
        statusNotStarted,
        statusNotRequired,
        taskMapFilter.statusMilestone,
        taskMapFilter.statusDeliverable,
        taskMapFilter.userFilter,
        taskMapFilter.id,
        filterLabels
      )
    )
  }
  const filterTasks = () => {
    if (!displayTasks) return
    let tasks = smartExpand(
      displayTasks,
      filterLabels,
      taskMapFilter,
      matterTeam
    )

    let filteredDisplayTasks = softFilterTasks(
      [...tasks],
      statusDone,
      statusNotStarted,
      statusNotRequired,
      statusMilestone,
      statusDeliverable,
      filterUser,
      taskMapFilter.id,
      filterLabels
    )

    if (!filteredDisplayTasks) return []
    return filteredDisplayTasks
  }

  useEffect(() => {
    dispatch(resetSelectedTask())
    setDisplayTasks(filterTasks())
    // eslint-disable-next-line
  }, [
    statusDone,
    statusNotStarted,
    statusNotRequired,
    filterLabels,
    statusMilestone,
    statusDeliverable,
    filterUser,
  ])

  useEffect(() => {
    // snap left hand screen to today pole
    if (timePeriod > 0) {
      const wrapperElement = document.getElementById('roadmap-tasks-wrapper')
      if (wrapperElement) {
        wrapperElement.scrollLeft = todayXPos - 300
      }
    }
  }, [todayXPos]) // eslint-disable-line

  useEffect(() => {
    setFilteredProject(project)
    if (!project.tasks) return
    if (expandCollapse || currentTasks.filter(t => t.level !== 1)) {
      let listToDisplay = getSubtasksToDisplay(project, currentTasks)
      if (focusTaskId) {
        listToDisplay = handleFocusedTaskId(listToDisplay)
      }

      setDisplayTasks(
        softFilterTasks(
          [...listToDisplay],
          statusDone,
          statusNotStarted,
          statusNotRequired,
          taskMapFilter.statusMilestone,
          taskMapFilter.statusDeliverable,
          taskMapFilter.userFilter,
          taskMapFilter.id,
          filterLabels
        )
      )
    } else if (!expandCollapse) {
      setDisplayTasks(
        softFilterTasks(
          [...project.tasks],
          statusDone,
          statusNotStarted,
          statusNotRequired,
          taskMapFilter.statusMilestone,
          taskMapFilter.statusDeliverable,
          taskMapFilter.userFilter,
          taskMapFilter.id,
          filterLabels
        )
      )
    }
  }, [project]) // eslint-disable-line

  const zoom = newTimePeriod => {
    setTimePeriod(newTimePeriod)
    if (newTimePeriod === 0) {
      document.getElementById('roadmap-tasks-wrapper').scrollLeft = 0
    } else if (timePeriod < newTimePeriod) {
      switch (newTimePeriod) {
        case 2:
          document.getElementById('roadmap-tasks-wrapper').scrollLeft =
            document.getElementById('roadmap-tasks-wrapper').scrollLeft / 4
          break
        case 3:
          if (timePeriod === 1) {
            document.getElementById('roadmap-tasks-wrapper').scrollLeft =
              document.getElementById('roadmap-tasks-wrapper').scrollLeft /
              4 /
              3
          } else if (timePeriod === 2) {
            document.getElementById('roadmap-tasks-wrapper').scrollLeft =
              document.getElementById('roadmap-tasks-wrapper').scrollLeft / 3
          }
          break
        default:
          break
      }
    }
    setRoadmapData(generateRoadmapData(displayTasks, new Date(), newTimePeriod))
  }

  useEffect(() => {
    let newHeight =
      (displayTasks.filter(t => !t.filteredOut).length + 1) *
      (detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
        ? RoadmapConstants.COMPACT_HEIGHT_OFFSET
        : RoadmapConstants.REGULAR_HEIGHT_OFFSET)
    const wrapperElement = document.getElementById('roadmap-tasks-wrapper')
    if (newHeight < height) {
      newHeight = height - (RoadmapConstants.MARGIN + 12)
    }
    if (roadmapDimensions.roadMapHeight !== newHeight) {
      setRoadmapDimensions({
        ...roadmapDimensions,
        roadmapHeight: newHeight,
      })
    }
    if (
      selectedTask.isLoaded &&
      wrapperElement &&
      document.getElementById(selectedTask.id)
    ) {
      const isOnScreen = isTaskOnScreen(
        document.getElementById(selectedTask.id),
        roadmapDimensions
      )
      if (isOnScreen !== undefined) {
        wrapperElement.scrollTop = isOnScreen
      }
    }
  }, [displayTasks, height, detailedView.showDetailedView]) // eslint-disable-line

  const taskCardClickHandler = (matterId, projectId, taskId) => {
    history(`/matter/${matterId}/workstream/${projectId}/task/${taskId}`)
  }

  const updateNameHandler = (name, taskId) => {
    taskService
      .updateTask(matterId, projectId, taskId, { name }, false)
      .then(() => {
        dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
      })
  }

  const updateTaskHandler = (taskId, statusChangePayload) => {
    dispatch(
      updateTaskDetails(
        matterId,
        projectId,
        taskId,
        statusChangePayload,
        true,
        true
      )
    )
  }

  const filteredTasks = () => {
    if (!project) return
    const tasks = flatTaskListFromTree(project)
    let filteredTasks = filterTasksByUser(tasks)
    if (taskMapFilter.statusMilestone) {
      filteredTasks = filterTaskByLabel(
        filterTasksByMilestone(filteredTasks),
        filterLabels
      )
    }
    if (taskMapFilter.statusDeliverable) {
      filteredTasks = filterTaskByLabel(
        filterTasksByDeliverable(filteredTasks),
        filterLabels
      )
    }
    setHighlightedTaskList(filteredTasks)
  }

  const filterTasksByUser = tasks => {
    if (!tasks) return
    const taskFlatlist = tasks
    let filteredTasks = filterTasksByUserId(
      taskFlatlist,
      taskMapFilter.id,
      taskMapFilter.email,
      matterTeam,
      {
        taskMemberOf: taskMapFilter.filterOptions.taskMemberOf,
        following: taskMapFilter.filterOptions.following,
        logicOperator: taskMapFilter.filterOptions.logicOperator,
      },
      false
    )
    return filteredTasks
  }

  const getColourMode = task => {
    if (taskMapFilter.filterOn) {
      if (
        highlightedTaskList &&
        highlightedTaskList.find(i => i.id === task.id) !== undefined
      ) {
        if (filterLabels.length > 0) {
          if (filterOutLabels(task, filterLabels)) {
            return TASK_CELL_COLOUR.FILTERED_IN
          } else {
            return TASK_CELL_COLOUR.FILTERED_OUT
          }
        }
        return TASK_CELL_COLOUR.FILTERED_IN
      } else {
        return TASK_CELL_COLOUR.FILTERED_OUT
      }
    } else if (filterLabels.length > 0) {
      if (filterOutLabels(task, filterLabels)) {
        return TASK_CELL_COLOUR.FILTERED_IN
      } else {
        return TASK_CELL_COLOUR.FILTERED_OUT
      }
    } else {
      return TASK_CELL_COLOUR.NORMAL
    }
  }

  const [roadmapData, setRoadmapData] = useState(
    generateRoadmapData(displayTasks, new Date(), timePeriod)
  )

  useEffect(() => {
    const startDate = new Date(roadmapData.rangeStart)

    const endDate = new Date(roadmapData.rangeEnd)
    let unPaddedDataPoints = generateDataPoints(timePeriod, startDate, endDate)

    let unPaddedTimeScale = scaleTime()
      .domain([startDate, endDate])
      .range([
        RoadmapConstants.DIVIDER_LHS_MARGIN,
        (document.body.offsetWidth /
          getTimescaleDivider(timePeriod, unPaddedDataPoints)) *
          unPaddedDataPoints -
          RoadmapConstants.DIVIDER_RHS_MARGIN,
      ])

    let endDateWithPadding = unPaddedTimeScale.invert(
      unPaddedTimeScale(endDate) + RoadmapConstants.TASK_WIDTH
    )

    const dataPoints = generateDataPoints(
      timePeriod,
      startDate,
      endDateWithPadding
    )
    const newWidth =
      (document.body.offsetWidth /
        getTimescaleDivider(timePeriod, dataPoints)) *
        dataPoints -
      RoadmapConstants.DIVIDER_RHS_MARGIN
    if (roadmapDimensions.roadMapWidth !== newWidth) {
      setRoadmapDimensions({
        ...roadmapDimensions,
        roadMapWidth: newWidth - 50,
      })
    }
  }, [roadmapData, width]) // eslint-disable-line

  const [draggingId, setDraggingId] = useState(null)
  const [dragDetails, setDragDetails] = useState({})

  useEffect(() => {
    if (displayTasks.length > 0) {
      setRoadmapData(generateRoadmapData(displayTasks, new Date(), timePeriod))
    }
  }, [filteredProject, timePeriod, displayTasks])

  if (matter?.matterStatus === MATTER_STATUS.CLOSED) {
    return (
      <MatterClosed
        isAdmin={matter.activities?.includes(ACTIVITIES.MATTER_ADMIN)}
        matterId={matterId}
      />
    )
  }

  if (!project.active && project.isLoaded) {
    return project.isForbidden ? (
      <NoPermission
        text={t('roadmapZeroState.permissionToAccessWorkstreamDenied')}
      />
    ) : (
      <NoPermission
        data-test="workstream-closed"
        text={t('taskDetails.workstreamClosed')}
      />
    )
  }

  const onScroll = () => {
    window.dispatchEvent(new Event('roadmap-scroll'))
    debounceScrollRef.current()
  }

  const resizeOffScreenRight = () => {
    let latestDates = displayTasks
      .map(t => getLatestDateFromTask(t))
      .filter(d => d !== undefined)
      .filter(d => d !== null)
      .map(d => new Date(d).getTime())
      .sort()
      .reverse()
    let newStartTime = latestDates[0] + 1000 * 60 * 60 * 24 * 14
    let newDispayTasks = [
      ...displayTasks.filter(t => t.id !== -1),
      { plannedEndDate: newStartTime, filteredOut: true, id: -1 },
    ]
    setDisplayTasks(newDispayTasks)
    setRoadmapData(generateRoadmapData(newDispayTasks, new Date(), timePeriod))
  }

  const resizeOffScreenLeft = () => {
    let earliestStartTime = displayTasks
      .map(t => getEarliestDateFromTask(t))
      .filter(d => d !== undefined)
      .filter(d => d !== null)
      .map(d => new Date(d).getTime())
      .sort()
    let newStartTime = earliestStartTime[0] - 1000 * 60 * 60 * 24 * 14
    let newDispayTasks = [
      ...displayTasks,
      { plannedStartDate: newStartTime, filteredOut: true, id: -1 },
    ]
    setDisplayTasks(newDispayTasks)
    setRoadmapData(generateRoadmapData(newDispayTasks, new Date(), timePeriod))
  }

  const handleDrag = (date, isStart) => {
    setDragDetails({ date: date, isStart: isStart })
  }

  const resetScale = () => {
    setDisplayTasks(displayTasks.filter(t => t.id !== -1))

    setRoadmapData(
      generateRoadmapData(
        displayTasks.filter(t => t.id !== -1),
        new Date(),
        timePeriod
      )
    )
  }

  const _setDraggingId = id => {
    setDraggingId(id)
    if (!id) {
      setDragDetails({})
    }
  }

  return project.isLoading &&
    (!project.id || project.matterId !== getMatterIdFromLocation(location)) ? (
    <CircularProgress
      size={LOADING_SPINNER_SIZE}
      style={loadingProgressCircleStyle}
    />
  ) : (
    <div id="roadmap-container" style={roadmapContainerStyle}>
      <div
        id="roadmapScrollFrame"
        style={roadmapScrollFrameStyle}
        data-test="roadmap-scroll-frame"
      >
        {!getDetailsAttribute([
          'firstTimeUserExperience',
          'hasSeenRoadmap',
        ]) && <RoadmapFtue />}
        <Roadmap
          data={roadmapData}
          rangeEnd={roadmapData?.rangeEnd}
          dimensions={roadmapDimensions}
          width={roadmapDimensions.width}
          project={filteredProject}
          taskCardClickHandler={taskCardClickHandler}
          updateNameHandler={updateNameHandler}
          updateTaskDetails={updateTaskHandler}
          roadMapRef={roadMapRef}
          highlightedTaskList={highlightedTaskList}
          getColourMode={getColourMode}
          areFiltersOn={areFiltersOn}
          displayTasks={displayTasks}
          setDisplayTasks={setDisplayTasksAndUpdateFilter}
          timePeriod={timePeriod}
          setTodayXPos={setTodayXPos}
          lastLocation={lastLocation}
          viewOnly={isViewOnly}
          onScroll={onScroll}
          focusTaskId={focusTaskId}
          resizeOffScreenRight={resizeOffScreenRight}
          resizeOffScreenLeft={resizeOffScreenLeft}
          draggingId={draggingId}
          setDraggingId={_setDraggingId}
          handleDrag={handleDrag}
          dragDetails={dragDetails}
          resetScale={resetScale}
        />
        {!roadmapData.isEmptyProject && (
          <>
            <MiniMapContainer
              roadmapRef={{ ...roadMapRef }}
              roadmapData={roadmapData}
              roadmapDimensions={minimapDimensions}
              project={filteredProject}
              taskCardClickHandler={taskCardClickHandler}
              dimensions={roadmapDimensions}
              width={roadmapDimensions.width}
              scrollingEvent={scrollingEvent}
              highlightedTaskList={highlightedTaskList}
              getColourMode={getColourMode}
              displayTasks={displayTasks}
              setDisplayTasks={setDisplayTasks}
              setTimePeriod={zoom}
              showMinimised={showMinimised}
              setShowMinimised={setShowMinimised}
            />
            <div
              style={{
                top: '46px',
                right: '90px',
                position: 'absolute',
                zIndex: 1000,
              }}
            >
              <Tooltip
                title={
                  isViewOnly ? t('matter.viewOnly') : t('bulkShifting.title')
                }
              >
                <span>
                  <Button
                    data-test="bulk-shift-button"
                    disabled={
                      project?.tasks?.filter(
                        t =>
                          t.status === TASK_STATUS.NOT_STARTED &&
                          (t.plannedStartDate || t.plannedEndDate)
                      ).length === 0
                    }
                    variant="outlined"
                    onClick={() => {
                      setShowBulkShift(true)
                    }}
                    style={{
                      zIndex: 1000,
                      borderColor: rawColours.primary.primary.main,
                      border: '2px solid',
                      minWidth: '30px',
                      width: '30px',
                      padding: '0px',
                    }}
                  >
                    <JurShift
                      fill={
                        project?.tasks?.filter(
                          t =>
                            t.status === TASK_STATUS.NOT_STARTED &&
                            (t.plannedStartDate || t.plannedEndDate)
                        ).length === 0
                          ? 'grey'
                          : rawColours.primary.primary.main
                      }
                    />
                  </Button>
                </span>
              </Tooltip>
            </div>

            {showBulkShift && (
              <BulkShiftDialog
                taskMenuContext={TASK_MENU_CONTEXT.ROADMAP}
                cancelHandler={() => setShowBulkShift(false)}
              />
            )}
            <RoadmapFilters
              matterId={matterId}
              workstreamId={projectId}
              showMinimisedMinimap={showMinimised}
            />
          </>
        )}

        {taskmap.showTaskPreview && (
          <TaskPreviewContainer
            isRoadmap={true}
            viewOnly={isViewOnly}
            isTaskmap={false}
          />
        )}
      </div>
    </div>
  )
}

export default RoadmapContainer
