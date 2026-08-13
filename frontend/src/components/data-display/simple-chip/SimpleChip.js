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
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  root: {
    borderRadius: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightMedium,
    letterSpacing: 0.4,
    minWidth: theme.spacing(5),
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.6),
    paddingRight: theme.spacing(0.6),
    paddingTop: theme.spacing(0.25),
    textAlign: 'center',
    alignItems: 'center',
    placeContent: 'center',
  },
}))

const SimpleChip = props => {
  const { classes } = useStyles()
  const { text, options } = props
  const chipStyle = {
    color: options.color,
    backgroundColor: options.backgroundColor,
    minWidth: options.minWidth,
    marginRight: options.marginRight,
    maxWidth: options.maxWidth,
    height: options.height,
    textTransform: options.textTransform,
  }

  if (!text) return null

  return (
    <Typography
      className={classes.root}
      data-test={options.dataTest}
      style={chipStyle}
      variant="caption"
    >
      {text}
    </Typography>
  )
}

SimpleChip.propTypes = {
  text: PropTypes.string,
  options: PropTypes.object,
}

export default SimpleChip
