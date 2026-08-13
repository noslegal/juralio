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

import { HeightRule, ShadingType, VerticalAlign } from 'docx'

import { FONT_COLOURS } from '../common/constants-colours'
import { TOP_BOTTOM_BORDERS } from '../common/constants-word'
import { FONT_SIZES } from '../common/constants-reports'

export const TABLE_HEADER_FORMATTING = {
  borders: TOP_BOTTOM_BORDERS,
  verticalAlign: VerticalAlign.CENTER,
  fontColor: FONT_COLOURS.GREY,
  fontSize: FONT_SIZES.LARGE,
}

export const TABLE_HEADER_FIRST_COLUMN_FORMATTING = {
  margins: { top: 200, left: 200, bottom: 200, right: 0 },
}

export const TABLE_FIRST_COLUMN_FORMATTING = {
  margins: { top: 200, left: 200, bottom: 0, right: 0 },
}

export const TABLE_HEADER_HEIGHT_OPTIONS = {
  height: 600,
  rule: HeightRule.EXACT,
}

export const TABLE_ROW_HEIGHT_OPTIONS = { height: 700, rule: HeightRule.EXACT }

export const BACKGROUND_SHADING_GREY = {
  shading: {
    fill: 'F8F8F6',
    val: ShadingType.CLEAR,
  },
}
