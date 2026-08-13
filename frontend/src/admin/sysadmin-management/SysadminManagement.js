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

import React from 'react'
import UpdateUserDetailsContainer from '../../app/organisation/users/UpdateUserDetailsContainer'
import JuralioUsersTableContainer from '../../components/layouts/manage-users/juralio-users-table/JuralioUsersTableContainer'
import ActivityLog from '../activity-log/ActivityLog'

const SysadminManagement = props => {
  return (
    <div>
      <JuralioUsersTableContainer
        data={props.users}
        currentUserId={props.self.id}
        currentUser={props.self}
        handleRowClick={props.selectUser}
        handleChange={props.handleInlineChange}
        isCurrentUserSysadmin={true}
        isCurrentUserOrgOwner={false}
        isLoaded={props.hasLoadedUsers}
        isOrganisation={false}
        isSysadminTable={true}
        isOrgMfaEnabled={true}
        currentUserTitleSize={'h6'}
        showUserConfirmationFunctionality={false}
        showActivityLog={props.showActivityLog}
      />
      <UpdateUserDetailsContainer
        closeHandler={props.deselectUser}
        resetFtue={props.resetFtue}
        resetTours={props.resetTours}
        saveChanges={properties => {
          props.handleInlineChange(props.selectedUser, properties)
        }}
        selectedUser={props.selectedUser}
        resetPassword={props.resetPassword}
        resendInv={props.resendInv}
        convertToMS={props.convertToMS}
        convertToJuralio={props.convertToJuralio}
        convertToOkta={props.convertToOkta}
        convertToSaml={props.convertToSaml}
        convertToGoogle={props.convertToGoogle}
        getOrgOwners={() => {
          return []
        }}
      />
      {props.showUserActivity && (
        <ActivityLog
          isLoaded={props.userActivityLoaded}
          data={props.userActivity}
          onClose={props.closeActivityLog}
          downloadActivityLog={props.downloadActivityLog}
        />
      )}
    </div>
  )
}
export default SysadminManagement
