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
import rawColours from '../../../theme/raw-colours'

export const gettingStartedTutorialSteps = t => [
  {
    selector: '[data-test=template-card-initial]',
    content: (
      <p
        data-test="status-filter-tour-content"
        style={{ marginRight: '30px', zIndex: 3001 }}
      >
        <Typography>{t('tours.gettingStarted.part1')}</Typography>
      </p>
    ),
    style: {
      backgroundColor: rawColours.primary.primary.main,
      color: 'rgba(255, 255, 255, 0.87)',
      fontFamily: 'Montserrat',
      width: '270px',
      padding: '0px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '16px',
      paddingLeft: '8px',
    },
  },
]
