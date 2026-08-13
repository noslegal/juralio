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

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { Button, Tooltip } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  getTemplateIdFromLocation,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import useOnScreen from '../../../hooks/use-on-screen'
import {
  addPlaceholderTask,
  //addPlaceholderTask,
  reorder,
  templateReorder,
} from '../../../redux/ducks/improved-taskmap'
import {
  cancelMove,
  performMove,
  performTemplateMove,
} from '../../../redux/ducks/improved-taskmap-interactions'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { moveTaskToNewParent, moveTemplateTaskToNewParent } from './move-task'
import {
  deleteInTreeById,
  findNodeInTree,
  updateStructureById,
} from './tree-helpers'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
const styles = makeStyles()(theme => ({
  wrapper: {
    backgroundColor: colorModifiers.hoverButtonOpacity(
      rawColours.primary.white.primary
    ),
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    left: '10px',
    top: '36px',
    zIndex: 100,
    borderRadius: theme.spacing(0.5),
    height: '50px',
    width: '200px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapperCompact: {
    left: 'unset',
    top: 'unset',
    right: '11px',
  },
  button: {
    height: theme.spacing(4),
    color: rawColours.primary.purple.primary,
    margin: theme.spacing(),
  },
  jumpButton: {
    position: 'fixed',
    top: '130px',
    right: '20px',
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    minWidth: 'unset',
    color: 'white',
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.purple.primary
    ),
    animationName: 'pulse',
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  arrowIcon: {
    color: 'white',
    cursor: 'pointer',
  },
}))

