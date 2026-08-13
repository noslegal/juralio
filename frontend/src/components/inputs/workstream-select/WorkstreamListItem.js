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
import { makeStyles } from 'tss-react/mui'
import WorkstreamReferenceNumberChip from '../../data-display/workstream-reference-number-chip/WorkstreamReferenceNumberChip'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: theme.spacing(3),
    minHeight: theme.spacing(3),
    maxHeight: theme.spacing(3),
    alignItems: 'center',
  },
  workstreamName: {
    marginLeft: theme.spacing(),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}))

const WorkstreamListItem = props => {
  const { classes } = useStyles()

  return (
    <div className={classes.root}>
      <WorkstreamReferenceNumberChip
        referenceNumber={props.item.referenceNumber}
      />
      <Typography
        variant="body1"
        data-test="workstream-item-name"
        className={classes.workstreamName}
      >
        {props.item.name}
      </Typography>
    </div>
  )
}

export default WorkstreamListItem
