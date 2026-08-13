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

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const useStyles = makeStyles()(theme => ({
  closedMatterInfoWrapper: {
    display: 'flex',
    backgroundColor: JuralioNamedColours.black[200],
    width: 'fit-content',
    height: theme.spacing(5),
    paddingRight: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  closedMatterInfoText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    color: juralioColours.whiteText.primary,
  },
  closedMatterInfoIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    color: juralioColours.whiteText.primary,
    margin: theme.spacing(0.5),
  },
}))

const ClosedInfoBox = props => {
  const { classes } = useStyles()

  return (
    <div
      data-test="projectClosedInfo"
      className={classes.closedMatterInfoWrapper}
    >
      <InfoOutlinedIcon className={classes.closedMatterInfoIcon} />
      <Typography
        data-test="teamClosedInfoText"
        className={classes.closedMatterInfoText}
      >
        {props.text}
      </Typography>
    </div>
  )
}

export default ClosedInfoBox
