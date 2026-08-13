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
import com.juralio.project.exception.ProjectNotFoundException
import com.juralio.recency.RecencyService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.exception.TaskNotFoundException
import com.juralio.task.seenBy.TaskSeenByService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class ProjectVisitRecencyController {
    static allowedMethods = [show: "GET", save: "POST", updateTask: "PATCH"]

    ProjectService projectService
    TaskService taskService
    RecencyService recencyService
    SpringSecurityService springSecurityService
    TaskSeenByService taskSeenByService

    def save() {
        Project project = projectService.getProjectOnly(params.id as long)
        if (!project) {
            respond null, [status: HttpStatus.NO_CONTENT]
            return
        }
        if (params.matter_id as long != project.matter.id as long) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }
        recencyService.updateProjectVisitRecency(project)
        respond [:], status: HttpStatus.OK
    }

    def updateTask() {
        Task taskToUpdate = taskService.getTaskOnly(params.task_id as long, params.project_id as long)
        Project project = projectService.getProjectOnly(params.project_id as long)
        if (params.matter_id as long != project.matter.id as long) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        taskSeenByService.seen(currentUser, taskToUpdate)
        respond status: HttpStatus.OK
    }

    def show() {
        try {
            Project project = projectService.getProjectOnly(params.id as long)
            if (!project) {
                throw new ProjectNotFoundException("Project not found")
            }

            if (params.matter_id as long != project.matter.id as long) {
                respond [:], status: HttpStatus.NOT_FOUND
                return
            }

            ProjectVisitRecency lastVisited = recencyService.getMostRecentProjectVisitRecency(project)
            if (!lastVisited) {
                save() //first time
                respond status: HttpStatus.OK
            } else {
                List<Task> newTasks = taskService.listTasks([
                        project_id  : project.id,
                        not_creator : true,
                        filterSeenBy: true,
                        date        : lastVisited.lastVisit
                ])
                
                if (newTasks.isEmpty()) {
                    throw new TaskNotFoundException("No new tasks")
                }

                respond newTasks, [status: HttpStatus.OK, view: '/project/_newTaskList']
            }


        } catch (ProjectNotFoundException exception) {
            respond status: HttpStatus.NOT_FOUND, text: exception.message
        } catch (TaskNotFoundException exception) {
            respond status: HttpStatus.NOT_FOUND, text: exception.message
        }
    }
}
