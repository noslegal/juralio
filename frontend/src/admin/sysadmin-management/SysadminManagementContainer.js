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
import { USER_ROLES } from '../../app/constants'
import { showSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import {
  convertUserToGoogle,
  convertUserToJuralio,
  convertUserToMicrosoft,
  convertUserToOkta,
  convertUserToSaml,
  deselectUser,
  fetchUsers,
  requestTemporaryPassword,
  resendInvite,
  resetFtue,
  selectUser,
  update,
} from '../../app/users/users-actions'
import { setAvailableTours } from '../../services/tour/tour-actions'
import tourService from '../../services/tour/tour-service'
import userService from '../../services/user/user-service'
import SysadminManagement from './SysadminManagement'
const SysadminManagementContainer = props => {
  const users = useSelector(state => state.users?.users)
  const hasLoadedUsers = useSelector(state => state.users?.isLoaded)
  const [userActivity, setUserActivity] = useState([])
  const [showUserActivity, setShowUserActivity] = useState(false)
  const [userActivityLoaded, setUserActivityLoaded] = useState(false)
  const dispatch = useDispatch()
  const auth = useSelector(state => state.auth)
  const selectedUser = useSelector(state => state.users?.selectedUser)
  const { t } = useTranslation()
  const self = auth.data.details
  useEffect(() => {
    dispatch(fetchUsers())
  }, []) //eslint-disable-line
  const filteredUsers = users.filter(u =>
    u.roles.includes(USER_ROLES.ROLE_SYS_ADMIN)
  )

  const handleInlineChange = (user, properties) => {
    dispatch(update(user.id, properties))
  }
  const _selectUser = user => dispatch(selectUser(user))
  const _deselectUser = user => dispatch(deselectUser(user))

  const _resetFtue = () => dispatch(resetFtue(selectedUser.id))

  const _resetTours = () => {
    tourService.resetTours(selectedUser.id).then(res => {
      if (res.status === 200) {
        dispatch(setAvailableTours(res.body))
        dispatch(showSnackbar(t('tours.common.resetSuccess')))
      }
    })
  }
  const _resendInv = () => dispatch(resendInvite(selectedUser))
  const _resetPassword = () => dispatch(requestTemporaryPassword(selectedUser))
  const _convertToMS = () =>
    dispatch(convertUserToMicrosoft(selectedUser.id, t, selectedUser.username))
  const _convertToJuralio = () =>
    dispatch(convertUserToJuralio(selectedUser, t, selectedUser.username))
  const _convertUserToOkta = () =>
    dispatch(convertUserToOkta(selectedUser.id, t, selectedUser.username))
  const _convertUserToSaml = () =>
    dispatch(convertUserToSaml(selectedUser.id, t, selectedUser.username))

  const _convertToGoogle = () =>
    dispatch(convertUserToGoogle(selectedUser.id, t, selectedUser.username))

  const showActivityLog = userId => {
    setUserActivityLoaded(false)
    setShowUserActivity(true)
    userService.getActivityLog(userId).then(res => {
      if (res.status === 200) {
        setUserActivity(
          res.body.sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
          )
        )
        setUserActivityLoaded(true)
      }
    })
  }

  const downloadActivityLog = () => {
    var dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ data: userActivity }))
    var downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'user-activity-log.json')
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }
  return (
    <SysadminManagement
      users={filteredUsers}
      hasLoadedUsers={hasLoadedUsers}
      handleInlineChange={handleInlineChange}
      self={self}
      selectUser={_selectUser}
      selectedUser={selectedUser}
      deselectUser={_deselectUser}
      resetTours={_resetTours}
      resetFtue={_resetFtue}
      resendInv={_resendInv}
      resetPassword={_resetPassword}
      convertToMS={_convertToMS}
      convertToJuralio={_convertToJuralio}
      convertToOkta={_convertUserToOkta}
      convertToSaml={_convertUserToSaml}
      convertToGoogle={_convertToGoogle}
      showActivityLog={showActivityLog}
      userActivity={userActivity}
      userActivityLoaded={userActivityLoaded}
      showUserActivity={showUserActivity}
      closeActivityLog={() => setShowUserActivity(false)}
      downloadActivityLog={downloadActivityLog}
    />
  )
}
export default SysadminManagementContainer
