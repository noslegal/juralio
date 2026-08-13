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

import com.juralio.auth.AppUser
import com.juralio.linkresource.LinkResource
import com.juralio.linkresource.LinkResourceService
import com.juralio.matter.MatterActivityService
import com.juralio.matter.MatterAdmin
import com.juralio.matter.MatterTeamMember
import com.juralio.matter.MatterViewer
import com.juralio.matter.MatterViewerService
import com.juralio.project.dao.ProjectDAOService
import com.juralio.project.dao.TaskCountsDAOService
import com.juralio.task.Task
import com.juralio.task.TaskTreeHelperService
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMember
import grails.gorm.transactions.Transactional
import server.PrivateWorkstreamMember
import server.PrivateWorkstreamMemberService

class ProjectOverview {
    long id
    String name
    String description
    String referenceNumber

    Boolean isPrivate
    List<PrivateWorkstreamMember> privateWorkstreamTeam = []

    long taskCount = -1
    long postCount = -1

    TaskCountsDTO taskCounts
    List<UserWithTaskCount> people
    def activities = []
}

class UserWithTaskCount {
    AppUser user
    long taskCount
}

class UserWithPermissionsandTaskCounts {
    AppUser user
    long taskCount
    Boolean isAdmin = false
    Boolean isEditor = false
    Boolean isViewer = false
    Boolean isCosts = false
    Boolean isActiveOnWorkstream = false
    Boolean isActiveOnMatter = false
}


class WorkstreamOverviewForMatter {
    Long id
    String name
    TaskCountsDTO taskCounts
    Date startDate
    Date endDate
    String referenceNumber
    def activities = []
    List<Task> levelATasks = []
    Boolean active
    List<Object> milestones = []
    Boolean isPrivate = false
    List<PrivateWorkstreamMember> privateWorkstreamTeam = []
    String description
}

class WorkstreamOverview {
    Long id
    String name
    String description
    String referenceNumber
    TaskCountsDTO taskCounts
    List<UserWithPermissionsandTaskCounts> teamMembers
    List<Task> levelATasks = []
    List<LinkResource> resources = []
    def activities = []
    Long postCount = 0
    Long resourceCount = 0
    Boolean isPrivate = false
    List<PrivateWorkstreamMember> privateWorkstreamTeam = []
    List<MatterViewer> viewers = []
    Boolean active
}

@Transactional
class ProjectOverviewService {

    TaskCountsDAOService taskCountsDAOService
    MatterActivityService matterActivityService
    ProjectDAOService projectDAOService
    TaskTreeHelperService taskTreeHelperService
    LinkResourceService linkResourceService
    PrivateWorkstreamMemberService privateWorkstreamMemberService
    MatterViewerService matterViewerService

    ProjectOverview constructProjectOverview(Project project) {
        ProjectOverview overview = new ProjectOverview()
        overview.id = project.id
        overview.name = project.name
        overview.referenceNumber = project.referenceNumber
        overview.description = project.description
        overview.isPrivate = project.isPrivate

        overview.postCount = getPostCount(project)
        overview.taskCounts = taskCountsDAOService.getTaskCounts(project.id)
        overview.taskCount = overview.taskCounts.doneCount + overview.taskCounts.inProgressCount + overview.taskCounts.notStartedCount + overview.taskCounts.notRequiredCount
        overview.people = getTeamMembers(project)
        matterActivityService.populateActivities(project.matter)
        overview.activities = project.matter.activities
        if (project.isPrivate) {
            overview.privateWorkstreamTeam = project.privateWorkstreamTeam as List
        }

        return overview
    }

    def getPostCount(Project project) {
        long postCount = 0

        project.tasks.each { Task task ->
            postCount += task.posts ? task.posts.size() : 0
        }

        return postCount
    }

