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

package com.juralio.project.admin

import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.CostsService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.task.Task
import com.juralio.task.TaskService
import grails.gorm.transactions.Transactional
import server.PrivateWorkstreamMember
import server.PrivateWorkstreamMemberService

@Transactional
class ProjectAdminService {

    ProjectService projectService
    def springSecurityService
    MatterService matterService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    CostsAuthorisationService costsAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    CostsService costsService
    TaskService taskService

    PrivateWorkstreamMemberService privateWorkstreamMemberService
    ProjectAuthorisationService projectAuthorisationService

    Project updateProject(Project projectToUpdate, ValidatedParameterMap parameters) {
        if(!projectAuthorisationService.hasUpdateAccess(projectToUpdate.matter.id)){
            throw new Exception()
        }
        AppUser user = springSecurityService.getCurrentUser()
        if (parameters.containsKey("active") && parameters.get("active") == false) {
            parameters.setProperty('closedDate', new Date())
            parameters.setProperty('closer', user)
            if (costsAuthorisationService.orgCostsSetupForMatterPosition(user, projectToUpdate.matter) && matterAuthorisationService.hasCostsAccess(projectToUpdate.matterId)) {
                List<Task> taskList = taskService.getLevelATasks(projectToUpdate)
                taskList.forEach { Task task -> costsService.removeTaskFromCosts(task)
                }
            }
        }
        projectToUpdate.properties = parameters
        if (parameters.containsKey("active") && parameters.get("active") == true) {

        }
        if (projectToUpdate.isPrivate) {
            if (projectService.canAccessPrivateWorkstream(projectToUpdate) || matterService.isMatterAdmin(projectToUpdate.matter.id, user.id)) {
                List<PrivateWorkstreamMember> privateWorkstreamMembers = privateWorkstreamMemberDAOService.findAllByWorkstream(projectToUpdate)
                projectToUpdate.privateWorkstreamTeam = privateWorkstreamMembers
                if(matterService.isMatterEditor(projectToUpdate.matterId,user.id) && privateWorkstreamMembers.findAll{PrivateWorkstreamMember member -> member.user.id ==user.id}.size()<1){
                    privateWorkstreamMemberService.saveMember(projectToUpdate.matter,projectToUpdate,user)
                }
            }
        }

        return projectToUpdate
    }
}