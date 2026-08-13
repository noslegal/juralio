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

import { addPlaceholderTask } from '../../../redux/ducks/improved-taskmap'
import {
  findNodeInTree,
  updateStructureById,
} from '../taskmap-helpers/tree-helpers'

const _createPlaceHolderTask = (
  placeholderObject,
  task,
  parent,
  structure,
  placement,
  tasks,
  dispatch
) => {
  let fakeStructure = { tasks: [...structure] }
  if (placement === 'top' || placement === 'bottom') {
    let children = findNodeInTree({ tasks: structure }, parent.id).tasks
    placeholderObject.parent.id = parent.id
    let indexOfDrop = children.map(t => t.id).indexOf(parseInt(task.id))
    if (placement === 'top') {
      children.splice(indexOfDrop, 0, placeholderObject)
    } else {
      children.splice(indexOfDrop + 1, 0, placeholderObject)
    }

    fakeStructure = updateStructureById(parent.id, fakeStructure, children)
  } else {
    let children = task.tasks
      ? [...task.tasks, placeholderObject]
      : [placeholderObject]
    placeholderObject.parent.id = task.id
    children = children.map(task => {
      if (task.id === -1) {
        return task
      } else {
        return findNodeInTree(fakeStructure, task.id)
      }
    })
    fakeStructure = updateStructureById(task.id, fakeStructure, children)
  }
  const isSibling = placement === 'top' || placement === 'bottom'
  dispatch(
    addPlaceholderTask(fakeStructure, placeholderObject, isSibling, !isSibling)
  )
}

export const createPlaceholderTask = (
  matterId,
  projectId,
  task,
  parent,
  structure,
  placement,
  tasks,
  dispatch,
  forLoading
) => {
  const getPlaceholderStatus = () => {
    return task.status
  }

  const placeholderObject = {
    id: -1,
    project: { id: projectId },
    matterId: matterId,
    level: -1,
    status: getPlaceholderStatus(),
    parent: { id: -1 },
    forLoading: forLoading,
  }
  _createPlaceHolderTask(
    placeholderObject,
    task,
    parent,
    structure,
    placement,
    tasks,
    dispatch
  )
}

export const createTemplatePlaceholderTask = (
  templateId,
  task,
  parent,
  structure,
  placement,
  tasks,
  dispatch
) => {
  const placeholderObject = {
    id: -1,
    template: { id: templateId },
    level: -1,
    status: parent.status,
    parent: { id: -1 },
  }
  _createPlaceHolderTask(
    placeholderObject,
    task,
    parent,
    structure,
    placement,
    tasks,
    dispatch
  )
}
