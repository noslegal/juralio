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
  getTemplateIdFromLocation,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import { reorder, templateReorder } from '../../../redux/ducks/improved-taskmap'
import {
  requestMove,
  requestMoveIntoSiblings,
} from '../../../redux/ducks/improved-taskmap-interactions'
import { shouldShow } from './filter-helpers'
import { findNodeInTree, updateStructureById } from './tree-helpers'

export const onDragover = e => {
  e.stopPropagation()
  e.preventDefault()
  const task = e.target.closest('[data-test=structureItem]')
  if (task) {
    localStorage.setItem('dragoverTaskId', task.id.split('-')[2])
    window.dispatchEvent(new Event('storage'))
  }
}

export const onDrag = e => {
  e.stopPropagation()
  e.preventDefault()
  // e.dataTransfer.setData('Text', 'dragMe')
  // e.dataTransfer.effectAllowed = 'move'
  // const yPos = parseInt(window.localStorage.getItem('dragoverYPos'))
  // const xPos = parseInt(window.localStorage.getItem('dragoverXPos'))
  // let closestCell = document.elementFromPoint(xPos, yPos)
  // const target = closestCell.closest('[data-test=moveDropzone]')

  // if (target) {
  //   e.preventDefault()
  //   target.style.backgroundColor = 'red'
  //   target.style.cursor = 'help'
  // }

  if (e.clientY > 0 && e.clientX > 0) {
    if (e.clientX <= 94) {
      document.getElementById('improved-taskmap-wrapper').scrollLeft -= 5
    } else if (e.clientX >= window.innerWidth * 0.96) {
      document.getElementById('improved-taskmap-wrapper').scrollLeft += 5
    }
    if (e.clientY <= 80) {
      document.getElementById('improved-taskmap-wrapper').scrollTop -= 5
    } else if (e.clientY >= window.innerHeight * 0.96) {
      document.getElementById('improved-taskmap-wrapper').scrollTop += 5
    }

    localStorage.setItem('dragoverYPos', e.clientY)
    localStorage.setItem('dragoverXPos', e.clientX)
    window.dispatchEvent(new Event('triggerMove'))
    window.dispatchEvent(new Event('storage'))
  }
}

export const setParentHeightDuringDrag = (top, bottom) => {
  localStorage.setItem('dragoverParentTop', top)
  localStorage.setItem('dragoverParentBottom', bottom)
  window.dispatchEvent(new Event('storage'))
}

export const setXBounds = taskId => {
  const self = document.getElementById(`structure-item-${taskId}`)
  if (self) {
    const bounds = self.getBoundingClientRect()
    localStorage.setItem('dragMinX', bounds.x)
    localStorage.setItem('dragMaxX', bounds.x + bounds.width)
    window.dispatchEvent(new Event('storage'))
  }
}

const statusEnum = {
  'not-required': 0,
  'not-started': 1,
  'in-progress': 2,
  done: 3,
}

