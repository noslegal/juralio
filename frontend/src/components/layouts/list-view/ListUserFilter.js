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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip, Popover } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import rawColours from '../../../theme/raw-colours'

import AvatarWithTextItem from '../../data-display/avatar-with-text-item/AvatarWithTextItem'
import { PeopleIcon } from '../../../theme/navigation/CommonIcons'
import juralioColours from '../../../theme/juralio-colours'
import UserAvatar from '../../data-display/user/user-avatar/UserAvatar'
import TeamSearch from '../../inputs/team-search/TeamSearch'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: 'auto',
    marginBottom: 'auto',
    padding: theme.spacing(1),
  },
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))
const ListUserFilter = props => {
  const {
    setUserFilter,
    userFilter,
    userData,
    userSearch,
    setUserSearch,
    matterId,
  } = props
  const { t } = useTranslation()
  const [showUserFilter, setShowUserFilter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()

  const onClickEveryone = () => {
    setUserFilter(0)
    setAnchorEl(null)
    setShowUserFilter(false)
  }

  const onClickYourTasks = () => {
    setUserFilter(1)
    setAnchorEl(null)
    setShowUserFilter(false)
  }

  const onClickUnassigned = () => {
    setUserFilter(2)
    setAnchorEl(null)
    setShowUserFilter(false)
  }

  const UnassignedAvatarText = { firstname: '?', avatarImageIndex: -1 }

  return (
    <>
      <Chip
        data-test="user-filter"
        className={userFilter !== 0 ? classes.selectedChip : ''}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowUserFilter(true)
        }}
        filled
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {userFilter === 0 ? (
              <PeopleIcon />
            ) : userFilter === 1 ? (
              <UserAvatar compact user={userData} />
            ) : userFilter === 3 ? (
              <UserAvatar compact user={userSearch} />
            ) : (
              <UserAvatar compact user={UnassignedAvatarText} />
            )}
            <ArrowDropDownIcon />
          </div>
        }
      />
      <Popover
        onClose={() => setShowUserFilter(false)}
        anchorEl={anchorEl}
        open={showUserFilter}
        style={{ padding: 4 }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div className={classes.root}>
          <div>
            <AvatarWithTextItem
              icon={PeopleIcon}
              title={t('filter.anyoneTasks')}
              titleDataTest="person-filter-everyone"
              onClickHandler={() => onClickEveryone()}
            />
            <AvatarWithTextItem
              avatarUser={userData}
              title={t('filter.yourTasks')}
              titleDataTest="person-filter-you"
              onClickHandler={() => onClickYourTasks()}
            />
            <AvatarWithTextItem
              avatarUser={UnassignedAvatarText}
              title={t('filter.unassignedTasks')}
              titleDataTest="person-filter-unassigned"
              subtitleDataTest="person-filter-username"
              onClickHandler={() => onClickUnassigned()}
            />
            {userSearch && (
              <AvatarWithTextItem
                dataTest="user-search-user"
                key={userSearch.id}
                avatarUser={userSearch}
                subtitle={formatUserDisplayNameAndUserName(userSearch)}
                subtitleDataTest={'user-search-name'}
                onClickHandler={() => {
                  setUserSearch(undefined)
                  setUserFilter(0)
                }}
                subtitleBlack
                darkMode={true}
              />
            )}
            <TeamSearch
              matterId={matterId}
              onChange={e => {
                setUserSearch(e)
                setUserFilter(3)
              }}
              placeholder={t('inbox.chooseUserPlaceholder')}
              team={[userData]}
              filterHidden={true}
              flatResultsList={true}
              style={{ marginBottom: 16 }}
              showPlaceholders={true}
              showPlaceholderAdd={false}
              smallMode={true}
              menuStyle={{}}
              disabled={false}
              showNoResults={true}
            />
          </div>
        </div>
      </Popover>
    </>
  )
}
export default ListUserFilter
