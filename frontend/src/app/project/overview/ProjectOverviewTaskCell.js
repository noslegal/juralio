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

import { ThemeProvider, StyledEngineProvider, Typography } from '@mui/material'
import React from 'react'
import { getTaskCellColour } from '../../../services/helpers/task/task-status-colour-helper'
import theme from '../../../theme/juralio-theme'
import { TASK_CELL_COLOUR } from '../../constants'

const getStatusSummary = task => {
  const results = { total: 1 }

  results[task.status] = 1

  if (task.tasks) {
    task.tasks.forEach(t => {
      const childResult = getStatusSummary(t)

      for (let status of Object.keys(childResult)) {
        if (status in results) {
          results[status] += childResult[status]
        } else {
          results[status] = childResult[status]
        }
      }
    })
  }

  return results
}

const ProjectOverviewTaskCell = props => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div
          style={{
            backgroundColor: getTaskCellColour(props.item),
            width: 'calc(100% - 5px)',
            height: 'calc(100% - 5px)',
            position: 'relative',
            overflowX: 'visible',
            marginTop: '15px',
            borderRadius: 4,
            border:
              props.item.level > 0 &&
              `solid 1px ${getTaskCellColour(
                props.item,
                TASK_CELL_COLOUR.FILTERED_IN
              )}`,
          }}
        >
          {props.item.level === 1 && (
            <Typography
              data-test="overview-phase-label"
              style={{
                position: 'absolute',
                top: '-30px',
                left: '10px',
                maxWidth: '600%',
                width: '750px',
              }}
            >
              {props.item.name}
            </Typography>
          )}
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default ProjectOverviewTaskCell
