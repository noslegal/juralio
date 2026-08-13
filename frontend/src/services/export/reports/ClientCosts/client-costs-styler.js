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

import { NEW_FONTS } from '../common/constants-reports'
import {
  CLIENT_COSTS_COLOURS,
  STATUS_COLOURS,
} from '../common/constants-colours'
import { setRangeStyle } from '../common/excel-helper'
import {
  applyMerges,
  setColumns as setSheetColumns,
} from '../common/excel/sheet-builder'

// The design template uses Arial throughout.
const ARIAL = NEW_FONTS.STANDARD_FONT

const BLACK = '000000'
const WHITE = 'FFFFFF'

// Thin grid lines and the heavier rule that frames section banners.
const GRID = { style: 'thin', color: { rgb: CLIENT_COSTS_COLOURS.GRID } }
const RULE = { style: 'thin', color: { rgb: CLIENT_COSTS_COLOURS.RULE } }
const boxed = { top: GRID, bottom: GRID, left: GRID, right: GRID }
const ruled = { top: RULE, bottom: RULE, left: GRID, right: GRID }

// Excel column letter for a 0-based column index (0 -> A, 26 -> AA).
export const colLetter = index => {
  let n = index + 1
  let result = ''
  while (n > 0) {
    const remainder = (n - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    n = Math.floor((n - 1) / 26)
  }
  return result
}

// Row tints used for zebra striping; sheet builders pick one via withFill.
export const TINTS = {
  white: WHITE,
  kv: CLIENT_COSTS_COLOURS.ROW_TINT, // F2F5F8 — key/value tables
  table: CLIENT_COSTS_COLOURS.BANNER_LIGHT, // EBF4FB — data tables
}

// Clone a base style with an explicit background fill (for alternating rows).
export const withFill = (style, rgb) => ({ ...style, fgColor: { rgb } })

// Reusable style fragments, read off the design template.
export const STYLES = {
  titleBand: {
    ...ARIAL,
    bold: true,
    sz: 16,
    color: { rgb: BLACK },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.BANNER },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  subHeader: {
    ...ARIAL,
    bold: true,
    sz: 11,
    color: { rgb: WHITE },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.TITLE_BAND },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  meta: {
    ...ARIAL,
    sz: 10,
    color: { rgb: WHITE },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.TITLE_BAND },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  intro: {
    ...ARIAL,
    italic: true,
    sz: 9,
    color: { rgb: CLIENT_COSTS_COLOURS.MUTED },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.BANNER_LIGHT },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    ...boxed,
  },
  sectionBanner: {
    ...ARIAL,
    bold: true,
    sz: 11,
    color: { rgb: BLACK },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.BANNER },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...ruled,
  },
  tableHeader: {
    ...ARIAL,
    bold: true,
    sz: 10,
    color: { rgb: WHITE },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.TITLE_BAND },
    alignment: { horizontal: 'center', vertical: 'center' },
    ...boxed,
  },
  label: {
    ...ARIAL,
    sz: 10,
    color: { rgb: CLIENT_COSTS_COLOURS.MUTED },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  value: {
    ...ARIAL,
    bold: true,
    sz: 10,
    color: { rgb: CLIENT_COSTS_COLOURS.BODY },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  // A larger, heading-coloured value used for the headline fee amount.
  valueStrong: {
    ...ARIAL,
    bold: true,
    sz: 11,
    color: { rgb: CLIENT_COSTS_COLOURS.HEADING },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  // Big heading-coloured number used for the scope overview metrics.
  metric: {
    ...ARIAL,
    bold: true,
    sz: 14,
    color: { rgb: CLIENT_COSTS_COLOURS.HEADING },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
  body: {
    ...ARIAL,
    sz: 10,
    color: { rgb: CLIENT_COSTS_COLOURS.BODY },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    ...boxed,
  },
  bodyCenter: {
    ...ARIAL,
    sz: 10,
    color: { rgb: CLIENT_COSTS_COLOURS.BODY },
    alignment: { horizontal: 'center', vertical: 'center' },
    ...boxed,
  },
  workstream: {
    ...ARIAL,
    bold: true,
    sz: 10,
    color: { rgb: BLACK },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.BANNER },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...ruled,
  },
  deliverable: {
    ...ARIAL,
    italic: true,
    sz: 9,
    color: { rgb: CLIENT_COSTS_COLOURS.HEADING_ACCENT },
    fgColor: { rgb: CLIENT_COSTS_COLOURS.BANNER_LIGHT },
    alignment: { horizontal: 'left', vertical: 'center' },
    ...boxed,
  },
}

// A centred numeric body cell.
export const numeric = { ...STYLES.bodyCenter }

// Centred fill matching the task status colour used in the app UI.
export const statusStyle = status => ({
  ...ARIAL,
  bold: true,
  sz: 10,
  color: { rgb: BLACK },
  fgColor: {
    rgb: STATUS_COLOURS[status] || CLIENT_COSTS_COLOURS.TASK_NOT_REQUIRED,
  },
  alignment: { horizontal: 'center', vertical: 'center' },
  ...boxed,
})

// Style every cell in a row across columns [startCol, endCol] (0-based, inclusive).
export const styleRowRange = (ws, rowIndex, startCol, endCol, style) => {
  const from = `${colLetter(startCol)}${rowIndex + 1}`
  const to = `${colLetter(endCol)}${rowIndex + 1}`
  setRangeStyle(ws, `${from}:${to}`, style)
}

// Merge a row's content cells across [startCol, endCol].
export const mergeRow = (ws, rowIndex, startCol, endCol) => {
  applyMerges(ws, [
    {
      s: `${colLetter(startCol)}${rowIndex + 1}`,
      e: `${colLetter(endCol)}${rowIndex + 1}`,
    },
  ])
}

// Column widths with a narrow leading gutter (column A), matching the template.
export const setColumns = (ws, widths) => {
  setSheetColumns(ws, [{ wch: 3 }, ...widths.map(wch => ({ wch }))])
}
