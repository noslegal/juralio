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

import { getNextAdjacentSibling } from './sibling_navigation_helper'
import { panDirection, gestureDirection } from './gesture_constants'

export const determinePanDirection = event => {
  return Math.abs(event.transform.x) > Math.abs(event.transform.y)
    ? panDirection.HORIZONTAL
    : panDirection.VERTICAL
}

export const getTranslation = (direction, transform) => ({
  x: direction === panDirection.HORIZONTAL ? transform.x : 0,
  y: direction === panDirection.VERTICAL ? transform.y : 0,
})

export const handleSwipe = (
  container,
  eventTransform,
  swipedElement,
  callback
) => {
  if (!swipedElement) {
    return
  }

  const swipedElementData = swipedElement.datum()
  const xThreshold = container.clientWidth / 2
  const yThreshold = container.clientHeight / 4

  if (eventTransform.x > xThreshold) {
    callback(swipedElementData, gestureDirection.PARENT)
  } else if (eventTransform.x < xThreshold * -1) {
    callback(swipedElementData, gestureDirection.CHILD)
  } else if (eventTransform.y > yThreshold) {
    callback(swipedElementData, gestureDirection.SIBLING_UP)
  } else if (eventTransform.y < yThreshold * -1) {
    callback(swipedElementData, gestureDirection.SIBLING_DOWN)
  }
}

export const determineFocusedItemFromGesture = (
  item,
  direction,
  partitionData
) => {
  if (!direction) {
    return item
  }

  if (
    direction === gestureDirection.PARENT &&
    item.parent &&
    item.parent.parent
  ) {
    return item.parent.parent
  } else if (direction === gestureDirection.CHILD && item.children) {
    return item
  } else if (
    direction === gestureDirection.SIBLING_UP ||
    direction === gestureDirection.SIBLING_DOWN
  ) {
    return getNextAdjacentSibling(item.parent, direction, partitionData)
  }
}
