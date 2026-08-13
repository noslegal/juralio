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

import {
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CONFIMRATION_STATUS } from '../../../../../app/constants'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  table: {
    marginTop: '10px',
  },
  additionalInfoWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    marginLeft: theme.spacing(6),
  },
  listItem: {
    height: theme.spacing(1.5),
    paddingLeft: '0px',
  },
}))

const SeatSummaryTable = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const users = props.users
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  const confirmedActiveUsers = users.filter(
    u =>
      u._user.confirmationStatus === CONFIMRATION_STATUS.CONFIRMED &&
      u._user.enabled
  ).length
  const trialingActiveUsers = users.filter(
    u =>
      u._user.confirmationStatus === CONFIMRATION_STATUS.TRIALING &&
      u._user.enabled
  ).length
  const whitelistedUsers = users.filter(
    u => u._user.confirmationStatus === CONFIMRATION_STATUS.WHITELISTED
  ).length
  const deactivtedUsers = users.filter(
    u =>
      u._user.confirmationStatus === CONFIMRATION_STATUS.LAPSED ||
      !u._user.enabled
  ).length
  let seatCount = organisation.seatCount ? organisation.seatCount : 0
  if (confirmedActiveUsers > seatCount) {
    //used to prevent having to refetch the updated seat count
    seatCount = confirmedActiveUsers
  }
  return (
    <div className={classes.wrapper}>
      <Table
        size="small"
        padding="none"
        sx={{ width: '350px', border: '1px solid rgba(224, 224, 224, 1)' }}
        className={classes.table}
      >
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography
                style={{ fontWeight: 800, fontSize: 16, margin: '8px' }}
              >
                {t('organisation.seatSummaryTable.seats')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                style={{ fontWeight: 800, fontSize: 16, margin: '8px' }}
              >
                {seatCount}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography style={{ margin: '8px' }}>
                {t('organisation.seatSummaryTable.activeConfirmedAccounts')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography style={{ margin: '8px' }}>
                {confirmedActiveUsers}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography style={{ margin: '8px' }}>
                {t('organisation.seatSummaryTable.unfilledSeats')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography style={{ margin: '8px' }}>
                {seatCount - confirmedActiveUsers}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className={classes.additionalInfoWrapper}>
        <List sx={{ listStyleType: 'disc' }} className={classes.list}>
          <ListItem sx={{ display: 'list-item' }} className={classes.listItem}>
            <Typography>
              {' '}
              {trialingActiveUsers +
                ' ' +
                t('organisation.seatSummaryTable.activeTrial')}
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item' }} className={classes.listItem}>
            <Typography>
              {' '}
              {deactivtedUsers +
                ' ' +
                t('organisation.seatSummaryTable.deactivated')}
            </Typography>
          </ListItem>
          {whitelistedUsers > 0 && (
            <ListItem
              sx={{ display: 'list-item' }}
              className={classes.listItem}
            >
              <Typography>
                {' '}
                {whitelistedUsers +
                  ' ' +
                  t('organisation.seatSummaryTable.whitelisted')}
              </Typography>
            </ListItem>
          )}
        </List>
      </div>
    </div>
  )
}

export default SeatSummaryTable
