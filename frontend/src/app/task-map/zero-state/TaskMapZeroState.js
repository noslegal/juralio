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
import { withStyles } from 'tss-react/mui'
import zeroStateImage2 from '../../../assets/images/Heather.png'
import zeroStateImageMobile from '../../../assets/images/taskmap-zerostate-arrow-mobile.svg'
import zeroStateImage from '../../../assets/images/taskmap-zerostate-arrow.svg'
import { isIE } from '../../../services/helpers/ie-helper'
import ZeroStateCreateButton from './ZeroStateCreateButton'

const isBrowserIE = isIE()

const styles = theme => ({
  content: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    transform: 'translate(-200%,-50%)',
  },
  arrowMobile: {
    position: 'absolute',
    transform: 'translate(0,100%)',
  },
  ieArrow: {
    position: 'absolute',
    transform: 'translate(-250%,-80%)',
  },
  zeroStateRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  zeroStateImage: {
    width: '60%',
    marginTop: 'auto',
    marginLeft: 'auto',
    pointerEvents: 'none',
  },
})

const TaskMapZeroState = props => {
  const { t } = useTranslation()
  return (
    <div className={props.classes.zeroStateRoot}>
      {!props.mobile && !props.viewOnly && (
        <ZeroStateCreateButton createFirstTask={props.createFirstTask} />
      )}
      <div className={props.classes.content}>
        <div style={{ marginTop: 'auto' }}>
          {!props.mobile && !props.viewOnly && (
            <div
              className={
                isBrowserIE ? props.classes.ieArrow : props.classes.arrow
              }
            >
              <img
                style={{ pointerEvents: 'none' }}
                src={zeroStateImage}
                data-test="zero-state-image"
                alt={t('taskmapZeroState.arrowAlt')}
              />
            </div>
          )}
          <Typography
            color="textSecondary"
            variant="h5"
            data-test="zero-state-title"
          >
            {props.title}
          </Typography>
          <Typography
            color="textSecondary"
            variant="body1"
            data-test="zero-state-caption"
          >
            {props.caption}
          </Typography>
        </div>

        <img
          src={zeroStateImage2}
          data-test="zero-state-image"
          alt={'heather'}
          className={props.classes.zeroStateImage}
        />
        {props.mobile && (
          <div className={isBrowserIE ? null : props.classes.arrowMobile}>
            <img
              src={zeroStateImageMobile}
              data-test="zero-state-image-mobile"
              alt={t('taskmapZeroState.arrowAlt')}
            />
          </div>
        )}
      </div>
    </div>
  )
}

TaskMapZeroState.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
}

export default withStyles(TaskMapZeroState, styles)
