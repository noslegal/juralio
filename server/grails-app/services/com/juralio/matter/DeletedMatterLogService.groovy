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
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured

@Transactional
class DeletedMatterLogService {

    SpringSecurityService springSecurityService
    MatterAuthorisationService matterAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    List<DeletedMatterLog> getAll() {
        AppUser user = springSecurityService.getCurrentUser()
        return DeletedMatterLog.findAllByOrganisationId(user.organisationId)
    }

    DeletedMatterLog createDeletedMatterLog(Long matterId, Long orgId, String matterName, String matterClient, String deletedBy, Date markedForDeletion) {
        if (!matterAuthorisationService.isOrgAdminForSameOrgAsMatter(matterId)) {
            throw new Exception()
        }
        DeletedMatterLog deletedMatterLog = new DeletedMatterLog(matterId: matterId, organisationId: orgId, matterName: matterName, matterClient: matterClient, deletedBy: deletedBy, markedForDeletion: markedForDeletion)
        return deletedMatterLog.save()
    }

    DeletedMatterLog removeDeletedMatterLog(Long matterId) {
        if (!matterAuthorisationService.isOrgAdminForSameOrgAsMatter(matterId)) {
            throw new Exception()
        }
        return DeletedMatterLog.findByMatterId(matterId).delete()
    }
}
