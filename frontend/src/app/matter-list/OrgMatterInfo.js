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

import { mdiArrowLeftCircle } from '@mdi/js'
import Icon from '@mdi/react'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Checkbox,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import JuralioLink from '../../components/navigation/juralio-link/JuralioLink'
import JuralioTable from '../../components/table/JuralioTable'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import {
  addAdmin,
  addCosts,
  addEditor,
  addViewOnly,
  fetchTeam,
  removeAdmin,
  removeCosts,
  removeEditor,
  removeUser,
  removeViewOnly,
} from '../../redux/ducks/matter-team'
import {
  renderUserColumn,
  useUserColumnStyles,
} from '../../services/helpers/table/juralio-table-common-columns'
import { formatUserDisplayName } from '../../services/user/helper/user-format-service'
import juralioColours from '../../theme/juralio-colours'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'
import rawColours from '../../theme/raw-colours'
import { ACTIVITIES, ADMIN, EDITOR } from '../constants'
import AddUserFlowContainer from '../matter-details/matter-people/AddUserFlowContainer'
import { fetchOrgProjects } from '../matter-details/projects/projects-actions'
import {
  generateTitle,
  projectColumns,
  projectData,
} from './org-matter-info-helper'
import { displayConfirmationDialog } from '../global-confirmation-dialog/global-confirmation-dialog-actions'
import { PeopleIcon } from '../../theme/navigation/CommonIcons'
import { useOrganisationData } from '../../hooks/costs-hook'
import { hasCompletedCostSetupForPosition } from '../../services/organisation/organisation-helper'
import { fetchMatterOverview } from '../matter-details/matter-details-actions'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { useUserPosition } from '../../hooks/user-hooks'

const useStyles = makeStyles()(theme => ({
  tableTitle: {
    position: 'relative',
    left: '-60px',
    width: 'calc(100% + 80px)',
    top: '-34px',
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    backgroundColor: rawColours.primary.white.primary,
  },
  padding: {
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
  },
  tabBar: {
    backgroundColor: rawColours.primary.white.primary,
    marginBottom: theme.spacing(2),
    color: juralioColours.darkText.primary,
  },
  tableHeader: {
    paddingLeft: theme.spacing(4),
    marginBottom: '-40px',
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(),
  },
  searchContainer: {
    height: theme.spacing(5),
  },
  textHelper: {
    display: 'flex',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
    width: '30%',
    alignItems: 'center',
    backgroundColor: JuralioNamedColours.beige[100],
  },
  arrowIcon: {
    paddingRight: theme.spacing(1.5),
  },
  matterAdminHelperText: {
    display: 'flex',
    alignItems: 'center',
  },
  matterAdminHelperTextPartial: {
    paddingRight: theme.spacing(0.4),
  },
}))

const TAB_PEOPLE = 0
const TAB_WORKSTREAMS = 1

