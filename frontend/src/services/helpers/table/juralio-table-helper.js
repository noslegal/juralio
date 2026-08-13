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

import InfoIcon from '@mui/icons-material/Info'
import { Tooltip } from '@mui/material'
import i18n from 'i18next'
import React from 'react'
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm'
import JurCalculator from '../../../assets/images/JurCalculator'

export const juralioDataGridDefaults = {
  pageSizeOptions: [10, 25, 50, 100],
  initialPageSize: 10,
  noRowsText: i18n.t('common.noRecordsInTable'),
}

export const renderHeaderWithToolTip = (classes, headerText, toolTipText) => (
  <div className={classes.header}>
    <div>{headerText}</div>
    <Tooltip title={toolTipText}>
      <InfoIcon fontSize="small" className={classes.infoIcon} />
    </Tooltip>
  </div>
)

export const generateToolTipHeader = (
  headerText,
  toolTipText,
  classes,
  options = { filterable: false }
) => ({
  field: headerText.toLowerCase().replace(/\s+/g, '_'),
  headerName: headerText,
  renderHeader: () => renderHeaderWithToolTip(classes, headerText, toolTipText),
  renderCell: params => <div>{params.value}</div>,
  ...options,
})

const renderHeaderWithIcon = (css, text, icon_idx) => (
  <div className={css}>
    <div>{text}</div>
    <div>
      {icon_idx === 3 && (
        <div style={{ position: 'absolute', left: '112px', top: '2px' }}>
          <AccessAlarmIcon />
        </div>
      )}
      {icon_idx === 4 && (
        <div style={{ position: 'absolute', left: '90px', top: '3px' }}>
          <JurCalculator />
        </div>
      )}
    </div>
  </div>
)

export const generateIconHeader = (
  headerText,
  icon_idx,
  css,
  options = { filterable: false },
  minWidth,
  maxWidth
) => ({
  field: headerText.toLowerCase().replace(/\s+/g, '_'),
  headerName: headerText,
  renderHeader: () => renderHeaderWithIcon(css, headerText, icon_idx),
  renderCell: params => <div>{params.value}</div>,
  minWidth,
  maxWidth,
  ...options,
})
