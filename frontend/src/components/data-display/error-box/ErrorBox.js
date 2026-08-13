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

import ErrorIcon from '@mui/icons-material/Error'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  error: {
    color: juralioColours.error,
  },
  errorWrapper: {
    display: 'flex',
  },
  padding: {
    paddingTop: theme.spacing(3),
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
}))

const ErrorBox = props => {
  const { error, padding } = props
  const { classes } = useStyles()

  if (!error || error.length === 0) {
    return null
  }

  return (
    <div
      data-test="error-box"
      className={classNames(
        classes.errorWrapper,
        padding ? classes.padding : undefined
      )}
    >
      <ErrorIcon fontSize="small" className={classes.errorIcon} />
      <Typography className={classes.error}>{error}</Typography>
    </div>
  )
}

ErrorBox.propTypes = {
  error: PropTypes.string,
  padding: PropTypes.bool,
}

export default ErrorBox
