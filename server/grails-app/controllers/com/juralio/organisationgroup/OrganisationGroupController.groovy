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

package com.juralio.organisationgroup

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class OrganisationGroupController {
    static lazyInit = false
	static allowedMethods = [index: "GET", update: "PATCH", save: "POST", show: "GET", list:"GET", orgList: "GET"]

    SpringSecurityService springSecurityService
    MatterService matterService
    OrganisationDAOService organisationDAOService
    CostsAuthorisationService costsAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    OrganisationGroupService organisationGroupService
    OrganisationGroupDAOService organisationGroupDAOService
    UserRoleService userRoleService

    // Group management is an org-admin/owner action (sysadmin bypasses). Membership alone is not enough.
    private boolean isAuthorised(AppUser user, long org_id) {
        if (userRoleService.hasSysadminRole(user)) return true
        if (user.organisation.id != org_id) return false
        return userRoleService.hasOrgAdminRole(user) || userRoleService.hasOrgOwnerRole(user)
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def list() {
        List<OrganisationGroup> groupList = organisationGroupService.getAll()
        List<OrganisationGroupDTO> groupDTOList = organisationGroupService.formatList(groupList)
        respond groupList, [status: HttpStatus.OK]
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def orgList(long org_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Organisation org = organisationDAOService.getOrganisation(org_id as long)
        if (org.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        List<OrganisationGroup> groupList = organisationGroupService.getGroupsForOrg(org)
        respond groupList, [status: HttpStatus.OK]
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def index(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Organisation org = organisationDAOService.getOrganisation(org_id as long)
        if (org.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        OrganisationGroup group = organisationGroupService.getGroup(group_id)
        if (!group || group.organisation.id != org_id) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        respond group, [Status: HttpStatus.OK]

    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def show(long org_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Organisation org = organisationDAOService.getOrganisation(org_id as long)
        if (org.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        List<OrganisationGroup> groups = organisationGroupService.getGroupsForOrg(org)
        List<OrganisationGroupDTO> groupDTOList = organisationGroupService.formatList(groups)
        respond groupDTOList, [Status: HttpStatus.OK]
    }

    def save(long org_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (!isAuthorised(currentUser, org_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        Organisation org = organisationDAOService.getOrganisation(org_id as long)
        if (!org) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'isInternal', 'positionId'])
        if (!validatedBody.name) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } else if (validatedBody.isInternal == null) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } else {
            OrganisationGroup group = organisationGroupService.saveGroup(validatedBody, org)
            respond group, Status: HttpStatus.OK
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def delete(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (!isAuthorised(currentUser, org_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        OrganisationGroup group = organisationGroupService.getGroup(group_id)
        if (!group || group.organisation.id != org_id) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        organisationGroupDAOService.deleteGroup(group)
        respond [:], status: HttpStatus.OK
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long org_id, long group_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (!isAuthorised(currentUser, org_id)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        OrganisationGroup group = organisationGroupService.getGroup(group_id)
        if(!group){
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        if (group.organisation.id != org_id) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'positionId'])
        if (validatedBody.name == '') {
            respond [:], status: HttpStatus.BAD_REQUEST
        }else {
            OrganisationGroup updatedGroup = organisationGroupService.updateGroup(validatedBody, group)
            respond updatedGroup, Status: HttpStatus.OK
        }
    }
}
