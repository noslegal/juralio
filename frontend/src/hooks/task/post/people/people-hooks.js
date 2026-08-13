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

import { useState, useEffect } from 'react'

import {
  sortByName,
  sortUserList,
} from '../../../../services/user/helper/user-sort-service'

export function useAddablePeople(matterPeople, postPeople) {
  const [peopleInMatterButNotInPost, setPeopleInMatterButNotInPost] = useState(
    []
  )

  useEffect(() => {
    if (!matterPeople || !postPeople) return
    const postPeopleUserIds = postPeople?.map(postPerson => postPerson.user?.id)
    const matterPeopleFilterOutPostPeople = matterPeople
      ?.filter(
        matterPerson =>
          !postPeopleUserIds.includes(matterPerson.user.id) &&
          matterPerson.user.enabled &&
          (matterPerson.user.isActiveOnMatter || matterPerson.isPlaceholder)
      )
      .map(matterPerson => ({
        ...matterPerson,
        id: matterPerson.user.id,
      }))
    setPeopleInMatterButNotInPost(matterPeopleFilterOutPostPeople)
  }, [matterPeople, postPeople])

  return peopleInMatterButNotInPost
}

export function useTaskTeamAuthorsAsUsers(taskTeamPeople, currentUserId) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!taskTeamPeople) return
    const mappedPostPeople = taskTeamPeople.map(postPerson => ({
      ...postPerson.user,
      postAuthorId: postPerson.id,
      user: postPerson.user,
    }))
    const sortedPeople = sortUserList(
      currentUserId,
      sortByName(mappedPostPeople)
    )
    setUsers(sortedPeople)
  }, [taskTeamPeople]) // eslint-disable-line

  return users
}

export function usePostAuthorsAsUsers(postPeople, currentUserId) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!postPeople) return
    const mappedPostPeople = postPeople.map(postPerson => ({
      ...postPerson.user,
      postAuthorId: postPerson.id,
      user: postPerson.user,
    }))
    const sortedPeople = sortUserList(
      currentUserId,
      sortByName(mappedPostPeople)
    )
    setUsers(sortedPeople)
  }, [postPeople]) // eslint-disable-line

  return users
}

export function useMeetingAttendeessAsUsers(attendees, currentUserId) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!attendees) return
    const mappedPostPeople = attendees.map(attendee => ({
      user: attendee,
      postAuthorId: attendee.id,
      ...attendee,
    }))
    const sortedPeople = sortUserList(
      currentUserId,
      sortByName(mappedPostPeople)
    )
    setUsers(sortedPeople)
  }, [attendees]) // eslint-disable-line

  return users
}
