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
import { useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const styles = theme => ({
  sysTitle: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: '1',
    height: theme.spacing(8),
    width: theme.spacing(41),
    paddingLeft: theme.spacing(1.5),
    color: juralioColours.darkText.primary,
  },
  title: {
    display: 'contents',
    flexDirection: 'column',
    justifyContent: 'center',
    width: theme.spacing(41),
    paddingLeft: theme.spacing(1.5),
    color: juralioColours.darkText.primary,
  },
})

function GlobalHeaderTitle(props) {
  const { classes } = props
  const org = useSelector(state => state.organisation.selectedOrganisation)

  return props.flipped ? (
    <div style={{ marginBottom: '20px' }} className={classes.title}>
      <Typography variant="h5">{props.caption}</Typography>
    </div>
  ) : (
    <div className={props.isSysAdmin ? classes.sysTitle : classes.title}>
      <Typography variant="h5">
        {props.title ? props.title : org && org.name}
      </Typography>
    </div>
  )
}

export default withStyles(GlobalHeaderTitle, styles)
