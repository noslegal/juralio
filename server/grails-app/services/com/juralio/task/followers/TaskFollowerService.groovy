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

package com.juralio.task.followers

import com.juralio.auth.AppUser
import com.juralio.common.UserDecoratorService
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.exception.TaskAlreadyHasUserAsFollowerException
import com.juralio.task.exception.TaskUserCannotBeBothFollowerAndTeamMemberException
import com.juralio.task.follower.TaskFollower
import com.juralio.task.followers.dao.TaskFollowerDAOService
import com.juralio.task.team.TaskTeamMemberService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class TaskFollowerService {

    TaskService taskService
    SpringSecurityService springSecurityService
    TaskFollowerDAOService taskFollowerDAOService
    TaskTeamMemberService taskTeamMemberService
    UserDecoratorService userDecoratorService
    TaskDAOService taskDAOService
    TaskAuthorisationService taskAuthorisationService

    TaskFollower addFollower(long taskId, AppUser user, long projectId) throws AccessDeniedException, TaskAlreadyHasUserAsFollowerException, TaskUserCannotBeBothFollowerAndTeamMemberException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        if (!taskTeamMemberService.isTeamMember(task, user, projectId)) {
            if (!isTaskFollower(task, user)) {
                TaskFollower follower = taskFollowerDAOService.save(task, user)
                userDecoratorService.decorateActiveUsersOnMatter([follower.user], task.project.matter)
                return follower
            } else
                throw new TaskAlreadyHasUserAsFollowerException("")
        } else
            throw new TaskUserCannotBeBothFollowerAndTeamMemberException("")
    }

    @CompileDynamic
    TaskFollower removeFollower(long taskId, AppUser user, long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        if (task.followers.size() == 0) return
        TaskFollower follower = TaskFollower.findByTaskAndUser(task, user)
        if (follower) {
            task.followers.remove(follower)
            follower.delete()
        }
    }

    @CompileDynamic
    boolean isTaskFollower(Task task, AppUser user) {
        if (task.followers) {
            if (task.followers.size() == 0) {
                return false
            }
            TaskFollower result = TaskFollower.findByTaskAndUser(task, user)
            return result != null
        }
        return false
    }

    @CompileDynamic
    boolean isTaskFollower(long taskId, AppUser user) {
        if(!taskAuthorisationService.hasReadAccess(taskId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if (task.followers) {
            if (task.followers.size() == 0) {
                return false
            }
            TaskFollower result = TaskFollower.findByTaskAndUser(task, user)
            return result != null
        }
        return false
    }

    List<Task> listTasksByTaskFollower(List<Project> projectsUserCanAccess, AppUser user = springSecurityService.getCurrentUser() as AppUser) {
        List<Task> allActiveTasksForUser = taskFollowerDAOService.listTasksByTaskFollower(projectsUserCanAccess, user)
        return allActiveTasksForUser
    }
}
