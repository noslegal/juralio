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

package com.juralio.task.taskBlocker

import com.juralio.task.Task
import com.juralio.task.TaskBlocker
import com.juralio.task.blockers.TaskBlockerService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus

import static org.springframework.http.HttpStatus.CREATED
import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskBlockerController {
    static allowedMethods = [getAllBlockers: "GET", addTaskBlocker: 'POST', removeTaskBlocker: 'DELETE', getValidBlocks: 'GET']
    TaskBlockerService taskBlockerService


    def getAllBlockers() {
        List<TaskBlocker> responseObject = taskBlockerService.generateBlockedDataObject(params.task_id as Long, params.project_id as Long)
        respond responseObject, [status: OK, view:'/task/blocker/_blockerList']
    }

    def addTaskBlocker() {
        Long otherTaskId = request.JSON.taskId
        try {
            if (request.JSON.blocks) {
                TaskBlocker taskBlocker = taskBlockerService.addTaskBlocker(params.task_id as Long, otherTaskId, params.project_id as Long)
                respond taskBlocker, [status: CREATED, view: '/task/blocker/_taskBlocker']
                return
            }
            if (request.JSON.blockedBy) {
                TaskBlocker taskBlocker = taskBlockerService.addTaskBlocker(otherTaskId, params.task_id as Long, params.project_id as Long)
                respond taskBlocker, [status: CREATED, view: '/task/blocker/_taskBlocker']
                return
            }
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
    }

    def getValidBlocks() {
        List<Task> validTasks = taskBlockerService.getValidBlocksForTask(params.task_id as long, params.project_id as Long)
        respond validTasks, [status: OK]
    }

    def removeTaskBlocker() {
        try {
            taskBlockerService.deleteTaskBlocker(params.task_id as Long, params.task2_id as Long, params.project_id as Long)
            respond [:], status: OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }
}
