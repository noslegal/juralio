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

import { select } from 'd3-selection'
import { zoomed, getPanInstance, onEnd } from './pan-behaviour'

export const applyGesture = (node, container, swipeCallback) => {
  const panInstance = getPanInstance()

  select(container).call(panInstance)

  panInstance.on('zoom', event => zoomed(event, node))
  panInstance.on('end', event => {
    onEnd(event, node, container, panInstance, swipeCallback)
  })
}
