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

import Typography from '@mui/material/Typography'
import React from 'react'

const itemStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
}

const nameStyle = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}

export const formatTemplateItemPlainText = item =>
  item ? `${item.name} - ${item.referenceNumber}` : ''

export function renderTemplateItemContent(item, index) {
  return (
    <div style={itemStyle} data-test="template-search-item">
      <Typography variant="body1" style={nameStyle}>
        <span data-test={'task-item-name-' + index}>{item.name}</span>
      </Typography>
      <Typography variant="body1">
        <span data-test={'task-item-referencenumber-' + index}>
          {item.referenceNumber}
        </span>
      </Typography>
    </div>
  )
}
