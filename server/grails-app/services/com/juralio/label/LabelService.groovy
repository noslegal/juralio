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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.label.dao.InactiveLabelDAOService
import com.juralio.label.dao.LabelDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAdmin
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.exception.MatterViewerException
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.exception.UserNotInOrganisationException
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.label.TaskLabel
import com.juralio.task.labels.TaskLabelDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic
import org.grails.web.json.JSONObject

@Transactional
@CompileStatic
class LabelService {
    LabelDAOService labelDAOService
    LabelDecoratorService labelDecoratorService
    InactiveLabelDAOService inactiveLabelDAOService
    MatterService matterService
    MatterAuthorisationService matterAuthorisationService
    SpringSecurityService springSecurityService
    ProjectService projectService
    TaskLabelDAOService taskLabelDAOService
    LabelAuthorisationService labelAuthorisationService
    String INACTIVE = 'inactive'
    int ORGANISATION_LABEL_LIMIT = 20
    int MATTER_LABEL_LIMIT = 20
    int HASHTAG_LABEL_LIMIT = 20
    OrganisationService organisationService

    List<Label> decorateLabels(List<Label> labels, Long organisationId = null, Long matterId = null) {
        for (label in labels) {
            labelDecoratorService.decorateLabelWithInactivity(label, organisationId, matterId)
        }
    }

    void decorateLabel(Label label, Long organisationId = null, Long matterId = null) {
        labelDecoratorService.decorateLabelWithInactivity(label, organisationId, matterId)
    }

    private void decorateUsageCounts(List<Label> labels, long matterId) {
        for (label in labels) {
            labelDecoratorService.decorateWithUsageCount(label, matterId)
        }
    }

    private void promote(Label organisationLabel) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (currentUser.organisationId != organisationLabel.organisationId) {
            return
        }
        List<Label> labelsToBePromoted = labelDAOService.findMatterLevelLabelsWithTheSameName(organisationLabel.organisationId as Integer, organisationLabel.type, organisationLabel.name)
        List<TaskLabel> taskLabelsToUpdate = labelDAOService.findTaskLabelsForListOfLabels(labelsToBePromoted)
        taskLabelsToUpdate.each { TaskLabel tl ->
            tl.label = organisationLabel
            tl.save()
        }

        //notify the admins
        List<MatterAdmin> matterAdminsToBeNotified = []
        labelsToBePromoted.each { Label l ->
            Matter matter = matterService.getMatter(l.matter.id)
            matterAdminsToBeNotified.addAll(matter.getMatterAdmins() as List<MatterAdmin>)
        }
        List<AppUser> usersToBeNotified = matterAdminsToBeNotified.collect { MatterAdmin ma -> ma.user }.toSet().toList()

