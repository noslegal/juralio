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

export const getScrollX = (clickedPosX, element, scales) => {
  const xOffset = clickedPosX - element.getBoundingClientRect()?.left
  const x = xOffset / element.clientWidth

  return x * scales.maxWidth - xOffset
}

export const getScrollY = (clickedPosY, element, scales) => {
  const yOffset = clickedPosY - element.getBoundingClientRect()?.top
  const y = yOffset / element.clientHeight

  return y * scales.maxHeight - yOffset
}

export const scrollToElement = (elementToFocus, containerElement) => {
  const elementRect = elementToFocus.getBoundingClientRect()
  containerElement.scrollLeft =
    elementRect.left + elementRect.width * 0.5 - window.screen.width * 0.5

  if (elementRect.height < window.screen.height) {
    containerElement.scrollTop =
      elementRect.top + elementRect.height * 0.5 - window.screen.height * 0.5
  } else {
    containerElement.scrollTop = elementRect.top - window.screen.height * 0.2
  }
}
