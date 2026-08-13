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

import { ICICLE_RENDER_COMPLETE_EVENT } from './icicleTransitionConstants'
const TRANSITION_END_EVENT = 'transitionend'

export const addRenderCompleteListener = icicleElement =>
  new Promise(resolve => {
    const onRenderComplete = () => {
      icicleElement.removeEventListener(
        ICICLE_RENDER_COMPLETE_EVENT,
        onRenderComplete
      )
      resolve()
    }

    icicleElement.addEventListener(
      ICICLE_RENDER_COMPLETE_EVENT,
      onRenderComplete
    )
  })

export const fadeOut = icicleElement =>
  new Promise(resolve => {
    const onFadeComplete = () => {
      icicleElement.removeEventListener(TRANSITION_END_EVENT, onFadeComplete)
      resolve()
    }

    icicleElement.addEventListener(TRANSITION_END_EVENT, onFadeComplete)
    icicleElement.style.transition = 'opacity 0.25s'
    icicleElement.style.opacity = 0
  })

export const fadeIn = icicleElement => (icicleElement.style.opacity = 1)
