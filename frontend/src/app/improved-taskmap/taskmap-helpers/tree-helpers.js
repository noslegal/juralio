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

export const updateStructureById = (
  taskId,
  structure,
  newChildren,
  newTask = null
) => {
  //new task is exclusively for adding tasks from template through the fab
  if (structure === null) {
    structure = newTask
  }
  if (structure.id === taskId) {
    structure['tasks'] = newChildren
  }
  if (structure['tasks'] && structure['tasks'].length > 0) {
    for (let i = 0; i < structure['tasks'].length; i++) {
      structure['tasks'][i] = updateStructureById(
        taskId,
        structure['tasks'][i],
        newChildren,
        newTask
      )
    }
  }

  return structure
}

export const findNodeInTree = (task, id) => {
  if (task.id === id) {
    return task
  } else if (task.tasks != null) {
    var i
    var result = null
    for (i = 0; result === null && i < task.tasks.length; i++) {
      result = findNodeInTree(task.tasks[i], id)
    }
    return result
  }
  return null
}

export const deleteInTreeById = (tree, id, identifier = 'tasks') => {
  if (tree.id === id) {
    return null
  }
  if (tree[identifier]) {
    tree[identifier] = tree[identifier]
      .map(idf => deleteInTreeById(idf, id, identifier))
      .filter(idf => idf != null)
  }
  return tree
}
