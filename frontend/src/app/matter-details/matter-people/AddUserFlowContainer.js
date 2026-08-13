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
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import matterService from '../../../services/matter/matter-service'
import { fetchOrganisationUsers } from '../../users/users-actions'
import AddUserFlow from './AddUserFlow'
import { hasCompletedCostSetupForPosition } from '../../../services/organisation/organisation-helper'
import { useOrganisationData } from '../../../hooks/costs-hook'
import { POSITIONS } from '../../constants'
import { useUserPosition } from '../../../hooks/user-hooks'
import { updateMatterDetails } from '../matter-details-actions'

const AddUserFlowContainer = props => {
  const { selectedMatter, matterTeam } = props
  const dispatch = useDispatch()

  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [addedUsers, setAddedUsers] = useState([])
  const [filteredOutUsers, setFilteredOutUsers] = useState([])
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [orgUsersNotInMatter, setOrgUsersNotInMatter] = useState(undefined)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false)
  const [matterAccess, setmatterAccess] = useState(0)
  const [sendEmail, setSendEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [costAccess, setCostAccess] = useState(1)
  const [costDisabled, setCostDisabled] = useState(false)
  const orgUsers = useSelector(state => state.users?.users)
  const location = useLocation()
  const isThereUsersToAdd = addedUsers && addedUsers.length > 0
  const orgData = useOrganisationData()
  const userPosition = useUserPosition(selectedMatter)
  const isCostsSetupComplete = hasCompletedCostSetupForPosition(
    orgData,
    userPosition.positionData?.name
  )

  useEffect(() => {
    if (!isThereUsersToAdd) {
      setSubmitButtonDisabled(true)
      return
    }
    if (matterAccess === '') {
      setSubmitButtonDisabled(true)
      return
    }
    setSubmitButtonDisabled(false)
  }, [matterAccess, addedUsers, isThereUsersToAdd])

  useEffect(() => {
    dispatch(fetchOrganisationUsers(selectedMatter.organisation.id))
  }, [dispatch, selectedMatter.organisation.id])

  useEffect(() => {
    //eslint-disable-next-line
    if (!orgUsers || (!orgUsers) instanceof Array) return
    const filterArray = matterTeam.map(u => u.user.id)
    const searchableUsers = orgUsers.filter(orgUser => {
      return orgUser && !filterArray.includes(orgUser.id) && orgUser.enabled
    })

    setFilteredOutUsers(filteredOutUsers)
    setOrgUsersNotInMatter(searchableUsers)
    setIsLoadingUsers(false)
  }, [filteredOutUsers, orgUsers, matterTeam])

  const initState = () => {
    setAddedUsers([])
    setShowLoadingBar(false)
    setSubmitButtonDisabled(true)
    setmatterAccess(0)
    setSendEmail(false)
    setEmailMessage('')
  }

  useEffect(() => {
    if (addedUsers.length > 0) {
      setCostDisabled(true)
      setCostAccess(0)
      addedUsers.forEach(user => {
        setCostDisabled(false)
        setCostAccess(1)
      })
    } else {
      setCostDisabled(false)
      setCostAccess(1)
    }
  }, [addedUsers])

  const addUser = selectedUsers => {
    if (
      selectedUsers.filter(u => u.isExternal).length > 0 &&
      matterAccess === 2
    ) {
      setmatterAccess(0)
    }
    setAddedUsers(selectedUsers)
  }

  const removeUser = userToRemove => {
    const usersToAddList = addedUsers.filter(
      user => user.id !== userToRemove.id
    )
    setAddedUsers(usersToAddList ? usersToAddList : [])
  }

  const getListOfUserIds = () => addedUsers.map(userToAdd => userToAdd.id)

  const addEditors = () =>
    dispatch(props.addEditor(getListOfUserIds(), selectedMatter.id, costAccess))

  const addAdmins = () =>
    dispatch(props.addAdmin(getListOfUserIds(), selectedMatter.id, costAccess))

  const addViewOnly = () =>
    dispatch(
      props.addViewOnly(getListOfUserIds(), selectedMatter.id, costAccess)
    )

  const sendEmailToUsers = () => {
    if (sendEmail) {
      return matterService.sendAddEmail(
        selectedMatter.id,
        getListOfUserIds(),
        emailMessage
      )
    }
  }

  const addUsersSubmitDialogHandler = () => {
    setSubmitButtonDisabled(true)
    setShowLoadingBar(true)
    const externalGroupAdded = addedUsers.filter(
      x => x.organisationGroup?.isInternal === false
    )
    const matterHasAdvisorGroup = selectedMatter.positionsOfGroups?.some(
      p => p.position?.name === POSITIONS.ADVISOR.name
    )

    if (
      externalGroupAdded.length > 0 &&
      matterTeam.filter(x => x.organisationGroup?.isInternal === true)
        .length === 0 &&
      matterHasAdvisorGroup &&
      selectedMatter.clientName !==
        externalGroupAdded[0].organisationGroup?.name
    ) {
      //set client name to external group name
      dispatch(
        updateMatterDetails(selectedMatter.id, {
          clientName: externalGroupAdded[0].organisationGroup?.name,
        })
      )
    }
    if (matterAccess === 0) {
      addEditors().then(() => {
        sendEmailToUsers()
        closeDialog()
      })
    } else if (matterAccess === 1) {
      addViewOnly().then(() => {
        sendEmailToUsers()
        closeDialog()
      })
    } else if (matterAccess === 2) {
      addAdmins().then(() => {
        sendEmailToUsers()
        closeDialog()
      })
    } else if (matterAccess === 3) {
      addViewOnly().then(() =>
        addAdmins().then(() => {
          sendEmailToUsers()
          closeDialog()
        })
      )
    } else if (matterAccess === 4) {
      addEditors().then(() =>
        addAdmins().then(() => {
          sendEmailToUsers()
          closeDialog()
        })
      )
    }
  }

  const openDialog = () => {
    setShowAddUserDialog(true)
    initState()
  }

  const closeDialog = () => {
    initState()
    setShowAddUserDialog(false)
  }

  const handleMatterAccess = e => {
    setmatterAccess(e.target.value)
    switch (e.target.value) {
      case 0:
        break
      case 1:
        break
      case 2:
        setCostAccess(0)
        break
      case 3:
        setmatterAccess(0)
        break

      default:
    }
  }

  const handleCostAccessMatter = value => {
    setCostAccess(value === 1 ? 0 : 1)
  }

  const handleSendEmailChange = e => {
    setSendEmail(e)
  }

  const handleMessageUpdate = message => {
    setEmailMessage(message)
  }

  const isAdministerMatterDisabled = matterAccess === 2

  const isMatterClosed =
    selectedMatter && selectedMatter.matterStatus === 'closed'

  if (location.state?.immediateAddTeamMembers && showAddUserDialog === false) {
    openDialog()
    location.state.immediateAddTeamMembers = false
  }

  return (
    <AddUserFlow
      openDialogHandler={openDialog}
      closeDialogHandler={closeDialog}
      showAddUserDialog={showAddUserDialog}
      matterTeam={matterTeam}
      matterId={selectedMatter.id}
      matterIsClosed={isMatterClosed}
      addedUsers={addedUsers}
      addUser={addUser}
      handleChipDelete={removeUser}
      filteredOutUsers={filteredOutUsers}
      addUsersSubmitDialogHandler={addUsersSubmitDialogHandler}
      isThereUsersToAdd={isThereUsersToAdd}
      showLoadingBar={showLoadingBar}
      orgUsersNotInMatter={orgUsersNotInMatter}
      isLoadingUsers={isLoadingUsers}
      submitButtonDisabled={submitButtonDisabled}
      showAssignRoles={true}
      matterAccess={matterAccess}
      handleMatterAccess={handleMatterAccess}
      costDisabled={costDisabled}
      costAccess={costAccess}
      handleCostAccessMatter={handleCostAccessMatter}
      isAdministerMatterDisabled={isAdministerMatterDisabled}
      handleSendEmailChange={handleSendEmailChange}
      sendEmail={sendEmail}
      handleMessageUpdate={handleMessageUpdate}
      isCostsSetupComplete={isCostsSetupComplete}
    />
  )
}

export default AddUserFlowContainer
