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

package com.juralio.task.team

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.common.UserDecoratorService
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.AddedToTaskTeamPayload
import com.juralio.matterevent.payload.RemovedFromTaskTeamPayload
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.Placeholders
import com.juralio.matter.PlaceholdersService
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskTreeHelperService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.exception.TaskUserCannotBeBothFollowerAndTeamMemberException
import com.juralio.task.followers.TaskFollowerService
import com.juralio.task.team.dao.TaskTeamMemberDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.security.access.AccessDeniedException

@Transactional
class TaskTeamMemberService {
    UserService userService
    MatterService matterService
    TaskDAOService taskDAOService
    TaskTeamMemberDAOService taskTeamMemberDAOService
    TaskFollowerService taskFollowerService
    SpringSecurityService springSecurityService
    MatterEventService matterEventService
    UserDecoratorService userDecoratorService
    TaskTreeHelperService taskTreeHelperService
    PlaceholdersService placeholdersService
    TaskAuthorisationService taskAuthorisationService

    private void publishTaskTeamChange(AppUser user, Task task, boolean added) {
        def payload = added ?
            new AddedToTaskTeamPayload(
                taskId: task.id, taskName: task.name, taskLevel: task.level,
                taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                projectId: task.project.id, projectName: task.project.name,
                affectedMemberId: user.id, affectedMemberUsername: user.username,
                affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname
            ) :
            new RemovedFromTaskTeamPayload(
                taskId: task.id, taskName: task.name, taskLevel: task.level,
                taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                projectId: task.project.id, projectName: task.project.name,
                affectedMemberId: user.id, affectedMemberUsername: user.username,
                affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname
            )
        matterEventService.publish(payload, springSecurityService.getCurrentUser() as AppUser, task.project.matter)
    }

    def addTeamMember(long taskId, long userId, long projectId) throws AccessDeniedException, TaskUserCannotBeBothFollowerAndTeamMemberException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        Matter matter = task.project.matter
        AppUser user = userService.getUserById(userId)

        if (!user.enabled) {
            throw new AccessDeniedException("""user $user.id cannot be added as a team member to task $task.id
                                               as the use account is not enabled.""")
        }

        if (!matterService.isTeamMember(matter.id, user.id) && !matterService.isViewer(matter.id, user.id)) {
            throw new AccessDeniedException("""user $user.id cannot be added as a team member to task $task.id
                                               as user is not a matter team member of $matter.id""")
        }

        if (taskTeamMemberDAOService.exists(task.id, user.id)) {
            return taskTeamMemberDAOService.get(task,user)
        }

