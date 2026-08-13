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

import { Button, Popover, TextField, Tooltip, Typography } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../../app/constants'
import UsersControlContainer from '../../../app/users/UsersControlContainer'
import LightButton from '../../../components/inputs/light-button/LightButton'
import { addUserToSubtasksSteps } from '../../../services/tour/steps/add-user-to-subtasks-steps'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import colourModifiers from '../../../theme/color-modifiers'
import { PeopleIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'
import UserList from '../../layouts/user-list/UserList'
import CreatePlaceholderDialog from '../../../app/matter-details/placeholders/CreatePlaceholderDialog'
import { useLocation } from 'react-router'
import { getMatterIdFromLocation } from '../../navigation/common/location-context-helper'
import PlaceholderAvatar from '../../data-display/placeholders/PlaceholderAvatar'
import InfoIcon from '@mui/icons-material/Info'
import { isInTasklistContext } from '../../../services/helpers/route/route-context-helper'
import UserHover from '../../data-display/user/UserHover'

const style = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
  },
  iconColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  content: {},
  topRow: {
    marginLeft: theme.spacing(0),
  },
  lowRow: {
    marginLeft: theme.spacing(1.6),
  },
  peopleIcon: {
    marginBottom: 'auto',
  },
  autocomplete: {
    width: theme.spacing(37.5),
    marginLeft: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  optionLabel: {
    marginLeft: theme.spacing(),
  },
  notRequiredText: {
    color: colourModifiers.secondaryText(rawColours.text.black),
    marginLeft: theme.spacing(0.5),
    marginBottom: theme.spacing(4),
  },
  removalWrapper: {
    display: 'flex',
    flexDirection: 'column',
    color: rawColours.dialog.background,
    width: 'fit-content',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removalButton: {
    width: theme.spacing(26),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removalText: {
    textTransform: 'none',
    color: rawColours.text.black,
  },
  popoverCss: {
    minWidth: 'unset',
    width: 'fit-content',
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
  },
}))

