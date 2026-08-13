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

package com.juralio.task

import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.status.TaskStatus
import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.*

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskStatusChangeController {

    static allowedMethods = [affectedTasks: 'POST']

    TaskAuthorisationService taskAuthorisationService
    TaskService taskService
    TaskConsistencyService taskConsistencyService
    TaskBlockerService taskBlockerService

    def affectedTasks() {
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, ['id'], [])
        long taskId = validatedBody.get('id')
        Task updatedTask = Task.get(taskId as Integer)
        if (taskAuthorisationService.hasReadAccess(taskId) == false) {
            render status: FORBIDDEN
            return
        }
        if (request.JSON.properties.status != null) {
            updatedTask.previousStatus = updatedTask.status
            updatedTask.status = request.JSON.properties.status
        }
        def affectedTasks = []
        try {
            affectedTasks = taskService.getAffectedTasks(updatedTask)
            affectedTasks = affectedTasks.sort { it.level }
        }
        catch (Exception e) {
            render status: BAD_REQUEST
        }
        if(affectedTasks.size()>0){
            affectedTasks.forEach(task-> {
                if(task.level<updatedTask.level&&request.JSON.properties.status== TaskStatus.IN_PROGRESS.value()){
                    task.blockers = taskBlockerService.getTaskBlockersByBlocked(task as Task)
                }
                if(task.level<updatedTask.level&&request.JSON.properties.status== TaskStatus.DONE.value()&&task.status==TaskStatus.NOT_STARTED.value()){
                    task.blockers = taskBlockerService.getTaskBlockersByBlocked(task as Task)
                }
                else if (task.level>updatedTask.level&&request.JSON.properties.status== TaskStatus.DONE.value()){
                    task.blockers = taskBlockerService.generateBlockedDataObject(task)
                }
            })
        }else if(affectedTasks.size()==0){
            updatedTask.blockers = taskConsistencyService.findBlockerConsistencyIssues(updatedTask,false,false)
            affectedTasks.add(updatedTask)
        }
        if(updatedTask.status==TaskStatus.IN_PROGRESS.value()){
            updatedTask.blockers = taskBlockerService.getTaskBlockersByBlocked(updatedTask as Task)
        }
        if(updatedTask.status==TaskStatus.DONE.value()){
            updatedTask.blockers = taskBlockerService.generateBlockedDataObject(updatedTask)

        }
        updatedTask.status = updatedTask.previousStatus
        if(updatedTask.blockers&&updatedTask.blockers.size()>0){
            if(!affectedTasks.contains(updatedTask)){
                affectedTasks.add(updatedTask)
                affectedTasks = affectedTasks.sort { it.level }
            }
        }
        respond affectedTasks, [status: OK, view: '/task/_recentTaskList']
    }

}
