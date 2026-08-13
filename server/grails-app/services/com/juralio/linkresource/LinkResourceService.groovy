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

package com.juralio.linkresource

import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.linkresource.dao.LinkResourceDAOService
import com.juralio.matter.MatterService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class LinkResourceService {

    MatterService matterService
    ProjectService projectService
    SpringSecurityService springSecurityService
    LinkResourceDAOService linkResourceDAOService
    Integer maxLinkCount = 15
    LinkResourceAuthorisationService linkResourceAuthorisationService

    List<LinkResource> getLinkResourcesForMatter(long matterId) {
        if (!linkResourceAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser

        List<LinkResource> linkResources = linkResourceDAOService.findAllByMatterId(matterId)
        linkResources = linkResources.findAll {
            if (it.workstreamId != null) {
                Project p = projectService.getProject(it.workstreamId)
                if (!projectService.canAccessPrivateWorkstream(p)) {
                    return false
                } else {
                    return true
                }
            } else {
                return true
            }
        }
        List<LinkResource> linkResourceVisits = LinkResourceVisit.findAllByUser(currentUser).sort { it.latestVisitTime }.findAll { linkResources.contains(it.linkResource) }.collect { it.linkResource }
        return linkResources.sort { linkResourceVisits.indexOf(it) }.reverse()
    }

    LinkResource save(def matterId, def workstreamId, ValidatedParameterMap properties) throws MaxLinkResourceCountExcepetion {
        if (!linkResourceAuthorisationService.hasCreateAccess(matterId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Boolean isWorkstreamLink = workstreamId && workstreamId.isNumber()
        Integer count
        if (isWorkstreamLink) {
            count = LinkResource.findAllByMatterIdAndWorkstreamId(matterId, workstreamId).size()
        } else {
            count = LinkResource.findAllByMatterIdAndWorkstreamId(matterId, null).size()
        }
        if (count >= maxLinkCount) {
            throw new MaxLinkResourceCountExcepetion()
        }
        LinkResource linkResource = new LinkResource(
                matterId: matterId,
                workstreamId: isWorkstreamLink ? workstreamId as Long : null,
                name: properties.get('name'),
                url: properties.get('url'),
                image: properties.get('image'),
                creator: currentUser
        )
        return linkResourceDAOService.save(linkResource)
    }

    LinkResource update(def matterId, def workstreamId, ValidatedParameterMap properties) {
        if (!linkResourceAuthorisationService.hasUpdateAccess(matterId as long)) {
            throw new Exception()
        }
        LinkResource linkResource = LinkResource.findByMatterIdAndWorkstreamId(matterId as long, workstreamId && workstreamId.isNumber() ? workstreamId : null)
        linkResource.properties = properties
        return linkResource
    }

    LinkResource delete(long matterId, def projectId, long linkResourceId) {
        if (!linkResourceAuthorisationService.hasUpdateAccess(matterId)) {
            throw new Exception()
        }
        LinkResource linkResource = linkResourceDAOService.get(linkResourceId)
        if (linkResource.matterId != matterId) {
            throw new Exception()
        }
        if (projectId && projectId.isNumber() && linkResource.workstreamId as long != projectId as long) {
            throw new Exception()
        }
        return linkResourceDAOService.delete(linkResource)
    }

    void visit(long linkResourceId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        LinkResource linkResource = LinkResource.findById(linkResourceId)
        if (!linkResource) {
            return
        }

        if (!matterService.isMatterEditor(linkResource.matterId, currentUser.id) && !matterService.isMatterAdmin(linkResource.matterId, currentUser.id, true) && !matterService.isViewer(linkResource.matterId, currentUser.id, true)) {
            throw new Exception()
        }

        LinkResourceVisit linkResourceVisit = LinkResourceVisit.findByUserAndLinkResource(currentUser, linkResource)
        if (linkResourceVisit) {
            linkResourceVisit.latestVisitTime = new Date()
        } else {
            linkResourceVisit = new LinkResourceVisit()
            linkResourceVisit.user = currentUser
            linkResourceVisit.linkResource = linkResource
            linkResourceVisit.latestVisitTime = new Date()
        }
        linkResourceVisit.save()

    }
}
