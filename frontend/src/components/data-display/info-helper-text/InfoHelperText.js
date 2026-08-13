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
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    color: juralioColours.darkText.secondary,
  },
  text: {
    paddingLeft: theme.spacing(),
  },
  error: {
    color: juralioColours.error,
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
}))

const InfoHelperText = props => {
  const { text, icon, dataTest } = props
  const Icon = icon
  const { classes } = useStyles()

  const error = props.error && props.error === true

  return (
    <div className={classes.container}>
      <Icon fontSize="small" className={error ? classes.errorIcon : ''} />
      <Typography
        data-test={dataTest}
        variant={'body2'}
        className={classNames(
          classes.text,
          error ? classes.error : classes.title
        )}
      >
        {text}
      </Typography>
    </div>
  )
}

InfoHelperText.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  dataTest: PropTypes.string.isRequired,
  error: PropTypes.bool,
}

export default InfoHelperText
