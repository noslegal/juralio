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

import { Fade, Typography } from '@mui/material'
import { Droppable, Draggable, DragDropContext } from '@hello-pangea/dnd'
import { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useDispatch, useSelector } from 'react-redux'
import taskService from '../../../services/task/task-service'
import ListTaskItem from './ListTaskItem'
import rawColours from '../../../theme/raw-colours'
import { DATE_VARIABLES, TASK_STATUS } from '../../../app/constants'
import DateChangePopover from '../../../app/task-map/date-change/DateChangePopover'
import ListStatusFilter from './ListStatusFilter'
import ListDateFilter from './ListDateFilter'
import { getEndDate } from '../../../app/roadmap/helpers/task-dates-helper'
import dayjs from 'dayjs'
import ListLevelFilter from './ListLevelFilter'
import ConfirmStatusChangeContainer from '../../../app/task-details/task-card-header/task-status-menu/ConfirmStatusChangeContainer'
import { confirmStatusChange } from '../../../app/improved-taskmap/taskmap-interaction-helpers/status-helpers'
import ListUserFilter from './ListUserFilter'
import { useUserDetailsData } from '../../../hooks/user-hooks'
import ListPhaseFilter from './ListPhaseFilter'
import ConfirmDateTimeChangeContainer from '../../../app/task-details/task-card-content/TaskDates/ConfirmDateTimeChangeContainer'
import { fetchTaskmapContent } from '../../../redux/ducks/improved-taskmap'
import ListTaskTypeFilter from './ListTaskTypeFilter'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import ListViewSwitcher from './ListViewSwitcher'
import TaskPreviewContainer from '../../../app/task-map/task-preview/TaskPreviewContainer'
import { fetchProjectWithPostsAndTaskTeam } from '../../../app/project/project-actions'
import { useTranslation } from 'react-i18next'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'

const useStyles = makeStyles()(theme => ({
  item: { marginTop: theme.spacing(0), marginBottom: theme.spacing(0) },
  grid: {
    alignItems: 'anchor-center',
    display: 'flex',
    backgroundColor: rawColours.primary.grey.main,
    height: theme.spacing(9),
    alignContent: 'center',
    paddingLeft: '8px',
    width: '100%',
  },
}))

