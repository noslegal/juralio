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
  usePostAuthorsAsUsers,
} from '../../../../../../hooks/task/post/people/people-hooks'
import { checkIfPrivateWorkstreamMember } from '../../../../../../services/helpers/user/user-roles-helper'
import { ACTIVITIES, TASK_STATUS } from '../../../../../constants'
import {
  addPostAuthor,
  deletePostAuthor,
} from '../../../TaskAuthors/task-authors-actions'
import { selectItem } from '../../task-posts-actions'

const PostPeopleContainer = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const matterDetails = useSelector(state => state.matterDetails?.matter)

  const userData = useSelector(state => state.auth.data.details)
  const currentPost = useSelector(
    state => state.selectedTaskPostList.postDetails.post
  )
  const postPeople = useSelector(
    state => state.selectedTaskPostList.postDetails.post?.authors
  )
  const matterPeople = useSelector(state => state.matterTeam.mainPage.team)
  const matterId = useSelector(state => state.selectedTask.matterId)
  const workstreamId = useSelector(state => state.selectedTask.projectId)
  const workstream = useSelector(state => state.project)
  const taskId = useSelector(state => state.selectedTask.id)
  const status = useSelector(state => state.selectedTask.status)
  const [postUsers, setPostUsers] = useState([])

  let postPeople2 = usePostAuthorsAsUsers(postPeople, userData.id)

  useEffect(() => {
    setPostUsers(
      postPeople2.map(member => {
        member.user.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
          workstream,
          member.user
        )
        return member
      })
    )
  }, [postPeople2]) //eslint-disable-line

  const [privateWorkstreamPeople, setPrivateWorkstreamPeople] = useState([])

  useEffect(() => {
    if (workstream.isPrivate) {
      setPrivateWorkstreamPeople(
        workstream.privateWorkstreamTeam.map(u => {
          u.user = u
          return u
        })
      )
    }
  }, [workstream.privateWorkstreamTeam]) //eslint-disable-line

  const addablePeople = useAddablePeople(
    workstream.isPrivate ? privateWorkstreamPeople : matterPeople,
    postUsers
  )
  const isReadOnly =
    status === TASK_STATUS.NOT_REQUIRED ||
    !postPeople?.map(p => p.user.id).includes(userData.id)

  const onClickAddPostAuthor = user => {
    dispatch(
      addPostAuthor(matterId, workstreamId, taskId, currentPost.id, user)
    )
  }
  const isUserMatterAdmin = () =>
    matterDetails &&
    matterDetails.activities &&
    matterDetails.activities[0] === ACTIVITIES.MATTER_ADMIN
  const onClickDeletePostAuthor = user => {
    return dispatch(
      deletePostAuthor(
        matterId,
        workstreamId,
        taskId,
        currentPost.id,
        user,
        removedSelfFromPrivatePost(user)
      )
    ).then(removedSelfFromPrivatePost(user) && dispatch(selectItem(-1)))
  }
  function removedSelfFromPrivatePost(user) {
    return currentPost.privatePost && user.id === userData.id
  }

  return (
    <PeopleManager
      matterId={matterId}
      workstreamId={workstreamId}
      taskId={taskId}
      isReadOnly={isReadOnly}
      onClickAddPerson={onClickAddPostAuthor}
      onClickDeletePerson={onClickDeletePostAuthor}
      userData={userData}
      addablePeople={addablePeople.filter(person => !person.isPlaceholder)}
      people={postUsers}
      canRemoveSelf={false}
      searchPlaceHolder={t('authorsPanel.authorSearchPlaceholder')}
      dataTestPrefix="post-people"
      viewOnly={props.viewOnly}
      isMatterAdmin={isUserMatterAdmin()}
      showPlaceholders={false}
    />
  )
}

export default PostPeopleContainer
