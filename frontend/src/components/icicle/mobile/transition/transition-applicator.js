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

import { selectAllCells } from '../../common/selection/selector'
import { applyPositioning } from '../../common/render/update/core-applicators/positioning-applicator'
import { applyTemplateContent } from '../../common/render/update/core-applicators/template-applicator'

export async function applyTransition(
  containerElement,
  scales,
  Template,
  overviewHeightThreshold,
  interactive
) {
  const cells = selectAllCells(containerElement)
  const transition = cells.transition().duration(500)

  applyPositioning(transition, scales, overviewHeightThreshold)

  await transition.end()
  applyTemplateContent(cells, Template, interactive)
}
