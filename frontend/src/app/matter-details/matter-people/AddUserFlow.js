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
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import EyeIcon from '@mui/icons-material/Visibility'
import SettingsIcon from '@mui/icons-material/Settings'
import AlertIcon from '@mui/icons-material/ReportProblem'

import {
  Box,
  Button,
  Checkbox,
  DialogContent,
  FormControl,
  FormControlLabel,
  MenuItem,
  Popper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioChip from '../../../components/data-display/juralio-chip/JuralioChip'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import AddUserEmailMessageEditor from './AddUserEmailMessageEditor'
import juralioColours from '../../../theme/juralio-colours'
import JurFullAccess from '../../../assets/images/JurFullAccess'
import JurViewAdmin from '../../../assets/images/JurViewAdmin'
import { useSelector } from 'react-redux'
import RenderIfVisible from '../../improved-taskmap/taskmap-helpers/render-if-visible'
import { uniq } from 'lodash'

const useStyles = makeStyles()(theme => ({
  root: {},
  addUserFlowWrapper: {
    maxHeight: 200,
    minHeight: 50,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  userChips: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    height: theme.spacing(35),
  },
  chip: {
    padding: theme.spacing(1),
  },
  userFullname: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '-5px',
  },
  userNameContainer: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  username: {
    marginLeft: theme.spacing(1),
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    paddingTop: theme.spacing(1),
  },
  rolesContainer: {
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterAccessText: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  textWithIcon: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  matterAccessForm: {
    maxWidth: theme.spacing(10),
    marginLeft: theme.spacing(2),
  },
  dialogHeaderTitle: {
    fontWeight: 'bold',
  },
  cantAdmin: {
    fontStyle: 'italic',
    fontWeight: 1,
  },
  endAdornment: { top: 12 },
  emailOptions: {
    width: '80%',
    marginTop: theme.spacing(),
  },
  emailCheckbox: {
    marginLeft: '11px',
  },
  iconClass: {
    paddingRight: theme.spacing(1),
  },
  formHeaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  icon: {
    marginTop: theme.spacing(0.5),
  },
  alertIcon: {
    fontSize: '15px',
    marginTop: '1px',
    marginLeft: '4px',
  },
  infoIcon: {
    marginLeft: '4px',
    color: juralioColours.darkText.secondary,
  },
  divFlex: {
    display: 'flex',
  },
  autoCompleteWrapper: {
    width: '80%',
  },
  permissionsWrapper: {
    verticalAlign: 'top',
    height: ' -webkit-fill-available',
  },
  limitedAccessNote: {
    color: juralioColours.darkText.secondary,
    marginTop: '-16px',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(1.5),
  },
  pointerEventsAuto: {
    '&&': {
      pointerEvents: 'auto',
    },
  },
  userResultContainer: {
    minWidth: '350px',
    maxWidth: '350px',
  },
}))

//workaround for popper not sitting correctly due to overflow
const CustomPopper = props => {
  return (
    <Popper
      {...props}
      // Set the placement to 'right-start' to show the options to the right of the input
      placement="bottom-start"
    />
  )
}

const AddUserFlow = props => {
  const { classes } = useStyles()
  const { isMobileView, addedUsers } = props
  const { t } = useTranslation()
  const isViewOnly = useIsViewOnly({ activities: [] })
  const [permissionsValue, setPermissionsValue] = useState(0)
  const [accessMenuOpen, setAccessMenuOpen] = useState(false)
  const groups = useSelector(
    state => state.matterDetails?.overview?.positionsOfGroups
  )
  const [validGroups, setValidGroups] = useState([])
  const matterGroups = groups?.map(x => x.group.id)

  const addedUsersGroups = uniq(
    addedUsers?.map(x => parseInt(x.organisationGroup?.id))
  )

  useEffect(() => {
    if (validGroups?.length === 0 && groups) {
      setValidGroups(groups.map(x => x.group.id))
    } else {
      addedUsersGroups.forEach(group => {
        if (!validGroups.includes(group) && validGroups.length === 1) {
          setValidGroups([...validGroups, group])
        }
      })
    }
    //eslint-disable-next-line
  }, [addedUsers, groups])

  const getLoadingText = () => {
    if (props.isLoadingUsers) {
      return (
        <Typography data-test="add-user-flow-autocomplete-loading">
          {t('common.loading')}
        </Typography>
      )
    } else {
      return (
        <Typography data-test="add-user-flow-autocomplete-no-options">
          {t('addUsersDialog.noOptions')}
        </Typography>
      )
    }
  }

  if (props.matterIsClosed) return null

  const renderUser = (params, user, state) => {
    return (
      <div className={classes.userResultContainer}>
        <RenderIfVisible defaultHeight={'100px'}>
          <div
            className={classes.userNameContainer}
            data-test="add-user-flow-autocomplete-option"
            {...params}
          >
            <UserAvatar user={user} />
            <div>
              <Typography variant="body2" className={classes.userFullname}>
                {user.firstname || user.lastname
                  ? formatUserDisplayName(user, false, false)
                  : user.username}
              </Typography>
              {(user.firstname || user.lastname) && (
                <Typography
                  variant="caption"
                  className={classes.username}
                  data-test="add-user-flow-autocomplete-username"
                >
                  {user.username}
                </Typography>
              )}
              <Box display={'flex'}>
                <Typography
                  variant="caption"
                  className={classes.username}
                  data-test="add-user-flow-autocomplete-username"
                >
                  {t('addUsersDialog.group')} {user.organisationGroup?.name}
                </Typography>
                {!matterGroups?.includes(
                  parseInt(user.organisationGroup?.id)
                ) && (
                  <Tooltip title={t('addUsersDialog.groupNotInMatter')}>
                    <AlertIcon className={classes.alertIcon} />
                  </Tooltip>
                )}
              </Box>
            </div>
          </div>
        </RenderIfVisible>
      </div>
    )
  }

  const handlePermissionChange = e => {
    setPermissionsValue(e.target.value)
    props.handleMatterAccess(e)
  }

  const handleWrappedPermissionChange = value => {
    setPermissionsValue(value)
    props.handleMatterAccess({ target: { value } })
    setAccessMenuOpen(false)
  }

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PersonAddIcon className={classes.addIcon} />}
        onClick={() => props.openDialogHandler()}
        disabled={isViewOnly}
        data-test="add-user-matter-button"
      >
        {t('addUsersDialog.dialogTitle')}
      </Button>
      {props.showAddUserDialog && (
        <JuralioDialog
          disabled={props.submitButtonDisabled}
          open={true}
          titleText={t('addUsersDialog.title')}
          titleIcon={PersonAddIcon}
          handleCancel={props.closeDialogHandler}
          onClose={props.closeDialogHandler}
          actionLabel={t('addUsersDialog.action')}
          handleAction={props.addUsersSubmitDialogHandler}
          fullScreen={isMobileView}
          showLoadingBar={props.showLoadingBar}
          loadingText={t('addUsersDialog.loadingText', {
            count: addedUsers.length,
          })}
        >
          <DialogContent id="dialog-content" data-test="dialog-content">
            <div className={classes.divFlex}>
              <Typography
                className={classes.dialogHeaderTitle}
                variant="subtitle2"
              >
                {t('addUsersDialog.subtitle')}
              </Typography>
            </div>
            <div
              className={classes.addUserFlowWrapper}
              onKeyDown={e => e.stopPropagation()}
            >
              <div className={classes.autoCompleteWrapper}>
                <Autocomplete
                  getOptionDisabled={option => {
                    if (
                      validGroups?.length === 1 ||
                      validGroups?.includes(
                        parseInt(option.organisationGroup?.id)
                      )
                    ) {
                      return false
                    } else {
                      return true
                    }
                  }}
                  PopperComponent={CustomPopper}
                  disableCloseOnSelect
                  data-test="add-user-flow-autocomplete"
                  loading={true}
                  loadingText={getLoadingText()}
                  multiple
                  id="tags-outlined"
                  classes={{ endAdornment: classes.endAdornment }}
                  options={
                    props.orgUsersNotInMatter ? props.orgUsersNotInMatter : []
                  }
                  onChange={(event, value) => {
                    if (
                      value.filter(u => u.isExternal).length > 0 &&
                      permissionsValue === 2
                    ) {
                      setPermissionsValue(0)
                    }
                    if (value.length === 0) {
                      setValidGroups(groups.map(x => x.group.id))
                    }
                    props.addUser(value)
                  }}
                  getOptionLabel={option => option.username}
                  renderOption={renderUser}
                  filterSelectedOptions
                  renderValue={(value, getItemProps) =>
                    value.map((user, index) => (
                      <div
                        key={user.id}
                        className={classes.chip}
                        data-test="add-user-flow-autocomplete-user-chip"
                      >
                        <JuralioChip
                          user={user}
                          compactAvatar={true}
                          handleChipDelete={() => props.handleChipDelete(user)}
                          {...getItemProps({ index })}
                        />
                      </div>
                    ))
                  }
                  filterOptions={(options, state) =>
                    options.filter(option =>
                      `${option.firstname?.toLowerCase()} ${option.lastname?.toLowerCase()} (${option.username.toLowerCase()})`.includes(
                        state.inputValue.toLowerCase()
                      )
                    )
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="standard"
                      data-test="add-user-flow-autocomplete-text-field"
                      sx={{
                        '& .MuiInput-root': {
                          '&::before': {
                            borderBottom: 'none !important',
                          },
                          '&::after': {
                            borderBottom: 'none !important',
                          },
                        },
                      }}
                      slotProps={{
                        ...params.slotProps,
                        input: {
                          // Preserve the Autocomplete-provided input slot props
                          // (incl. the anchor ref) — overwriting them drops the
                          // ref and makes focus() throw on a null input (MUI 9).
                          ...params.slotProps?.input,
                          sx: {
                            maxHeight: 100,
                            overflowY: 'scroll',
                            border: '1px solid',
                            borderColor: '#dfdfdf',
                            borderRadius: '8px',
                            '& .MuiAutocomplete-input': {
                              minWidth: '10px !important',
                            },
                            overflowX: 'hidden',
                          },
                        },
                      }}
                    />
                  )}
                  value={addedUsers}
                />
              </div>

              <div className={classes.permissionsWrapper}>
                <Tooltip
                  placement="top"
                  title={
                    permissionsValue === 0
                      ? t('matterAdmin.people.viewEdit')
                      : permissionsValue === 1
                        ? t('matterAdmin.people.viewOnly')
                        : permissionsValue === 2
                          ? t('matterAdmin.people.noAccess')
                          : permissionsValue === 3
                            ? t('matterAdmin.people.viewAdmin')
                            : t('matterAdmin.people.fullAccess')
                  }
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    data-test="matter-access"
                    className={classes.matterAccessForm}
                  >
                    <Select
                      value={permissionsValue}
                      variant="outlined"
                      open={accessMenuOpen}
                      onOpen={() => setAccessMenuOpen(true)}
                      onClose={() => setAccessMenuOpen(false)}
                      onChange={e => handlePermissionChange(e)}
                      // startAdornment=
                      renderValue={() =>
                        permissionsValue === 0 ? (
                          <EditIcon className={classes.icon} />
                        ) : permissionsValue === 1 ? (
                          <EyeIcon className={classes.icon} />
                        ) : permissionsValue === 2 ? (
                          <SettingsIcon className={classes.icon} />
                        ) : permissionsValue === 3 ? (
                          <JurViewAdmin className={classes.icon} />
                        ) : (
                          <JurFullAccess size="large" />
                        )
                      }
                    >
                      <MenuItem data-test="view-edit" value={0}>
                        {t('matterAdmin.people.viewEdit')}
                      </MenuItem>
                      <MenuItem data-test="view-only" value={1}>
                        {t('matterAdmin.people.viewOnly')}
                      </MenuItem>
                      <Tooltip
                        title={
                          addedUsers.filter(u => u.isExternal).length ===
                          addedUsers.length
                            ? t('matterAdmin.people.externalCantBeAdmin')
                            : ''
                        }
                      >
                        <MenuItem
                          disabled={
                            addedUsers.filter(u => u.isExternal).length ===
                            addedUsers.length
                          }
                          onClick={() =>
                            addedUsers.filter(u => u.isExternal).length !==
                              addedUsers.length &&
                            handleWrappedPermissionChange(3)
                          }
                          className={classes.pointerEventsAuto}
                          data-test="view-admin"
                          value={3}
                        >
                          {t('matterAdmin.people.viewAdmin')}
                        </MenuItem>
                      </Tooltip>
                      <Tooltip
                        title={
                          addedUsers.filter(u => u.isExternal).length ===
                          addedUsers.length
                            ? t('matterAdmin.people.externalCantBeAdmin')
                            : ''
                        }
                      >
                        <MenuItem
                          disabled={
                            addedUsers.filter(u => u.isExternal).length ===
                            addedUsers.length
                          }
                          onClick={() =>
                            addedUsers.filter(u => u.isExternal).length !==
                              addedUsers.length &&
                            handleWrappedPermissionChange(4)
                          }
                          className={classes.pointerEventsAuto}
                          data-test="full-access"
                          value={4}
                        >
                          {t('matterAdmin.people.fullAccess')}
                        </MenuItem>
                      </Tooltip>

                      <Tooltip
                        title={
                          addedUsers.filter(u => u.isExternal).length > 0
                            ? t('matterAdmin.people.externalCantBeAdmin')
                            : ''
                        }
                      >
                        <MenuItem
                          disabled={
                            addedUsers.filter(u => u.isExternal).length > 0
                          }
                          onClick={() =>
                            addedUsers.filter(u => u.isExternal).length === 0 &&
                            handleWrappedPermissionChange(2)
                          }
                          className={classes.pointerEventsAuto}
                          data-test="no-access"
                          value={2}
                        >
                          {t('matterAdmin.people.noAccess')}
                        </MenuItem>
                      </Tooltip>
                    </Select>
                  </FormControl>
                </Tooltip>
              </div>
            </div>
            {addedUsers.filter(u => u.isExternal).length > 0 &&
              addedUsers.filter(u => !u.isExternal).length > 0 &&
              permissionsValue === 3 && (
                <Typography
                  className={classes.limitedAccessNote}
                  variant="caption"
                >
                  {t('matterAdmin.people.limitedNoAdminAccess')}
                </Typography>
              )}
            {props.isCostsSetupComplete && (
              <div>
                <div className={classes.formHeaderWrapper}>
                  <Tooltip
                    title={
                      props.isAdministerMatterDisabled || props.costDisabled
                        ? t('matterAdmin.people.disabledCostsTooltip')
                        : ''
                    }
                  >
                    <FormControl
                      disabled={
                        props.isAdministerMatterDisabled || props.costDisabled
                      }
                      component="fieldset"
                    >
                      <Checkbox
                        data-test="assign-phase-checkbox"
                        checked={props.costAccess}
                        onChange={() =>
                          props.handleCostAccessMatter(props.costAccess)
                        }
                      />
                    </FormControl>
                  </Tooltip>
                  <Typography
                    variant="subtitle2"
                    className={classes.textWithIcon}
                  >
                    {t('matterAdmin.people.costTitle')}
                  </Typography>
                  <Tooltip title={t('matterAdmin.people.costSubtitle')}>
                    <InfoIcon className={classes.infoIcon} />
                  </Tooltip>
                </div>
              </div>
            )}
            <FormControl className={classes.emailOptions}>
              <FormControlLabel
                control={
                  <Checkbox
                    data-test="send-email-checkbox"
                    color="primary"
                    className={classes.emailCheckbox}
                    checked={props.sendEmail}
                    onClick={() => {
                      props.handleSendEmailChange(!props.sendEmail)
                    }}
                  />
                }
                label={t('matterAdmin.people.sendEmailNotification')}
              ></FormControlLabel>
              {props.sendEmail && (
                <div>
                  <AddUserEmailMessageEditor
                    disabled={!props.sendEmail}
                    handleMessageUpdate={props.handleMessageUpdate}
                  />
                </div>
              )}
            </FormControl>
          </DialogContent>
        </JuralioDialog>
      )}
    </div>
  )
}

AddUserFlow.propTypes = {
  showAssignRoles: PropTypes.bool,
  orgUsersNotInMatter: PropTypes.array,
}

export default AddUserFlow
