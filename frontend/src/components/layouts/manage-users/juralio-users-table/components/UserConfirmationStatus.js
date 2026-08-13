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

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import { Button, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { CONFIMRATION_STATUS } from '../../../../../app/constants'
import rawColours from '../../../../../theme/raw-colours'
import dayjs from 'dayjs'

const styles = makeStyles()(theme => ({
  globalWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: rawColours.primary.green.primary,
    marginLeft: theme.spacing(0.5),
  },
  infoIcon: {
    marginLeft: theme.spacing(0.5),
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: rawColours.primary.black[100],
  },
  text: {
    fontSize: theme.spacing(1.5),
  },
  dateText: {
    fontSize: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(0.5),
    textTransform: 'unset',
  },
}))

const UserConfirmationStatus = props => {
  const instanceSettings = useSelector(state => state.instanceSettings)
  const { t } = useTranslation()
  const { classes } = styles()

  const user = props.user
  if (!user) {
    return null
  }
  const getDaysLeftInTrial = () => {
    const numberOfDaysInTrial = instanceSettings.settings.trialPeriod
    const userTrialEndDate = new Date(user.trialStartDate)
    userTrialEndDate.setDate(userTrialEndDate.getDate() + numberOfDaysInTrial)
    const now = new Date()
    const daysRemaining = Math.max(
      Math.floor(
        (userTrialEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
      ),
      0
    )
    if (daysRemaining === 0) {
      return '< 1'
    }
    return daysRemaining
  }

  const daysLeftInTrial = getDaysLeftInTrial()

  const isTrialing = user.confirmationStatus === CONFIMRATION_STATUS.TRIALING
  const isLapsed = user.confirmationStatus === CONFIMRATION_STATUS.LAPSED
  const isWhitelisted =
    user.confirmationStatus === CONFIMRATION_STATUS.WHITELISTED

  const confirmClick = e => {
    e.stopPropagation()
    props.update(user, {
      confirmationStatus: CONFIMRATION_STATUS.CONFIRMED,
      orgId: user.organisation.id,
    })
  }
  const isConfirmed = user.confirmationStatus === CONFIMRATION_STATUS.CONFIRMED

  const getStatusDates = user => {
    if (user.confirmationStatus === CONFIMRATION_STATUS.CONFIRMED) {
      if (
        user.confirmationDate &&
        user.confirmationDate !== undefined &&
        user.confirmationDate !== null
      ) {
        return dayjs(user.confirmationDate).format('YYYY-MM-DD').toString()
      } else {
        return 'n/a'
      }
    } else {
      if (
        user.lapsedDate &&
        user.lapsedDate !== undefined &&
        user.lapsedDate !== null
      ) {
        return dayjs(user.lapsedDate).format('YYYY-MM-DD').toString()
      } else {
        return 'n/a'
      }
    }
  }
  return (
    <div className={classes.globalWrapper}>
      {isTrialing && (
        <Typography
          data-test="trialing-days-remaining-info"
          className={classes.text}
        >
          {Number.isInteger(daysLeftInTrial) && daysLeftInTrial !== 1
            ? t('userList.confirmationStatus.daysLeftInTrial', {
                days: daysLeftInTrial,
              })
            : t('userList.confirmationStatus.dayLeftInTrial', {
                day: daysLeftInTrial,
              })}
        </Typography>
      )}
      {isTrialing && user.organisation && (
        <Button
          variant="contained"
          data-test="confirm-user-button"
          className={classes.button}
          onClick={confirmClick}
        >
          {t('common.confirm')}
        </Button>
      )}
      {isLapsed && (
        <>
          <div>
            <Typography data-test="confirmed-date" className={classes.dateText}>
              {getStatusDates(user)}
            </Typography>
          </div>
          <div className={classes.wrapper}>
            <Typography data-test="lapsed-status-info" className={classes.text}>
              {t('userList.confirmationStatus.lapsed')}
            </Typography>
            <Tooltip title={t('userList.confirmationStatus.lapsedInfo')}>
              <InfoIcon className={classes.infoIcon} />
            </Tooltip>
          </div>
        </>
      )}
      {isWhitelisted && (
        <div className={classes.wrapper}>
          <Typography
            data-test="whitelist-status-info"
            className={classes.text}
          >
            {t('userList.confirmationStatus.whitelisted')}
          </Typography>
          <Tooltip title={t('userList.confirmationStatus.whitelistedInfo')}>
            <InfoIcon className={classes.infoIcon} />
          </Tooltip>
        </div>
      )}
      {isConfirmed && (
        <>
          <div>
            <Typography data-test="confirmed-date" className={classes.dateText}>
              {getStatusDates(user)}
            </Typography>
          </div>
          <div className={classes.wrapper}>
            <Typography
              data-test="confirmed-status-info"
              className={classes.text}
            >
              {t('userList.confirmationStatus.confirmed')}
            </Typography>
            <CheckCircleIcon className={classes.checkIcon} />
          </div>
        </>
      )}
    </div>
  )
}
export default UserConfirmationStatus
