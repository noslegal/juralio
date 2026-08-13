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

import React, { useState } from 'react'
import { Typography, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import '@glideapps/glide-data-grid/dist/index.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import rawColours from '../../../theme/raw-colours'
import ResourceTaskChip from './ResourceTaskChip'

const useStyles = makeStyles()(theme => ({
  row: {
    display: 'grid',
    gridTemplateColumns: '5% 75% 20% ',
    minHeight: theme.spacing(10),
    borderRight: 'solid',
    borderWidth: '1px',
    borderColor: 'white',
    borderRadius: '0',
  },
  expandButton: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#717BBC',
    '&:hover': {
      backgroundColor: '#484f7a',
    },
    height: 80,
  },
  expandButtonPricing: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: rawColours.primary.black[100],
    '&:hover': {
      backgroundColor: rawColours.primary.black[200],
    },
    height: 80,
  },
  unassignedDetailsContainer: {
    display: 'block',
    paddingLeft: 8,
    paddingTop: 8,
  },
  leftColumn: {
    borderRight: 'solid',
    borderRightColor: '#717BBC',
    borderRightWidth: 6,
  },
}))

const UnassignedTableRow = props => {
  const { classes } = useStyles()
  const { workstream, updateWorkstreamDataRows, updateTaskDataRows } = props
  const [isExpanded, setIsExpanded] = useState(true)

  const compareGrades = (a, b) => {
    if (a.gradeId === b.gradeId) {
      return 0
    } else {
      return a.gradeId < b.gradeId ? -1 : 1
    }
  }

  const sortedGrades = props.costRatios.sort(compareGrades)

  return (
    <>
      <div>
        <Paper className={classes.row}>
          <div className={classes.leftColumn}>
            <div
              className={
                props.sortType === 0
                  ? classes.expandButton
                  : classes.expandButtonPricing
              }
              style={props.disableInteractions ? { pointerEvents: 'none' } : {}}
              onClick={() => {
                if (!props.disableInteractions) {
                  if (isExpanded === true) {
                    setIsExpanded(false)
                    if (props.sortType === 0) {
                      updateWorkstreamDataRows(workstream, false)
                    } else {
                      props.updatePricingDataRows(props.pricing, false)
                    }
                  } else {
                    setIsExpanded(true)
                    if (props.sortType === 0) {
                      updateWorkstreamDataRows(workstream, true)
                    } else {
                      props.updatePricingDataRows(props.pricing, true)
                    }
                  }
                }
              }}
            >
              {!props.disableInteractions ? (
                isExpanded ? (
                  <ArrowDropUpIcon />
                ) : (
                  <ArrowDropDownIcon />
                )
              ) : (
                <></>
              )}
            </div>
          </div>
          <div>
            <div
              className={classes.unassignedDetailsContainer}
              style={{
                height: 72,
                backgroundColor: 'lightgrey',
              }}
            >
              {/* Add unassigned icon */}
              <Typography variant="h6">
                Phases not assigned to a pricing segment
              </Typography>
              <Typography variant="caption">
                See pricing to assign phases to a pricing segment
              </Typography>
            </div>
            {/* )} */}

            <div>
              {isExpanded &&
                !props.disableInteractions &&
                props.tasks.map(t => {
                  return (
                    <ResourceTaskChip
                      task={t}
                      updateTaskDataRows={updateTaskDataRows}
                      costRatios={sortedGrades}
                      unassigned={true}
                    />
                  )
                })}
            </div>
          </div>
        </Paper>
      </div>
    </>
  )
}
export default UnassignedTableRow
