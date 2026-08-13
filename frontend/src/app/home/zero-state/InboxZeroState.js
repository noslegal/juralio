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
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioSizes from '../../../theme/juralio-sizes'

const useStyles = makeStyles()(theme => ({
  zeroStateContainer: {
    width: '100%',
    display: 'inline-block',
    height: `calc(50% - ${juralioSizes.timeDividerHeight / 2}px)`,
    minHeight: theme.spacing(10),
  },
  content: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  caption: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    maxWidth: theme.spacing(50),
  },
  image: {
    maxWidth: theme.spacing(40),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
}))

const InboxZeroState = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()

  return (
    <div className={classes.zeroStateContainer} ref={props.setRef}>
      <div className={classes.content}>
        <div className={classes.image}>
          {props.image && (
            <img
              width={props.imageDimensions.width}
              height={props.imageDimensions.height}
              src={props.image}
              alt={t('inboxZeroState.imageAlt')}
              data-test="zero-state-image"
            />
          )}
        </div>
        <Typography
          color="textSecondary"
          variant="h5"
          data-test="zero-state-title"
        >
          {props.title}
        </Typography>
        <div className={classes.caption}>
          <Typography
            color="textSecondary"
            variant="body1"
            data-test="zero-state-caption"
          >
            {props.caption}
          </Typography>
        </div>
      </div>
    </div>
  )
}

InboxZeroState.propTypes = {
  setRef: PropTypes.func,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  caption: PropTypes.string,
}

export default InboxZeroState
