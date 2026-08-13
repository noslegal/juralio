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

import { ARROW_TYPE } from './Arrow'

export const getArrowTypeForHighlightedArrow = (pos, numberOfArrows) => {
  if (pos === 1 && numberOfArrows > pos) {
    return ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY
  } else if (pos > 1 && pos < numberOfArrows) {
    return ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY
  } else if (pos === 1) {
    return ARROW_TYPE.LEFT_FLAT_RIGHT_FLAT
  } else if (pos === numberOfArrows) {
    return ARROW_TYPE.LEFT_POINTY_RIGHT_FLAT
  }
}

export const getArrowTypeForBlandArrow = (pos, numberOfArrows) => {
  if (pos === 1 && numberOfArrows > pos) {
    return ARROW_TYPE.LEFT_FLAT_RIGHT_POINTY_NO_LETTER
  } else if (pos > 1 && pos < numberOfArrows) {
    return ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER
  } else if (pos === numberOfArrows) {
    return ARROW_TYPE.LEFT_POINTY_RIGHT_POINTY_NO_LETTER_NO_LEADING_ARROW
  }
}
