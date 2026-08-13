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

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Button, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { useIsViewOnly } from '../../../../../hooks/matter/viewer/matter-viewer-hooks'
import InfoTooltip from '../../../../data-display/info-tooltip/InfoTooltip'
import CreateUserFlowContainer from '../../../../flows/create-user-flow/CreateUserFlowContainer'
import EditLoginMsgDialog from './EditLoginMsgDialog'
import SeatSummaryTable from './SeatSummaryTable'
import { getInstanceSettings } from '../../../../../redux/actions/instance-management-actions'
import {
  fetchOrganisationUsers,
  fetchUsers,
} from '../../../../../app/users/users-actions'
import { PeopleIcon } from '../../../../../theme/navigation/CommonIcons'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  tableTitle: {
    display: 'flex',
    marginBottom: theme.spacing(),
  },
  title: {
    marginLeft: theme.spacing(),
  },
  usersSummary: { display: 'flex', flexDirection: 'row' },
  count: {
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  addPersonButton: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  buttonSpan: {
    width: 'max-content',
  },
  buttonDiv: {
    display: 'flex',
  },
  editMsgButton: {
    marginTop: theme.spacing(2),
    width: 'auto',
    marginLeft: 'auto',
  },
}))

const getHeaderTextForContext = (t, isCurrentUserSysadmin, isSysadminTable) => {
  if (isSysadminTable) {
    return t('userList.sysAdmins')
  }
  return t(
    isCurrentUserSysadmin ? 'userList.currentUsers' : 'entity.user_other'
  )
}

export const JuralioUsersTableHeader = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [showAddUsers, setShowAddUsers] = useState(false)
  const [showEditLogin, setShowEditLogin] = useState(false)

  const confirmedUsersIsEnabled = useSelector(
    state => state.instanceSettings.settings.enableUserConfirmation
  )
  const instanceSettings = useSelector(state => state.instanceSettings.settings)

  const organisation = useSelector(
    state => state.organisation?.selectedOrganisation
  )

  const { users, isCurrentUserSysadmin, isOrganisation, isSysadminTable } =
    props

  const isGlobalUsersList = isCurrentUserSysadmin && !isOrganisation
  const isUserHeaderVisible =
    (isCurrentUserSysadmin && !isOrganisation) || !isCurrentUserSysadmin
  const isViewOnly = useIsViewOnly({ activities: [] })

  const activeUsers = users.filter(user => user._user?.enabled).length

  const activeFullUsers = users.filter(
    x => x._user?.isExternal === false && x._user?.enabled
  ).length

  const externalCount = users.filter(
    user => user._user?.isExternal && user._user?.enabled
  ).length
  const fullCount = activeFullUsers - externalCount
  const seatLimit =
    instanceSettings.fullSeats <= 0 && instanceSettings.limitedSeats <= 0
  const showAddUser = () => {
    setShowAddUsers(true)
  }

  const closeAddUser = () => {
    setShowAddUsers(false)
    if (isOrganisation && organisation?.id) {
      dispatch(fetchOrganisationUsers(organisation.id))
    } else if (isCurrentUserSysadmin) {
      dispatch(fetchUsers())
    }
  }

  const showEditLoginMsgDialog = () => {
    setShowEditLogin(true)
  }

  const closeEditLoginMsgDialog = () => {
    setShowEditLogin(false)
  }

  useEffect(() => {
    dispatch(getInstanceSettings())
  }, [activeUsers, externalCount, dispatch])

  const generateUserCountHeader = confirmedUsersIsEnabled => {
    if (confirmedUsersIsEnabled) {
      return (
        <Typography data-test="summary-of-accounts">
          {t('userList.summaryOfAccounts')}
        </Typography>
      )
    }
    return (
      <div className={classes.usersSummary} data-test="user-count-summary">
        <Typography
          dangerouslySetInnerHTML={{
            __html: isSysadminTable
              ? t('userList.header.usersSummary.overallCountSysAdmin_2', {
                  type: isGlobalUsersList ? 'instance' : 'organisation',
                  count: activeUsers === 0 ? t('common.no_other') : activeUsers,
                  plural: activeUsers === 1 ? '' : 's',
                })
              : t('userList.header.usersSummary.overallCount_2', {
                  type: isGlobalUsersList ? 'instance' : 'organisation',
                  count: activeUsers === 0 ? t('common.no_other') : activeUsers,
                  plural: activeUsers === 1 ? '' : 's',
                  full_seats_left: instanceSettings.fullSeats,
                  used_full: fullCount,
                  limited_seats_left: instanceSettings.limitedSeats,
                  used_limited: externalCount,
                }),
          }}
        ></Typography>
        &nbsp;&nbsp;
        {isGlobalUsersList && !isSysadminTable && (
          <InfoTooltip text={t('sysAdmin.accounts.infotip')} />
        )}
      </div>
    )
  }

  return (
    <div className={classes.root}>
      {showAddUsers && (
        <CreateUserFlowContainer
          cancelHandler={closeAddUser}
          isCreateSysadminFlow={isSysadminTable}
          activeUsers={activeUsers}
        />
      )}
      {showEditLogin && (
        <EditLoginMsgDialog
          cancelHandler={closeEditLoginMsgDialog}
          organisation={organisation}
        />
      )}

      {isUserHeaderVisible && (
        <div className={classes.tableTitle}>
          <PeopleIcon />
          <Typography
            data-test="table-title"
            variant={props.currentUserTitleSize}
            className={classes.title}
          >
            {getHeaderTextForContext(
              t,
              isCurrentUserSysadmin,
              isSysadminTable,
              confirmedUsersIsEnabled
            )}
          </Typography>
        </div>
      )}
      {generateUserCountHeader(confirmedUsersIsEnabled && !isGlobalUsersList)}
      {confirmedUsersIsEnabled && !isGlobalUsersList && (
        <SeatSummaryTable users={users} />
      )}
      <div className={classes.buttonDiv}>
        <Tooltip
          title={seatLimit ? t('userList.header.seats.reachedLimit') : ''}
        >
          <span className={classes.buttonSpan}>
            <Button
              data-test="add-people-button"
              disabled={seatLimit || isViewOnly}
              className={classes.addPersonButton}
              startIcon={<PersonAddIcon className={classes.addIcon} />}
              variant="outlined"
              color="primary"
              onClick={() => {
                showAddUser()
              }}
            >
              {isSysadminTable
                ? t('addUsersDialog.createSysadmin')
                : t('addUsersDialog.dialogTitle2')}
            </Button>
          </span>
        </Tooltip>
        {confirmedUsersIsEnabled && (
          <Button
            className={classes.editMsgButton}
            data-test="edit-custom-messages-button"
            variant="outlined"
            color="primary"
            onClick={() => {
              showEditLoginMsgDialog()
            }}
          >
            {t('Edit User Confirmation Notices')}
          </Button>
        )}
      </div>
    </div>
  )
}