const ListTaskGroup = props => {
  const { t } = useTranslation()
  const { matterId, workstreamId } = props
  const dispatch = useDispatch()
  const dateChange = useSelector(state => state.dateChange)
  const initialTaskList = useSelector(state => state.improvedTaskmap.tasks)
  const [tasks, setTasks] = useState()
  const { classes } = useStyles()
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const matterDetails = useSelector(state => state.matterDetails)
  const isViewOnly = useIsViewOnly(matterDetails.matter)

  const projectTasks = useSelector(state => state.project.tasks)
  let taskmapView = flatTaskListFromTree({ tasks: projectTasks })
  const selectedTask = useSelector(state => state.selectedTask)
  const task = tasks?.find(t => t.id === taskmapInteractions.taskId)
  const taskmap = useSelector(state => state.taskmap)
  const statusChange = useSelector(state => state.statusChange)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const [selectedPhases, setSelectedPhases] = useState([])
  const [selectedLevel, setSelectedLevel] = useState(5)
  const [filterDate, setFilterDate] = useState(undefined)
  const [dateFilter, setDateFilter] = useState(0)
  //0-all 1-before 2-after 3-no
  const [showOnlyMilestones, setShowOnlyMilestones] = useState(0)
  const [showOnlyDeliverables, setShowOnlyDeliverables] = useState(0)
  const [showOnlyTasks, setShowOnlyTasks] = useState(0)
  const [statusFilter, setStatusFilter] = useState(0)
  //0-ns-ip 1-ns 2-ip 3-d 4-nr
  const [userFilter, setUserFilter] = useState(0)
  const [userSearch, setUserSearch] = useState(undefined)
  const [view, setView] = useState(0)
  const [value, setValue] = useState(0)
  const showReset =
    selectedPhases.length !== 0 ||
    selectedLevel !== 5 ||
    filterDate !== undefined ||
    statusFilter !== 0 ||
    userFilter !== 0 ||
    showOnlyMilestones === true ||
    showOnlyDeliverables === true ||
    showOnlyTasks === true

  const userDetailsData = useUserDetailsData()

  const isTeamMember = task => {
    let isTm = false
    task.teamMembers.forEach(tm => {
      if (tm.id === userDetailsData.id) {
        isTm = true
      }
    })
    return isTm
  }

  const isTeamMemberSearch = (task, user) => {
    let isTm = false
    task.teamMembers.forEach(tm => {
      if (tm.id === user.id) {
        isTm = true
      }
    })
    return isTm
  }

  const filterByUser = task => {
    if (userFilter === 0) {
      return true
    } else if (userFilter === 1) {
      return isTeamMember(task)
    } else if (userSearch) {
      return isTeamMemberSearch(task, userSearch)
    } else {
      return task.teamMembers.length === 0
    }
  }

  const showTask = task => {
    if (
      selectedPhases.length > 0 &&
      !selectedPhases.includes(findLevelA(task)?.id)
    ) {
      return false
    }

    if (!task.isMilestone && showOnlyMilestones === true) {
      return false
    }
    if (!task.isDeliverable && showOnlyDeliverables === true) {
      return false
    }
    if ((task.isMilestone || task.isDeliverable) && showOnlyTasks === true) {
      return false
    }
    if (selectedLevel + 1 < task.level) {
      return false
    }
    if (
      dateFilter === 1 &&
      (dayjs(getEndDate(task, false)).isAfter(dayjs(filterDate)) ||
        getEndDate(task, false) === null)
    ) {
      return false
    }
    if (
      dateFilter === 2 &&
      (dayjs(getEndDate(task, false)).isBefore(dayjs(filterDate)) ||
        getEndDate(task, false) === null)
    ) {
      return false
    }
    if (dateFilter === 3 && getEndDate(task, false) !== null) {
      return false
    }
    if (statusFilter === 0) {
      return (
        task.status === TASK_STATUS.NOT_STARTED ||
        task.status === TASK_STATUS.IN_PROGRESS
      )
    } else if (statusFilter === 1) {
      return task.status === TASK_STATUS.NOT_STARTED
    } else if (statusFilter === 2) {
      return task.status === TASK_STATUS.IN_PROGRESS
    } else if (statusFilter === 3) {
      return task.status === TASK_STATUS.DONE
    } else if (statusFilter === 4) {
      return task.status === TASK_STATUS.NOT_REQUIRED
    } else if (statusFilter === 5) {
      return (
        task.status === TASK_STATUS.NOT_STARTED ||
        task.status === TASK_STATUS.IN_PROGRESS ||
        task.status === TASK_STATUS.DONE ||
        task.status === TASK_STATUS.NOT_REQUIRED
      )
    } else {
    }
  }

  useEffect(() => {
    if (initialTaskList) {
      setTasks(
        initialTaskList
          .filter(t => t.level !== 1)
          .sort((a, b) => a.listIdx - b.listIdx)
      )
    }
  }, [initialTaskList])

  useEffect(() => {
    if (tasks) {
      let matchTask = tasks.find(x => x.id === selectedTask?.id)
      if (
        matchTask &&
        matchTask.teamMembers.length !== selectedTask.teamMembers.length
      ) {
        dispatch(fetchTaskmapContent(matterId, workstreamId))
        dispatch(fetchProjectWithPostsAndTaskTeam(matterId, workstreamId))
      }
    }
    //eslint-disable-next-line
  }, [selectedTask])

  useEffect(() => {
    if (taskmapView && view === 1) {
      taskmapView.forEach(t => {
        let matchTask = initialTaskList.find(x => x.id === t.id)
        t.parent = matchTask.parent
      })
      let sortedTaskmapView = []
      taskmapView.forEach(t => {
        if (t.level <= 2) {
          sortedTaskmapView.push(t)
        } else {
          let parentIndex = sortedTaskmapView.findIndex(
            y => y.id === t.parent.id
          )
          sortedTaskmapView.splice(parentIndex, 0, t)
        }
      })
      setTasks(sortedTaskmapView.filter(t => t.level !== 1))
    } else if (view === 0) {
      if (initialTaskList) {
        setTasks(
          initialTaskList
            .filter(t => t.level !== 1)
            .sort((a, b) => a.listIdx - b.listIdx)
        )
      }
    } else if (view === 2) {
      if (initialTaskList) {
        setTasks(
          initialTaskList
            .filter(t => t.level !== 1)
            .sort((a, b) => getEndDate(a, false) - getEndDate(b, false))
            .sort((a, b) => sortByRemoveNull(a, b))
        )
      }
    }
    //eslint-disable-next-line
  }, [view, initialTaskList])

  const sortByRemoveNull = (a, b) => {
    if (getEndDate(a, false) === null || getEndDate(b, false) === null) {
      return -1
    }
    return 1
  }

  useEffect(() => {
    dispatch(fetchTaskmapContent(matterId, workstreamId))
    //eslint-disable-next-line
  }, [dateChange])

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    removed.listIdx = endIndex
    result.forEach(task => {
      if (task.listIdx < endIndex && task.listIdx > startIndex) {
        task.listIdx = task.listIdx - 1
      } else if (task.listIdx < startIndex && task.listIdx > endIndex) {
        task.listIdx = task.listIdx + 1
      } else if (task.listIdx === endIndex || task.listIdx === startIndex) {
        if (endIndex > startIndex) {
          task.listIdx = task.listIdx - 1
        } else {
          task.listIdx = task.listIdx + 1
        }
      }
    })
    result.splice(endIndex, 0, removed)
    return result
  }

  const onListDragEnd = result => {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    const currTask = tasks[result.source.index]
    const newTaskList = reorder(
      tasks,
      result.source.index,
      result.destination.index
    )

    setTasks(newTaskList)
    taskService
      .updateTask(
        currTask.matterId,
        currTask.project.id,
        currTask.id,
        { newListIdx: result.destination.index },
        false
      )
      .then(res => {
        setTasks(
          res.body
            .filter(t => t.level !== 1)
            .sort((a, b) => a.listIdx - b.listIdx)
        )
      })
  }

  const findLevelA = task => {
    let parent = initialTaskList.find(t => t.id === task.parent.id)
    if (parent) {
      if (parent.level === 1) {
        return parent
      } else {
        return findLevelA(parent)
      }
    }
  }

  const allTasksHidden = tasks?.map(t => {
    return showTask(t) && filterByUser(t)
  })

  const renderItems = () => {
    if (tasks) {
      return (
        <>
          <ConfirmDateTimeChangeContainer
            matterId={task && task?.matterId}
            projectId={task && task.project && task?.project?.id}
            isTaskmap={true}
            tasks={tasks}
            task={task}
            onCancel={() => {}}
          />
          {statusChange.statusChangeTargetTaskId && task && (
            <ConfirmStatusChangeContainer
              task={task}
              confirmHandler={properties => {
                confirmStatusChange(
                  properties,
                  statusChange.affectedTasks,
                  initialTaskList,
                  task,
                  dispatch,
                  statusDone
                )
              }}
            />
          )}
          {(taskmapInteractions.dates || taskmap.dateType !== null) && (
            <DateChangePopover
              inTaskMap={true}
              task={task}
              forceFetch={true}
              dateType={taskmap.dateType}
              fullType={
                taskmap.dateType === DATE_VARIABLES.END
                  ? task?.status === TASK_STATUS.DONE
                    ? DATE_VARIABLES.AED
                    : DATE_VARIABLES.PED
                  : DATE_VARIABLES.PSD
              }
            />
          )}
          {taskmap.showTaskPreview && (
            <TaskPreviewContainer
              isRoadmap={false}
              viewOnly={isViewOnly}
              isTaskmap={true}
            />
          )}
          <div className={classes.grid}>
            <div
              style={{
                justifySelf: 'center',
                marginRight: '12px',
                marginLeft: '12px',
              }}
            >
              <ListLevelFilter
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListPhaseFilter
                setSelectedPhases={setSelectedPhases}
                selectedPhases={selectedPhases}
                phases={initialTaskList.filter(t => t.level === 1).reverse()}
              />
              <ListStatusFilter
                setStatusFilter={setStatusFilter}
                statusFilter={statusFilter}
              />
              <ListTaskTypeFilter
                showOnlyMilestones={showOnlyMilestones}
                setShowOnlyMilestones={setShowOnlyMilestones}
                showOnlyTasks={showOnlyTasks}
                setShowOnlyTasks={setShowOnlyTasks}
                showOnlyDeliverables={showOnlyDeliverables}
                setShowOnlyDeliverables={setShowOnlyDeliverables}
                value={value}
                setValue={setValue}
              />
              <ListDateFilter
                setDateFilter={setDateFilter}
                dateFilter={dateFilter}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
              />
              <ListViewSwitcher setView={setView} view={view} />
              {showReset && (
                <Typography
                  data-test="reset-button"
                  style={{
                    marginLeft: '8px',
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    setSelectedPhases([])
                    setSelectedLevel(5)
                    setFilterDate(undefined)
                    setDateFilter(0)
                    setStatusFilter(0)
                    setUserFilter(0)
                    setShowOnlyMilestones(false)
                    setShowOnlyDeliverables(false)
                    setShowOnlyTasks(false)
                    setValue(0)
                  }}
                >
                  {t('common.reset')}
                </Typography>
              )}
            </div>
            <div></div>
            <div style={{ marginLeft: 'auto', marginRight: '24px' }}>
              <ListUserFilter
                matterId={props.matterId}
                userFilter={userFilter}
                setUserFilter={setUserFilter}
                userData={userDetailsData}
                userSearch={userSearch}
                setUserSearch={setUserSearch}
              />
            </div>
          </div>
          <div style={{ marginLeft: '12px', marginRight: '12px' }}>
            {allTasksHidden.includes(true) ? (
              tasks?.map((task, index) => {
                return (
                  <Fade timeout={500} in={showTask(task) && filterByUser(task)}>
                    <div
                      style={
                        showTask(task) && filterByUser(task)
                          ? {}
                          : { visibility: 'collapse', height: '0px' }
                      }
                    >
                      <Draggable
                        key={task.id}
                        draggableId={`${task.id}`}
                        index={index}
                        isDragDisabled={view > 0 || isViewOnly}
                      >
                        {(provided, snapshot) => (
                          <div
                            data-test="draggable-task"
                            style={
                              showTask(task) && filterByUser(task)
                                ? {}
                                : {
                                    marginTop: '0px',
                                    marginBottom: '0px',
                                  }
                            }
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={classes.item}
                          >
                            <ListTaskItem
                              workstreamId={workstreamId}
                              isLink={false}
                              task={task}
                              parent={findLevelA(task)}
                              subtasks={tasks.filter(
                                t => t.parent.id === task.id
                              )}
                              matterId={props.matterId}
                              isDragging={snapshot.isDragging}
                              viewOnly={isViewOnly}
                            />
                          </div>
                        )}
                      </Draggable>
                    </div>
                  </Fade>
                )
              })
            ) : (
              <Typography
                data-test="zero-state-filter"
                style={{ justifySelf: 'center', marginTop: '8px' }}
              >
                {t('listView.filterZeroState')}
              </Typography>
            )}
          </div>
        </>
      )
    } else {
      return <div />
    }
  }

  return (
    <>
      <DragDropContext onDragEnd={onListDragEnd}>
        {tasks && tasks.length > 0 ? (
          <div className="task-group" data-test={'123'}>
            <Droppable droppableId={`${props.droppableId}`}>
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {renderItems()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ) : (
          <></>
        )}
      </DragDropContext>
    </>
  )
}
export default ListTaskGroup