        // PBI-10: label promote/delete notifications dropped with the old InboxNotification
        // path. They are org-scoped and will return on the new event platform via PBI-7b.
        //delete the old labels
        labelsToBePromoted.each { Label l -> l.delete() }
    }

    private void demote(Label matterLabel) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser

        List<Label> inactiveMatchingOrgLabels = getOrganisationLevelLabels(currentUser.organisationId as long).findAll { Label label -> label.name == matterLabel.name && label.inactive }

        List<Project> projects = projectService.getProjectsByMatterId(matterLabel.matter.id, false, false, false, true, false)
        List<Task> tasks = projects.collect { Project p -> p.tasks }.flatten() as List<Task>
        List<TaskLabel> taskLabelsToUpdate = labelDAOService.findTaskLabelsForListOfLabels(inactiveMatchingOrgLabels).findAll { TaskLabel tl -> tasks.contains(tl.task) }

        taskLabelsToUpdate.each { TaskLabel tl ->
            tl.label = matterLabel
            tl.save()
        }
    }

    private Label updateLabel(Label label, ValidatedParameterMap newProperties, Long organisationId = null, Long matterId = null, Long labelId = null) {
        newProperties.keySet()
                .findAll { key -> key != INACTIVE }
                .each { key ->
                    label[key as String] = newProperties[key]
                }

        if (newProperties.keySet().contains(INACTIVE)) {
            boolean inactiveValue = newProperties[INACTIVE] == true

            if (matterId) {
                inactiveLabelDAOService.setInactiveMatterLabel(label, organisationId, matterId, inactiveValue)
            } else if (organisationId) {
                label = inactiveLabelDAOService.setInactiveOrganisationLabel(labelId, label, organisationId, inactiveValue)
                // PBI-10: label delete notification dropped with the old InboxNotification path
                // (org-scoped; returns on the new event platform via PBI-7b).
            }
            label.inactive = inactiveValue
            if (!inactiveValue && label.organisationId != null) {
                promote(label)
            }
            if (!inactiveValue && label.matterId != null) {
                demote(label)
            }
            return label
        }
        if (label.matterId != null && label.type != LabelTypes.USER_DEFINED.value()) {
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            boolean isMatterAdmin = matterService.isMatterAdmin(label.matter.id, currentUser.id)
            if (!isMatterAdmin) {
                throw new InsufficientPermissions()
            }
        }


        labelDAOService.save(label)
        if (newProperties.keySet().contains('name') && label.organisationId != null) {
            promote(label)
        }
        if (newProperties.keySet().contains('name') && label.matterId != null) {
            demote(label)
        }
        decorateLabel(label, organisationId, matterId)
        return label
    }

    List<Label> getSystemLevelLabels() {
        List<Label> labels = labelDAOService.findSystemLevelLabels()
        decorateLabels(labels)
        return labels
    }

    Label getLabel(long labelId) {
        return labelDAOService.findLabel(labelId)
    }

    List<Label> getOrganisationLevelLabels(long organisationId) throws UserNotInOrganisationException {
        if (!labelAuthorisationService.hasListReadAccess(organisationId)) {
            throw new Exception()
        }
        Organisation organisation = organisationService.getOrganisationDAOService().getOrganisation(organisationId)

        List<Label> labels = labelDAOService.findOrganisationLevelLabels(organisation)
        decorateLabels(labels, organisationId)
        return labels.findAll { Label label -> label.inactiveBy == null || label.inactiveBy == LabelInactiveBy.ORGANISATION.value() }
    }

    List<Label> getMatterLevelLabels(long matterId) throws MatterViewerException {
        if (!labelAuthorisationService.hasListReadAccess(null,matterId)) {
            throw new Exception()
        }
        List<Label> labels = labelDAOService.findMatterLevelLabels(matterId)
        decorateLabels(labels, null, matterId)
        return labels.findAll { Label label -> label.inactiveBy == null || label.inactiveBy == LabelInactiveBy.MATTER.value() }
    }

    List<Label> getOrganisationAndSystemLabels(long organisationId) throws UserNotInOrganisationException {
        if (!labelAuthorisationService.hasListReadAccess(organisationId)) {
            throw new Exception()
        }
        Organisation organisation = organisationService.getOrganisationDAOService().getOrganisation(organisationId)
        List<Label> labels = labelDAOService.findOrganisationLevelAndAboveLabels(organisation)
        decorateLabels(labels, organisationId)
        return labels.findAll { Label label -> label.inactiveBy == null || label.inactiveBy == LabelInactiveBy.ORGANISATION.value() }
    }

    List<Label> getMatterAndOrganisationAndSystemLabels(long organisationId, long matterId, boolean includeUsageCounts = true) throws UserNotInOrganisationException, MatterViewerException {
        if (!labelAuthorisationService.hasListReadAccess(organisationId,matterId)) {
            throw new Exception()
        }
        Organisation organisation = organisationService.getOrganisationDAOService().getOrganisation(organisationId)
        List<Label> labels = labelDAOService.findMatterLevelAndAboveLabels(organisation, matterId)
        decorateLabels(labels, organisationId, matterId)
        if (includeUsageCounts && matterAuthorisationService.hasTeamMemberAccess(matterId)) {
            decorateUsageCounts(labels, matterId)
        }
        return labels.findAll { Label label -> label.inactiveBy == null || label.inactiveBy == LabelInactiveBy.MATTER.value() }
    }


    Label updateOrganisationLabel(long organisationId, long labelId, JSONObject newProperties) throws UserNotInOrganisationException {
        if (!labelAuthorisationService.hasUpdateAccess(labelId)) {
            throw new Exception()
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(newProperties, [], ['name', 'type', 'inactive', 'modifier'])
        Label organisationLabel = labelDAOService.findOrganisationLabel(organisationId, labelId)
        return updateLabel(organisationLabel, validatedBody, organisationId, null, labelId)
    }

    Label updateMatterLabel(long matterId, long labelId, JSONObject newProperties) throws MatterViewerException {
        if (!labelAuthorisationService.hasUpdateAccess(labelId)) {
            throw new Exception()
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(newProperties, [], ['name', 'type', 'inactive', 'modifier'])

        Label matterLabel = labelDAOService.findMatterLabel(matterId, labelId)
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        return updateLabel(matterLabel, validatedBody, user.organisation.id, matterId)
    }

    Label reactivateLabel(Label existingLabel, Long organisationId, Long matterId) throws LabelUniquenessException {
        if (existingLabel) {
            InactiveLabel inactiveLabel = inactiveLabelDAOService.getInactiveLabel(existingLabel, organisationId, matterId)
            if (inactiveLabel) {
                JSONObject properties = new JSONObject()
                properties.put("inactive", "false")
                Label newLabel
                if (matterId) {
                    newLabel = updateMatterLabel(matterId, existingLabel.id, properties)
                } else {
                    newLabel = updateOrganisationLabel(organisationId, existingLabel.id, properties)
                }
                return newLabel
            }
            throw new LabelUniquenessException()
        }
        return null
    }

    Label addOrganisationLabel(long organisationId, JSONObject newProperties) throws UserNotInOrganisationException, LabelUniquenessException, LabelLimitException {
        if (!labelAuthorisationService.hasOrganisationCreateAccess(organisationId)) {
            throw new Exception()
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(newProperties, ['name', 'type'], ['inactive', 'modifier'])
        checkLabelLimitForOrganisation(organisationId)
        Organisation organisation = organisationService.getOrganisationDAOService().getOrganisation(organisationId)

        Label existingLabel = Label.findWhere(name: validatedBody.get("name"), type: validatedBody.get("type"), organisation: organisation)
        Label reactivatedLabel = reactivateLabel(existingLabel, organisationId, null)
        if (reactivatedLabel) {
            return reactivatedLabel
        }

        Label newLabel = new Label()
        newLabel.organisation = organisation
        return updateLabel(newLabel, validatedBody)
    }

    Label addMatterLabel(long matterId, JSONObject newProperties) throws MatterViewerException, InsufficientPermissions, LabelUniquenessException, LabelLimitException {
        if (!labelAuthorisationService.hasMatterCreateAccess(matterId)) {
            throw new Exception()
        }
        checkLabelLimitForMatter(matterId, newProperties.type)
        Label newLabel = new Label()
        newLabel.matter = matterService.getMatter(matterId)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (newProperties.type == LabelTypes.USER_DEFINED.value()) {
            //check they are a matter editor
            boolean isTeamMember = matterService.isTeamMember(matterId, currentUser.id)
            if (!isTeamMember) {
                throw new InsufficientPermissions()
            }
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(newProperties, ['name', 'type'], ['inactive', 'modifier'])

        Label existingLabel = Label.findWhere(name: validatedBody.get("name"), type: validatedBody.get("type"), matter: newLabel.matter)
        Label reactivedLabel = reactivateLabel(existingLabel, currentUser.organisation.id, matterId)
        if (reactivedLabel) {
            return reactivedLabel
        }

        return updateLabel(newLabel, validatedBody)
    }


    Boolean mergeLabels(Long matterId, Long labelId1, Long label2Id) {
        if (!labelAuthorisationService.hasMergeAccess(matterId)) {
            throw new Exception()
        }
        try {
            Label label2 = getLabel(label2Id)
            Label label1 = getLabel(labelId1)
            if (
                    (label1.organisation!= label2.organisation ) || label1.matterId != matterId || label2.matterId != matterId) {
                throw new Exception()
            }
            if (matterId) {
                if (label1.matterId != matterId || label2.matterId != matterId) {
                    throw new Exception()
                }
            }
            decorateLabel(label1, label1.organisation?label1.organisation.id:null, label1.matter.id)
            if (label1.type != label2.type || label1.inactive) {
                return false
            }


            List<TaskLabel> usages = taskLabelDAOService.findTaskLabelsByLabel(label2)
            usages.each { TaskLabel tl ->
                Boolean alreadyExists = taskLabelDAOService.findTaskLabel(tl.task, label1) != null
                if (alreadyExists) {
                    tl.delete()
                } else {
                    tl.label = label1
                    tl.save()
                }
            }
            label2.delete()
            return true
        } catch (Exception ignored) {
            return false
        }
    }

    List<Task> getLabelUsageMatter(long matterId, long labelId) {
        if (!matterAuthorisationService.hasTeamMemberAccess(matterId)) {
            throw new Exception()
        }
        List<Project> projects = projectService.getProjectsByMatterId(matterId, false, true)
        List<Task> result = []

        for (Project project in projects) {
            for (Task task in (project.tasks as List<Task>)) {
                for (TaskLabel taskLabel in task.labels) {
                    if (taskLabel.label.id == labelId) {
                        result.add(task)
                        break
                    }
                }
            }
        }

        result.sort({ a, b -> a.name <=> b.name })
        result.sort({ a, b -> a.level <=> b.level })
        return result
    }

    private void checkLabelLimitForOrganisation(long organisationId) throws LabelLimitException {
        Organisation organisation = organisationService.getOrganisationDAOService().getOrganisation(organisationId)
        if (labelDAOService.findOrganisationLevelLabels(organisation).size() == ORGANISATION_LABEL_LIMIT) {
            throw new LabelLimitException()
        }
    }

    private void checkLabelLimitForMatter(long matterId, Object labelType) throws LabelLimitException {
        List<Label> matterLabels = labelDAOService.findMatterLevelLabels(matterId)

        def riskAndWorkflowLabels = matterLabels.findAll({ label -> label.type == LabelTypes.RISK.value() || label.type == LabelTypes.WORKFLOW.value() })
        def userDefinedLabels = matterLabels.findAll({ label -> label.type == LabelTypes.USER_DEFINED.value() })

        if (labelType == LabelTypes.RISK.value() || labelType == LabelTypes.WORKFLOW.value()) {
            if (riskAndWorkflowLabels.size() == MATTER_LABEL_LIMIT) {
                throw new LabelLimitException()
            }
        }
        if (labelType == LabelTypes.USER_DEFINED.value()) {
            if (userDefinedLabels.size() == HASHTAG_LABEL_LIMIT) {
                throw new LabelLimitException()
            }
        }
    }
}
