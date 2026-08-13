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
import com.juralio.common.ValidatedParameterMap
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.DeletedMatterPayload
import com.juralio.matterevent.payload.RestoredMatterPayload
import com.juralio.matter.costs.MatterCosts
import com.juralio.matter.dao.MatterDAOService
import com.juralio.matter.exception.CannotChangeNameException
import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import com.juralio.matter.referencenumber.MatterPostsReferenceNumberService
import com.juralio.matter.referencenumber.MatterReferenceNumberService
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectService
import com.juralio.project.ProjectWithPostsService
import com.juralio.project.dao.TaskCountsDAOService
import com.juralio.task.Creation_type
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import server.PrivateWorkstreamMemberService

@Transactional
class MatterService {

    final String DELETED_MIRROR_POSTFIX = "_deletedmirror"

    MatterDAOService matterDAOService
    MatterActivationService matterActivationService
    MatterActivityService matterActivityService
    MatterAuthorisationService matterAuthorisationService
    MatterEventService matterEventService
    UserRoleService userRoleService
    MatterService matterService
    MatterReferenceNumberService matterReferenceNumberService
    MatterContentReferenceNumberService matterContentReferenceNumberService
    MatterPostsReferenceNumberService matterPostsReferenceNumberService
    ProjectService projectService
    PrivateWorkstreamMemberService privateWorkstreamMemberService
    SpringSecurityService springSecurityService
    TaskCountsDAOService taskCountsDAOService
    ProjectWithPostsService projectWithPostsService
    ProjectAuthorisationService projectAuthorisationService
    DeletedMatterLogService deletedMatterLogService
    CostsAuthorisationService costsAuthorisationService
    OrganisationGroupDAOService organisationGroupDAOService


    Matter getMatter(long matterId) {
        if(!matterAuthorisationService.hasReadAccess(matterId)){
            throw new Exception()
        }
        Matter matter = matterDAOService.get(matterId as long)

        if (matter) {
            matterActivityService.populateActivities(matter)
        }

        if (matter.projects) {
            matter.projects.findAll { Project p ->
                if (p.isPrivate) {
                    return projectAuthorisationService.hasPrivateWorkstreamMemberAccess(matter, p)
                } else {
                    return true
                }
            }.each { p ->
                p.taskCounts = taskCountsDAOService.getTaskCounts(p.id)
                p.postCount = projectWithPostsService.getUsersWorkstreamPostCount(p)
                if (p.isPrivate) {
                    p.privateWorkstreamTeam = privateWorkstreamMemberService.getMembers(matter, p)
                    p.isPrivateMember = p.privateWorkstreamTeam.user.contains(springSecurityService.getCurrentUser())
                }
            }
        }

        return matter
    }

    Matter getMatterOnly(long matterId) {
        if(!matterAuthorisationService.hasReadAccess(matterId)){
            throw new Exception()
        }
        return matterDAOService.get(matterId as long)
    }

    List<Matter> getMattersForTeamMember() {
        List<Matter> matters = matterDAOService.getActiveMatterListForTeamMember()
        matterActivityService.populateActivitiesForCollection(matters)
        return matters
    }

    List<Matter> getAllMattersForOrganisation(def populateProjects = true) {
        if(!matterAuthorisationService.isOrgAdmin()){
            throw new Exception()
        }
        List<Matter> matters = matterDAOService.getAllMattersForUsersOrganisation()
        matters = matters.findAll { Matter m ->
            (!m.isPersonal || canSeePersonalMatter(m.id)) && m.matterStatus != MatterStatus.PENDING_DELETION.value()
        }
        matterActivityService.populateActivitiesForCollection(matters)
        if(populateProjects){
            projectService.populateProjectsForCollection(matters)
        }
        return matters
    }