const MoveConfirmation = props => {
  const { classes } = styles()
  const structure = useSelector(state => state.improvedTaskmap.structure)

  const ref = useRef()
  const isVisible = useOnScreen(ref)

  const { t } = useTranslation()
  const dispatch = useDispatch()
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const [rotateDegrees, setRotateDegrees] = useState(0)
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const taskContent = tasks.find(t => t.id === props.task.id)
  const onCancel = () => {
    const moveMask = document.getElementById('move-mask')
    if (moveMask) {
      moveMask.remove()
    }
    dispatch(cancelMove())
    window.localStorage.setItem('dropZoneId', '-1')
    window.dispatchEvent(new Event('completeMove'))
  }

  const doSmoothStructureUpdate = (
    newChildId,
    newParentId,
    force,
    newChild
  ) => {
    let fakeStructure = { tasks: [...structure] }
    const insertIndex = taskmapInteractions.complexMoveDetails.insertIndex
    let children = findNodeInTree({ tasks: structure }, newParentId)?.tasks

    fakeStructure = deleteInTreeById(fakeStructure, newChildId)
    if (!children) {
      //level A
      fakeStructure.tasks.splice(insertIndex, 0, {
        id: newChildId,
      })
    } else {
      children.splice(insertIndex, 0, newChild)
      fakeStructure = updateStructureById(newParentId, fakeStructure, children)
    }

    if (force) {
      dispatch(addPlaceholderTask(fakeStructure, {}, false, false))
    }
    return fakeStructure
  }

  const onConfirm = () => {
    const moveMask = document.getElementById('move-mask')
    moveMask.remove()
    let fakeStructure = { tasks: [...cloneDeep(structure)] }
    let parent = {
      id: null,
      tasks: [],
    }
    let newTaskContent
    const moveDetails = taskmapInteractions.complexMoveDetails
    if (!isInTemplate(window.location.href)) {
      const taskToMove = tasks.find(task => task.id === props.newChildId)
      if (!moveDetails.newParentId) {
        parent.tasks = [...cloneDeep(structure)]
      } else {
        parent = tasks.find(task => task.id === moveDetails.newParentId)
      }
      const newChildren = parent?.tasks?.filter(t => t.id !== taskToMove.id)
      newChildren.splice(moveDetails.insertIndex, 0, taskToMove)
      fakeStructure = updateStructureById(parent.id, fakeStructure, newChildren)
      moveTaskToNewParent(
        taskContent ? taskContent.matterId : tasks[0].matterId,
        taskContent ? taskContent.project.id : tasks[0].projectId,
        taskToMove,
        taskContent ? taskContent.id : undefined,
        dispatch,
        t,
        onCancel,
        tasks,
        (updatedTask, force) => {
          //if Force is true we perform server calls instead of doing local structure updates
          let oldParent = taskToMove.parent
          updatedTask.parent = taskContent
            ? taskContent
            : {
                id: taskToMove.projectId,
                level: 0,
                name: 'temp',
                type: 'PROJECT',
              }
          if (
            (taskToMove.isMilestone || taskToMove.isDeliverable) &&
            taskContent === undefined
          ) {
            dispatch(showSnackbar(t('taskMove.convertedToPhase')))
          }
          if (force) {
            //server call
            doSmoothStructureUpdate(
              props.newChildId,
              props.task.id,
              force,
              updatedTask
            )
          } else {
            //local structure update
            fakeStructure = doSmoothStructureUpdate(
              props.newChildId,
              props.task.id,
              force,
              updatedTask
            )
            newTaskContent = cloneDeep(tasks)
            //replace old task data with updated task data
            newTaskContent[
              newTaskContent.indexOf(
                newTaskContent.find(t => t.id === taskToMove.id)
              )
            ] = updatedTask
            //remove from old parent tasks if it had a parent
            if (taskToMove.level > 1) {
              let oldSiblings =
                newTaskContent[
                  newTaskContent.indexOf(
                    newTaskContent.find(t => t.id === oldParent.id)
                  )
                ]?.tasks
              let oldPositionIdx = oldSiblings.indexOf(
                oldSiblings.find(t => t.id === taskToMove.id)
              )
              let oldParentIdx = newTaskContent.indexOf(
                newTaskContent.find(t => t.id === oldParent.id)
              )
              newTaskContent[oldParentIdx].tasks.splice(oldPositionIdx, 1)
            }
            //add to new parent
            if (taskContent) {
              newTaskContent[
                newTaskContent.indexOf(
                  newTaskContent.find(t => t.id === taskContent.id)
                )
              ].tasks.push(updatedTask)
            }
          }
          //if force is true we make a server call to fetch the strucutre,
          //otherwise we have already updated our local copy so can just push the local copy to the redux
          dispatch(
            performMove(
              taskContent ? taskContent.matterId : tasks[0].matterId,
              taskContent ? taskContent.project.id : tasks[0].projectId,
              fakeStructure,
              newTaskContent,
              force,
              isEmpty(moveDetails)
            )
          )
          if (!isEmpty(moveDetails)) {
            dispatch(
              reorder(
                taskContent ? taskContent.matterId : tasks[0].matterId,
                taskContent ? taskContent.project.id : tasks[0].projectId,
                parent?.id,
                newChildren,
                force
              )
            )
          }
          window.dispatchEvent(new Event('completeMove'))
        },
        false
      )
    } else {
      let templateId = getTemplateIdFromLocation(window.location)
      const taskToMove = tasks.find(
        task => task.id === taskmapInteractions.taskId
      )
      if (!moveDetails.newParentId) {
        parent.tasks = [...cloneDeep(structure)]
      } else {
        parent = tasks.find(task => task.id === moveDetails.newParentId)
      }
      const newChildren = parent?.tasks?.filter(t => t.id !== taskToMove.id)
      newChildren.splice(moveDetails.insertIndex, 0, taskToMove)
      fakeStructure = updateStructureById(parent.id, fakeStructure, newChildren)
      moveTemplateTaskToNewParent(
        templateId,
        taskmapInteractions.taskId,
        taskContent ? taskContent.id : undefined,
        dispatch,
        t,
        () => {},
        tasks,
        () => {
          if (
            (taskToMove.isMilestone || taskToMove.isDeliverable) &&
            taskContent === undefined
          ) {
            dispatch(showSnackbar(t('taskMove.convertedToPhase')))
          }
          doSmoothStructureUpdate(props.newChildId, props.task.id, true, {
            id: taskToMove.id,
          })
          dispatch(performTemplateMove(templateId))
          if (!isEmpty(moveDetails)) {
            dispatch(
              templateReorder(
                getTemplateIdFromLocation(window.location),
                parent?.id,
                newChildren,
                fakeStructure
              )
            )
          }
          window.dispatchEvent(new Event('completeMove'))
        }
      )
    }
  }

  const scrollToMoveDetails = () => {
    document.getElementById('move-confirmation-dialog').scrollIntoView()
  }

  const movePointer = () => {
    let wrapper = document.getElementById('move-confirmation-dialog')
    let jumpButton = document.getElementById('jump-button')
    if (wrapper && jumpButton) {
      let p1 = wrapper.getBoundingClientRect()
      let p2 = jumpButton.getBoundingClientRect()
      let down = false
      if (p1.y > p2.y) {
        down = true
      }
      let right = false
      let left = false
      if (p1.x > p2.x) {
        right = true
      } else if (p1.x < p2.x) {
        left = true
      }
      if (down && right) {
        setRotateDegrees(135)
      } else if (!down && right) {
        setRotateDegrees(45)
      } else if (down && left) {
        setRotateDegrees(225)
      } else if (!down && left) {
        setRotateDegrees(315)
      } else if (down) {
        setRotateDegrees(180)
      } else {
        setRotateDegrees(0)
      }
    }
  }

  useEffect(() => {
    let r = document.getElementById('improved-taskmap')
    let moveMask = document.getElementById('move-mask')
    let d = document.createElement('div')
    d.style.width = '100%'
    d.style.height = '100%'
    d.style.top = '0'
    d.style.left = '0'
    d.style.zIndex = 99
    d.style.position = 'fixed'
    d.style.backgroundColor = 'black'
    d.style.opacity = '20%'
    d.id = 'move-mask'
    const x = onCancel
    d.onclick = x
    if (r && !moveMask) {
      r.appendChild(d)
    }
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    window.addEventListener('taskmap-scroll', movePointer)
  }, [])
  return (
    <div
      className={`${classes.wrapper}${
        props.isCompact ? ` ${classes.wrapperCompact}` : ''
      }`}
      ref={ref}
      id="move-confirmation-dialog"
    >
      <Button className={classes.button} onClick={onCancel}>
        {t('common.cancel')}
      </Button>

      <Button
        variant="outlined"
        className={classes.button}
        color={'inherit'}
        onClick={onConfirm}
      >
        {t('common.confirm')}
      </Button>
      {!isVisible && (
        <Tooltip title={t('taskMove.jumpButton')}>
          <Button
            className={classes.jumpButton}
            color={'inherit'}
            variant="contained"
            onClick={scrollToMoveDetails}
            id="jump-button"
          >
            <ArrowUpwardIcon
              className={classes.arrowIcon}
              style={{ transform: `rotate(${rotateDegrees}deg)` }}
            />
          </Button>
        </Tooltip>
      )}
    </div>
  )
}
export default MoveConfirmation
