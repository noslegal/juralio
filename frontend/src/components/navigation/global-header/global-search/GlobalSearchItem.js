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

import { Typography } from '@mui/material'
import React from 'react'
import { getTaskColour } from '../../../../app/task-details/TaskCardCommon'
import { getLocationParams } from '../../../../services/helpers/route/route-helper'
import { levelNumberToLetter } from '../../../../services/helpers/task/task-util-helper'
import {
  formatDescriptionPlainText,
  formatNamePlainText,
  formatReferenceNumber,
  formatWorkstreamNamePlainText,
} from '../../../../services/task/task-text-format-service'
import juralioColours from '../../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'
import theme from '../../../../theme/juralio-theme'

const itemStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
}

const nameStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontWeight: 'bold',
  color: JuralioNamedColours.black['200'],
}

const projectStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: JuralioNamedColours.black['200'],
}

const descriptionStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: JuralioNamedColours.black['200'],
}

const topRowStyle = {
  width: '100%',
}

const middleRowStyle = {
  width: '100%',
  paddingBottom: theme.spacing(1),
}

const bottomRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
}

const resultCaption = { color: juralioColours.taskStatus.contrast }

function getLevelAndJNumberStyle(item) {
  return {
    backgroundColor: getTaskColour(item),
    borderRadius: theme.spacing(0.5),
    padding: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
    color: juralioColours.taskStatus.contrast,
    fontFamily: theme.typography.fontFamily,
    width: theme.spacing(10),
    display: 'flex',
    alignItems: 'center',
  }
}

export function renderGlobalSearchItem(item, index) {
  return (
    <div style={itemStyle} data-test="global-search-item">
      {!getLocationParams('workstream') && (
        <div style={topRowStyle}>{renderNotificationTitle(item, index)}</div>
      )}

      <div style={topRowStyle}>{renderName(item, index)}</div>
      <div style={middleRowStyle}>{renderDescription(item, index)}</div>
      <div style={bottomRowStyle}>
        {renderLevelAndReferenceNumber(item, index)}
      </div>
    </div>
  )
}

function renderDescription(item, index) {
  return (
    <Typography variant="caption" style={descriptionStyle}>
      <span
        data-test={'global-search-item-description-' + index}
        dangerouslySetInnerHTML={{
          __html: formatDescriptionPlainText(item),
        }}
      />
    </Typography>
  )
}

function renderName(item, index) {
  return (
    <Typography variant="caption" style={nameStyle}>
      <span data-test={'global-search-item-name-' + index}>
        {formatNamePlainText(item)}
      </span>
    </Typography>
  )
}

function renderNotificationTitle(item, index) {
  return (
    <Typography variant="caption" style={projectStyle}>
      <span data-test={'global-search-item-project-name-' + index}>
        {formatWorkstreamNamePlainText(item)}
      </span>
    </Typography>
  )
}

export const renderLevelAndReferenceNumber = (item, index) => {
  return (
    <div style={getLevelAndJNumberStyle(item)}>
      <span data-test={'global-search-item-level-' + index}>
        <Typography variant="caption" style={resultCaption}>
          {levelNumberToLetter(item.level)}
        </Typography>
      </span>
      &nbsp;.&nbsp;
      <span data-test={'global-search-item-referencenumber-' + index}>
        <Typography variant="caption" style={resultCaption}>
          {formatReferenceNumber(item)}
        </Typography>
      </span>
    </div>
  )
}
