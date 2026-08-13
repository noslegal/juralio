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

import PeopleIcon from '@mui/icons-material/People'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { formatUserDisplayNameAndUserName } from '../../../services/user/helper/user-format-service'
import AvatarWithTextItem from '../../data-display/avatar-with-text-item/AvatarWithTextItem'
import TeamSearch from '../team-search/TeamSearch'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const UnassignedAvatarText = { firstname: '?', avatarImageIndex: -1 }

const PersonSelector = props => {
  const {
    selectorLabel,
    //selectionText,
    userSearch,
    fetchingUserSearch,
    resetFilterToAnybody,
    fetchFilterUserRecency,
    userDetailsData,
    onClickEveryone,
    onClickYourTasks,
    onClickUnassigned,
    onClickSpecifiedUser,
    onClickSearchedTeamMember,
  } = props

  const { classes } = useStyles()
  const { t } = useTranslation()
  const userFilter = useSelector(state => state.taskMapFilter.userFilter)
  const selectionText = useSelector(
    state => state.taskMapFilter.filterSelectionText
  )

  useEffect(() => {
    if (!selectionText || selectionText.length === 0) {
      resetFilterToAnybody()
    }
  }, [resetFilterToAnybody, selectionText])

  useEffect(() => {
    if (
      !userSearch &&
      !fetchingUserSearch &&
      userFilter &&
      selectionText !== 'Just my tasks' &&
      selectionText !== 'Unassigned tasks'
    ) {
      fetchFilterUserRecency()
    }
  }, [
    fetchingUserSearch,
    fetchFilterUserRecency,
    userFilter,
    selectionText,
    userSearch,
  ])

  return (
    <div className={classes.root}>
      <div labelText={selectorLabel ? selectorLabel : ''}>
        <AvatarWithTextItem
          icon={PeopleIcon}
          title={t('filter.anyoneTasks')}
          titleDataTest="person-filter-everyone"
          onClickHandler={() => onClickEveryone()}
        />
        <AvatarWithTextItem
          avatarUser={userDetailsData}
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
            dataTest="recent-user-option"
            key={userSearch.id}
            avatarUser={userSearch}
            subtitle={formatUserDisplayNameAndUserName(userSearch)}
            subtitleDataTest={'person-filter-recent-user'}
            onClickHandler={() => {
              onClickSpecifiedUser(userSearch)
            }}
            subtitleBlack
            darkMode={true}
          />
        )}
        <TeamSearch
          matterId={props.matters && props.matters[0]?.toString()}
          onChange={onClickSearchedTeamMember}
          placeholder={t('inbox.chooseUserPlaceholder')}
          team={[userDetailsData]}
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
  )
}

PersonSelector.propTypes = {
  selectorLabel: PropTypes.string,
  matters: PropTypes.array.isRequired,
  includeMatterTeam: PropTypes.bool,
  filterChangeHandler: PropTypes.func.isRequired,
}

export default PersonSelector
