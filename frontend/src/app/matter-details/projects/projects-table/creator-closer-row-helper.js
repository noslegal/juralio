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

export const generateClosedRow = (value, classes, t) => {
  //if project has no closer but has close date
  if (value[1][0] === null && typeof value[1][1] === 'string') {
    return (
      <div data-test="project-closed-on">
        <Typography variant="caption">
          {t('common.closed')}
          &nbsp;
          {t('common.on')} <b>{value[1][1]}</b>
        </Typography>
      </div>
    )
  }
  //if project has a closer and open/closing date but no creator
  if (
    value[1][0] !== null &&
    value[0][0] === null &&
    typeof value[0][1] === 'string' &&
    typeof value[1][1] === 'string'
  ) {
    return (
      <div>
        <div className={classes.row} data-test={'project-created-on'}>
          <Typography variant="caption">
            {t('common.created')} {t('common.on')} <b>{value[0][1]}</b>
          </Typography>
        </div>
        <div className={classes.row} data-test={'project-closed-on'}>
          <Typography variant="caption">
            {t('common.closedBy')}{' '}
            <b>
              {value[1][0].firstname} {value[1][0].lastname}
            </b>{' '}
            {t('common.on')} <b>{value[1][1]}</b>
          </Typography>
        </div>
      </div>
    )
  }
  //if project has creator closer and full date data
  if (
    value[1][0] !== null &&
    value[0][0] !== null &&
    typeof value[0][1] === 'string' &&
    typeof value[1][1] === 'string'
  ) {
    return (
      <div>
        <div className={classes.row} data-test={'project-created-on'}>
          <Typography variant="caption">
            {t('common.createdBy')}{' '}
            <b>
              {value[0][0].firstname} {value[0][0].lastname}
            </b>{' '}
            {t('common.on')} <b>{value[0][1]}</b>
          </Typography>
        </div>
        <div className={classes.row} data-test={'project-closed-on'}>
          <Typography variant="caption">
            {t('common.closedBy')}{' '}
            <b>
              {value[1][0].firstname} {value[1][0].lastname}
            </b>{' '}
            {t('common.on')} <b>{value[1][1]}</b>
          </Typography>
        </div>
      </div>
    )
  }
  return ''
}

export const generateOpenRow = (value, classes, t) => {
  if (value[0][0] === null && typeof value[0][1] === 'string') {
    //if project has no creator
    return (
      <div data-test="project-created-on">
        <Typography variant="caption">
          {t('common.created')}
          &nbsp;
          {t('common.on')} <b>{value[0][1]}</b>
        </Typography>
      </div>
    )
  } else if (value[0][0] !== null && typeof value[0][1] === 'string') {
    //else project has a creator and date
    return (
      <div className={classes.row} data-test={'project-created-on'}>
        <Typography variant="caption">
          {t('common.createdBy')}{' '}
          <b>
            {value[0][0].firstname} {value[0][0].lastname}
          </b>{' '}
          {t('common.on')} <b>{value[0][1]}</b>
        </Typography>
      </div>
    )
  }
  //cover any edge case
  else {
    return ''
  }
}
