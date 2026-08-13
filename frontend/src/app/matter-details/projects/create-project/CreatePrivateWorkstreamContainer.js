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
import { useSelector } from 'react-redux'
import CreatePrivateWorkstream from './CreatePrivateWorkstream'

const CreatePrivateWorkstreamContainer = props => {
  const [addedUsers, setAddedUsers] = useState([])

  useEffect(() => {
    const mappedAddedUsers = addedUsers.map(addedUser => addedUser.user.id)
    props.setPrivateWorkstreamUsers(mappedAddedUsers)
  }, [addedUsers]) // eslint-disable-line

  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)

  const isLoadingUsers = false

  const addUser = selectedUsers => {
    setAddedUsers(selectedUsers)
  }

  const removeUser = userToRemove => {
    const usersToAddList = addedUsers.filter(
      user => user.user.id !== userToRemove.id
    )
    setAddedUsers(usersToAddList ? usersToAddList : [])
  }

  return (
    <CreatePrivateWorkstream
      isLoadingUsers={isLoadingUsers}
      usersInMatter={matterTeam}
      addUser={addUser}
      handleChipDelete={removeUser}
      addedUsers={addedUsers}
      handleWorkstreamIsPrivateChange={props.handleWorkstreamIsPrivateChange}
      workstreamIsPrivate={props.workstreamIsPrivate}
    />
  )
}

export default CreatePrivateWorkstreamContainer
