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

import { LinearProgress, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import JuralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  text: {
    color: JuralioColours.darkText.primary,
    paddingBottom: theme.spacing(1),
  },
}))

const JuralioLinearProgress = props => {
  const { classes } = useStyles()
  const { show, text } = props

  if (!show) return null

  return (
    <div className={classes.loadingState}>
      {text && text.length > 0 && (
        <Typography
          data-test="loading-text"
          variant={'caption'}
          className={classes.text}
        >
          {text}
        </Typography>
      )}
      {props.progress ? (
        <LinearProgress
          data-test="loading-bar"
          variant="buffer"
          value={props.progress}
          valueBuffer={props.progress + 30}
        />
      ) : (
        <LinearProgress data-test="loading-bar" />
      )}
    </div>
  )
}

JuralioLinearProgress.propTypes = {
  show: PropTypes.bool.isRequired,
  text: PropTypes.string,
}

export default JuralioLinearProgress
