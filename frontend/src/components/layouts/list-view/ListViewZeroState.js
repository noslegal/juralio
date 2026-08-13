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
import zeroStateImage from '../../../assets/images/PineTree.png'
import { enableImmediateAdd } from '../../../app/project/project-actions'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskMapUrl,
} from '../../navigation/common/location-context-helper'

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
    width: '20%',
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

const ListViewZeroState = props => {
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
            data-test="listView-zero-state-title"
          >
            {t('listViewZeroState.title')}
          </Typography>
          <div className={classes.zeroStateCaptionDiv}>
            <Typography
              color="textSecondary"
              variant="body1"
              data-test="listView-zero-state-caption"
            >
              {t('listViewZeroState.caption')}
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
              <Typography> {t('common.taskmap')}</Typography>
            </Link>
          </div>
        </div>

        <img
          src={zeroStateImage}
          data-test="zero-state-image"
          alt={'tree'}
          className={classes.zeroStateImage}
        />
      </div>
    </div>
  )
}

export default ListViewZeroState