        if (!taskFollowerService.isTaskFollower(task, user)) {
            TaskTeamMember ttm = taskTeamMemberDAOService.save(task, user)
            publishTaskTeamChange(user, task, true)
            userDecoratorService.decorateActiveUsersOnMatter([ttm.user], task.project.matter)
            return ttm
        } else
            throw new TaskUserCannotBeBothFollowerAndTeamMemberException()
    }

    def addPlaceholderTeamMember(long taskId, long placeholderId, long projectId) throws AccessDeniedException, TaskUserCannotBeBothFollowerAndTeamMemberException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        Matter matter = task.project.matter
        Placeholders user = placeholdersService.getPlaceholder(placeholderId, matter.id)

        if (!user.enabled) {
            throw new AccessDeniedException("""user $user.id cannot be added as a team member to task $task.id
                                               as the use account is not enabled.""")
        }
        if (taskTeamMemberDAOService.existsPlaceholder(task.id, user.id)) {
            return taskTeamMemberDAOService.getPlaceholder(task,user)
        }
            TaskTeamMember ttm = taskTeamMemberDAOService.savePlaceHolder(task, user)
            return ttm
    }

    def deleteTeamMember(long taskId, long userId, long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        AppUser user
        TaskTeamMember ttm
        def taskTeamMember = task.teamMembers.find(x->x.user!=null&&x.user.id==userId)
        if(taskTeamMember?.user!=null){
            user = taskTeamMember.user
            ttm = taskTeamMemberDAOService.delete(task, user)
            publishTaskTeamChange(user, task, false)
        }else {
            Placeholders placeholder = placeholdersService.getPlaceholder(userId, task.project.matter.id)
            ttm =taskTeamMemberDAOService.deletePlaceholder(task,placeholder)
        }
        return ttm
    }

    boolean isTeamMember(Task task, AppUser user, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(task.id,projectId)){
            throw new Exception()
        }
        if (task.teamMembers.size() == 0) {
            return false
        }
        TaskTeamMember result = TaskTeamMember.findByTaskAndUser(task, user)
        return result != null
    }

    def isTeamMember(long taskId, AppUser user, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if (task.teamMembers.size() == 0) {
            return false
        }
        TaskTeamMember result = TaskTeamMember.findByTaskAndUser(task, user)
        return result != null
    }

    List<AppUser> getTaskTeamMembersAndFollowersExcludingSelfAndPlaceholders(Task task, Project project) {
        if(!taskAuthorisationService.hasReadAccess(task.id)){
            throw new Exception()
        }
        def filterMembers = task.teamMembers.findAll{it.user}
        List<AppUser> members = filterMembers ? filterMembers.user : []
        List<AppUser> followers = task.followers ? task.followers.user : []

        return (members + followers).findAll { it.id != springSecurityService.getCurrentUserId() }
    }

    List<Task> listTasksByTaskTeamMember(List<Project> projectsUserCanAccess) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        List<Task> allActiveTasksForUser = taskTeamMemberDAOService.listTasksByTaskTeamMember(projectsUserCanAccess, user)
        return allActiveTasksForUser
    }

    TaskTeamMember addToTaskAndAllSubtasks(long taskId, long userId, long projectId)throws AccessDeniedException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        List<Task> flatListOfChildren = taskTreeHelperService.getFlatTaskList(task)
        TaskTeamMember rootTTM
        flatListOfChildren.each{Task t ->
            try{
                TaskTeamMember ttm = addTeamMember(t.id,userId,projectId)
                if(t.id == taskId && ttm){
                    rootTTM = ttm
                }
            } catch(TaskUserCannotBeBothFollowerAndTeamMemberException e){

            } catch(Exception e){
            }
        }
        return rootTTM
    }

    TaskTeamMember addToTaskAndAllSubtasksPlaceholder(long taskId, long userId, long projectId)throws AccessDeniedException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        List<Task> flatListOfChildren = taskTreeHelperService.getFlatTaskList(task)
        TaskTeamMember rootTTM
        flatListOfChildren.each{Task t ->
            try{
                TaskTeamMember ttm = addPlaceholderTeamMember(t.id,userId,projectId)
                if(t.id == taskId && ttm){
                    rootTTM = ttm
                }
            } catch(TaskUserCannotBeBothFollowerAndTeamMemberException e){

            } catch(Exception e){
            }
        }
        return rootTTM
    }

    TaskTeamMember deleteTeamMemberAndAllSubtasks(long taskId, long userId, long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        List<Task> flatListOfChildren = taskTreeHelperService.getFlatTaskList(task)
        def taskTeamMember = task.teamMembers.find(x->x.user!=null&&x.user.id==userId)
        AppUser user = userService.getUserById(userId)
        TaskTeamMember rootTTM

        flatListOfChildren.each{ Task t ->
            TaskTeamMember ttm = taskTeamMemberDAOService.delete(t, user)
            publishTaskTeamChange(user, t, false) //todo condense this?
            if(t.id == taskId){
                rootTTM = ttm
            }
        }
        return rootTTM
    }

    TaskTeamMember deleteTeamMemberAndAllSubtasksPlaceholder(long taskId, long userId, long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        List<Task> flatListOfChildren = taskTreeHelperService.getFlatTaskList(task)
        Placeholders user = placeholdersService.getPlaceholder(userId, task.project.matter.id)
        TaskTeamMember rootTTM

        flatListOfChildren.each{ Task t ->
            TaskTeamMember ttm = taskTeamMemberDAOService.deletePlaceholder(t, user)
            if(t.id == taskId){
                rootTTM = ttm
            }
        }
        return rootTTM
    }
}