    Map getAllMattersForOrganisationPaged(
            int startIndex,
            int endIndex,
            String query,
            List<String> statuses,
            String sortField,
            String sortOrder
    ) {
        if(!matterAuthorisationService.isOrgAdmin()){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        int pageSize = endIndex - startIndex

        Map result = matterDAOService.findOrganisationMattersPaged(
                currentUser.organisation.id as Long,
                currentUser.id as Long,
                query,
                statuses,
                sortField,
                sortOrder,
                startIndex,
                pageSize
        )

        matterActivityService.populateActivitiesForCollection(result.matters as List<Matter>)
        projectService.populateProjectsForCollection(result.matters as List<Matter>)

        return result
    }

    List<Matter> getMattersForUser(int limit) {
        List<Matter> matters = matterDAOService.getMattersForUser()
        if (limit > -1 && limit < matters.size()) {
            matters = matters[0..(limit - 1)]
        }
        matterActivityService.populateActivitiesForCollection(matters)
        projectService.populateProjectsForCollection(matters)
        return matters
    }

    List<Matter> getMattersForUser(int startIndex, int endIndex) {
        List<Matter> matters = matterDAOService.getMattersForUser()
        if (startIndex > -1 && endIndex > -1) {
            if(startIndex > matters.size()-1){
                //no more!
                matters = []
            } else{
                if(endIndex > matters.size()-1){
                    matters = matters[startIndex..(matters.size() - 1)]
                }else {
                    matters = matters[startIndex..(endIndex - 1)]
                }
            }
        }
        matterActivityService.populateActivitiesForCollection(matters)
        projectService.populateProjectsForCollection(matters)
        return matters
    }

    List<Matter> getMattersMatchingPattern(String pattern) {
        List<Matter> matters = matterDAOService.getMattersForUser()
        matters = matters.findAll { Matter m -> m.name.contains(pattern) }
        return matters
    }

    boolean hasUnrestrictedView(Matter matter, AppUser user) {
        if (matter && matter.matterStatus == MatterStatus.ACTIVE.value()) {
            return true
        }

        return !(matter?.creator.id == user.id)
    }

    def updateMatter(Matter matter, ValidatedParameterMap properties, boolean matterActivation,boolean matterDeletion) {
        if(!matterAuthorisationService.hasUpdateAccess(matter.id,matterActivation,matterDeletion)){
            throw new Exception()
        }
        AppUser user = springSecurityService.getCurrentUser()
        boolean isOrgAdmin = matterService.isOrgAdmin(matter.id, user)

        if (isOrgAdmin && !matterDeletion &&
                matter.matterStatus == MatterStatus.ACTIVE.value() &&
                !matterService.isMatterAdmin(matter.id, user.id)) {
            return null
        }

        String prevStatus = matter.matterStatus
        matter.properties = properties

        if (matterActivation && matter.matterStatus == MatterStatus.ACTIVE.value()) {
            matterActivationService.activateMatter(matter)
            if (prevStatus == MatterStatus.PENDING_DELETION.value()) {
                deletedMatterLogService.removeDeletedMatterLog(matter.id)
                matterEventService.publish(new RestoredMatterPayload(
                    matterReference: matter.caseId, matterName: matter.name, matterStatus: matter.matterStatus,
                    affectedMemberId: user.id, affectedMemberUsername: user.username,
                    affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname
                ), user, matter)
                matterActivationService.activateProjects(matter)
            }
        } else if (matter.isDirty("matterStatus") && matter.matterStatus == MatterStatus.CLOSED.value()) {
            matterActivationService.closeMatter(matter)
        }

        if (matter.isDirty("matterStatus") && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
            deletedMatterLogService.createDeletedMatterLog(matter.id, matter.organisationId, matter.name, matter.clientName, user.username, new Date())
            matterActivationService.markMatterForDeletion(matter)
            matterEventService.publish(new DeletedMatterPayload(
                matterReference: matter.caseId, matterName: matter.name, matterStatus: matter.matterStatus,
                affectedMemberId: user.id, affectedMemberUsername: user.username,
                affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname
            ), user, matter)
        }

        preventUnauthorisedNameChanges(matter)

        return matter
    }

    void createPersonalMatter(AppUser newUser) {
        if (newUser.externalUserId == null && newUser.organisationId != null) {
            Matter personalMatter = new Matter()
            personalMatter.clientName = newUser.organisation.name
            String name
            if (newUser.firstname) {
                name = newUser.firstname.endsWith('s') ? newUser.firstname + '\'' : newUser.firstname + '\'s'
            } else {
                name = 'Your'
            }
            personalMatter.name = name + ' personal matter'
            personalMatter.organisation = newUser.organisation
            personalMatter.isPersonal = true
            personalMatter.deletedMirror = createDeletedMirror(personalMatter)
            personalMatter.creator = newUser
            Matter savedMatter = matterDAOService.save(personalMatter)
            OrganisationGroup userGroup = newUser.organisationGroup ?: organisationGroupDAOService.getInternalGroupForOrg(newUser.organisation)
            MatterGroupPosition newPositionLink = new MatterGroupPosition(matter: savedMatter, groupPosition: userGroup.groupPosition, organisationGroup: userGroup).save()
            matterActivationService.activateForNewUser(savedMatter, newUser)
            savedMatter.caseId = matterReferenceNumberService.addReferenceNumberToMatter(personalMatter.organisation.id as long,
                    savedMatter.id as long)
            matterContentReferenceNumberService.generateMatterContentSequence(savedMatter.id as long)
            matterPostsReferenceNumberService.generateMatterPostsSequence(savedMatter.id as long)



            Project personalProject = new Project(active: true, creation_type: Creation_type.FROM_BLANK.value(), template: null, isPrivate: false)
            personalProject.name = name + ' personal workstream'
            projectService.save(savedMatter.id, personalProject)
        }
    }

    boolean isPersonalMatter(Long matterId) {
        Matter matter = matterDAOService.get(matterId)
        return matter.isPersonal
    }

    boolean canSeePersonalMatter(Long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return isMatterAdmin(matterId, currentUser.id) || isTeamMember(matterId, currentUser.id)

    }

    boolean isMatterInOrg(Long matterId, Long orgId) {
        Matter matter = matterDAOService.get(matterId)
        return matter.organisationId == orgId
    }


    Matter save(Matter matter,def validatedBody) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        matter.organisation = currentUser.organisation
        matter.creator = currentUser
        matter.deletedMirror = createDeletedMirror(matter)
        Matter savedMatter = matterDAOService.save(matter)
        savedMatter.caseId = matterReferenceNumberService.addReferenceNumberToMatter(matter.organisation.id as long,
                savedMatter.id as long)
        matterContentReferenceNumberService.generateMatterContentSequence(savedMatter.id as long)
        matterPostsReferenceNumberService.generateMatterPostsSequence(savedMatter.id as long)

        //assign the creators group to its default position
        if(validatedBody.position!=null){
            //this code is bad and needs to be updated to work with more than 2 positons
            MatterGroupPosition positionLink = new MatterGroupPosition(matter: savedMatter,groupPosition: validatedBody.position==0 ? GroupPosition.findByOrganisationAndName(savedMatter.organisation, 'Client'):GroupPosition.findByOrganisationAndName(savedMatter.organisation, 'Advisor') , organisationGroup: currentUser.organisationGroup)
            positionLink.save()
        }else {
            MatterGroupPosition positionLink = new MatterGroupPosition(matter: savedMatter,groupPosition: currentUser.organisationGroup.groupPosition, organisationGroup: currentUser.organisationGroup)
            positionLink.save()
        }

        matterActivationService.activateForCurrentUser(savedMatter)
        return savedMatter
    }