const OrgMatterInfo = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isViewOnly = useIsViewOnly({ activities: [] })

  const [showDialog, setShowDialog] = useState(false)
  const [roleType, setRoleType] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedTab, setSelectedTab] = useState(TAB_PEOPLE)
  const history = useNavigate()

  const projects = useSelector(state => state.project.orgProjects)
  const currentUser = useSelector(state => state.auth.data.details.username)
  const team = useSelector(state => state.matterTeam.mainPage.team)
  const teamLoaded = useSelector(state => state.matterTeam.mainPage.isLoaded)

  const userColumnClasses = useUserColumnStyles()
  const orgData = useOrganisationData()
  const userPosition = useUserPosition(props.selectedMatter)
  const isCostsSetupComplete = hasCompletedCostSetupForPosition(
    orgData,
    userPosition.positionData?.name
  )

  const isUserMatterAdmin = props.selectedMatter.activities?.includes(
    ACTIVITIES.MATTER_ADMIN
  )

  const handleChange = (event, newValue) => setSelectedTab(newValue)

  const isOnlyAdmin = teamMember => {
    const admins = team.filter(u => u.matterAdminId)
    return (
      admins.length >= 1 &&
      admins.length < 2 &&
      admins[0].user.id === teamMember?.user.id
    )
  }

  const openDialog = (roleType, teamMember) => {
    setRoleType(roleType)
    if (roleType === ADMIN) {
      if (teamMember.matterAdminId) {
        setShowDialog(true)
        setSelectedUser(teamMember)
      } else {
        dispatch(addAdmin(teamMember.user.id, props.selectedMatter.id))
      }
    }
    if (roleType === EDITOR) {
      if (teamMember.teamMemberId) {
        setShowDialog(true)
        setSelectedUser(teamMember)
      } else {
        dispatch(addEditor(teamMember.user.id, props.selectedMatter.id))
      }
    }
  }

  const closeDialog = () => setShowDialog(false)

  const toggleAdmin = teamMember => {
    dispatch(removeAdmin(teamMember.matterAdminId, props.selectedMatter.id))
    closeDialog()
  }

  const toggleEditor = teamMember => {
    dispatch(removeEditor(teamMember.teamMemberId, props.selectedMatter.id))
    closeDialog()
  }

  const handleMatterAccess = (teamMember, value) => {
    if (value === 0) {
      dispatch(addEditor(teamMember.user.id, props.selectedMatter.id)).then(
        () => {
          if (teamMember.matterViewerId > 0) {
            dispatch(
              removeViewOnly(teamMember.matterViewerId, props.selectedMatter.id)
            )
          }
          if (teamMember.matterAdminId > 0) openDialog(ADMIN, teamMember)
        }
      )
    } else if (value === 1) {
      dispatch(addViewOnly(teamMember.user.id, props.selectedMatter.id)).then(
        () => {
          if (teamMember.teamMemberId > 0) {
            dispatch(
              removeEditor(teamMember.teamMemberId, props.selectedMatter.id)
            )
          }
          if (teamMember.matterAdminId > 0) openDialog(ADMIN, teamMember)
        }
      )
    } else if (value === 2) {
      if (teamMember.teamMemberId > 0) {
        dispatch(removeEditor(teamMember.teamMemberId, props.selectedMatter.id))
      }
      if (teamMember.matterViewerId > 0) {
        dispatch(
          removeViewOnly(teamMember.matterViewerId, props.selectedMatter.id)
        )
      }
      if (!teamMember.matterAdminId > 0) {
        dispatch(addAdmin(teamMember.user.id, props.selectedMatter.id))
      }
    } else if (value === 3) {
      dispatch(addViewOnly(teamMember.user.id, props.selectedMatter.id)).then(
        () => {
          if (!teamMember.matterAdminId > 0) {
            dispatch(addAdmin(teamMember.user.id, props.selectedMatter.id))
          }
          if (teamMember.teamMemberId > 0) {
            dispatch(
              removeEditor(teamMember.teamMemberId, props.selectedMatter.id)
            )
          }
        }
      )
    } else if (value === 4) {
      dispatch(addAdmin(teamMember.user.id, props.selectedMatter.id)).then(
        () => {
          if (teamMember.matterViewerId > 0) {
            dispatch(
              removeViewOnly(teamMember.matterViewerId, props.selectedMatter.id)
            )
          }
          if (!teamMember.teamMemberId > 0) {
            dispatch(addEditor(teamMember.user.id, props.selectedMatter.id))
          }
        }
      )
    }
  }

  const removeFromTeam = teamMember => {
    const confirmationOptions = {
      headerIcon: PeopleIcon,
      actionText: 'common.remove',
      cancelText: 'common.cancel',
      titleText: 'matterAdmin.people.removeUserDialogTitle',
      promptText: t('matterAdmin.people.removeUserDialogBody'),
      usageContext: 'MatterAdminPeople',
      cancel: () => {},
    }
    if (teamMember.user.firstname && teamMember.user.lastname) {
      confirmationOptions.titleExtra = `: ${teamMember.user.firstname} ${teamMember.user.lastname}`
    } else {
      confirmationOptions.titleExtra = null
    }
    dispatch(
      displayConfirmationDialog(confirmationOptions, () => {
        dispatch(removeUser(teamMember, props.selectedMatter.id))
      })
    )
  }

  const handleCostsAccess = teamMember => {
    if (teamMember.costsId) {
      dispatch(removeCosts(teamMember.costsId, props.selectedMatter.id))
    } else {
      dispatch(addCosts(teamMember.user.id, props.selectedMatter.id))
    }
  }

  const teamRows = (team ?? []).map(tm => ({
    id: tm.user.id,
    _tm: tm,
    user: tm.user,
    groupName: tm?.organisationGroup?.name ?? '',
    accessLevel:
      tm.teamMemberId > 0 && tm.matterAdminId > 0
        ? 4
        : tm.matterAdminId > 0 && tm.matterViewerId > 0
          ? 3
          : tm.teamMemberId > 0
            ? 0
            : tm.matterViewerId > 0
              ? 1
              : 2,
    costsId: tm.costsId,
    role: tm.matterAdminId > 0 ? t('entity.admin') : t('entity.member'),
    _search: `${tm.user.firstname ?? ''} ${
      tm.user.lastname ?? ''
    }`.toLowerCase(),
  }))

  const teamCols = [
    {
      field: 'user',
      headerName: t('entity.name'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params =>
        renderUserColumn(
          t,
          userColumnClasses.classes,
          params.row.user,
          currentUser
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
      headerName: t('matter.overview.matterContent'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => {
        const tm = params.row._tm
        return (
          <FormControl data-test="matter-content">
            <Select
              disabled={isViewOnly}
              value={params.row.accessLevel}
              onChange={e => handleMatterAccess(tm, e.target.value)}
            >
              <MenuItem
                disabled={isOnlyAdmin(tm)}
                data-test="view-edit"
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
                disabled={tm.user.isExternal}
                data-test="no-access"
                value={2}
              >
                <Tooltip
                  title={
                    tm.user.isExternal
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
              <MenuItem
                disabled={tm.user.isExternal}
                data-test="viewAdmin"
                value={3}
              >
                <Tooltip
                  title={
                    tm.user.isExternal
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
                disabled={tm.user.isExternal}
                data-test="fullAccess"
                value={4}
              >
                <Tooltip
                  title={
                    tm.user.isExternal
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
            renderCell: params => (
              <span>
                <Checkbox
                  data-test="cost-access"
                  color="primary"
                  checked={params.row.costsId > 0}
                  onChange={() => handleCostsAccess(params.row._tm)}
                  disabled={
                    isViewOnly ||
                    !params.row._tm.user?.enabled ||
                    (params.row._tm.teamMemberId === 0 &&
                      params.row._tm.matterViewerId === 0)
                  }
                />
              </span>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
    {
      field: 'remove',
      headerName: t('entity.remove'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <IconButton
          aria-label={t('common.delete')}
          data-test="delete-button"
          disabled={isViewOnly}
          onClick={() => {
            if (!isOnlyAdmin(params.row._tm)) {
              removeFromTeam(params.row._tm)
            } else {
              dispatch(showSnackbar(t(`Can't remove only admin from matter`)))
            }
          }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'role',
      headerName: t('entity.role'),
      flex: 1,
      filterable: true,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const projectNameSorted = projects.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    return aName.localeCompare(bName)
  })
  const sortedProjects = projectNameSorted.sort((a, b) => b.active - a.active)

  useEffect(() => {
    dispatch(fetchMatterOverview(props.selectedMatter.id))
    dispatch(fetchOrgProjects(props.selectedMatter.id))
    dispatch(fetchTeam(props.selectedMatter.id))
  }, [dispatch, props.selectedMatter.id])

  return (
    <div>
      <div className={classes.tableHeader}>
        {generateTitle(props, classes, t, selectedTab, handleChange)}
      </div>
      {selectedTab === TAB_PEOPLE && (
        <Fragment>
          <div className={classes.wrapper}>
            <div className={classes.searchContainer}>
              <AddUserFlowContainer
                selectedMatter={props.selectedMatter}
                matterTeam={team}
                teamLoaded={teamLoaded}
                addEditor={addEditor}
                addAdmin={addAdmin}
                addViewOnly={addViewOnly}
                assignAdminRoleInitialValue={true}
                assignEditorRoleInitialValue={false}
              />
            </div>
            {team.length < 2 && (
              <div className={classes.textHelper} data-test="team-helper">
                <Icon
                  path={mdiArrowLeftCircle}
                  size={1.5}
                  color={rawColours.primary.primary.main}
                  className={classes.arrowIcon}
                />
                <Typography>{t('teamMembership.helper')}</Typography>
              </div>
            )}
          </div>
          <JuralioTable
            columns={teamCols}
            rows={teamRows}
            filters={[
              {
                name: 'role',
                label: t('entity.role'),
                options: Array.from(
                  new Set(teamRows.map(r => r.role).filter(Boolean))
                ),
                matchFn: (row, selected) => selected.includes(row.role),
              },
            ].filter(f => f.options.length > 0)}
            rowDataTest="matters-user-list-item"
          />
        </Fragment>
      )}
      {selectedTab === TAB_WORKSTREAMS && (
        <div data-test="workstreams-helper">
          {isUserMatterAdmin ? (
            <div className={classes.matterAdminHelperText}>
              <Typography className={classes.matterAdminHelperTextPartial}>
                {t('organisationAdmin.workstreams.helperPartial')}
              </Typography>
              <JuralioLink
                onClick={() =>
                  history(`/matteradmin/${props.selectedMatter.id}`, {
                    state: { tabItem: 2 },
                  })
                }
                value={t('organisationAdmin.workstreams.helperLink')}
                data-test="link-to-matter-admin"
              />
            </div>
          ) : (
            <Typography>{t('organisationAdmin.workstreams.helper')}</Typography>
          )}
          <JuralioTable
            columns={projectColumns(classes, t, dispatch, true, props)}
            rows={projectData(sortedProjects, t)}
          />
        </div>
      )}
      {showDialog && (
        <JuralioDialog
          open={true}
          titleText={t('organisationAdmin.matters.removeMatterRole.prompt', {
            role: roleType,
          })}
          handleCancel={() => setShowDialog(false)}
          onClose={() => setShowDialog(false)}
          actionLabel={t('sysAdmin.organisations.confirm')}
          handleAction={() =>
            roleType === ADMIN
              ? toggleAdmin(selectedUser)
              : toggleEditor(selectedUser)
          }
        >
          <DialogContent>
            <Typography
              data-test="remove-matter-role-confirmation-content"
              variant={'body2'}
            >
              {t(
                'organisationAdmin.matters.removeMatterRole.confirmationPart1of2'
              )}
              <b>
                {' '}
                {selectedUser && formatUserDisplayName(selectedUser.user)}{' '}
              </b>
              {t(
                'organisationAdmin.matters.removeMatterRole.confirmationPart2of2',
                { role: roleType }
              )}
            </Typography>
          </DialogContent>
        </JuralioDialog>
      )}
    </div>
  )
}

export default OrgMatterInfo
