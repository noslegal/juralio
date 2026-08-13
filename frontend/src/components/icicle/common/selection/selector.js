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

import 'element-closest'
import { select } from 'd3-selection'

export const ICICLE_CSS_NAME = 'icicle'

export const selectAllCells = containerElement => {
  return select(containerElement).selectAll(`.${ICICLE_CSS_NAME}`)
}

export const selectCellFromPoint = (x, y) =>
  document.elementFromPoint(x, y).closest(`.${ICICLE_CSS_NAME}`)

export const selectElementData = element => select(element).datum().data

export const selectElementDatum = element => select(element).datum()

export const selectElementById = (containerElement, id) =>
  selectAllCells(containerElement).filter(datum => datum.data.id === id)

export const selectIcicleElementFromEvent = event => {
  if (event.sourceEvent) {
    const nearestIcicleAncestor = event.sourceEvent.srcElement.closest(
      `.${ICICLE_CSS_NAME}`
    )
    return nearestIcicleAncestor ? select(nearestIcicleAncestor) : undefined
  }

  return undefined
}