export const onDrop = (
  e,
  dispatch,
  taskId,
  tasks,
  structure,
  height,
  depth,
  taskmapFilter
) => {
  //hack fix for newly created tasks
  tasks.forEach(t => (t.tasks === null ? (t.tasks = []) : ''))
  e.stopPropagation()
  const parentTop = parseInt(window.localStorage.getItem('dragoverParentTop'))
  const parentBottom = parseInt(
    window.localStorage.getItem('dragoverParentBottom')
  )
  const minX = parseInt(window.localStorage.getItem('dragMinX'))
  const maxX = parseInt(window.localStorage.getItem('dragMaxX'))

  const yPos = parseInt(window.localStorage.getItem('dragoverYPos'))
  const xPos = parseInt(window.localStorage.getItem('dragoverXPos'))

  if (height === 1 && depth === 1) {
    return
  }
  if (yPos < parentTop || yPos > parentBottom || xPos < minX || xPos > maxX) {
    let closestCell = document.elementFromPoint(xPos, yPos)
    if (closestCell.id.includes('errorzone')) {
      window.dispatchEvent(new Event('completeMove'))
      return
    }
    let dropZone = closestCell.closest('[data-test=moveDropzone]')
    if (dropZone) {
      let id = dropZone.id
      window.localStorage.setItem('dropZoneId', id.split('-')[2])
      window.dispatchEvent(new Event('completeMove'))
      dispatch(requestMove(taskId))
      return
    } else {
      window.localStorage.setItem('dropZoneId', '-1')
      window.dispatchEvent(new Event('completeMove'))
    }
  } //used to clear old move triggers

  window.localStorage.setItem('dropZoneId', '-1')
  window.dispatchEvent(new Event('completeMove'))
  let closestCell = document.elementFromPoint(xPos, yPos)
  if (closestCell.id === 'improved-taskmap-wrapper') {
    closestCell = document.getElementById('improved-taskmap')
  }

  let structureItem = closestCell.closest('[data-test=structureItem]')
  if (!structureItem) {
    //this is expensive
    let strucutreItems = [
      ...document.querySelectorAll('[data-test=structureItem]'),
    ]
      .map(item => {
        return { id: item.id, coords: item.getBoundingClientRect() }
      })
      .filter(t => t.id !== `structure-item-${taskId}` && t.coords.x <= xPos)
    const distanceBetween = (point, origin) => {
      let a = Math.abs(point.x - origin.x)
      let b = Math.abs(point.y - origin.y)
      return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
    }
    let sortedItems = strucutreItems.sort((a, b) =>
      distanceBetween(a.coords, { x: xPos, y: yPos }) >
      distanceBetween(b.coords, { x: xPos, y: yPos })
        ? 1
        : -1
    )

    let closestItem = sortedItems[0]

    if (closestItem) {
      window.localStorage.setItem(
        'dragoverTaskId',
        closestItem.id.split('-')[2]
      )
      structureItem = document.getElementById(closestItem.id)
    }
  }
  if (structureItem) {
    const dropOverTaskId = structureItem.id.split('-')[2]
    if (parseInt(dropOverTaskId) === taskId) {
      return
    }
    let structBounds = structureItem.getBoundingClientRect()

    const dropY = yPos
    let top = structBounds.y
    let above = dropY <= top + 0.5 * structBounds.height
    let below = dropY > top + 0.5 * structBounds.height
    let parent = {
      id: null,
      tasks: [],
    }

    parent.id = tasks.find(t =>
      t.tasks
        .map(st => st.id)
        .includes(parseInt(window.localStorage.getItem('dragoverTaskId')))
    )?.id
    try {
      parent.tasks = findNodeInTree({ tasks: structure }, parent.id).tasks.map(
        t => tasks.find(tt => tt.id === t.id)
      )
    } catch (exception) {
      parent.tasks = structure.map(t => tasks.find(tt => tt.id === t.id))
    }

    const filledTask = parent.tasks.find(t => t.id === taskId)

    const checkIfBadDrop = () => {
      const statusEnum = {
        'not-requried': 0,
        'not-started': 1,
        'in-progress': 2,
        done: 3,
      }
      let dragOverTaskId = parseInt(
        window.localStorage.getItem('dragoverTaskId')
      )
      const draggingId = taskId
      const getAllChildrenLevels = task => {
        let results = [task.level]
        if (task.tasks) {
          for (let i = 0; i < task.tasks.length; i++) {
            results.push(
              ...getAllChildrenLevels(
                tasks.find(t => t.id === task.tasks[i].id)
              )
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
      let sibling = tasks.find(t => t.id === parseInt(dropOverTaskId))
      if (depth + sibling.level > 6) {
        return true
      }

      const getAllChildrenIds = id => {
        let results = [id]
        let t = tasks.find(t => t.id === id)
        for (let i = 0; i < t.tasks.length; i++) {
          results.push(...getAllChildrenIds(t.tasks[i].id))
        }

        return results
      }
      let allChildren = getAllChildrenIds(draggingId)

      if (allChildren.includes(dragOverTaskId)) {
        return true
      }

      let overTaskStatus = tasks.filter(
        t => t.id === parseInt(dragOverTaskId)
      )[0]?.status
      let selfStatus = tasks.filter(t => t.id === draggingId)[0]?.status

      let parentTask = {
        tasks: [],
      }
      try {
        parentTask.tasks = tasks
          .find(t => t.tasks.map(st => st.id).includes(dragOverTaskId))
          .tasks.map(t => tasks.find(st => st.id === t.id))
      } catch (exception) {
        parentTask.tasks = structure.map(t => tasks.find(tt => tt.id === t.id))
      }

      let statusAbove, statusBelow
      let indexOfDragover = parentTask.tasks
        .map(t => t.id)
        .indexOf(dragOverTaskId)

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

      if (selfStatus !== overTaskStatus) {
        if (statusAbove && statusEnum[selfStatus] > statusEnum[statusAbove]) {
          return true
        }
        if (statusBelow && statusEnum[selfStatus] < statusEnum[statusBelow]) {
          return true
        }
      }

      if (
        parentTask.tasks.length === 16 &&
        parentTask.tasks[0].level === 1 &&
        tasks.filter(t => t.id === parseInt(draggingId))[0].level !==
          tasks.filter(t => t.id === parseInt(dragOverTaskId))[0].level
      ) {
        return true
      }
      const draggingTask = tasks.find(x => x.id === draggingId)
      const dropTask = tasks.find(x => x.id === parseInt(dragOverTaskId))
      if (
        draggingTask.parent.id === dropTask.parent.id &&
        parentTask.tasks.length > 8 &&
        parentTask.tasks[0].level !== 1
      ) {
        return true
      } else if (
        draggingTask.parent.id !== dropTask.parent.id &&
        parentTask.tasks.length >= 8 &&
        parentTask.tasks[0].level !== 1
      ) {
        return true
      }

      return false
    }

    let isBadDrop = checkIfBadDrop()
    if (isBadDrop) {
      return
    }

    let fakeStructure = { tasks: [...structure] }
    const newChildren = parent.tasks.filter(t => t.id !== taskId)

    let indexOfDrop = newChildren
      .map(t => t.id)
      .indexOf(parseInt(dropOverTaskId))

    let child = newChildren[indexOfDrop]

    if (above) {
      if (!child || !filledTask) {
        let _newParent = tasks.filter(t =>
          t.tasks?.map(st => st.id).includes(parseInt(dropOverTaskId))
        )[0]
        let newParent
        if (_newParent) {
          let newParentId = tasks.filter(t =>
            t.tasks?.map(st => st.id).includes(parseInt(dropOverTaskId))
          )[0].id

          newParent = findNodeInTree({ tasks: structure }, newParentId)
        }
        let self = tasks.filter(t => t.id === taskId)[0]
        if (newParent) {
          if (newParent && self.parent?.id !== newParent.id) {
            let insertIndex = newParent.tasks
              .map(t => t.id)
              .filter(t => shouldShow(t, taskmapFilter))
              .indexOf(parseInt(dropOverTaskId))

            dispatch(requestMoveIntoSiblings(taskId, newParent.id, insertIndex))
          }
        } else {
          //level A
          let insertIndex = structure
            .map(t => t.id)
            .filter(t => shouldShow(t, taskmapFilter))
            .indexOf(parseInt(dropOverTaskId))
          dispatch(requestMoveIntoSiblings(taskId, null, insertIndex))
        }
        return
      }
      if (statusEnum[child.status] > statusEnum[filledTask.status]) {
        dispatch(requestMove(taskId))

        return
      }
      newChildren.splice(indexOfDrop, 0, filledTask)
    } else if (below) {
      if (!child || !filledTask) {
        let foundTasks = tasks.filter(t =>
          t.tasks?.map(st => st.id).includes(parseInt(dropOverTaskId))
        )
        let newParentId
        let newParent
        if (foundTasks.length > 0) {
          newParentId = foundTasks[0].id
          newParent = findNodeInTree({ tasks: structure }, newParentId)
        }

        let self = tasks.filter(t => t.id === taskId)[0]
        if (newParent) {
          if (newParent && self.parent?.id !== newParent.id) {
            let insertIndex =
              newParent.tasks
                .filter(t => shouldShow(t, taskmapFilter))
                .map(t => t.id)
                .indexOf(parseInt(dropOverTaskId)) + 1 //it's this index
            dispatch(requestMoveIntoSiblings(taskId, newParent.id, insertIndex))
          }
        } else {
          //level A
          let insertIndex =
            structure
              .map(t => t.id)
              .filter(t => shouldShow(t, taskmapFilter))
              .indexOf(parseInt(dropOverTaskId)) + 1
          dispatch(requestMoveIntoSiblings(taskId, null, insertIndex))
        }

        return
      }
      if (statusEnum[child.status] < statusEnum[filledTask.status]) {
        dispatch(requestMove(taskId))

        return
      }

      newChildren.splice(indexOfDrop + 1, 0, filledTask)
    }

    fakeStructure = updateStructureById(parent.id, fakeStructure, newChildren)
    if (isInTemplate(window.location.href)) {
      dispatch(
        templateReorder(
          getTemplateIdFromLocation(window.location),
          parent?.id,
          newChildren,
          fakeStructure
        )
      )
    } else {
      dispatch(
        reorder(
          tasks[0].matterId,
          tasks[0].project.id,
          parent?.id,
          newChildren,
          fakeStructure
        )
      )
    }
  }
}
