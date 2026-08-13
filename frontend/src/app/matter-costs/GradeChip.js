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

import React from 'react'
import { Typography, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { CATEGORY_COLOURS } from '../constants'

const useStyles = makeStyles()(theme => ({
  paper: {
    borderRadius: '8px',
    padding: '4px 8px',
    minWidth: '264px',
    maxWidth: '528px',
    display: 'flex',
  },
  pip: {
    marginRight: theme.spacing(0.5),
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const GradeChip = props => {
  const { classes } = useStyles()
  const grade = props.grade
  return (
    <div>
      <Paper
        className={classes.paper}
        style={{
          marginRight: '8px',
          backgroundColor:
            CATEGORY_COLOURS[
              props.cr?.colour_idx ? props.cr.colour_idx : grade.colour_idx
            ].secondary,
          color:
            CATEGORY_COLOURS[
              props.cr?.colour_idx ? props.cr.colour_idx : grade.colour_idx
            ].text,
        }}
      >
        <div
          className={classes.pip}
          style={{
            backgroundColor:
              CATEGORY_COLOURS[
                props.cr?.colour_idx ? props.cr.colour_idx : grade.colour_idx
              ].primary,
            display: 'flex',
          }}
        />
        <Typography
          style={{
            color:
              CATEGORY_COLOURS[
                props.cr?.colour_idx ? props.cr.colour_idx : grade.colour_idx
              ].text,
          }}
        >
          {props.cr?.gradeName ? props.cr.gradeName : grade.name}
        </Typography>
        {props.ratioValue > 0 && (
          <Typography style={{ marginLeft: 'auto' }}>
            {props.ratioValue + '%'}
          </Typography>
        )}
      </Paper>
    </div>
  )
}
export default GradeChip
