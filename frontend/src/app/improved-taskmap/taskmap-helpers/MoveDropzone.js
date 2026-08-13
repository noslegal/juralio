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

import { Card, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import {
  COMPACT_TASK_HEIGHT,
  DEFAULT_TASK_HEIGHT,
  DEFAULT_TASK_WIDTH,
  DETAILED_TASK_HEIGHT,
} from './consts'
import Icicle from './Icicle'
import MoveConfirmation from './MoveConfirmation'
import RenderIfVisible from './render-if-visible'
const styles = makeStyles()(theme => ({
  structureItem: {
    backgroundColor: colorModifiers.secondaryBackground('#cacaca'),
    width: `${DEFAULT_TASK_WIDTH}px`,
    minHeight: `${DEFAULT_TASK_HEIGHT}px`,
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    overflow: 'visible',
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
  moveDropzone: {
    minWidth: `${DEFAULT_TASK_WIDTH}px`,
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
  errorzone: {
    minWidth: `${DEFAULT_TASK_WIDTH}px`,
    width: 'fit-content',
    height: 'fit-content',
    position: 'relative',
    justifyContent: 'center',
    display: 'flex',
    overflow: 'visible',
    border: `dashed  2px grey`,
    backgroundColor: 'rgba(169,169,169,0.5)',
  },
}))
const MoveDropzone = props => {
  const { task, isCompact, isDetailed } = props
  const { classes } = styles()
  const [isHover, setIsHover] = useState(false)
  const structure = useSelector(state => state.improvedTaskmap.structure)
  function searchTree(element, id) {
    if (element.id === id) {
      return element
    } else if (element.tasks != null) {
      var i
      var result = null
      for (i = 0; result == null && i < element.tasks.length; i++) {
        result = searchTree(element.tasks[i], id)
      }
      return result
    }
    return null
  }
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )

  const newChildId = taskmapInteractions.taskId
  let newChildTask = searchTree({ id: -1, tasks: structure }, newChildId)

  useEffect(() => {
    const checkLocalStorageData = () => {
      let yPos = parseInt(window.localStorage.getItem('dragoverYPos'))
      let xPos = parseInt(window.localStorage.getItem('dragoverXPos'))
      let self = document.getElementById(`move-child-${task.id}`)
      let selfError = document.getElementById(`errorzone-${task.id}`)
      if (self || selfError) {
        let bounds
        if (self) {
          bounds = self.getBoundingClientRect()
        } else {
          bounds = selfError.getBoundingClientRect()
        }

        if (
          bounds.y < yPos &&
          bounds.y + bounds.height > yPos &&
          bounds.x < xPos &&
          bounds.x + bounds.width > xPos
        ) {
          setIsHover(true)
        } else {
          setIsHover(false)
        }
      }
    }
    window.addEventListener('storage', checkLocalStorageData)
    return () => window.removeEventListener('storage', checkLocalStorageData)
  }, []) //eslint-disable-line
  if (props.errorzone) {
    return (
      <RenderIfVisible
        rootElementClass={classes.visibleWrapper}
        defaultHeight={
          isCompact
            ? COMPACT_TASK_HEIGHT
            : isDetailed
              ? DETAILED_TASK_HEIGHT
              : DEFAULT_TASK_HEIGHT
        }
        initialVisible={
          navigator.userAgent.includes('Cypress!') ||
          props.task.id === -1 ||
          (taskmapInteractions.move && newChildTask)
        }
        stayRendered={
          (taskmapInteractions.move && newChildTask) ||
          navigator.userAgent.includes('Cypress!')
        }
        placeholderElementClass={
          isCompact ? classes.compactStructureItem : classes.structureItem
        }
        visibleOffset={3000}
      >
        <Card
          className={classes.errorzone}
          style={{
            minHeight: `${
              isCompact
                ? COMPACT_TASK_HEIGHT
                : isDetailed
                  ? DETAILED_TASK_HEIGHT
                  : DEFAULT_TASK_HEIGHT
            }px`,
            backgroundColor: isHover ? 'grey' : '',
          }}
          id={`errorzone-${task.id}`}
          data-test="errorzone"
          onDragEnter={() => {
            window.dispatchEvent(new Event('hoverOverMoveDropzone'))
          }}
          onDragLeave={() => {
            window.dispatchEvent(new Event('exitHoverOverMoveDropzone'))
          }}
        >
          <Typography
            id={`errorzone-${task.id}`}
            variant="caption"
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
          >
            {props.errorzoneText}
          </Typography>
        </Card>
      </RenderIfVisible>
    )
  } else {
    return (
      <RenderIfVisible
        rootElementClass={classes.visibleWrapper}
        defaultHeight={
          isCompact
            ? COMPACT_TASK_HEIGHT
            : isDetailed
              ? DETAILED_TASK_HEIGHT
              : DEFAULT_TASK_HEIGHT
        }
        initialVisible={
          navigator.userAgent.includes('Cypress!') ||
          props.task.id === -1 ||
          (taskmapInteractions.move && newChildTask)
        }
        stayRendered={
          (taskmapInteractions.move && newChildTask) ||
          navigator.userAgent.includes('Cypress!')
        }
        placeholderElementClass={
          isCompact ? classes.compactStructureItem : classes.structureItem
        }
        visibleOffset={3000}
      >
        <Card
          className={classes.moveDropzone}
          style={{
            minHeight: `${
              isCompact
                ? COMPACT_TASK_HEIGHT
                : isDetailed
                  ? DETAILED_TASK_HEIGHT
                  : DEFAULT_TASK_HEIGHT
            }px`,
            backgroundColor: isHover
              ? colorModifiers.secondaryBackground(
                  rawColours.primary.purple.primary
                )
              : '',
          }}
          id={`move-child-${task.id}`}
          data-test="moveDropzone"
          onDragEnter={() => {
            window.dispatchEvent(new Event('hoverOverMoveDropzone'))
          }}
          onDragLeave={() => {
            window.dispatchEvent(new Event('exitHoverOverMoveDropzone'))
          }}
        >
          {taskmapInteractions.move && newChildTask && (
            <div className={classes.childrenWrapper}>
              <Icicle
                task={newChildTask}
                key={newChildTask.id}
                isDragging={false}
                isLoaded={true}
                childDragging={false}
                isMinimap={false}
                isReadOnly={true}
                fadeout={false}
                ignoreMargin={true}
              />
            </div>
          )}
          {taskmapInteractions.move && newChildTask && (
            <MoveConfirmation
              newChildId={newChildId}
              task={task}
              isCompact={isCompact}
            />
          )}
        </Card>
      </RenderIfVisible>
    )
  }
}
export default MoveDropzone
