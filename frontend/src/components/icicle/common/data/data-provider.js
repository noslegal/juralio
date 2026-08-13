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

import { hierarchy, partition } from 'd3-hierarchy'
import cloneDeep from 'lodash/cloneDeep'
import { decorateCellWidths } from './cell-widths-decorator'
import { getChildrenAccessor } from './data-provider-utils'
const filterChildren = tasks => {
  if (!tasks) return []
  return tasks
    .map(child => {
      if (child.filteredOut) {
        return undefined
      } else if (child.tasks) {
        child.tasks = filterChildren(child.tasks)
        return child
      } else {
        return child
      }
    })
    .filter(c => c !== undefined)
}

export const getPartitionData = (
  data,
  childrenPropertyName,
  shouldHaveEqualCellWidths
) => {
  if (!data || data.length === 0) throw new Error('data must be defined')
  let dataClone = cloneDeep(data)

  dataClone.tasks = filterChildren(dataClone.tasks)
  dataClone.tasks = dataClone.tasks.filter(t => !t.filteredOut)
  let root = hierarchy(dataClone, getChildrenAccessor(childrenPropertyName))

  decorateCellWidths(root, childrenPropertyName, shouldHaveEqualCellWidths)
  return partition()(root)
}

export const getNodeById = (id, partitionData) =>
  partitionData.descendants().find(node => node.data.id === id)
