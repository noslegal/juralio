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

package com.juralio.project

import com.juralio.auth.*
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.project.dao.ProjectDAOService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic
import server.PrivateWorkstreamMember

@Transactional
@CompileStatic
class ProjectAuthorisationService extends BaseAuthorisationService
        implements ReadAuthorisation, CreateAuthorisation, UpdateAuthorisation {

    MatterService matterService
    ProjectDAOService projectDAOService
    ProjectService projectService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    UserRoleService userRoleService

    @Override
    boolean hasReadAccess(Long entityId) {
        Project project = projectDAOService.get(entityId)
        if (project) {
            if (project.isPrivate && !projectService.canAccessPrivateWorkstream(project)) {
                return false
            }
            if (project.isPendingDeletion) {
                return false
            }
            if (matterService.isTeamMemberOnActiveMatter(project.matter.id, getUserId()) ||
                    matterService.isViewerOnActiveMatter(project.matter.id, getUserId())) {
                return true
            }
            Project otherProject = projectDAOService.findByDeletedMirror(project)
            return (otherProject && matterService.isTeamMemberOnActiveMatter(otherProject.matter.id, getUserId()))
        }
        return false
    }

    boolean hasWriteAccess(Long entityId) {
        return hasReadAccess(entityId)
    }

    boolean hasCopyAccess(Long entityId) {
        return hasReadAccess(entityId)
    }

    boolean orgProjectAccess(Long entityId) {
        return matterService.isOrgAdmin(entityId, getUser())
    }

    @Override
    boolean hasCreateAccess(Long parentEntityId) {
        if (matterService.isPersonalMatter(parentEntityId) && (userRoleService.hasSysadminRole(getUser()))) {
            return true
        }
        if (matterService.isPersonalMatter(parentEntityId) && userRoleService.hasOrgAdminRole(getUser()) && matterService.isMatterInOrg(parentEntityId, getUser().organisation.id as Long)) {
            return true
        }
        return matterService.isMatterAdmin(parentEntityId, getUserId())
    }

    boolean hasListReadAccess(long parentEntityId, boolean limitToMTMs) {
        boolean isViewer = matterService.isViewerOnActiveMatter(parentEntityId, getUserId())
        return limitToMTMs ? isTeamMemberOnActiveMatter(parentEntityId) || isViewer : isMatterTeamMemberOrMatterAdmin(parentEntityId) || isViewer  || orgProjectAccess(parentEntityId)
    }

    boolean hasUnarchiveAccess(long entityId) {
        Project project = projectDAOService.get(entityId)
        return matterService.isMatterAdmin(project.matter.id, getUserId())
    }

    @Override
    boolean hasUpdateAccess(Long entityId) {
        return isTeamMemberOnActiveMatter(entityId) || isMatterAdmin(entityId)
    }

    boolean isTeamMemberOnActiveMatter(long parentEntityId) {
        return matterService.isTeamMemberOnActiveMatter(parentEntityId, getUserId())
    }

    boolean isMatterAdmin(long parentEntityId) {
        return matterService.isMatterAdmin(parentEntityId, getUserId())
    }

    boolean isMatterTeamMemberOrMatterAdmin(Long parentEntityId) {
        return isTeamMemberOnActiveMatter(parentEntityId) || isMatterAdmin(parentEntityId)
    }

    boolean isOnActiveMatterTeam(long matterId, long userId) {
        return matterService.isMatterAdminOnActiveMatter(matterId, userId) ||
                matterService.isTeamMemberOnActiveMatter(matterId, userId) ||
                matterService.isViewerOnActiveMatter(matterId, userId)
    }

    boolean hasPrivateWorkstreamMemberAccess(Matter matter, Project workstream) {
        PrivateWorkstreamMember workstreamMember = privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(workstream, getUser())
        return workstreamMember != null && isOnActiveMatterTeam(matter.id, getUserId()) || isMatterAdmin(matter.id)
    }

    boolean hasAddPrivateWorkstreamMemberAccess(Matter matter, Project workstream, AppUser userToAdd) {
        // Must be a matter admin
        if (!isMatterAdmin(matter.id)) {
            return false
        }
        // userToAdd should be in the matter team
        if (!isOnActiveMatterTeam(matter.id, userToAdd.id)) {
            return false
        }
        return true
    }

    boolean hasRemovePrivateWorkstreamMemberAccess(Matter matter) {
        // Must be a matter admin
        if (!isMatterAdmin(matter.id)) {
            return false
        }
        return true
    }

}
