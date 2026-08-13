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

package com.juralio.search

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.inboxnotification.InboxFilterType
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.task.Task
import com.juralio.task.followers.TaskFollowerService
import com.juralio.task.team.TaskTeamMemberService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

import static org.springframework.http.HttpStatus.BAD_REQUEST
import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class ProjectContentSearchController {

    static allowedMethods = [performSearch: "GET"]
    protected final Log logger = LogFactory.getLog(getClass())

    ProjectService projectService
    ProjectContentSearchService projectContentSearchService
    ProjectContentSearchFilter projectContentSearchFilter
    TaskTeamMemberService taskTeamMemberService
    TaskFollowerService taskFollowerService
    SpringSecurityService springSecurityService
    UserService userService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def performSearch() {
        List<ProjectContentSearchResultDTO> response
        def status
        if ((params.matter_id && params.project_id) || params.teamSearchType || params.team) {
            ProjectContentSearchFilter filterObject = projectContentSearchFilter.getInstance(params, request)
            if (!filterObject.hasErrors()) {
                respond projectContentSearchService.performSearch(filterObject), [status: OK]
            } else {
                respond  status: BAD_REQUEST
                return
            }
        } else {
            respond universalSearch(), [status: OK]
            return
        }
        String personFilter = params.personFilter
        long personFilterId = params.personFilterId != null ? Integer.parseInt(params.personFilterId) : -1
        if (personFilter?.size() > 0 && personFilter != InboxFilterType.ANYBODY.value()) {
            respond applyPersonFilter(response, personFilter, personFilterId), [status: OK]
            return
        }
        //respond response, [status: status]
    }


    private List<ProjectContentSearchResultDTO> applyPersonFilter(List<ProjectContentSearchResultDTO> resultList, String personFilter, long personFilterId) {
        AppUser filterUser
        List<ProjectContentSearchResultDTO> filteredResponse = []

        if (personFilter == InboxFilterType.USER.value()) {
            filterUser = userService.getUserById(personFilterId)
        } else if (params.personFilter == InboxFilterType.YOU.value()) {
            filterUser = springSecurityService.getCurrentUser()
        }
        if (params.personFilter == InboxFilterType.USER.value() ||
                params.personFilter == InboxFilterType.YOU.value()) {

            resultList.each {
                result ->
                    if (taskTeamMemberService.isTeamMember(result.id as Long, filterUser, result.projectId as long) || taskFollowerService.isTaskFollower(result.id as Long, filterUser)) {
                        filteredResponse.add(result)
                    }
            }
        } else if (params.personFilter == InboxFilterType.UNASSIGNED.value()) {
            resultList.each {
                result ->
                    def task = Task.get(result.id as Long)
                    if (task.teamMembers.size() == 0) {
                        filteredResponse.add(result)
                    }
            }
        }
        return filteredResponse
    }

    private universalSearch() {
        def response
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        List<ProjectContentSearchFilter> filters = []
        List<ProjectContentSearchResultDTO> responses = []
        List<Project> projects = projectService.getProjectsByUser()
        projects = projects.findAll { Project project -> !project.isPrivate || (project.isPrivate && (privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(project, currentUser) != null)) }

        projects.each { Project project ->
            params.project_id = project.id
            ProjectContentSearchFilter filterObject = projectContentSearchFilter.getInstance(params, request)
            filters.add(filterObject)
        }

        filters.each { ProjectContentSearchFilter filter ->
            def result = projectContentSearchService.performSearch(filter)
            if (result) {
                responses.add(result)
            }
        }

        response = responses.flatten()
        return response
    }
}
