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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import { Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import { DEFAULT_TASK_WIDTH } from '../taskmap-helpers/consts'
const styles = makeStyles()(theme => ({
  dropzoneWrapper: {
    position: 'absolute',
    width: `${DEFAULT_TASK_WIDTH}px`,
    height: '4px',
    zIndex: 1400,
    backgroundColor: rawColours.primary.purple.primary,
  },
  dropzoneIconWrapper: {
    position: 'absolute',
    width: '24px',
    height: '24px',
    zIndex: 1400,
    backgroundColor: rawColours.primary.purple.primary,
    borderRadius: '4px',
  },
}))
const DropZone = () => {
  const { classes } = styles()
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const structure = useSelector(state => state.improvedTaskmap.structure)
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const draggingId = taskmapInteractions.taskId
  const [dragOverTaskId, setDragOverTaskId] = useState(
    window.localStorage.getItem('dragoverTaskId')
  )

  const draggingTask = tasks.find(x => x.id === draggingId)
  const dropTask = tasks.find(x => x.id === parseInt(dragOverTaskId))

  const yScroll = document.getElementById('improved-taskmap-wrapper')?.scrollTop
  const [isOverMoveDropzone, setIsOverMoveDropzone] = useState(false)
  const zoom = useSelector(state => state.improvedTaskmap.zoomLevel)

  const getPos = (taskId, yPos) => {
    const pos = {
      x: 0,
      y: 0,
    }
    const element = document.getElementById(`structure-item-${taskId}`)
    if (element) {
      const bounds = element.getBoundingClientRect()
      pos.x =
        bounds.x -
        80 +
        document.getElementById('improved-taskmap-wrapper').scrollLeft

      let self = yPos - 85
      let top = bounds.top - 85
      let bottom = top + bounds.height
      if (Math.abs(self - top) < Math.abs(self - bottom)) {
        pos.y = top
      } else {
        pos.y = bottom
      }
    }

    return pos
  }

  const parentTop = window.localStorage.getItem('dragoverParentTop')
  const parentBottom = window.localStorage.getItem('dragoverParentBottom')

  const [yPos, setYPos] = useState(window.localStorage.getItem('dragoverYPos'))
  const [pos, setPos] = useState(
    getPos(dragOverTaskId, window.localStorage.getItem('dragoverYPos'))
  )
  const { t } = useTranslation()

  const enableDropzone = () => setIsOverMoveDropzone(false)
  const disableDropzone = () => setIsOverMoveDropzone(true)

  useEffect(() => {
    setPos(getPos(dragOverTaskId, yPos))
  }, [dragOverTaskId, yPos])

  useEffect(() => {
    const checkLocalStorageData = () => {
      setYPos(window.localStorage.getItem('dragoverYPos'))
      setDragOverTaskId(window.localStorage.getItem('dragoverTaskId'))
    }

    window.addEventListener('storage', checkLocalStorageData)
    window.addEventListener('hoverOverMoveDropzone', disableDropzone)
    window.addEventListener('exitHoverOverMoveDropzone', enableDropzone)
    return () => {
      window.removeEventListener('storage', checkLocalStorageData)
      window.removeEventListener('hoverOverMoveDropzone', disableDropzone)
      window.removeEventListener('exitHoverOverMoveDropzone', enableDropzone)
    }
  }, [])

  const posX = pos.x
  const posY = pos.y
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)

  if (yPos <= parentTop || yPos >= parentBottom) {
    if (!isOutOfBounds) {
      setIsOutOfBounds(true)
    }
  }

  const scrollX = document.getElementById('improved-taskmap-wrapper').scrollLeft
  if (
    posX - scrollX < window.localStorage.getItem('dragMinX') ||
    posX - scrollX > window.localStorage.getItem('dragMaxX')
  ) {
    if (!isOutOfBounds) {
      setIsOutOfBounds(true)
    }
  }

  let dragItemIsTooDeep = false
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
  let allChildrenLevels = getAllChildrenLevels(
    tasks.find(t => t.id === draggingId)
  )
    .sort()
    .reverse()
  let depth =
    allChildrenLevels[0] - allChildrenLevels[allChildrenLevels.length - 1]
  let sibling = tasks.find(t => t.id === parseInt(dragOverTaskId))
  if (sibling) {
    dragItemIsTooDeep = sibling.level + depth > 6
  }
  if (isOutOfBounds && (isOverMoveDropzone || dragItemIsTooDeep)) {
    return null
  }

  const getAllChildrenIds = id => {
    let results = [id]
    let t = tasks.find(t => t.id === id)
    if (t.tasks) {
      for (let i = 0; i < t.tasks.length; i++) {
        results.push(...getAllChildrenIds(t.tasks[i].id))
      }
    }

    return results
  }
  let isOverChildren = getAllChildrenIds(draggingId).includes(
    parseInt(dragOverTaskId)
  )
  if (isOverChildren) {
    return null
  }
  const statusEnum = {
    'not-requried': 0,
    'not-started': 1,
    'in-progress': 2,
    done: 3,
  }

  let overTaskStatus = tasks.filter(t => t.id === parseInt(dragOverTaskId))[0]
    ?.status
  let selfStatus = tasks.filter(t => t.id === draggingId)[0]?.status
  let parentTask = {
    tasks: [],
  }
  try {
    parentTask.tasks = tasks
      .find(t => t.tasks.map(st => st.id).includes(parseInt(dragOverTaskId)))
      .tasks.map(t => tasks.find(st => st.id === t.id))
  } catch (exception) {
    parentTask.tasks = structure.map(t => tasks.find(tt => tt.id === t.id))
  }

  let statusAbove, statusBelow
  let above, below
  let draggedOver = document.getElementById('structure-item-' + dragOverTaskId)
  if (draggedOver) {
    let draggedOverCell = draggedOver.getBoundingClientRect()
    above =
      parseInt(window.localStorage.getItem('dragoverYPos')) + yScroll <=
      draggedOverCell.y + 0.5 * draggedOverCell.height + yScroll
    below =
      parseInt(window.localStorage.getItem('dragoverYPos')) + yScroll >
      draggedOverCell.y + 0.5 * draggedOverCell.height + yScroll
  }
  let indexOfDragover = parentTask.tasks
    .map(t => t.id)
    .indexOf(parseInt(dragOverTaskId))

  if (above && indexOfDragover !== -1) {
    if (indexOfDragover > 0) {
      statusAbove = parentTask.tasks[indexOfDragover - 1].status
    } else {
      //no status above
    }
    statusBelow = parentTask.tasks[indexOfDragover].status
  } else if (below && indexOfDragover !== -1) {
    if (indexOfDragover < parentTask.tasks.length - 1) {
      statusBelow = parentTask.tasks[indexOfDragover + 1].status
    } else {
      //no status below
    }
    statusAbove = parentTask.tasks[indexOfDragover].status
  }

  let moveUp = false
  let moveDown = false
  let atSubTaskLimit = false
  let atPhaseLimit = false
  if (selfStatus !== overTaskStatus) {
    if (statusAbove && statusEnum[selfStatus] > statusEnum[statusAbove]) {
      moveUp = true
    }
    if (statusBelow && statusEnum[selfStatus] < statusEnum[statusBelow]) {
      moveDown = true
    }
  }

  if (
    draggingTask?.parent.id === dropTask?.parent.id &&
    parentTask.tasks.length > 8 &&
    parentTask.tasks[0].level !== 1
  ) {
    return null
  } else if (
    draggingTask?.parent.id !== dropTask?.parent.id &&
    parentTask.tasks.length === 8 &&
    parentTask.tasks[0].level !== 1
  ) {
    atSubTaskLimit = true
  } else if (
    draggingTask?.parent.id !== dropTask?.parent.id &&
    parentTask.tasks.length === 16 &&
    parentTask.tasks[0].level === 1
  ) {
    atPhaseLimit = true
  }

  return (
    <>
      <div
        className={classes.dropzoneWrapper}
        style={{
          width: `${DEFAULT_TASK_WIDTH * zoom}px`,
          left: `${posX}px`,
          top: `${posY + yScroll}px`,
          backgroundColor:
            moveUp || moveDown || atSubTaskLimit || atPhaseLimit ? 'grey' : '',
        }}
        id="dropzone"
      ></div>
      {isOutOfBounds && (
        <div
          className={classes.dropzoneIconWrapper}
          style={{
            left: `${posX}px`,
            top: `${posY + yScroll - 12}px`,
            backgroundColor:
              moveUp || moveDown || atSubTaskLimit || atPhaseLimit
                ? 'grey'
                : '',
          }}
        >
          <ChevronRightIcon
            style={{
              fill: 'white',
              width: '28px',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          />
        </div>
      )}
      <Tooltip
        open={moveUp || moveDown || atSubTaskLimit || atPhaseLimit}
        title={
          atPhaseLimit
            ? t('taskMove.phaseMax')
            : atSubTaskLimit
              ? t('taskMove.taskMax')
              : moveUp
                ? t('taskMove.moveUp')
                : t('taskMove.moveDown')
        }
      >
        <div
          className={classes.dropzoneIconWrapper}
          style={{
            left: `${posX + DEFAULT_TASK_WIDTH * zoom}px`,
            top: `${posY + yScroll - 12}px`,
            backgroundColor:
              moveUp || moveDown || atSubTaskLimit || atPhaseLimit
                ? 'grey'
                : '',
          }}
        >
          {isOutOfBounds && (
            <ChevronLeftIcon
              style={{
                fill: 'white',
                width: '28px',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            />
          )}
          {!isOutOfBounds && (
            <SwapVertIcon
              style={{
                fill: 'white',
                width: '28px',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            />
          )}
        </div>
      </Tooltip>
    </>
  )
}
export default DropZone
