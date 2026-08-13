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

import { selectAll } from 'd3-selection'

export const getNeighbours = (taskId, cellCoords) => {
  let neighbours = []
  Object.keys(cellCoords).forEach(cell => {
    if (
      (Math.floor(cellCoords[cell].y) ===
        Math.floor(cellCoords[taskId].y + cellCoords[taskId].height + 9) ||
        Math.floor(cellCoords[cell].y) ===
          Math.floor(cellCoords[taskId].y + cellCoords[taskId].height + 1)) &&
      cellCoords[cell].x === cellCoords[taskId].x
    ) {
      //below
      neighbours.push(cell)
    }
  })
  return neighbours
}

export const removeNewTaskHighlight = () => {
  selectAll('.tooltip').remove()
  selectAll('.newArea').remove()
  selectAll('.svgWrapper').remove()
}

export const getCardinals = (lineData, startPoint) => {
  let north = lineData
    .filter(p => p.x === startPoint.x)
    .sort((a, b) => {
      return Math.abs(a.y - startPoint.y) < Math.abs(b.y - startPoint.y)
        ? -1
        : 1
    })
    .find(p => p.y > startPoint.y)
  let south = lineData
    .filter(p => p.x === startPoint.x)
    .sort((a, b) => {
      return Math.abs(a.y - startPoint.y) < Math.abs(b.y - startPoint.y)
        ? -1
        : 1
    })
    .find(p => p.y < startPoint.y)

  let west = lineData
    .filter(p => p.y === startPoint.y)
    .sort((a, b) => {
      return Math.abs(a.x - startPoint.x) > Math.abs(b.x - startPoint.x)
        ? -1
        : 1
    })
    .find(p => p.x < startPoint.x)

  let east = lineData
    .filter(p => p.y === startPoint.y)
    .sort((a, b) => {
      return Math.abs(a.x - startPoint.x) < Math.abs(b.x - startPoint.x)
        ? -1
        : 1
    })
    .find(p => p.x > startPoint.x)

  let cardinals = [north, south, east, west].filter(p => p !== undefined)

  return cardinals
}

const getWidthScaleFactor = (mainIcicle, miniIcicle) =>
  mainIcicle.scrollWidth / miniIcicle.clientWidth

const getHeightScaleFactor = (mainIcicle, miniIcicle) =>
  mainIcicle.scrollHeight / miniIcicle.clientHeight

export const getViewportScrollX = (
  interactiveIcicleScrollX,
  mainIcicle,
  miniIcicle
) => interactiveIcicleScrollX / getWidthScaleFactor(mainIcicle, miniIcicle)

export const getViewportScrollY = (
  interactiveIcicleScrollY,
  mainIcicle,
  miniIcicle
) => interactiveIcicleScrollY / getHeightScaleFactor(mainIcicle, miniIcicle)
