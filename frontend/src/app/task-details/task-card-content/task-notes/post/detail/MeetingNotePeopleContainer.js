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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import PeopleManager from '../../../../../../components/inputs/people-manager/PeopleManager'
import {
  useAddablePeople,
  useMeetingAttendeessAsUsers,
} from '../../../../../../hooks/task/post/people/people-hooks'
import {
  addIsActiveOnWorkstream,
  sortNoAccessLast,
} from '../../../../../../services/helpers/user/user-helper'
import { ACTIVITIES, TASK_STATUS } from '../../../../../constants'
import {
  addPostMember,
  deletePostMember,
} from '../../../TaskMembers/task-members-actions'

const MeetingNotePeopleContainer = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const userData = useSelector(state => state.auth.data.details)
  const currentPost = useSelector(
    state => state.selectedTaskPostList.postDetails.post
  )
  const meetingPeople = useSelector(
    state => state.selectedTaskPostList.postDetails.post?.members
  )
  const workstream = useSelector(state => state.project)
  const matterPeople = useSelector(state => state.matterTeam.mainPage.team)
  const matterId = useSelector(state => state.selectedTask.matterId)
  const workstreamId = useSelector(state => state.selectedTask.projectId)
  const taskId = useSelector(state => state.selectedTask.id)
  const status = useSelector(state => state.selectedTask.status)
  const meetingUsers = useMeetingAttendeessAsUsers(meetingPeople, userData.id)
  const matterDetails = useSelector(state => state.matterDetails?.matter)

  const isUserMatterAdmin = () =>
    matterDetails &&
    matterDetails.activities &&
    matterDetails.activities[0] === ACTIVITIES.MATTER_ADMIN
  const addablePeople = useAddablePeople(matterPeople, meetingUsers)
  const isReadOnly = status === TASK_STATUS.NOT_REQUIRED

  const onClickAddMeetingPerson = user => {
    dispatch(
      addPostMember(matterId, workstreamId, taskId, currentPost.id, user)
    )
  }
  const onClickDeleteMeetingPerson = user =>
    dispatch(
      deletePostMember(matterId, workstreamId, taskId, currentPost.id, user)
    )

  const [mappedPeople, setMappedPeople] = useState([])
  useEffect(() => {
    setMappedPeople(
      sortNoAccessLast(addIsActiveOnWorkstream(meetingUsers, workstream))
    )
  }, [meetingUsers]) //eslint-disable-line

  return (
    <PeopleManager
      matterId={matterId}
      workstreamId={workstreamId}
      taskId={taskId}
      isReadOnly={isReadOnly}
      onClickAddPerson={onClickAddMeetingPerson}
      onClickDeletePerson={onClickDeleteMeetingPerson}
      userData={userData}
      addablePeople={addablePeople}
      people={mappedPeople}
      canRemoveSelf={props.viewOnly ? false : true}
      searchPlaceHolder={t('authorsPanel.meetingAttendeeSearchPlaceholder')}
      dataTestPrefix="meeting-note-people"
      viewOnly={props.viewOnly}
      isMatterAdmin={isUserMatterAdmin()}
      showPlaceholders={true}
    />
  )
}

export default MeetingNotePeopleContainer
