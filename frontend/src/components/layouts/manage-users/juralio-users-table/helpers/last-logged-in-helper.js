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
import dayjs from 'dayjs'
import React from 'react'
import { getDateTimeDisplayStrings } from '../../../../../services/helpers/date-helper'

export const getUserLastLoggedInDate = user => {
  if (user.onlineNow) {
    return { onlineNow: true }
  }

  return user.mostRecentActivityTime
    ? getDateTimeDisplayStrings(
        dayjs(user.mostRecentActivityTime),
        undefined,
        true
      )
    : { date: '', time: '' }
}

export const renderLastLoggedInEntry = (t, lastLoggedInDate, classes) => {
  if (lastLoggedInDate && lastLoggedInDate.onlineNow) {
    return (
      <div>
        <Typography
          data-test="user-last-log-in-date"
          variant="caption"
          className={classes.cellTextOnlineNow}
        >
          {t('common.onlineNow')}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.dateEntries}>
      <div>
        <Typography
          data-test="user-last-log-in-date"
          variant="caption"
          className={classes.cellText}
        >
          {lastLoggedInDate.date}
        </Typography>
      </div>
      <div>
        <Typography
          data-test="user-last-log-in-date"
          variant="caption"
          className={classes.cellText}
        >
          {lastLoggedInDate.time}
        </Typography>
      </div>
    </div>
  )
}