    private List<UserWithTaskCount> getTeamMembers(Project project) {
        List<UserWithTaskCount> people = []
        def taskCount = [:]
        def users = [:]

        project.tasks.each {
            Task task ->
                task.teamMembers.each {
                    TaskTeamMember ttm ->
                        if (ttm.user && ttm.user.enabled) {
                            def userId = ttm.user.id
                            if (!taskCount.containsKey(userId)) {
                                taskCount.put(userId, 0)
                            }
                            if (!users.containsKey(userId)) {
                                users.put(userId, ttm)
                            }
                            if (task.status == TaskStatus.IN_PROGRESS.value()) {
                                taskCount.put(userId, taskCount.get(userId) + 1)
                            }
                        } else if ( ttm.placeholder ){
                            def userId = ttm.placeholder.id
                            if (!taskCount.containsKey(userId)) {
                                taskCount.put(userId, 0)
                            }
                            if (!users.containsKey(userId)) {
                                users.put(userId, ttm)
                            }
                            if (task.status == TaskStatus.IN_PROGRESS.value()) {
                                taskCount.put(userId, taskCount.get(userId) + 1)
                            }
                        }
                }
        }

        taskCount.keySet().each({ userId ->
            UserWithTaskCount user = new UserWithTaskCount()
            def userData = users.get(userId)
            if(userData.user != null){
                user.user = userData.user
                user.user.isPlaceholder = false
                user.taskCount = taskCount.get(userId)

            } else {
                //make fake appUser from placeholder and push into list
                if(userData.placeholder.enabled == true){
                    AppUser fakeUser = new AppUser(firstname: userData.placeholder.firstName, lastname: userData.placeholder.lastName, enabled: userData.placeholder.enabled)
                    fakeUser.username = userData.placeholder.emailAddress != null ? userData.placeholder.emailAddress : ''
                    fakeUser.id = userData.placeholder.id
                    user.user = fakeUser
                    user.user.isPlaceholder = true
                }


            }
            if(user.user != null){
                people.add(user)
            }
        })

        return people
    }

    private List<UserWithPermissionsandTaskCounts> getTeamMembersWithPermissions(Project project) {
        List<UserWithPermissionsandTaskCounts> people = []
        def taskCount = [:]
        def users = [:]

        project.tasks.each {
            Task task ->
                task.teamMembers.each {
                    TaskTeamMember ttm ->
                        if ( ttm.user && ttm.user.enabled) {
                            def userId = ttm.user.id
                            if (!taskCount.containsKey(userId)) {
                                taskCount.put(userId, 0)
                            }
                            if (!users.containsKey(userId)) {
                                users.put(userId, ttm)
                            }
                            if (task.status == TaskStatus.IN_PROGRESS.value()) {
                                taskCount.put(userId, taskCount.get(userId) + 1)
                            }
                        }  else if ( ttm.placeholder ){
                            def userId = ttm.placeholder.id
                            if (!taskCount.containsKey(userId)) {
                                taskCount.put(userId, 0)
                            }
                            if (!users.containsKey(userId)) {
                                users.put(userId, ttm)
                            }
                            if (task.status == TaskStatus.IN_PROGRESS.value()) {
                                taskCount.put(userId, taskCount.get(userId) + 1)
                            }
                        }
                }
        }

        taskCount.keySet().each({ userId ->
            UserWithPermissionsandTaskCounts user = new UserWithPermissionsandTaskCounts()
            def userData = users.get(userId)
            if(userData.user != null){
                user.user = userData.user
                user.user.isPlaceholder = false
                user.taskCount = taskCount.get(userId)
                user.isAdmin = project.matter.matterAdmins.find { it.user.id == userId }?.id
                user.isEditor = project.matter.teamMembers.find { it.user.id == userId }?.id
                user.isCosts = project.matter.matterCosts.find { it.user.id == userId }?.id
                user.isViewer = project.matter.matterViewers.find { it.user.id == userId }?.id
                if (project.isPrivate) {
                    user.isActiveOnWorkstream = project.privateWorkstreamTeam.find { it.user.id == userId } != null

                }
            } else {
                //make fake appUser from placeholder and push into list
                if(userData.placeholder.enabled == true){
                    AppUser fakeUser = new AppUser(firstname: userData.placeholder.firstName, lastname: userData.placeholder.lastName, enabled: userData.placeholder.enabled)
                    fakeUser.username = userData.placeholder.emailAddress != null ? userData.placeholder.emailAddress : ''
                    fakeUser.id = userData.placeholder.id
                    user.taskCount = taskCount.get(userId)
                    user.user = fakeUser
                    user.user.isPlaceholder = true
                    user.isAdmin = false
                    user.isEditor = false
                    user.isCosts = false
                    user.isViewer = false
                    if (project.isPrivate) {
                        user.isActiveOnWorkstream = project.privateWorkstreamTeam.find { it.user.id == userId } != null
                    }
                }
            }

            if(user.user != null){
                people.add(user)
            }

        })

        return people
    }

