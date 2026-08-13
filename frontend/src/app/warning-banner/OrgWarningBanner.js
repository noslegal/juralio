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
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'

const styles = makeStyles()(theme => ({
  wrapper: {
    height: theme.spacing(4),
    backgroundColor: JuralioNamedColours.red.main,
    width: '100%',
    zIndex: 100,
    display: 'flex',
  },
  text: {
    color: 'white',
    margin: 'auto',
  },
}))
const OrgWarningBanner = props => {
  const { classes } = styles()

  return (
    <div className={classes.wrapper} data-test="org-warning-banner">
      <Typography className={classes.text}>
        {props.text}
        {props.link ? props.link : ''}
      </Typography>
    </div>
  )
}
export default OrgWarningBanner
