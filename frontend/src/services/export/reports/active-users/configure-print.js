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

import { FONT_COLOURS } from '../common/constants-colours'
import { FONT_SIZES } from '../common/constants-reports'
import { setPrintConfig } from '../common/excel/print'
import { getPrivilegedAndConfidentialText } from '../common/report-text-helpers'

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

export const setPrintConfiguration = (t, ws, recordCount) => {
  setPrintConfig(ws, {
    area: { s: { r: 0, c: 0 }, e: { c: 4, r: 11 + recordCount } },

    margins: landscapeMargins,

    footer: {
      odd: getStandardFooter(t),
      even: getStandardFooter(t),
    },

    props: {
      orientation: 'landscape',
      paper: 'A4',
      errors: 'n/a',
      gridlines: false,
      centerX: true,
      centerY: false,
    },
  })
}
