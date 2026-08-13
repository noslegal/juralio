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

import { Button, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import fetchHelper from '../../../services/helpers/fetch/fetch-helper'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import PlaceholderAvatar from '../../data-display/placeholders/PlaceholderAvatar'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'
import Search from '../search/Search'
import InfoIcon from '@mui/icons-material/Info'
import CreatePlaceholderDialog from '../../../app/matter-details/placeholders/CreatePlaceholderDialog'
import { getMatterIdFromLocation } from '../../navigation/common/location-context-helper'
import { useLocation } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { hideTaskmapTaskAssigneeContainer } from '../../../app/task-details/task-actions'
import {
  isInPostContext,
  isInTasklistContext,
  isInTaskmapContext,
} from '../../../services/helpers/route/route-context-helper'
import AvatarWithTextItem from '../../data-display/avatar-with-text-item/AvatarWithTextItem'

const useStyles = makeStyles()(theme => ({
  searchContainer: {
    paddingTop: theme.spacing(1),
  },
  userFullname: {
    paddingLeft: theme.spacing(),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userNameContainer: {
    display: 'flex',
    alignItems: 'center',
    width: theme.spacing(42.5),
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
  },
  renderPlaceholderDialogButtonDiv: {
    textAlign: 'center',
  },
}))

const TeamSearch = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false)
  const [prefillValue, setPrefillValue] = useState('')
  const location = useLocation()

  const taskId = useSelector(
    isInTaskmapContext()
      ? state => state.taskmap?.selectedTask?.id
      : state => state.selectedTask?.id
  )

  const renderSearchItemContent = user => {
    return (
      <>
        {props.smallMode ? (
          <AvatarWithTextItem
            dataTest="recent-user-option"
            key={user.id}
            avatarUser={user}
            subtitle={formatUserDisplayNameAndUserName(user)}
            subtitleDataTest={'person-filter-recent-user'}
            // onClickHandler={() => {
            //   onClickSpecifiedUser(userSearch)
            // }}
            subtitleBlack
            darkMode={false}
            hideAvatar={true}
          />
        ) : (
          <div className={classes.userNameContainer} title={user.username}>
            {user.isPlaceholder ? (
              <PlaceholderAvatar
                placeholderName={user.firstname + ' ' + user.lastname}
              />
            ) : (
              <UserAvatar user={user} />
            )}
            <Typography variant="caption" className={classes.userFullname}>
              {formatUserDisplayNameAndUserName(user)}
            </Typography>
          </div>
        )}
      </>
    )
  }

  const renderPlaceholderDialogButton = () => {
    return (
      <div className={classes.renderPlaceholderDialogButtonDiv}>
        <Button
          style={{ textTransform: 'none' }}
          data-test="add-as-placeholder"
          onClick={() => {
            if (isInPostContext()) {
              const showPlaceholderDialogEvent = new CustomEvent(
                'show-placeholder-create-dialog',
                {
                  detail: {
                    name: prefillValue,
                  },
                }
              )
              window.dispatchEvent(showPlaceholderDialogEvent)
              props.onClose()
            } else {
              setShowPlaceholderDialog(true)
            }
          }}
        >
          {t('matterAdmin.placeholders.dialog.addAsPlaceholder')}
          <Tooltip title={t('matterAdmin.placeholders.dialog.placeholderInfo')}>
            <InfoIcon className={classes.infoIcon} data-test="info-icon" />
          </Tooltip>
        </Button>
      </div>
    )
  }

  const performUserSearch = searchTerm => {
    setPrefillValue(searchTerm.toLowerCase())
    props.onInputChange && props.onInputChange()
    if (props.teamMemberOptions) {
      return new Promise(resolve =>
        resolve(
          props.teamMemberOptions.filter(
            tm =>
              Object.values(tm).filter(t =>
                typeof t === 'string'
                  ? t.toLowerCase().includes(searchTerm.toLowerCase())
                  : false
              ).length > 0
          )
        )
      )
    }

    return fetchHelper('users/search', 'POST', {
      name: searchTerm,
      matterId: props.matterId,
      showPlaceholders: props.showPlaceholders ? true : false,
    }).then(response => {
      return response.body
    })
  }

  const formatSelectedItem = () => ''

  const onChange = (selectedItem, helper) => {
    if (selectedItem) {
      helper.clearSelection()
      props.onChange(selectedItem)
    }
    if (props.closeHandler) props.closeHandler()
  }

  const resultExclusionComparator = (itemToExclude, searchResult) => {
    if (props.matterId) {
      return itemToExclude.id === searchResult.id
    } else if (props.member) {
      return itemToExclude.id === searchResult.id
    } else {
      return (
        itemToExclude.id === searchResult.id ||
        itemToExclude.user?.id === searchResult.id
      )
    }
  }
  return (
    <div
      className={classes.searchContainer}
      style={props.style}
      data-test="team-search"
    >
      <Search
        focus={props.focus}
        onClose={props.onClose ? props.onClose : () => {}}
        error={!!props.errorText}
        helperText={props.errorText}
        onChange={onChange}
        resultsToExclude={props.team}
        exclusionComparator={resultExclusionComparator}
        formatSelectedItem={formatSelectedItem}
        performSearch={performUserSearch}
        renderItemContent={renderSearchItemContent}
        placeholder={
          props.placeholder
            ? props.placeholder
            : t('teamMembership.teamSearchPlaceholder')
        }
        filterHidden={props.filterHidden}
        usageContext="TeamSearch"
        flatResultsList={props.flatResultsList}
        disabled={props.disabled}
        menuStyle={props.menuStyle}
        showNoResults={props.showNoResults}
        renderCustomNoResults={
          props.showPlaceholderAdd ? renderPlaceholderDialogButton : undefined
        }
        onFocus={() => {}}
        onBlur={() => {}}
      />
      {showPlaceholderDialog &&
        (isInTaskmapContext() || isInTasklistContext()) && (
          <CreatePlaceholderDialog
            handleClose={() => {
              if (isInTaskmapContext()) {
                dispatch(hideTaskmapTaskAssigneeContainer())
              }
              setShowPlaceholderDialog(false)
            }}
            matterId={getMatterIdFromLocation(location)}
            taskId={taskId}
            callBack={() => {}}
            prefillValue={prefillValue}
          />
        )}
    </div>
  )
}

TeamSearch.propTypes = {
  errorText: PropTypes.string,
  filterHidden: PropTypes.bool,
  flatResultsList: PropTypes.bool,
  matterId: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  team: PropTypes.array,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  member: PropTypes.bool, //used for post member to fix search issue
  teamMemberOptions: PropTypes.array, //used for searching an existng list without querying the backend
  menuStyle: PropTypes.object,
}

export default TeamSearch
