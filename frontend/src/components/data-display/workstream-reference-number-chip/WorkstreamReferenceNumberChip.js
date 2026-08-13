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
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { WorkstreamIcon } from '../../../theme/navigation/CommonIcons'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    height: theme.spacing(2),
    minHeight: theme.spacing(2),
    maxHeight: theme.spacing(3),
    backgroundColor: JuralioNamedColours.beige[200],
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    alignItems: 'center',
    borderRadius: theme.spacing(0.75),
  },
  referenceNumber: {
    paddingRight: theme.spacing(0.5),
  },
  icon: {
    minHeight: theme.spacing(1.75),
    maxHeight: theme.spacing(1.75),
    opacity: 0.5,
  },
}))

const WorkstreamReferenceNumberChip = props => {
  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      <WorkstreamIcon className={classes.icon} />
      <Typography
        variant="caption"
        data-test="workstream-item-reference-number"
        className={classes.referenceNumber}
      >
        {props.referenceNumber?.replace('P', '')}
      </Typography>
    </div>
  )
}

WorkstreamReferenceNumberChip.propTypes = {
  referenceNumber: PropTypes.string.isRequired,
}

export default WorkstreamReferenceNumberChip
