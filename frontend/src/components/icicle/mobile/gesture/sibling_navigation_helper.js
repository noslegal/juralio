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

import { gestureDirection } from './gesture_constants'

function getFilterCompareFunc(direction) {
  if (direction === gestureDirection.SIBLING_DOWN) {
    return (compareItem, currentItem) => compareItem.x0 < currentItem.x0
  } else if (direction === gestureDirection.SIBLING_UP) {
    return (compareItem, currentItem) => compareItem.x0 > currentItem.x0
  }
}

function getSortFunction(direction) {
  if (direction === gestureDirection.SIBLING_DOWN) {
    return (itemA, itemB) => itemA.x0 - itemB.x0
  } else if (direction === gestureDirection.SIBLING_UP) {
    return (itemA, itemB) => itemB.x0 - itemA.x0
  }
}

export const getNextAdjacentSibling = (item, direction, partitionData) => {
  const adjacentSiblings = partitionData
    .descendants()
    .filter(
      currentItem =>
        currentItem.children &&
        item.depth === currentItem.depth &&
        getFilterCompareFunc(direction)(item, currentItem)
    )
    .sort(getSortFunction(direction))

  if (adjacentSiblings.length > 0) {
    return adjacentSiblings[0]
  }
}
