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

import { BorderStyle } from 'docx'

import { BORDER_COLOUR, BORDER_COLOUR_LIGHT } from './constants-colours'

export const EXPORT_MARGINS = {
  top: 200,
  right: 400,
  bottom: 200,
  left: 400,
}

export const NO_BORDERS = {
  top: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
  bottom: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
  left: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
  right: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
}

export const TOP_BOTTOM_BORDERS = {
  top: { size: 20, color: BORDER_COLOUR, style: BorderStyle.THICK },
  bottom: { size: 20, color: BORDER_COLOUR, style: BorderStyle.THICK },
  left: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
  right: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
}

export const BOTTOM_BORDER = {
  top: { size: 0, color: BORDER_COLOUR, style: BorderStyle.NONE },
  bottom: { size: 5, color: BORDER_COLOUR_LIGHT, style: BorderStyle.SINGLE },
  left: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
  right: { size: 0, color: 'FFFFFF', style: BorderStyle.NONE },
}