const renderAddButton = (t, onClick, classes, props) => {
  var inPWS = props.isInPrivateWS
  return (
    <>
      {inPWS && (
        <div data-test="add-team-member-button">
          <Button
            variant="outlined"
            onClick={onClick}
            startIcon={<PeopleIcon className={classes.peopleIcon} />}
          >
            {props.addText}
          </Button>
        </div>
      )}
      {!inPWS && (
        <div data-test="add-team-member-button">
          <LightButton
            isNotStarted={
              !props.task || props.task.status === TASK_STATUS.NOT_STARTED
            }
            caption={props.addText || t('taskmapPopover.addTeamMember')}
            isInPrivateWorkstream={true}
            clickHandler={onClick}
            viewOnly={props.viewOnly}
          />
        </div>
      )}
    </>
  )
}
const renderAddSearch = (
  options,
  t,
  classes,
  onSelect,
  onClose,
  setShowPlaceholderDialog,
  setPrefillValue
) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={option =>
        option.user.firstname && option.user.lastname
          ? `${option.user.firstname} ${option.user.lastname}`
          : option.user.username
      }
      key={options.length}
      onInput={(e, v) => {
        setPrefillValue(e.target.value)
      }}
      onChange={(e, v) => {
        onSelect(v)
      }}
      disableCloseOnSelect
      open
      autoHighlight
      data-test="autocomplete-search"
      onKeyDown={e => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
      onBlur={() => {
        onClose()
      }}
      filterOptions={(options, state) => {
        let filteredValue = options.filter(option =>
          `${option.user.firstname?.toLowerCase()} ${option.user.lastname?.toLowerCase()} (${option.user.username.toLowerCase()})${
            option.isPlaceholder
          } `.includes(state.inputValue.toLowerCase())
        )
        if (filteredValue.length === 0 && state.inputValue !== '') {
          filteredValue.push({
            user: {
              isAddPlaceholder: true,
            },
          })
        }
        return filteredValue
      }}
      renderOption={(props, option) => {
        if (option.user.isAddPlaceholder) {
          return (
            <div>
              <Button
                style={{ textTransform: 'none' }}
                data-test="add-as-placeholder"
                onClick={() => {
                  setShowPlaceholderDialog(true)
                }}
              >
                {t('matterAdmin.placeholders.dialog.addAsPlaceholder')}
                <Tooltip
                  title={t('matterAdmin.placeholders.dialog.placeholderInfo')}
                >
                  <InfoIcon
                    className={classes.infoIcon}
                    data-test="info-icon"
                  />
                </Tooltip>
              </Button>
            </div>
          )
        }
        return (
          <Tooltip
            placement="right"
            slotProps={{
              tooltip: {
                sx: {
                  backgroundColor: 'transparent',
                },
              },
            }}
            title={<UserHover user={option.user} />}
          >
            <div style={{ display: 'flex', flexDirection: 'row' }} {...props}>
              {option.isPlaceholder ? (
                <PlaceholderAvatar
                  small
                  placeholderName={
                    option.user.firstname + ' ' + option.user.lastname
                  }
                />
              ) : (
                <UserAvatar small user={option.user} />
              )}

              <Typography
                className={classes.optionLabel}
                data-test="options-label"
              >
                {formatUserDisplayNameAndUserName(option.user)}
              </Typography>
            </div>
          </Tooltip>
        )
      }}
      renderInput={params => (
        <TextField
          {...params}
          className={classes.autocomplete}
          placeholder={t('taskmapPopover.addTeamMember')}
          inputRef={input => input && input.focus()}
        />
      )}
    />
  )
}
const UserSearch = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [addMode, setAddMode] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [popoverAnchor, setPopoverAnchor] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const tours = useSelector(state => state.tour.tours)
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false)
  const [prefillValue, setPrefillValue] = useState('')
  const taskId = useSelector(state => state.selectedTask.id)
  const selectedTask = useSelector(state => state.selectedTask)

  const location = useLocation()

  const dispatch = useDispatch()
  const isAddEnabled = !addMode && !props.isReadOnly

  const closeTourForever = () => {
    tourService.completeTour('addToSubtasks').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }
  const triggerAddtoSubtasksTour = () => {
    const sessionTours = JSON.parse(
      window.sessionStorage.getItem('juralio_tours')
    )
    if (selectedTask.tasks && selectedTask.tasks.length === 0) {
      return
    }
    const hiddenForSession = sessionTours && sessionTours['addToSubtasks']
    !tours.addToSubtasks &&
      !hiddenForSession &&
      !isInTasklistContext() &&
      dispatch(
        setTour('addToSubtasks', addUserToSubtasksSteps(t, closeTourForever))
      )
  }

  const selectRemoval = (user, ref) => {
    setPopoverAnchor(ref)
    setShowRemoveDialog(true)
    setSelectedUser(user)
  }

  return (
    <>
      <div className={classes.root}>
        <div className={classes.iconColumn}>
          {!props.noBreak && props.currentTeam.length > 0 && <div>&nbsp;</div>}
          {props.showIcon && !props.isInPrivateWS && (
            <PeopleIcon className={classes.peopleIcon} />
          )}
        </div>
        <div className={classes.content}>
          <div className={classes.topRow}>
            {props.currentTeam.length > 0 && (
              <UsersControlContainer
                users={props.currentTeam}
                floatLeft={true}
                showRoles={true}
                showAvatarList={props.showAvatarList}
                renderUsersList={() => (
                  <UserList
                    users={props.currentTeam}
                    onRemoveClick={props.handleRemoveUser}
                    canRemoveSelf={true}
                    showRoleHeadings={true}
                    hideItemRole={props.hideItemRole}
                    addToAllSubtasks={props.addToAllSubtasks}
                    task={props.task}
                    selectRemoval={selectRemoval}
                  />
                )}
              />
            )}
            {props.status === TASK_STATUS.NOT_REQUIRED && (
              <Typography
                data-test="task-team-members-not-required"
                className={classes.notRequiredText}
              >
                {t('taskTeamMembers.notRequired')}
              </Typography>
            )}
          </div>
          <div className={classes.lowRow}>
            {addMode &&
              renderAddSearch(
                props.availableUsers,
                t,
                classes,
                props.onSelect,
                () => {
                  setAddMode(false)
                  if (!window.location.href.includes('matteradmin')) {
                    triggerAddtoSubtasksTour()
                  }
                },
                setShowPlaceholderDialog,
                setPrefillValue
              )}
            {isAddEnabled &&
              renderAddButton(
                t,
                () => {
                  setAddMode(true)
                },
                classes,
                props
              )}
            {showPlaceholderDialog && (
              <CreatePlaceholderDialog
                handleClose={() => setShowPlaceholderDialog(false)}
                matterId={getMatterIdFromLocation(location)}
                taskId={taskId}
                callBack={() => {}}
                prefillValue={prefillValue}
              />
            )}
          </div>
        </div>
      </div>
      {showRemoveDialog && (
        <Popover
          customCss={classes.popoverCss}
          open={true}
          anchorEl={popoverAnchor.current}
          onClose={() => {
            setShowRemoveDialog(false)
          }}
        >
          <div
            className={classes.removalWrapper}
            data-test="remove-from-popover"
          >
            <Button
              className={classes.removalButton}
              data-test="remove-just-this-task"
              onClick={() => {
                props.handleRemoveUser(selectedUser)
                setShowRemoveDialog(false)
              }}
            >
              <Typography className={classes.removalText}>
                {t('UserListItem.removeFromOne')}
              </Typography>
            </Button>
            <Button
              className={classes.removalButton}
              data-test="remove-all-subtasks"
              onClick={() => {
                props.handleRemoveUser(selectedUser, true)
                setShowRemoveDialog(false)
              }}
            >
              <Typography className={classes.removalText}>
                {t('UserListItem.removeFromAll')}
              </Typography>
            </Button>
          </div>
        </Popover>
      )}
    </>
  )
}

export default UserSearch
