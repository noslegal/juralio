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

import { Link, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../assets/images/Mountain.png'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskMapUrl,
} from '../../components/navigation/common/location-context-helper'
import { enableImmediateAdd } from '../project/project-actions'

const useStyles = makeStyles()(theme => ({
  zeroStateRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  content: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  zeroStateImage: {
    width: '60%',
    marginTop: 'auto',
    marginLeft: 'auto',
    pointerEvents: 'none',
  },
  zeroStateCaptionDiv: {
    display: 'flex',
  },
  link: {
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: 'smaller',
    paddingLeft: theme.spacing(0.5),
  },
}))

const RoadmapZeroState = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes } = useStyles()
  const location = useLocation()

  return (
    <div className={classes.zeroStateRoot}>
      <div className={classes.content}>
        <div style={{ marginTop: 'auto' }}>
          <Typography
            color="textSecondary"
            variant="h5"
            data-test="roadmap-zero-state-title"
          >
            {t('roadmapZeroState.title')}
          </Typography>
          <div className={classes.zeroStateCaptionDiv}>
            <Typography
              color="textSecondary"
              variant="body1"
              data-test="roadmap-zero-state-caption"
            >
              {t('roadmapZeroState.caption')}
            </Typography>
            <Link
              onClick={() => dispatch(enableImmediateAdd())}
              href={
                '#' +
                getTaskMapUrl(
                  undefined,
                  getMatterIdFromLocation(location),

                  getProjectIdFromLocation(location)
                )
              }
              className={classes.link}
            >
              {t('common.taskmap')}
            </Link>
          </div>
        </div>

        <img
          src={zeroStateImage}
          data-test="zero-state-image"
          alt={'moutain'}
          className={classes.zeroStateImage}
        />
      </div>
    </div>
  )
}

export default RoadmapZeroState
