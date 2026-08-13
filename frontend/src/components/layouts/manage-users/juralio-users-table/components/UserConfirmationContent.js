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
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
  },
  text: {
    marginBottom: '8px',
    fontSize: '14px',
  },
}))

const UserConfirmationContent = props => {
  const seatCount = props.seatCount
  const isConfirmation = props.isConfirmation

  const isDeactivation = props.isDeactivation

  const isReactivation = props.isReactivation
  const seatsAvailable = props.seatsAvailable
  const { classes } = style()
  const { t } = useTranslation()
  const getConfirmationContent = reactivation => {
    return (
      <div
        className={classes.wrapper}
        data-test={
          seatsAvailable
            ? `seat-fill-confirmation${reactivation ? '-reactivation' : ''}`
            : `seat-increase-confirmation${reactivation ? '-reactivation' : ''}`
        }
      >
        <Typography className={classes.text}>
          {t(
            `userList.confirmationDialog.seatCounts.${
              seatsAvailable ? 'wontIncrease' : 'willIncrease'
            }${reactivation ? 'Reactivation' : ''}.stateChange`,
            { seatCount: seatCount, newSeatCount: seatCount + 1 }
          )}
        </Typography>
        <Typography className={classes.text}>
          {t(
            `userList.confirmationDialog.seatCounts.${
              seatsAvailable ? 'wontIncrease' : 'willIncrease'
            }${reactivation ? 'Reactivation' : ''}.description`,
            { seatCount: seatCount, newSeatCount: seatCount + 1 }
          )}
        </Typography>
        <Typography className={classes.text}>
          {t(
            `userList.confirmationDialog.seatCounts.${
              seatsAvailable ? 'wontIncrease' : 'willIncrease'
            }${reactivation ? 'Reactivation' : ''}.implication`
          )}
        </Typography>
      </div>
    )
  }

  const getDeactivationContent = () => {
    return (
      <div
        className={classes.wrapper}
        data-test="seat-deactivation-confirmation"
      >
        <Typography className={classes.text}>
          {t(`userList.confirmationDialog.seatCounts.deactivation.description`)}
        </Typography>
        <Typography className={classes.text}>
          {t(
            `userList.confirmationDialog.seatCounts.deactivation.stateChange`,
            { seatCount: seatCount }
          )}
        </Typography>
      </div>
    )
  }
  return (
    <div>
      {isConfirmation && getConfirmationContent()}
      {isDeactivation && getDeactivationContent()}
      {isReactivation && getConfirmationContent(true)}
    </div>
  )
}

export default UserConfirmationContent