    WorkstreamOverviewForMatter getWorkstreamOverviewForMatter(Project workstream, Boolean includeMilestones = false) {
        WorkstreamOverviewForMatter overview = new WorkstreamOverviewForMatter(id: workstream.id, name: workstream.name, referenceNumber: workstream.referenceNumber, active: workstream.active, isPrivate: workstream.isPrivate,description: workstream.description)
        overview.taskCounts = taskCountsDAOService.getTaskCounts(workstream.id, true)
        overview.startDate = projectDAOService.getEarliestStartDateInProject(workstream.id)
        overview.endDate = projectDAOService.getLatestEndDateInProject(workstream.id)
        overview.activities = workstream.matter.activities
        overview.levelATasks = workstream.tasks.findAll { t -> t.level == 1 && t.status != TaskStatus.NOT_REQUIRED.value() }
        overview.levelATasks.each { Task t ->
            t.taskCounts = taskCountsDAOService.getTaskCounts(t, false)
            if (includeMilestones) {
                t.milestones = taskTreeHelperService.getFlatTaskList(t).findAll { Task ta -> ta.isMilestone }.collect { [status: it.status, date: it.actualEndDate ? it.actualEndDate : it.plannedEndDate, name: it.name, id:it.id] }
            }
        }
        overview.milestones = workstream.tasks.findAll { Task t -> t.isMilestone }.collect { [status: it.status, date: it.actualEndDate ? it.actualEndDate : it.plannedEndDate, name: it.name, id:it.id] } as List
        if (workstream.isPrivate) {
            overview.privateWorkstreamTeam = workstream.privateWorkstreamTeam as List
        }
        return overview
    }

    WorkstreamOverview getworkstreamOverview(Project workstream) {
        WorkstreamOverview overview = new WorkstreamOverview(id: workstream.id, name: workstream.name, description: workstream.description, referenceNumber: workstream.referenceNumber, isPrivate: workstream.isPrivate, active: workstream.active)
        overview.taskCounts = taskCountsDAOService.getTaskCounts(workstream.id, false)
        overview.teamMembers = getTeamMembersWithPermissions(workstream)
        matterActivityService.populateActivities(workstream.matter)
        overview.activities = workstream.matter.activities
        overview.levelATasks = workstream.tasks.findAll { t -> t.level == 1 && t.status != TaskStatus.NOT_REQUIRED.value() }
        overview.levelATasks.each { Task t ->
            t.taskCounts = taskCountsDAOService.getTaskCounts(t, false)
            t.milestones = taskTreeHelperService.getFlatTaskList(t).findAll { Task ta -> ta.isMilestone }.collect { [status: it.status, date: it.actualEndDate ? it.actualEndDate : it.plannedEndDate, name: it.name, id:it.id] }
        }
        overview.postCount = getPostCount(workstream)
        List<LinkResource> resources = linkResourceService.getLinkResourcesForMatter(workstream.matter.id).findAll { it.workstreamId == workstream.id }
        overview.resourceCount = resources.size()
        overview.resources = resources.stream().limit(3).collect()
        if (workstream.isPrivate) {
            overview.privateWorkstreamTeam = privateWorkstreamMemberService.getMembers(workstream.matter, workstream)
        }
        overview.viewers = workstream.matter.matterViewers as List

        return overview
    }


}
