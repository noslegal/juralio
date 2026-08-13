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

import InsightsIcon from '@mui/icons-material/Insights'
import { Button, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { CONFIMRATION_STATUS, USER_ROLES } from '../../../../app/constants'
import { displayConfirmationDialog } from '../../../../app/global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../../../../app/global-snackbar/global-snackbar-actions'
import api from '../../../../services/helpers/fetch/fetch-helper.js'
import {
  renderAuthMethod,
  renderUserColumn,
  useUserColumnStyles,
} from '../../../../services/helpers/table/juralio-table-common-columns'
import { renderHeaderWithToolTip } from '../../../../services/helpers/table/juralio-table-helper'
import {
  userNameComparator,
  userRolesComparator,
} from '../../../../services/helpers/table/juralio-table-sort-comparators'
import juralioColours from '../../../../theme/juralio-colours'
import { DeleteIcon } from '../../../../theme/navigation/CommonIcons'
import withLoader from '../../../feedback/with-loader/WithLoader'
import LockSwitch from './components/LockSwitch'
import UserConfirmationStatus from './components/UserConfirmationStatus'
import UserStatusToggle from './components/UserStatusToggle'
import processData from './helpers/juralio-users-table-data-provider'
import { renderLastLoggedInEntry } from './helpers/last-logged-in-helper'
import { UserRolesFilterInput } from './helpers/user-roles-custom-filter'
import JuralioUsersTable from './JuralioUsersTable'
import { fetchUsers } from '../../../../app/users/users-actions'

const useStyles = makeStyles()(theme => ({
  cellTextOnlineNow: {
    paddingLeft: theme.spacing(),
    color: theme.palette.success.light,
    fontWeight: theme.typography.fontWeightBold,
    minHeight: theme.spacing(2),
  },
  cellText: {
    color: juralioColours.darkText.secondary,
    height: theme.spacing(2),
  },
  dateEntries: {
    display: 'flex',
    flexDirection: 'row',
    width: theme.spacing(20),
    justifyContent: 'space-around',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyItems: 'center',
  },
  infoIcon: {
    paddingLeft: theme.spacing(1),
    color: juralioColours.darkText.secondary,
  },
}))

const JuralioUsersTableContainer = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const {
    currentUser,
    currentUserId,
    isOrganisation,
    isOrgMfaEnabled,
    isSysadminTable,
  } = props
  const userColumnClasses = useUserColumnStyles()
  const isUserSysAdmin = props.isCurrentUserSysadmin
  const showLastLoggedIn = !isUserSysAdmin
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  const instanceSettings = useSelector(state => state.instanceSettings.settings)
  const seatLimit =
    instanceSettings.fullSeats <= 0 && instanceSettings.limitedSeats <= 0
  const dispatch = useDispatch()

  const users = useSelector(state => state.users?.users)
  const showConfrimDate =
    isUserSysAdmin && props.showUserConfirmationFunctionality
  const userIsOnlyOrgOwner = user => {
    if (!user.roles?.includes(USER_ROLES.ROLE_ORG_OWNER)) {
      return false
    }
    if (!users) return false
    let orgOwners = users.filter(
      u =>
        u?.organisation &&
        u.organisation?.id === user.organisation?.id &&
        u.roles.includes(USER_ROLES.ROLE_ORG_OWNER)
    )
    return orgOwners.length === 1
  }

  const handleUserDelete = (e, user) => {
    e.stopPropagation()
    const confirmOptions = {
      actionText: t('common.delete'),
      titleText: t('userDeletion.deleteConfirmationTitle', {
        userName: user.username,
      }),
      promptText: t('userDeletion.deleteConfirmationPrompt'),
      usageContext: 'DeleteUser',
      headerIcon: DeleteIcon,
      dontTranslatePromptText: true,
      cancel: () => {},
    }
    dispatch(
      displayConfirmationDialog(confirmOptions, () => {
        api(`users/${user.id}`, 'DELETE').then(res => {
          if (res.status === 200) {
            dispatch(showSnackbar(t('userDeletion.deleteSuccess')))
            !isOrganisation
              ? dispatch(fetchUsers())
              : dispatch(
                  props.refreshUserList(
                    props.isCurrentUserSysadmin,
                    props.isOrganisation,
                    user.organisation.id
                  )
                )
          } else {
            dispatch(showSnackbar(t('common.error')))
          }
        })
      })
    )
  }

  const confirmationStatusOrder = {
    [CONFIMRATION_STATUS.TRIALING]: 0,
    [CONFIMRATION_STATUS.CONFIRMED]: 1,
    [CONFIMRATION_STATUS.WHITELISTED]: 2,
    [CONFIMRATION_STATUS.LAPSED]: 3,
  }

  const columns = [
    {
      field: '_user',
      headerName: t('common.name'),
      flex: 2,
      filterable: false,
      sortable: true,
      sortComparator: userNameComparator,
      renderHeader: () => (
        <span data-test="user-name-header">{t('common.name')}</span>
      ),
      renderCell: params =>
        renderUserColumn(
          t,
          userColumnClasses.classes,
          params.row._user,
          currentUser.username,
          true
        ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    ...(!isOrganisation && isUserSysAdmin && !isSysadminTable
      ? [
          {
            field: 'organisation',
            headerName: t('entity.organisation'),
            flex: 1,
            filterable: false,
            sortable: true,
            renderHeader: () => (
              <span data-test="user-org-header">
                {t('entity.organisation')}
              </span>
            ),
            renderCell: params => (
              <span data-test="user-org-text">{params.value}</span>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    {
      field: 'groupName',
      headerName: t('common.group'),
      flex: 1,
      filterable: true,
      sortable: true,
      renderCell: params => <Typography>{params.row.groupName}</Typography>,
      getApplyQuickFilterFn: () => () => false,
    },
    ...(!isSysadminTable
      ? [
          {
            field: 'roles',
            headerName: t('userList.headerRoles'),
            flex: 2,
            filterable: !isSysadminTable,
            sortable: true,
            sortComparator: userRolesComparator,
            renderHeader: () => (
              <span data-test="user-roles-header">
                {renderHeaderWithToolTip(
                  classes,
                  t('userList.headerRoles'),
                  t('userList.header.tooltipRolesOrganisation')
                )}
              </span>
            ),
            renderCell: params => (
              <span data-test="user-roles">
                {params.row.roles && params.row.roles.length > 0
                  ? params.row.roles.join(', ')
                  : t('userList.notApplicable')}
              </span>
            ),
            filterOperators: [
              {
                label: t('userList.headerRoles'),
                value: 'containsAnyRole',
                getApplyFilterFn: filterItem => {
                  if (!filterItem.value || filterItem.value.length === 0)
                    return null
                  const selectedRoles = filterItem.value
                  return params =>
                    params.value &&
                    params.value.some(role => selectedRoles.includes(role))
                },
                InputComponent: ({ item, applyValue }) => (
                  <UserRolesFilterInput
                    item={item}
                    applyValue={applyValue}
                    isOrganisation={isOrganisation}
                    t={t}
                  />
                ),
              },
            ],
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    ...(!isSysadminTable
      ? [
          {
            field: 'userType',
            headerName: t('userList.type'),
            flex: 1,
            filterable: true,
            sortable: true,
            renderHeader: () => (
              <span data-test="user-type-header">{t('userList.type')}</span>
            ),
            renderCell: params => (
              <span data-test="user-type">
                <Typography data-test="user-type-text" variant="caption">
                  {params.row.userType}
                </Typography>
              </span>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    ...(isOrgMfaEnabled
      ? [
          {
            field: 'mfaEnabled',
            headerName: t('userList.headerMFA'),
            flex: 1,
            filterable: false,
            sortable: true,
            renderHeader: () => (
              <span data-test="user-mfa-header">{t('userList.headerMFA')}</span>
            ),
            renderCell: params => (
              <span data-test="user-mfa">
                <LockSwitch
                  open={!params.row.mfaEnabled}
                  handleToggle={isOpen => {
                    if (props.isSysadminTable) return
                    props.handleChange(params.row._user, {
                      mfaEnabled: !isOpen,
                    })
                  }}
                />
              </span>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    {
      field: 'enabled',
      headerName: t('userList.headerStatus'),
      flex: 1,
      filterable: true,
      sortable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: true, label: t('common.active') },
        { value: false, label: t('common.inactive') },
      ],
      renderHeader: () => (
        <span data-test="user-status-header">{t('userList.headerStatus')}</span>
      ),
      renderCell: params => (
        <span data-test="user-status">
          <UserStatusToggle
            isExternal={params.row._user.isExternal}
            tooltipText={
              seatLimit === true && !params.row.enabled && !isUserSysAdmin
                ? t('userList.header.seats.toggleDisabledTooltip')
                : ''
            }
            currentValue={params.row.enabled.toString()}
            readOnly={
              currentUserId === params.row._user.id ||
              (seatLimit === true && !params.row.enabled && !isUserSysAdmin) ||
              userIsOnlyOrgOwner(params.row._user)
            }
            updateStatus={e => {
              let updateObject = { enabled: !params.row.enabled }
              if (props.showUserConfirmationFunctionality) {
                if (
                  params.row._user.confirmationStatus ===
                    CONFIMRATION_STATUS.LAPSED &&
                  !params.row._user.enabled
                ) {
                  updateObject.confirmationStatus =
                    CONFIMRATION_STATUS.CONFIRMED
                }
              }
              props.handleChange(params.row._user, updateObject)
              e.preventDefault()
            }}
          />
        </span>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    ...(props.showUserConfirmationFunctionality && isOrganisation
      ? [
          {
            field: 'confirmationStatus',
            headerName: t('userList.userConfirmation'),
            flex: 1,
            filterable: props.showUserConfirmationFunctionality,
            sortable: true,
            sortComparator: (v1, v2, cellParams1, cellParams2) => {
              const o1 = confirmationStatusOrder[v1] ?? 99
              const o2 = confirmationStatusOrder[v2] ?? 99
              if (o1 === o2 && v1 === CONFIMRATION_STATUS.TRIALING) {
                const t1 = new Date(
                  cellParams1.row._user.trialStartDate
                ).getTime()
                const t2 = new Date(
                  cellParams2.row._user.trialStartDate
                ).getTime()
                return t1 - t2
              }
              return o1 - o2
            },
            renderHeader: () => (
              <span data-test="user-confirmation-status-header">
                {t('userList.userConfirmation')}
              </span>
            ),
            renderCell: params => (
              <span data-test="user-confirmation-status">
                <UserConfirmationStatus
                  user={params.row._user}
                  update={props.handleChange}
                />
              </span>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    {
      field: 'authMethod',
      headerName: t('userList.authMethod'),
      flex: 1,
      filterable: true,
      sortable: true,
      renderHeader: () => (
        <span data-test="user-auth-method-header">
          {t('userList.authMethod')}
        </span>
      ),
      renderCell: params => (
        <span data-test="user-auth-method-mfa">
          {renderAuthMethod(
            t,
            userColumnClasses,
            params.row.authMethod,
            organisation
          )}
        </span>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    ...(isOrganisation && showLastLoggedIn
      ? [
          {
            field: 'lastLoggedIn',
            headerName: t('userList.lastLoggedIn'),
            flex: 2,
            filterable: false,
            sortable: true,
            sortComparator: (v1, v2) => {
              let result = 0
              if (v1.onlineNow !== undefined) {
                if (v1.onlineNow === true && v2.onlineNow) result = 0
                if (v1.onlineNow === true && !v2.onlineNow) result = 1
                if (v1.onlineNow === false && v2.onlineNow) result = -1
              } else if (v2.onlineNow !== undefined) {
                if (v2.onlineNow === true && v1.onlineNow) result = 0
                if (v2.onlineNow === true && !v1.onlineNow) result = -1
                if (v2.onlineNow === false && v1.onlineNow) result = 1
              } else if (v1.date.length === 0 && v2.date.length === 0) {
                result = 0
              } else if (v1.date.length > 0 && v2.date.length > 0) {
                const date1 = new Date(v1.date + ' ' + v1.time)
                const date2 = new Date(v2.date + ' ' + v2.time)
                if (date1 > date2) result = 1
                else if (date1 < date2) result = -1
              } else if (v1.date.length > 0 && v2.date.length === 0) {
                result = 1
              } else if (v1.date.length === 0 && v2.date.length > 0) {
                result = -1
              }
              return result
            },
            renderHeader: () => (
              <span data-test="user-last-logged-in-label">
                {t('userList.lastLoggedIn')}
              </span>
            ),
            renderCell: params => (
              <div data-test="user-last-log-in">
                {renderLastLoggedInEntry(t, params.row.lastLoggedIn, classes)}
              </div>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    ...(isUserSysAdmin || isOrganisation
      ? [
          {
            field: 'delete',
            headerName: t('common.delete'),
            flex: 1,
            filterable: false,
            sortable: false,
            renderCell: params =>
              params.row._user.hasNeverSignedIn && (
                <IconButton
                  aria-label="Delete user"
                  data-test="delete-user-button"
                  onClick={e => handleUserDelete(e, params.row._user)}
                >
                  <DeleteIcon />
                </IconButton>
              ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    ...(props.isSysadminTable
      ? [
          {
            field: 'activityLog',
            headerName: t('userList.activityLog'),
            flex: 1,
            filterable: false,
            sortable: false,
            renderCell: params => (
              <Button
                data-test="user-activity-log"
                variant="contained"
                onClick={e => {
                  e.stopPropagation()
                  props.showActivityLog(params.row._user.id)
                }}
              >
                <InsightsIcon />
              </Button>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
  ]

  const rows = processData(
    t,
    props.data,
    props.isOrganisation,
    organisation?.id,
    props.showUserConfirmationFunctionality
  )

  const uniq = arr => Array.from(new Set(arr.filter(Boolean)))

  const roleOptionsAll = [
    t('userList.orgadmin'),
    t('userList.matterCreator'),
    t('userList.knowledgeManager'),
    t('userList.orgOwner'),
  ]
  const roleOptions = isOrganisation ? roleOptionsAll.slice(1) : roleOptionsAll

  const filters = [
    // {
    //   name: 'groupName',
    //   label: t('common.group'),
    //   options: uniq(rows.map(r => r.groupName)),
    //   matchFn: (row, selected) => selected.includes(row.groupName),
    // },
    ...(!isSysadminTable
      ? [
          {
            name: 'roles',
            label: t('userList.headerRoles'),
            options: roleOptions,
            matchFn: (row, selected) =>
              (row.roles ?? []).some(r => selected.includes(r)),
          },
          {
            name: 'userType',
            label: t('userList.type'),
            options: uniq(rows.map(r => r.userType)),
            matchFn: (row, selected) => selected.includes(row.userType),
          },
        ]
      : []),
    {
      name: 'enabled',
      label: t('userList.headerStatus'),
      options: [t('common.active'), t('common.inactive')],
      matchFn: (row, selected) =>
        selected.includes(
          row.enabled ? t('common.active') : t('common.inactive')
        ),
    },
    ...(props.showUserConfirmationFunctionality && isOrganisation
      ? [
          {
            name: 'confirmationStatus',
            label: t('userList.userConfirmation'),
            options: uniq(rows.map(r => r.confirmationStatus)),
            matchFn: (row, selected) =>
              selected.includes(row.confirmationStatus),
          },
        ]
      : []),
    {
      name: 'authMethod',
      label: t('userList.authMethod'),
      options: uniq(rows.map(r => r.authMethod)),
      matchFn: (row, selected) => selected.includes(row.authMethod),
    },
  ].filter(f => f.options.length > 0)

  return (
    <JuralioUsersTable
      handleRowClick={props.handleRowClick}
      columns={columns}
      rows={rows}
      filters={filters}
      organisationId={organisation?.id}
      isCurrentUserSysadmin={props.isCurrentUserSysadmin}
      isCurrentUserOrgOwner={props.isCurrentUserOrgOwner}
      isOrganisation={props.isOrganisation}
      isSysadminTable={props.isSysadminTable}
      currentUserTitleSize="subtitle1"
    />
  )
}

export default withLoader(200)(JuralioUsersTableContainer)
