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

import ListTaskItem from './ListTaskItem'
import rawColours from '../../../theme/raw-colours'
import ListLevelFilter from './ListLevelFilter'
import ListPhaseFilter from './ListPhaseFilter'
import { fetchTemplateTaskmapContent } from '../../../redux/ducks/improved-taskmap'
import ListTaskTypeFilter from './ListTaskTypeFilter'
import ListViewSwitcher from './ListViewSwitcher'
import templateService from '../../../services/template/template-service'
import TaskRename from '../../../app/improved-taskmap/taskmap-interactions/TaskRename'

const useStyles = makeStyles()(theme => ({
  item: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1) },
  grid: {
    display: 'grid',
    gridTemplateColumns: '10% 70% 7% 13%',
    backgroundColor: rawColours.primary.grey.main,
    height: theme.spacing(9),
    alignContent: 'center',
    paddingLeft: '8px',
  },
}))

const ListTemplateTaskGroup = props => {
  const { templateId } = props
  const dispatch = useDispatch()
  const dateChange = useSelector(state => state.dateChange)
  const initialTaskList = useSelector(state => state.improvedTaskmap.tasks)
  const [tasks, setTasks] = useState()
  const { classes } = useStyles()
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )

  const task = tasks?.find(t => t.id === taskmapInteractions.taskId)
  const [selectedPhases, setSelectedPhases] = useState([])
  const [selectedLevel, setSelectedLevel] = useState(5)
  const [showOnlyMilestones, setShowOnlyMilestones] = useState(0)

  const [view, setView] = useState(0)
  const showReset =
    selectedPhases.length !== 0 ||
    selectedLevel !== 5 ||
    showOnlyMilestones !== 0

  const showTask = task => {
    if (
      selectedPhases.length > 0 &&
      !selectedPhases.includes(findLevelA(task).id)
    ) {
      return false
    }

    if (!task.isMilestone && showOnlyMilestones === 1) {
      return false
    }
    if (selectedLevel + 1 < task.level) {
      return false
    }
    return true
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
    if (view === 1) {
      // taskmapView.forEach(t => {
      //   let matchTask = initialTaskList.find(x => x.id === t.id)
      //   t.parent = matchTask.parent
      // })
      let sortedTaskmapView = []
      initialTaskList.forEach(t => {
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
    }
    //eslint-disable-next-line
  }, [view])

  useEffect(() => {
    dispatch(fetchTemplateTaskmapContent(templateId))
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

    templateService
      .updateTemplateTask(templateId, currTask.id, {
        newListIdx: result.destination.index,
      })
      .then(res => {
        dispatch(fetchTemplateTaskmapContent(templateId))
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

  // const allTasksHidden = tasks?.map(t => {
  //   return showTask(t) && filterByUser(t)
  // })

  const renderItems = () => {
    if (tasks) {
      return (
        <>
          {taskmapInteractions.rename && <TaskRename task={task} />}
          <div className={classes.grid}>
            <div>
              <ListLevelFilter
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ListPhaseFilter
                setSelectedPhases={setSelectedPhases}
                selectedPhases={selectedPhases}
                phases={initialTaskList.filter(t => t.level === 1)}
              />

              <ListTaskTypeFilter
                showOnlyMilestones={showOnlyMilestones}
                setShowOnlyMilestones={setShowOnlyMilestones}
              />

              <ListViewSwitcher setView={setView} view={view} />
              {showReset && (
                <Typography
                  style={{
                    marginLeft: '8px',
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    setSelectedPhases([])
                    setSelectedLevel(5)
                    setShowOnlyMilestones(0)
                  }}
                >
                  Reset
                </Typography>
              )}
            </div>
            <div></div>
            <div></div>
          </div>
          <div
            id={'improved-taskmap-wrapper'}
            style={{ marginLeft: '12px', marginRight: '12px' }}
          >
            {true ? (
              tasks?.map((task, index) => {
                return (
                  <Fade timeout={500} in={showTask(task)}>
                    <div
                      style={
                        showTask(task)
                          ? {}
                          : { visibility: 'collapse', height: '0px' }
                      }
                    >
                      <Draggable
                        key={task.id}
                        draggableId={`${task.id}`}
                        index={index}
                        isDragDisabled={view === 1}
                      >
                        {provided => (
                          <div
                            className={showTask(task) ? classes.item : null}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <ListTaskItem
                              isLink={false}
                              task={task}
                              parent={findLevelA(task)}
                              subtasks={tasks.filter(
                                t => t.parent.id === task.id
                              )}
                              matterId={props.matterId}
                            />
                          </div>
                        )}
                      </Draggable>
                    </div>
                  </Fade>
                )
              })
            ) : (
              <Typography style={{ justifySelf: 'center', marginTop: '8px' }}>
                {
                  'No template tasks  - change the filters to see other available tasks in this template '
                }
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
export default ListTemplateTaskGroup
