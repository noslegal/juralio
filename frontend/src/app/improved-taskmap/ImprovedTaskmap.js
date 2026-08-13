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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TASK_STATUS } from '../constants'
import ImprovedTaskmapZeroState from './ImprovedTaskmapZerostate'
import {
  COMPACT_TASK_HEIGHT,
  DEFAULT_TASK_HEIGHT,
  DEFAULT_TASK_WIDTH,
} from './taskmap-helpers/consts'
import Icicle from './taskmap-helpers/Icicle'
import MoveDropzone from './taskmap-helpers/MoveDropzone'
import { isInTemplate } from '../../components/navigation/common/location-context-helper'
import { cancelMove } from '../../redux/ducks/improved-taskmap-interactions'
import { setParentHeightDuringDrag } from './taskmap-helpers/drag-helpers'

const ImprovedTaskmap = props => {
  const dispatch = useDispatch()
  const taskmapFilter = useSelector(state => state.taskMapFilter)
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const isTemplate = isInTemplate(window.location.href)

  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const taskBeingMovedId = taskmapInteractions.taskId
  const fullTaskBeingMoved = taskBeingMovedId
    ? tasks.find(t => t.id === taskBeingMovedId)
    : null
  const [isInMove, setIsInMove] = useState(false)
  const zoom = useSelector(state => state.improvedTaskmap.zoomLevel)

  useEffect(() => {
    window.addEventListener('triggerMove', handleMoveTrigger)
    window.addEventListener('completeMove', completeMove)

    return () => {
      window.removeEventListener('triggerMove', handleMoveTrigger)
      window.removeEventListener('completeMove', completeMove)
    }
  })

  useEffect(
    () => () => {
      if (taskmapInteractions.move) {
        dispatch(cancelMove())
        window.localStorage.setItem('dropZoneId', '-1')
        window.dispatchEvent(new Event('completeMove'))
      }
    },
    [] // eslint-disable-line
  )

  const structure = props.structure
  const filteredStructure = structure.filter(t => {
    if (taskmapFilter.statusNotRequired) {
      return true
    }
    if (!taskmapFilter.statusDone && t.status === TASK_STATUS.DONE) {
      return false
    }
    return t.status !== TASK_STATUS.NOT_REQUIRED
  })

  const handleMoveTrigger = () => {
    setIsInMove(true)
  }

  const completeMove = () => {
    let dropzoneId = parseInt(window.localStorage.getItem('dropZoneId'))
    if (dropzoneId !== 0) {
      setIsInMove(false)
    }
  }

  const zeroState = filteredStructure.length === 0
  const defaultHeight =
    (isTemplate
      ? taskmapFilter.detailedView.templateViewMode
      : taskmapFilter.detailedView.viewMode) === 2
      ? COMPACT_TASK_HEIGHT
      : DEFAULT_TASK_HEIGHT

  let _structure = structure.filter(t => !t.isDropzone)

  if (fullTaskBeingMoved?.level === 1 && taskmapInteractions.move) {
    _structure = _structure.filter(t => t.id !== fullTaskBeingMoved.id)
  }

  if (
    isInMove &&
    structure &&
    structure.length < 8 &&
    fullTaskBeingMoved?.level > 1
  ) {
    let status = fullTaskBeingMoved.status
    let lastIndexOfStatus = _structure.map(t => t.status).lastIndexOf(status)
    if (
      _structure.filter(t => t.isDropzone).length === 0 &&
      lastIndexOfStatus === -1
    ) {
      _structure.push({ isDropzone: true })
    }
  } else if (taskmapInteractions.complexMoveDetails.insertIndex !== undefined) {
    if (taskmapInteractions.complexMoveDetails.newParentId === null) {
      _structure.splice(taskmapInteractions.complexMoveDetails.insertIndex, 0, {
        isDropzone: true,
      })
    }
  }

  return (
    <>
      <div
        data-test="zoom-taskmap"
        style={{
          minHeight: `${props.height * defaultHeight}px`,
          minWidth: `${props.width * DEFAULT_TASK_WIDTH}px`,
          position: 'absolute',
          marginLeft: '16px',
          marginTop: '36px',
          paddingBottom: '88px', //was 36px might mess up minimap
          paddingRight: '32px', //did not exist might mess up minimap
          zoom: zoom,
        }}
        id="improved-taskmap"
      >
        {!zeroState &&
          _structure.map(task => {
            if (task.isDropzone) {
              return (
                <MoveDropzone
                  task={{ id: 0 }}
                  isCompact={taskmapFilter.detailedView.viewMode === 2}
                  isDetailed={taskmapFilter.detailedView.viewMode === 1}
                  show={true}
                />
              )
            }
            return (
              <Icicle
                task={task}
                key={task.id}
                isLoaded={props.isLoaded}
                isReadOnly={props.isReadOnly}
                childDragging={() => {
                  let self = document.getElementById('improved-taskmap')
                  if (self) {
                    let bounds = self.getBoundingClientRect()
                    setParentHeightDuringDrag(bounds.top, bounds.bottom)
                  }
                }}
              />
            )
          })}
      </div>

      {zeroState && !props.filterZeroState && (
        <ImprovedTaskmapZeroState hasLoadedOnce={props.hasLoadedOnce} />
      )}
    </>
  )
}
export default ImprovedTaskmap
