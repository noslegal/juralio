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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.matter.dao.MatterViewerDAOService
import com.juralio.matter.exception.CannotAddInactiveUserException
import com.juralio.matter.exception.CannotAddUserNotInOrganisationException
import com.juralio.matter.exception.CannotRemoveMatterViewerException
import com.juralio.matter.exception.InvalidRoleForMatterViewerException
import com.juralio.recency.RecencyService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.validation.ValidationException
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class MatterViewerService {

    SpringSecurityService springSecurityService
    MatterService matterService
    UserRoleService userRoleService
    MatterViewerDAOService matterViewerDAOService
    RecencyService recencyService
    MatterAuthorisationService matterAuthorisationService

    MatterViewer getMatterViewer(Matter matter, AppUser user){
        return matterViewerDAOService.findByMatterAndUser(matter,user)
    }

    MatterViewer saveUser(long matterId, long userId) {
        Matter matter = Matter.get(matterId)
        AppUser user = AppUser.get(userId)
        MatterViewer matterViewer = new MatterViewer(matter: matter, user: user)
        return saveMatterViewer(matterViewer)
    }

    MatterViewer saveMatterViewer(MatterViewer matterViewer) {
        if(!matterAuthorisationService.hasUpdateAccess(matterViewer.matter.id,true)){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        AppUser user = AppUser.get(matterViewer.user.id)

        if (!user.enabled) {
            throw new CannotAddInactiveUserException()
        }

        if (!matterService.hasUnrestrictedView(matterViewer.matter, currentUser)) {
            throw new CannotRemoveMatterViewerException(
                    "Cannot add matter viewers without being a matter administrator")
        }

        if (userRoleService.hasSysadminRole(matterViewer.user)) {
            throw new InvalidRoleForMatterViewerException("Sysadmin user cannot be added as matter viewer")
        }

        if (!matterViewer.user.organisation || matterViewer.user.organisation.id != matterViewer.matter.organisation.id) {
            throw new CannotAddUserNotInOrganisationException()
        }

        try {
            matterViewer.save(failOnError: true, flush: true)
        } catch (ValidationException e) {
            return matterViewerDAOService.findByMatterAndUser(matterViewer.matter, matterViewer.user)
        }

        return matterViewer
    }

    boolean deleteMatterViewer(long id, long matterId) {
        if(!matterAuthorisationService.hasUpdateAccess(matterId,true)){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        MatterViewer matterViewer = matterViewerDAOService.get(id)
        AppUser user = matterViewer.user
        if (!matterService.hasUnrestrictedView(matterViewer.matter, currentUser)) {
            throw new CannotRemoveMatterViewerException(
                    "Cannot remove matter viewers without being a matter administrator")
        }

        recencyService.removeRecencyForUser(user, matterViewer.matter.id)

        Matter matter = matterViewer.matter
        matter.removeFromMatterViewers(matterViewer)
        matterViewer.delete()
        return true
    }
}

