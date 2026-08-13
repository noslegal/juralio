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

package com.juralio.label

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.label.dao.InactiveLabelDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.labels.TaskLabelsService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class LabelController {
    static allowedMethods = [
            getLabelsForSystem        : "GET",
            getLabelsForMatter        : "GET",
            getLabelsForOrganisation  : "GET",
            getUsageForLabel          : "GET",
            updateLabelForOrganisation: "PATCH",
            updateLabelForMatter      : "PATCH",
            deleteMatterLabelUsages   : "POST",
            mergeMatterLabels         : "POST",
            addOrganisationLabel      : 'POST']

    LabelService labelService
    SpringSecurityService springSecurityService
    MatterService matterService
    InactiveLabelDAOService inactiveLabelDAOService
    TaskLabelsService taskLabelsService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    private long getOrgIdForCurrentUser() {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        user.organisation.id
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def getLabelsForSystem() {
        List<Label> labels = labelService.getSystemLevelLabels()
        respond labels, [status: HttpStatus.OK, view: '/label/_labelList']
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def getLabelsForOrganisation() {
        List<Label> labels
        long organisationId = getOrgIdForCurrentUser()
        if (params.includeHierarchicalLabels) { //fetch full list of available labels
            labels = labelService.getOrganisationAndSystemLabels(organisationId)
        } else {
            labels = labelService.getOrganisationLevelLabels(organisationId)
        }
        respond labels, [status: HttpStatus.OK, view: '/label/_labelList']
    }

    def getLabelsForMatter(long matterId) {
        List<Label> labels
        AppUser appUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        if(matter.organisationId != appUser.organisationId){
           respond [:], status: HttpStatus.FORBIDDEN
           return
        }
        if (params.includeHierarchicalLabels == 'true') {
            long organisationId = getOrgIdForCurrentUser()
            labels = labelService.getMatterAndOrganisationAndSystemLabels(organisationId, matterId)
            respond labels, [status: HttpStatus.OK, view: '/label/_labelListWithUsageCounts']
        } else if (params.allNoCounts == 'true') {
            long organisationId = getOrgIdForCurrentUser()
            labels = labelService.getMatterAndOrganisationAndSystemLabels(organisationId, matterId, false)
            respond labels, [status: HttpStatus.OK, view: '/label/_labelListWithUsageCounts']
        } else {
            labels = labelService.getMatterLevelLabels(matterId)
            respond labels, [status: HttpStatus.OK, view: '/label/_labelList']
        }
    }

    def getUsageForLabel(long matterId, long labelId) {
        try {
            List<Task> tasks = labelService.getLabelUsageMatter(matterId, labelId)
            respond tasks, [status: HttpStatus.OK, view: '/label/_labelUsageTaskList']
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def updateLabelForOrganisation(long labelId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        long organisationId = getOrgIdForCurrentUser()
        try {
            Label label = Label.findById(labelId)
            if (Label.findWhere(name: request.JSON.name, type: label.type, organisation: appUser.organisation) != null) {
                respond([text: "Label name is already in use"], status: HttpStatus.BAD_REQUEST)
                return
            }
            Label updatedLabel = labelService.updateOrganisationLabel(organisationId, labelId, request.JSON as JSONObject)
            respond updatedLabel, [status: HttpStatus.OK, view: '/label/_label']
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def deleteMatterLabelUsages(long matterId, long labelId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, ['taskIds'], [])
            List<Long> taskIds = validatedBody.get('taskIds')
            taskIds.each {
                Task t = Task.class.findById(it)
                taskLabelsService.deleteLabelFromTask(t.projectId, it, labelId)
            }
            respond [:], status: HttpStatus.OK
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def updateLabelForMatter(long matterId, long labelId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            Label label = Label.findById(labelId)
            if(label.matterId != matterId){
                respond([:], status: HttpStatus.BAD_REQUEST)
                return
            }
            Matter matter = matterService.getMatter(matterId)
            if (Label.findWhere(name: request.JSON.name, type: label.type, matter: matter) != null) {
                respond([text: "Label name is already in use"], status: HttpStatus.BAD_REQUEST)
                return
            }
            Label updatedLabel = labelService.updateMatterLabel(matterId, labelId, request.JSON as JSONObject)
            respond updatedLabel, [status: HttpStatus.OK, view: '/label/_label']
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def addOrganisationLabel() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        long organisationId = getOrgIdForCurrentUser()
        try {
            Label newLabel = labelService.addOrganisationLabel(organisationId, request.JSON as JSONObject)
            respond newLabel, [status: HttpStatus.OK, view: '/label/_label']
        } catch (LabelUniquenessException ignored) {
            respond([text: "Label name is already in use"], status: HttpStatus.BAD_REQUEST)
        } catch (LabelLimitException ignored) {
            respond([text: "Label limit for organisation has been reached"], status: HttpStatus.BAD_REQUEST)
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }


    def mergeMatterLabels(long matterId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Boolean successfulMerge = labelService.mergeLabels(matterId, request.JSON.masterLabelId as Long, request.JSON.minorLabelId as Long)
        if (successfulMerge) {
            respond [:], status: HttpStatus.OK
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def addMatterLabel(long matterId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            Label newLabel = labelService.addMatterLabel(matterId, request.JSON as JSONObject)
            respond newLabel, [status: HttpStatus.OK, view: '/label/_label']
        } catch (LabelUniquenessException ignored) {
            respond([text: "Label name is already in use"], status: HttpStatus.BAD_REQUEST)
        } catch (LabelLimitException ignored) {
            respond([text: "Label limit for matter has been reached"], status: HttpStatus.BAD_REQUEST)
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }
}