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

import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import { FormControl, MenuItem, Select, Tooltip, Box } from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'react-i18next'
import { connect, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { getHomeUrl } from '../../../../components/navigation/common/location-context-helper'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import {
  renderUserColumn,
  useUserColumnStyles,
} from '../../../../services/helpers/table/juralio-table-common-columns'
import { renderHeaderWithToolTip } from '../../../../services/helpers/table/juralio-table-helper'
import { userNameComparator } from '../../../../services/helpers/table/juralio-table-sort-comparators'
import withRouter from '../../../../services/navigation/WithRouter'
import juralioColours from '../../../../theme/juralio-colours'
import { OPERATION_MODE } from '../../../constants'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import processData from './matter-people-table-data-provider'
import MatterPeopleTable from './MatterPeopleTable'
import { hasCompletedCostSetupForPosition } from '../../../../services/organisation/organisation-helper'
import { useOrganisationData } from '../../../../hooks/costs-hook'
//import matterService from '../../../../services/matter/matter-service'
import { fetchMatterOverview } from '../../matter-details-actions'
import { useUserPosition } from '../../../../hooks/user-hooks'

const useStyles = makeStyles()(theme => ({
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

const confirmationOptions = {
  headerIcon: PeopleIcon,
  actionText: 'common.remove',
  cancelText: 'common.cancel',
  titleText: 'matterAdmin.people.removeUserDialogTitle',
  promptText: 'matterAdmin.people.removeUserDialogBody',
  usageContext: 'MatterAdminPeople',
  cancel: () => {},
}

// Handles display of people on a Matter team.
const MatterPeopleTableContainer = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes } = useStyles()
  const history = useNavigate()
  const userColumnClasses = useUserColumnStyles()

  const orgData = useOrganisationData()
  const userPosition = useUserPosition(props.matter)
  const isCostsSetupComplete = hasCompletedCostSetupForPosition(
    orgData,
    userPosition.positionData?.name
  )

  const isOnlyAdminRole = tm =>
    tm.matterAdminId > 0 && !tm.teamMemberId && !tm.matterViewerId

  const isCurrentUser = tm => tm.user.username === props.currentUser.username

  const isViewOnly = useIsViewOnly({ activities: [] })

  const isDisabled = user =>
    props.mode === OPERATION_MODE.VIEW || user.user.isExternal || isViewOnly

  const isOnlyAdmin = tm => {
    const admins = props.people.filter(p => p.matterAdminId)
    if (admins.length < 2 && admins[0]?.user === tm.user) {
      return true
    } else return false
  }

  const removeUserFromTeam = user => {
    confirmationOptions.promptText = t(
      'matterAdmin.people.removeUserDialogBody'
    )
    if (user.user.firstname && user.user.lastname) {
      confirmationOptions.titleExtra = `: ${user.user.firstname} ${user.user.lastname}`
    } else {
      confirmationOptions.titleExtra = null
    }

    if (isCurrentUser(user)) {
      confirmationOptions.promptText = t(
        'matterAdmin.people.removeSelfAdminPrompt'
      )
      dispatch(
        displayConfirmationDialog(confirmationOptions, () => {
          props.teamActions
            .removeUser(user, props.matterId)
            .then(() => history(getHomeUrl()))
        })
      )
    } else {
      dispatch(
        displayConfirmationDialog(confirmationOptions, () => {
          props.teamActions.removeUser(user, props.matterId).then(() => {
            if (
              props.people
                .map(x => x.organisationGroup?.id)
                .filter(x => x === user.organisationGroup?.id).length === 1
            ) {
              matterService
                .deleteGroupFromMatter(
                  props.matterId,
                  user.organisationGroup.id
                )
                .then(() => dispatch(fetchMatterOverview(props.matterId)))
            }
          })
        })
      )
    }
  }

  const removeAdmin = user => {
    if (isCurrentUser(user)) {
      const confirmOptions = {
        actionText: t('common.confirm'),
        titleText: t('matterAdmin.people.removeSelfAdmin'),
        promptText: t('matterAdmin.people.removeSelfAdminPrompt'),
        usageContext: 'removeSelfMatterAdmin',
        headerIcon: PeopleIcon,
        dontTranslatePromptText: true,
      }
      if (user.user.firstname && user.user.lastname) {
        confirmOptions.titleExtra = `: ${user.user.firstname} ${user.user.lastname}`
      } else {
        confirmOptions.titleExtra = null
      }
      dispatch(
        displayConfirmationDialog(confirmOptions, () => {
          props.teamActions
            .removeAdmin(user.matterAdminId, props.matterId)
            .then(() => history(getHomeUrl()))
        })
      )
    } else {
      props.teamActions.removeAdmin(user.matterAdminId, props.matterId)
    }
  }

  const handleMatterAccess = (tm, user, value) => {
    if (value === 0) {
      props.teamActions.addEditor(user.id, props.matterId).then(() => {
        if (tm.matterViewerId > 0) {
          props.teamActions.removeViewOnly(tm.matterViewerId, props.matterId)
        }
        if (tm.matterAdminId > 0) {
          removeAdmin(tm)
        }
      })
    } else if (value === 1) {
      props.teamActions.addViewer(user.id, props.matterId).then(() => {
        if (tm.matterAdminId > 0) {
          removeAdmin(tm)
        }
        if (tm.teamMemberId > 0) {
          props.teamActions.removeEditor(tm.teamMemberId, props.matterId)
        }
      })
    } else if (value === 2) {
      if (tm.teamMemberId > 0) {
        props.teamActions.removeEditor(tm.teamMemberId, props.matterId)
      }
      if (tm.matterViewerId > 0) {
        props.teamActions.removeViewOnly(tm.matterViewerId, props.matterId)
      }
      if (tm.costsId > 0) {
        props.teamActions.removeCosts(tm.costsId, props.matterId)
      }
      if (!tm.matterAdminId > 0) {
        props.teamActions.addAdmin(user.id, props.matterId)
      }
    } else if (value === 3) {
      props.teamActions.addEditor(user.id, props.matterId).then(() => {
        if (!tm.matterAdminId > 0) {
          props.teamActions.addAdmin(user.id, props.matterId)
        }
        if (tm.matterViewerId > 0) {
          props.teamActions.removeViewOnly(tm.matterViewerId, props.matterId)
        }
      })
    } else if (value === 4) {
      props.teamActions.addViewer(user.id, props.matterId).then(() => {
        if (!tm.matterAdminId > 0) {
          props.teamActions.addAdmin(user.id, props.matterId)
        }
        if (tm.teamMemberId > 0) {
          props.teamActions.removeEditor(tm.teamMemberId, props.matterId)
        }
      })
    }
  }

  const toggleCosts = tm => {
    if (tm.costsId) {
      props.teamActions.removeCosts(tm.costsId, props.matterId)
    } else {
      props.teamActions.addCosts(tm.user.id, props.matterId)
    }
  }

  const columns = [
    {
      field: 'user',
      headerName: t('common.name'),
      flex: 2,
      filterable: false,
      sortable: true,
      sortComparator: userNameComparator,
      renderCell: params =>
        renderUserColumn(
          t,
          userColumnClasses.classes,
          params.row.user,
          props.currentUser.username
        ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    // {
    //   field: 'groupName',
    //   headerName: t('common.group'),
    //   flex: 1,
    //   filterable: false,
    //   getApplyQuickFilterFn: () => () => false,
    // },
    {
      field: 'accessLevel',
      headerName: 'Matter content',
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => {
        const tm = params.row._tm
        return (
          <FormControl data-test="matter-content">
            <Select
              value={params.row.accessLevel}
              onChange={e =>
                handleMatterAccess(tm, params.row.user, e.target.value)
              }
              disabled={isViewOnly || props.isClosed}
            >
              <MenuItem
                disabled={isOnlyAdmin(tm)}
                data-test={isOnlyAdmin(tm) ? 'view-edit-disabled' : 'view-edit'}
                value={0}
              >
                <Tooltip
                  title={
                    isOnlyAdmin(tm)
                      ? t('matterAdmin.people.cantRemoveAdmin')
                      : ''
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: 'block', pointerEvents: 'auto' }}
                  >
                    {t('matterAdmin.people.viewEdit')}
                  </Box>
                </Tooltip>
              </MenuItem>
              <MenuItem
                disabled={isOnlyAdmin(tm)}
                data-test="view-only"
                value={1}
              >
                <Tooltip
                  title={
                    isOnlyAdmin(tm)
                      ? t('matterAdmin.people.cantRemoveAdmin')
                      : ''
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: 'block', pointerEvents: 'auto' }}
                  >
                    {t('matterAdmin.people.viewOnly')}
                  </Box>
                </Tooltip>
              </MenuItem>
              <MenuItem
                disabled={isDisabled(tm)}
                data-test="full-access"
                value={3}
              >
                <Tooltip
                  title={
                    isDisabled(tm)
                      ? t('matterAdmin.people.externalCantBeAdmin')
                      : ''
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: 'block', pointerEvents: 'auto' }}
                  >
                    {t('matterAdmin.people.fullAccess')}
                  </Box>
                </Tooltip>
              </MenuItem>
              <MenuItem
                disabled={isDisabled(tm)}
                data-test="view-admin"
                value={4}
              >
                <Tooltip
                  title={
                    isDisabled(tm)
                      ? t('matterAdmin.people.externalCantBeAdmin')
                      : ''
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: 'block', pointerEvents: 'auto' }}
                  >
                    {t('matterAdmin.people.viewAdmin')}
                  </Box>
                </Tooltip>
              </MenuItem>
              <MenuItem
                disabled={isDisabled(tm)}
                data-test={isDisabled(tm) ? 'no-access-disabled' : 'no-access'}
                value={2}
              >
                <Tooltip
                  title={
                    isDisabled(tm)
                      ? t('matterAdmin.people.externalCantBeAdmin')
                      : ''
                  }
                >
                  <Box
                    component="span"
                    sx={{ display: 'block', pointerEvents: 'auto' }}
                  >
                    {t('matterAdmin.people.noAccess')}
                  </Box>
                </Tooltip>
              </MenuItem>
            </Select>
          </FormControl>
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
    ...(isCostsSetupComplete
      ? [
          {
            field: 'costsId',
            headerName: t('entity.costs'),
            flex: 1,
            filterable: false,
            sortable: false,
            renderHeader: () =>
              renderHeaderWithToolTip(
                classes,
                t('entity.costs'),
                t('teamList.costsTooltip')
              ),
            renderCell: params => (
              <Tooltip
                title={
                  isOnlyAdminRole(params.row._tm)
                    ? t('matterAdmin.people.disabledCostsTooltip')
                    : ''
                }
              >
                <span>
                  <Checkbox
                    data-test="is-costs"
                    color="primary"
                    checked={params.row.costsId > 0}
                    disabled={isOnlyAdminRole(params.row._tm)}
                    onChange={() => toggleCosts(params.row._tm)}
                  />
                </span>
              </Tooltip>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    {
      field: 'status',
      headerName: t('common.status'),
      flex: 1,
      filterable: true,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'remove',
      headerName: '',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: params => {
        if (props.isClosed) return null
        return props.people.length < 2 || isOnlyAdmin(params.row._tm) ? null : (
          <IconButton
            aria-label={t('common.delete')}
            data-test="delete-button"
            disabled={isViewOnly}
            onClick={() => removeUserFromTeam(params.row._tm)}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = processData(t, props.people)

  const accessLevelLabels = {
    0: t('matterAdmin.people.viewEdit'),
    1: t('matterAdmin.people.viewOnly'),
    2: t('matterAdmin.people.noAccess'),
    3: t('matterAdmin.people.fullAccess'),
    4: t('matterAdmin.people.viewAdmin'),
  }
  const accessLabelToLevel = Object.fromEntries(
    Object.entries(accessLevelLabels).map(([k, v]) => [v, Number(k)])
  )

  const filters = [
    {
      name: 'accessLevel',
      label: t('matter.overview.matterContent'),
      options: Array.from(
        new Set(rows.map(r => accessLevelLabels[r.accessLevel]).filter(Boolean))
      ),
      matchFn: (row, selected) =>
        selected.map(s => accessLabelToLevel[s]).includes(row.accessLevel),
    },
    {
      name: 'status',
      label: t('common.status'),
      options: Array.from(new Set(rows.map(r => r.status).filter(Boolean))),
      matchFn: (row, selected) => selected.includes(row.status),
    },
  ].filter(f => f.options.length > 0)

  return (
    <MatterPeopleTable
      columns={columns}
      rows={rows}
      filters={filters}
      matterId={props.matterId}
      mode={props.mode}
      teamActions={props.teamActions}
      isLoaded={props.teamL}
    />
  )
}

function mapStateToProps(state) {
  return {
    teamL: state.matterTeam.mainPage.isLoaded, // Makes React rerender when it gets the team
  }
}

export default connect(mapStateToProps)(withRouter(MatterPeopleTableContainer))
