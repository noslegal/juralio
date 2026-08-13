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

import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import PersonSelector from '../../../components/inputs/person-selector/PersonSelector'
import { useUserDetailsData } from '../../../hooks/user-hooks'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import { OPERATOR, UNASSIGNED } from '../../constants'
import { taskFilterActions } from './task-filter-actions'

const TaskFilterContainer = props => {
  const { matterId } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const userDetailsData = useUserDetailsData()

  const currentUserEmail = useSelector(state => state.auth.data.auth.username)
  const currentUserId = useSelector(state => state.auth.data.details.id)
  const selectedPerson = useSelector(state => state.taskMapFilter.personFilter)
  const selectionUser = useSelector(
    state => state.taskMapFilter.filterSelectionUser
  )
  const userSearch = useSelector(state => state.taskMapFilter.filterUserRecency)
  const fetchingUserSearch = useSelector(
    state => state.taskMapFilter.fetchingFilterUserRecency
  )

  const fetchFilterUserRecency = () =>
    dispatch(taskFilterActions.fetchFilterUserRecency(matterId))

  const setEmailToEveryone = () => {
    if (userSearch) {
      dispatch(taskFilterActions.resetFilterUserRecency())
    }
    dispatch(taskFilterActions.resetEmailToFilterFor())
  }

  const setEmailToCurrentUser = () => {
    if (userSearch) {
      dispatch(taskFilterActions.resetFilterUserRecency())
    }
    dispatch(
      taskFilterActions.setIdToFilterFor(currentUserId, t('filter.yourTasks'), {
        taskMemberOf: true,
        following: true,
        logicOperator: OPERATOR.OR,
      })
    )
  }

  const setEmailToUnassigned = () => {
    if (userSearch) {
      dispatch(taskFilterActions.resetFilterUserRecency())
    }
    dispatch(
      taskFilterActions.setIdToFilterFor(
        UNASSIGNED,
        t('filter.unassignedTasks'),
        {
          taskMemberOf: true,
          following: true,
        }
      )
    )
  }

  const setSpecifiedUser = userData => {
    dispatch(
      taskFilterActions.setIdToFilterFor(
        userData.id,
        formatUserDisplayName(userData),
        {
          taskMemberOf: true,
          following: false,
        }
      )
    )
  }

  const onClickSearchedTeamMember = userData => {
    dispatch(
      taskFilterActions.postFilterUserRecency(matterId, userData.id)
    ).then(() => fetchFilterUserRecency())

    setSpecifiedUser(userData)
  }

  return (
    <PersonSelector
      filterChangeHandler={() => {}}
      selectedPerson={selectedPerson}
      selectionUser={selectionUser}
      userSearch={userSearch}
      fetchingUserSearch={fetchingUserSearch}
      fetchFilterUserRecency={fetchFilterUserRecency}
      userDetailsData={userDetailsData}
      onClickEveryone={setEmailToEveryone}
      onClickYourTasks={setEmailToCurrentUser}
      onClickUnassigned={setEmailToUnassigned}
      onClickSearchedTeamMember={onClickSearchedTeamMember}
      onClickSpecifiedUser={setSpecifiedUser}
      matters={[matterId]}
      selectorLabel={''}
      selectionText={''}
      resetFilterToAnybody={() => {}}
    />
  )
}

TaskFilterContainer.propTypes = {
  matterId: PropTypes.string.isRequired,
  projectId: PropTypes.string, //.isRequired,
}

export default TaskFilterContainer
