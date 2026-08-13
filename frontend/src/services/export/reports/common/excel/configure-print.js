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

import { FONT_COLOURS } from '../constants-colours'
import { FONT_SIZES } from '../constants-reports'
import { getPrivilegedAndConfidentialText } from '../report-text-helpers'
import { setPrintConfig } from './print'

const footerTextStyle = {
  s: { sz: FONT_SIZES.SMALL / 2, color: { rgb: FONT_COLOURS.GREY } },
}

const landscapeMargins = {
  footer: 0.2,
  header: 0.2,
  top: 0.2,
  bottom: 0.5,
  left: 0.2,
  right: 0.2,
}

const getStandardFooter = t => {
  return {
    left: {
      w: getPrivilegedAndConfidentialText(t).replace('&', '&&'),
      ...footerTextStyle,
    },
    right: {
      w: ` &P ${t('exports.common.of')} &N`,
      ...footerTextStyle,
    },
  }
}

export const setPrintConfiguration = (t, ws, taskCount, printType, col) => {
  setPrintConfig(ws, {
    area: { s: { r: 0, c: 0 }, e: { c: col, r: 6 + taskCount } },

    margins: landscapeMargins,

    footer: {
      odd: getStandardFooter(t),
      even: getStandardFooter(t),
    },

    props: {
      orientation: 'landscape',
      paper: printType,
      errors: 'n/a',
      gridlines: false,
      centerX: true,
      centerY: false,
      fit: { width: 1, height: 0 },
    },
  })
}
