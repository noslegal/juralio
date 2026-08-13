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

import {
  Card,
  Grow,
  LinearProgress,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import classNames from 'classnames'

import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import { improvedCanvasMinimap } from '../../../components/icicle/desktop/helper/canvas-render-helper'
import {
  getMatterIdFromLocation,
  getTaskDetailsUrl,
  getTemplateIdFromLocation,
  getTemplateTaskDetailsUrl,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import { removeNewTask } from '../../../redux/ducks/improved-taskmap'
import {
  completeTaskDrag,
  requestTaskDrag,
} from '../../../redux/ducks/improved-taskmap-interactions'

import {
  getStatusColour,
  getTaskCellColour,
} from '../../../services/helpers/task/task-status-colour-helper'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { CONFIG, TASK_STATUS } from '../../constants'
import QuickAddButtons from '../task-add/QuickAddButtons'
import TaskContentContainer from '../task-content/TaskContentContainer'
import NewTaskHighlight from '../taskmap-interactions/NewTaskHighlight'
import {
  COMPACT_TASK_HEIGHT,
  DEFAULT_TASK_HEIGHT,
  DEFAULT_TASK_WIDTH,
} from './consts'
import {
  onDrag,
  onDragover,
  onDrop,
  setParentHeightDuringDrag,
  setXBounds,
} from './drag-helpers'
import { shouldShow } from './filter-helpers'
import {
  getHeightForMinimapCell,
  getWidthForMinimapCell,
} from './minimap-helpers'
import MoveDropzone from './MoveDropzone'
import RenderIfVisible from './render-if-visible'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import JurMilestone from '../../../assets/images/JurMilestone'
import juralioColours from '../../../theme/juralio-colours'
import { isPlannedEndDateOverdue } from '../../roadmap/helpers/task-dates-helper'
import { useTranslation } from 'react-i18next'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: 'fit-content',
  },
  structureItem: {
    backgroundColor: colorModifiers.secondaryBackground('#cacaca'),
    width: `${DEFAULT_TASK_WIDTH}px`,
    minHeight: `${DEFAULT_TASK_HEIGHT}px`,
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    overflow: 'visible',
  },
  fullSizeStructureItem: {
    width: `${DEFAULT_TASK_WIDTH}px`,
    minHeight: `${DEFAULT_TASK_HEIGHT}px`,
    height: '100%',
  },
  miniStructureItem: {
    height: '100%',
  },
  compactStructureItem: {
    backgroundColor: colorModifiers.secondaryBackground('#cacaca'),
    width: `${DEFAULT_TASK_WIDTH}px`,
    minHeight: `${COMPACT_TASK_HEIGHT}px`,
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
  },
  visibleWrapper: {
    margin: '4px',
    display: 'flex',
    position: 'relative',
  },
  miniVisibleWrapper: {
    margin: '1px',
    display: 'flex',
    position: 'relative',
  },
  skeleton: {
    WebkitTransform: 'scale(1)',
    fontFamily: 'montserrat',
    cursor: 'pointer',
    padding: theme.spacing(),
    fontWeight: 500,
    fontSize: '0.875rem',
    textOverflow: 'ellipsis',
    whiteSpece: 'nowrap',
  },
  fadeOutAnimation: {
    animationName: 'fadeOut',
    animationDuration: '1s',
    animationIterationCount: '1',
    animationTimingFunction: 'ease-in-out',
  },
  moveDropzone: {
    minWidth: `${DEFAULT_TASK_WIDTH}px`,
    minHeight: `${DEFAULT_TASK_HEIGHT}px`,
    width: 'fit-content',
    height: 'fit-content',
    position: 'relative',
    backgroundColor: 'unset',
    justifyContent: 'center',
    display: 'flex',
    overflow: 'visible',
    border: `dashed  2px ${rawColours.primary.purple.primary}`,
    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.purple.primary
      ),
    },
  },
  urlFocus: {
    borderRadius: theme.spacing(0.5),
  },
  icon: {
    marginLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.5),
    visibility: 'visible',
  },
  skeletonRow: {
    display: 'flex',
    marginLeft: '-20px',
    alignItems: 'center',
  },
}))

