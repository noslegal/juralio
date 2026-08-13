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
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  container: {
    width: '80%',
    height: '50%',
  },
  content: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    color: juralioColours.darkText.primary,
    marginTop: theme.spacing(1),
  },
  subtitle: {
    maxWidth: 400,
    color: juralioColours.darkText.secondary,
    marginTop: theme.spacing(1),
  },
}))

// The Notice handles display of the image with text displayed when a user
// first logs into Juralio.
const Notice = props => {
  const { image, imageAlt, title, subtitle } = props
  const { classes } = useStyles()

  if (!image || !title || !subtitle) return null

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <img
          src={`data:image/svg+xml,${encodeURIComponent(image)}`}
          width="50%"
          height="50%"
          data-test="notice-image"
          alt={imageAlt}
        />
        <Typography
          className={classes.title}
          variant="h5"
          data-test="notice-title"
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          data-test="notice-subtitle"
          className={classes.subtitle}
        >
          {subtitle}
        </Typography>
      </div>
    </div>
  )
}

Notice.propTypes = {
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
}

export default Notice