    private Matter createDeletedMirror(Matter matter) {
        Matter mirror = new Matter(
                name: matter.name + DELETED_MIRROR_POSTFIX,
                clientName: matter.clientName + DELETED_MIRROR_POSTFIX,
                creationDate: matter.creationDate,
                matterStatus: MatterStatus.INACTIVE.value(),
                userDefinedReferenceNumber: matter.userDefinedReferenceNumber
        )
        mirror.creator = null
        mirror.organisation = matter.organisation
        return matterDAOService.save(mirror)
    }

    private preventUnauthorisedNameChanges(Matter matter) {
        if (matter.isDirty(Matter.NAME) && !isCurrentUserMatterAdmin(matter)) {
            throw new CannotChangeNameException("Cannot change name.  Currently logged on user is not " +
                    "a matter administrator")
        } else if (matter.isDirty(Matter.CLIENT_NAME) && !isCurrentUserMatterAdmin(matter)) {
            throw new CannotChangeNameException("Cannot change client name.  Currently logged on user is not " +
                    "a matter administrator")
        }
    }

    private isCurrentUserMatterAdmin(Matter matter) {
        AppUser currentUser = springSecurityService.getCurrentUser()

        return matter && isMatterAdmin(matter.id, currentUser.id)
    }

    boolean isMatterAdminOnActiveMatter(long matterId, long userId) {
        return isMatterAdmin(matterId, userId, true)
    }