const Icicle = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const newTaskIds = useSelector(state => state.improvedTaskmap.newTasks)

  useEffect(() => {
    let splitUrl = window.location.href.split('?')
    if (splitUrl.length > 1) {
      let urlParams = new URLSearchParams(
        '?' + window.location.href.split('?')[1]
      )
      let focusTaskId = urlParams.get('id')
      if (focusTaskId[focusTaskId.length - 1] === 'h') {
        focusTaskId = focusTaskId.substring(0, focusTaskId.length - 1)
        const focusTask = tasks.filter(t => t.id === parseInt(focusTaskId))

        if (
          parseInt(focusTaskId) === props.task.id ||
          flatTaskListFromTree({ tasks: focusTask })
            .map(x => x.id)
            .includes(props.task.id)
        ) {
          setIsUrlFocus(true)
        }
      } else {
        if (parseInt(focusTaskId) === props.task.id) {
          setIsUrlFocus(true)
        }
      }
    }
  }, [props.task, tasks])

  const structure = useSelector(state => state.improvedTaskmap.structure)
  const height = useSelector(state => state.improvedTaskmap.height)
  const depth = useSelector(state => state.improvedTaskmap.depth)
  const improvedTaskmap = useSelector(state => state.improvedTaskmap)
  const selectionMode = useSelector(state => state.project.selectionMode)
  const dispatch = useDispatch()
  const [isNew, setIsNew] = useState(false)
  const [fadeout, setFadeout] = useState(false)
  const [isInMove, setIsInMove] = useState(false)
  const [isUrlFocus, setIsUrlFocus] = useState(null)
  const task = props.task
  const taskBeingMovedId = taskmapInteractions.taskId
  const isMidMove = taskmapInteractions.move

  let children = task.tasks
    ? task.tasks
        .filter(t => shouldShow(t, taskMapFilter))
        .filter(t => {
          if (taskBeingMovedId && isMidMove) {
            return t.id !== taskBeingMovedId
          } else {
            return true
          }
        })
    : []

  useEffect(() => {
    if (isUrlFocus) {
      setTimeout(() => {
        setIsUrlFocus(false)
        window.location.href = window.location.href.split('?')[0]
      }, 3000)
    }
  }, [isUrlFocus])

  useEffect(() => {
    if (!taskmapInteractions.move) {
      setIsInMove(false)
    }
  }, [taskmapInteractions.move])

  const isComplexMove =
    Object.keys(taskmapInteractions.complexMoveDetails).length > 0
  useEffect(() => {
    if (props.fadeout) {
      setFadeout(props.fadeout)
    }
  }, [props.fadeout])

  useEffect(() => {
    !props.isMinimap && setIsNew(newTaskIds?.includes(props.task.id))
  }, [newTaskIds]) //eslint-disable-line

  const location = useLocation()
  const history = useNavigate()

  const handleFadeout = () => {
    let fadeoutId = parseInt(window.localStorage.getItem('taskmapFadeOut'))
    if (fadeoutId === task.id) {
      setFadeout(true)
    } else if (!props.fadeout) {
      setFadeout(false)
    }
  }

  const handleMoveTrigger = () => {
    if (children?.length === 0 && !isDragging) {
      setIsInMove(true)
    }
  }

  const completeMove = () => {
    let dropzoneId = parseInt(window.localStorage.getItem('dropZoneId'))
    if (dropzoneId !== props.task.id) {
      setIsInMove(false)
    }
  }

  useEffect(() => {
    window.addEventListener('taskmapFadeOut', handleFadeout)
    window.addEventListener('triggerMove', handleMoveTrigger)
    window.addEventListener('completeMove', completeMove)

    return () => {
      window.removeEventListener('taskmapFadeOut', handleFadeout)
      window.removeEventListener('triggerMove', handleMoveTrigger)
      window.removeEventListener('completeMove', completeMove)
    }
  })

  useEffect(() => {
    setIsDragging(props.isDragging)
  }, [props.isDragging])

  const findTaskInStructure = (id, structure) => {
    let task = null

    structure.map(s => {
      if (s.id === id) {
        task = s
      } else if (s.tasks) {
        let st = findTaskInStructure(id, s.tasks)
        if (st) {
          task = st
        }
      }
    })

    return task
  }

  const generateDragImage = taskId => {
    let taskStructure = findTaskInStructure(taskId, structure)
    let ctx = document.getElementById('drag-canvas')?.getContext('2d')
    const self = tasks.find(t => t.id === taskId)
    const flatTasks = flatTaskListFromTree(taskStructure).map(t =>
      tasks.find(ft => ft.id === t.id)
    )

    const width =
      flatTasks.length > 0
        ? Math.max(...flatTasks.map(t => t.level)) - self.level + 1
        : 1
    let height =
      flatTasks.length > 0
        ? flatTasks.filter(l => l.tasks?.length === 0 || l.tasks === null)
            ?.length
        : 1

    if (height < 1) {
      height = 1
    }

    const placeholderTaskHeight =
      height > 20
        ? COMPACT_TASK_HEIGHT - (40 - CONFIG.PROJECT_TASK_LIMIT / height)
        : COMPACT_TASK_HEIGHT
    const placeholderTaskWidth =
      width > 3 ? DEFAULT_TASK_WIDTH - 40 * depth : DEFAULT_TASK_WIDTH

    document
      .getElementById('drag-canvas')
      .setAttribute('width', width * placeholderTaskWidth + 8 * width)
    document
      .getElementById('drag-canvas')
      .setAttribute('height', height * placeholderTaskHeight + 8 * height)

    improvedCanvasMinimap(
      [taskStructure],
      tasks,
      height,
      width,
      taskMapFilter,
      [],
      {
        width: width * placeholderTaskWidth + 8 * width,
        height: height * placeholderTaskHeight + 8 * height,
        ctx: ctx,
        isDragImage: true,
      }
    )
    let data = document.getElementById('drag-canvas').toDataURL()
    document.getElementById('drag-image-element').setAttribute('src', data)
  }

  const onDragStart = e => {
    if (props.isReadOnly) return
    if (props.isMinimap) {
      return
    }
    generateDragImage(task.id)
    e.stopPropagation()

    document.getElementById('drag-image-element').style.top = `${e.clientY}px`
    document.getElementById('drag-image-element').style.left = `${e.clientY}px`

    let cellCoords = document
      .getElementById(`structure-item-${task.id}`)
      .getBoundingClientRect()

    const getAllChildrenLevels = task => {
      let results = [task.level]
      if (task.tasks) {
        for (let i = 0; i < task.tasks.length; i++) {
          results.push(
            ...getAllChildrenLevels(tasks.find(t => t.id === task.tasks[i].id))
          )
        }
      }

      return results
    }
    let allChildren = getAllChildrenLevels(tasks.find(t => t.id === task.id))
      .sort()
      .reverse()
    let depth = allChildren[0] - allChildren[allChildren.length - 1] + 1
    localStorage.setItem('dragIcicleDepth', depth)
    setXBounds(task.id)
    props.childDragging()
    e.dataTransfer.setDragImage(
      document.getElementById('drag-image-element'),
      e.clientX - cellCoords.x,
      e.clientY - cellCoords.y
    )
    dispatch(requestTaskDrag(task.id))
    setIsDragging(true)
  }

  const childDragging = () => {
    let self = document.getElementById(`structure-item-${task.id}`)
    if (self) {
      let bounds = self.getBoundingClientRect()
      setParentHeightDuringDrag(bounds.top, bounds.bottom)
    }
  }

  const onDragEnd = e => {
    if (props.isReadOnly) return

    dispatch(completeTaskDrag(task.id))
    document.getElementById('drag-image-element').style.top = `-100000px`
    document.getElementById('drag-image-element').style.left = `-100000px`
    onDrop(
      e,
      dispatch,
      task.id,
      cloneDeep(tasks),
      cloneDeep(structure),
      height,
      depth,
      taskMapFilter
    )
    setIsDragging(false)
  }

  const taskContent = tasks.find(t => t.id === task.id)
  if (taskContent) {
    const show = shouldShow(taskContent, taskMapFilter, fadeout)
    if (!show) {
      return null
    }
  }

  const isLoaded = props.isLoaded

  if (
    isComplexMove &&
    taskmapInteractions.complexMoveDetails.newParentId === props.task.id
  ) {
    children.splice(taskmapInteractions.complexMoveDetails.insertIndex, 0, {
      isDropzone: true,
    })
  }

  const isCompact =
    taskMapFilter.detailedView[
      isInTemplate(window.location.href) ? 'templateViewMode' : 'viewMode'
    ] === 2

  const handleNewTaskClick = e => {
    e.stopPropagation()
    setIsNew(false)
    const findAllNewchildren = t => {
      let tasks = []
      let childrenIds = t.tasks
        .map(t => t.id)
        .filter(cid => newTaskIds.includes(cid))
      tasks = [...tasks, ...childrenIds]
      if (childrenIds.length > 0) {
        childrenIds.forEach(id => {
          tasks = [
            ...tasks,
            ...findAllNewchildren(t.tasks.find(ct => ct.id === id)),
          ]
        })
      }
      return tasks
    }

    let allNewchildren = findAllNewchildren(props.task)
    allNewchildren.forEach(child => {
      dispatch(
        removeNewTask(taskContent.matterId, taskContent.project.id, child)
      )
    })

    dispatch(
      removeNewTask(taskContent.matterId, taskContent.project.id, props.task.id)
    )
  }

  const getMilestoneColour = () => {
    if (
      props.task.status === TASK_STATUS.NOT_STARTED &&
      isPlannedEndDateOverdue(props.task)
    ) {
      return { color: rawColours.error.primary }
    }
    if (isInTemplate(window.location.href)) {
      return { color: rawColours.primary.purple.secondary }
    }
    return props.task.status === TASK_STATUS.NOT_STARTED
      ? { color: juralioColours.taskStatus.notStarted }
      : { color: juralioColours.taskStatus.done }
  }

  const getDeliverableColour = () => {
    if (
      props.task.status === TASK_STATUS.NOT_STARTED &&
      isPlannedEndDateOverdue(props.task)
    ) {
      return rawColours.error.primary
    }
    if (isInTemplate(window.location.href)) {
      return rawColours.primary.purple.secondary
    }
    if (props.task.status === TASK_STATUS.IN_PROGRESS) {
      return juralioColours.taskStatus.inProgress
    }
    return props.task.status === TASK_STATUS.NOT_STARTED
      ? juralioColours.taskStatus.notStarted
      : juralioColours.taskStatus.done
  }

  return (
    <Grow
      timeout={task.id !== -1 && !isMidMove ? task.level * 1000 : 0}
      in={true}
    >
      <div
        className={`${classes.wrapper} ${fadeout && classes.fadeOutAnimation}`}
        key={task.id}
        draggable={
          !taskMapFilter.expandCollapseTaskFilter.includes(props.task.id) &&
          !props.isMinimap &&
          props.isLoaded &&
          !props.isReadOnly &&
          props.task.status !== TASK_STATUS.NOT_REQUIRED
        }
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onDragOver={onDragover}
        data-test="icicle-wrapper"
        id={`task-wrapper-${props.task.id}`}
        style={{
          //maxHeight: isCompact ? '56px' : '100px',
          marginTop:
            taskContent && taskContent.level === 1 && !props.ignoreMargin
              ? props.isMinimap
                ? '1px'
                : '16px'
              : '',
        }}
      >
        <RenderIfVisible
          rootElementClass={
            props.isMinimap
              ? classes.miniVisibleWrapper
              : classes.visibleWrapper
          }
          defaultHeight={
            props.isMinimap
              ? getHeightForMinimapCell(height)
              : isCompact
                ? COMPACT_TASK_HEIGHT
                : DEFAULT_TASK_HEIGHT
          }
          initialVisible={
            props.isMinimap ||
            navigator.userAgent.includes('Cypress!') ||
            props.task.id === -1 ||
            fadeout
          }
          stayRendered={navigator.userAgent.includes('Cypress!')}
          placeholderElementClass={
            isCompact && !props.isMinimap
              ? classes.compactStructureItem
              : classes.structureItem
          }
          visibleOffset={3000}
        >
          <div
            onMouseEnter={() =>
              !props.isMinimap &&
              !isNew &&
              !props.isReadOnly &&
              props.isLoaded &&
              setIsHovering(true)
            }
            onMouseLeave={() =>
              !props.isMinimap &&
              !isNew &&
              !props.isReadOnly &&
              setIsHovering(false)
            }
            data-test={`depth-${taskContent?.level}`}
            depth={taskContent?.level}
            className={!props.isMinimap && isUrlFocus && classes.urlFocus}
            style={{
              border:
                !props.isMinimap && isUrlFocus
                  ? `3px solid ${getStatusColour(props.task.status)}`
                  : '3px solid rgba(0,0,0,0)',
              borderBottom:
                !props.isMinimap && isUrlFocus
                  ? `3px solid ${getStatusColour(props.task.status)}`
                  : '3px solid rgba(0,0,0,0)',
              boxShadow:
                !props.isMinimap && isUrlFocus
                  ? `0px 0px 6px  ${getStatusColour(props.task.status)}`
                  : '',
            }}
          >
            {isNew && <NewTaskHighlight onClick={handleNewTaskClick} />}

            <Card
              className={classNames(
                classes.structureItem,
                props.isMinimap ? classes.miniStructureItem : null,
                isCompact && !props.isMinimap
                  ? classes.compactStructureItem
                  : classes.structureItem
              )}
              style={{
                opacity: isDragging ? '0.5' : '',
                backgroundColor:
                  isLoaded && taskContent
                    ? ''
                    : colorModifiers.secondaryBackground('#cacaca'),
                width: props.isMinimap ? getWidthForMinimapCell(depth) : '',
                minHeight: props.isMinimap
                  ? Math.max(getHeightForMinimapCell(height), 1)
                  : '',
                height:
                  !props.isMinimap &&
                  taskMapFilter.expandCollapseTaskFilter.includes(props.task.id)
                    ? 'auto'
                    : '',
                marginTop:
                  !isLoaded && !isInTemplate(window.location.href)
                    ? '20px'
                    : '0px',
              }}
              id={`structure-item-${task.id}`}
              data-test="structureItem"
            >
              {(!isLoaded || props.task.forLoading) && (
                <Skeleton
                  className={classes.skeleton}
                  width={450}
                  style={{
                    backgroundColor: colorModifiers.skeletonBackground(
                      getTaskCellColour(props.task)
                    ),
                    paddingLeft: isCompact ? '32px' : '16px',
                    paddingTop: isCompact ? '9px' : '10px',
                  }}
                  onClick={() => {
                    //goto task details
                    const newPath = !isInTemplate(window.location.href)
                      ? getTaskDetailsUrl(
                          getMatterIdFromLocation(location),
                          improvedTaskmap.workstreamId,
                          props.task.id
                        )
                      : getTemplateTaskDetailsUrl(
                          getTemplateIdFromLocation(location),
                          props.task.id
                        )

                    history(newPath)
                  }}
                >
                  <div className={classes.skeletonRow}>
                    {props.task?.isMilestone &&
                      isInTemplate(window.location.href) && (
                        <JurMilestone
                          data-test="milestone-icon"
                          style={getMilestoneColour()}
                          className={classes.icon}
                        />
                      )}
                    {props.task.isDeliverable &&
                      isInTemplate(window.location.href) && (
                        <JurDeliverable
                          stroke={getDeliverableColour()}
                          data-test="deliverable-icon"
                          className={classes.icon}
                        />
                      )}

                    <Typography
                      style={{
                        visibility: 'visible',
                        marginLeft: isCompact ? '0px' : '20px',
                      }}
                    >
                      {props.task.forLoading
                        ? 'Adding to matter...'
                        : props.task.name}
                    </Typography>
                  </div>
                  {props.task.forLoading && (
                    <div
                      style={{
                        width: '100%',
                        marginLeft: isCompact ? '-20px' : '0px',
                        visibility: 'visible',
                        paddingTop: isCompact ? '2px' : '32px',
                      }}
                    >
                      <LinearProgress />
                    </div>
                  )}
                </Skeleton>
              )}
              {isLoaded && !props.isMinimap && !props.task.forLoading && (
                <TaskContentContainer
                  id={task.id}
                  isReadOnly={props.isReadOnly}
                />
              )}
            </Card>

            {isHovering &&
              !taskmapInteractions.move &&
              isLoaded &&
              !taskmapInteractions.rename && (
                <QuickAddButtons task={task} selectionMode={selectionMode} />
              )}
          </div>
        </RenderIfVisible>
        {flatTaskListFromTree(tasks.find(t => t.id === props.task.id)).length >
          0 &&
          children.length === 0 &&
          !taskmapInteractions.dragging &&
          !taskmapInteractions.move && (
            <Tooltip title={t('taskMap.filterInToSeeAll')}>
              <div
                data-test="filtered-out-subtasks"
                onClick={e => {
                  if (
                    taskMapFilter.expandCollapseTaskFilter.includes(
                      props.task.id
                    )
                  ) {
                    const fullTask = tasks.find(t => t.id === props.task.id)
                    dispatch(taskFilterActions.expandTask(props.task.id))
                    fullTask?.tasks?.forEach(child => {
                      if (
                        child?.tasks?.length > 0 &&
                        !taskMapFilter.expandCollapseTaskFilter.includes(
                          child.id
                        )
                      ) {
                        dispatch(taskFilterActions.collapseTask(child.id))
                      }
                    })
                    e.stopPropagation()
                  }
                }}
                style={{
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  width: 50,
                  height: 50,
                  backgroundColor: 'rgba(169,169,169,0.2)',
                  justifyItems: 'center',
                  alignContent: 'center',
                  borderRadius: '4px',
                  color: juralioColours.darkText.secondary,
                  cursor: taskMapFilter.expandCollapseTaskFilter.includes(
                    props.task.id
                  )
                    ? 'pointer'
                    : 'default',
                }}
              >
                {
                  <Typography>
                    {'+' +
                      flatTaskListFromTree(
                        tasks.find(t => t.id === props.task.id)
                      ).length}
                  </Typography>
                }
              </div>
            </Tooltip>
          )}
        {children.length > 0 && (
          <div className={classes.childrenWrapper}>
            {children.map(t => {
              if (
                t.isDropzone &&
                props.task.status !== TASK_STATUS.NOT_REQUIRED
              ) {
                return (
                  <MoveDropzone
                    classes={classes}
                    task={props.task}
                    isCompact={isCompact}
                    isDetailed={taskMapFilter.detailedView.viewMode === 1}
                    show={true}
                  />
                )
              }
              return (
                <Icicle
                  task={t}
                  key={t.id}
                  isDragging={isDragging}
                  isLoaded={props.isLoaded}
                  childDragging={childDragging}
                  isMinimap={props.isMinimap}
                  isReadOnly={props.isReadOnly}
                  fadeout={fadeout}
                />
              )
            })}
          </div>
        )}
        {!props.task.isMilestone &&
          tasks.find(t => t.id === props.task.id)?.level +
            parseInt(window.localStorage.getItem('dragIcicleDepth')) <=
            6 &&
          isInMove &&
          props.task.status !== TASK_STATUS.NOT_REQUIRED &&
          !isDragging && (
            <div className={classes.childrenWrapper}>
              <MoveDropzone
                errorzone={
                  taskMapFilter.levelFilter === props.task.level ||
                  taskMapFilter.expandCollapseTaskFilter.includes(props.task.id)
                }
                errorzoneText={
                  taskMapFilter.expandCollapseTaskFilter.includes(props.task.id)
                    ? t('taskMap.expandPhase')
                    : taskMapFilter.levelFilter === props.task.level
                      ? t('taskMap.expandLevel')
                      : ''
                }
                classes={classes}
                task={props.task}
                isCompact={isCompact}
                isDetailed={taskMapFilter.detailedView.viewMode === 1}
                show={isInMove && !isDragging}
              />
            </div>
          )}
      </div>
    </Grow>
  )
}
export default Icicle
