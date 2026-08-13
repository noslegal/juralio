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

import { getWidth } from './positioning-helper'

export const applyLevelIndicators = (cells, scales) => {
  const indicators = document.querySelectorAll('[id^="level-"]')
  const data = cells.data()
  for (let i = 0; i < indicators.length; i++) {
    const cell = data.find(d => d.depth === i)
    const levelWidth = getWidth(cell, scales) + 1
    indicators[i].style.left = 33 + levelWidth * i + 'px'
  }
}