    boolean isTeamMemberOnActiveMatter(long matterId, long userId) {
        return isTeamMember(matterId, userId, true)
    }

    boolean isViewerOnActiveMatter(long matterId, long userId) {
        return isViewer(matterId, userId, true)
    }

    boolean isTeamMember(long matterId, long userId, boolean onlyOnActiveMatter = false) {
        Matter matter = matterDAOService.get(matterId)
        if (!matter || matter.organisation.id != matterAuthorisationService.getUserOrganisationId()) {
            return false
        }

        if (onlyOnActiveMatter && matter?.matterStatus == MatterStatus.CLOSED.value()) {
            return false
        }

        if (onlyOnActiveMatter && matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
            return false
        }

        return (matter.teamMembers.collect { MatterTeamMember it -> it.user.id })?.contains(userId)
    }

    boolean isViewer(long matterId, long userId, boolean onlyOnActiveMatter = false) {
        if (onlyOnActiveMatter) {
            Matter matter = matterDAOService.get(matterId)

            if (matter && matter.matterStatus == MatterStatus.CLOSED.value()) {
                return false
            }

            if (matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
                return false
            }
        }

        return MatterViewer.where {
            matter.id == matterId && user.id == userId
        }.count() == 1
    }

       boolean isCosts(long matterId, long userId, boolean onlyOnActiveMatter = false) {
        Matter matterInstance = matterDAOService.get(matterId)
        if (onlyOnActiveMatter) {
            if (matterInstance && matterInstance.matterStatus == MatterStatus.CLOSED.value()) {
                return false
            }

            if (matterInstance && matterInstance.matterStatus == MatterStatus.PENDING_DELETION.value()) {
                return false
            }
        }
           AppUser currentUser = springSecurityService.getCurrentUser()
           if(!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterInstance)){
                return false
           }

        return MatterCosts.where {
            matter.id == matterId && user.id == userId
        }.count() == 1
    }

    boolean isMatterAdmin(long matterId, long userId, boolean onlyOnActiveMatter = false) {
        if (onlyOnActiveMatter) {
            Matter matter = matterDAOService.get(matterId)

            if (matter && matter.matterStatus == MatterStatus.CLOSED.value()) {
                return false
            }

            if (matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
                return false
            }
        }

        return MatterAdmin.where {
            matter.id == matterId && user.id == userId
        }.count() == 1
    }

    boolean isMatterEditor(long matterId, long userId) {
        return isTeamMember(matterId, userId, true)
    }

    boolean isOrgAdmin(long matterId, AppUser user) {
        if (!user.organisation) return false
        return Matter.where {
            id == matterId && organisation.id == user.organisation.id
        }.count() == 1 && userRoleService.hasOrgAdminRole(user)
    }

    boolean isMatterCreator(long matterId, long userId) {
        Matter matter = matterDAOService.get(matterId)
        if (matter?.creator && matter.organisation.id == matterAuthorisationService.getUserOrganisationId()) {
            return matter.creator.id == userId
        }
        return false
    }

    boolean isMirrorMatter(long matterId) {
        Matter matter = matterDAOService.get(matterId)
        if (matter && !matter.deletedMirror) {
            return true
        }
        return false
    }
}
