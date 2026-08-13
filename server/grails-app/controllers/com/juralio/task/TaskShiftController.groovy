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
import com.juralio.task.datetime.exception.DateBoundaryException
import com.juralio.task.datetime.exception.TaskDateTimeException
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.grails.web.json.JSONObject
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskShiftController {
    TaskShiftService taskShiftService
    TaskService taskService
    static allowedMethods = [shift: "PATCH", bulkShift: "PATCH"]

    def shift() {
        Long taskId = params.id as long
        Long projectId = params.project_id as long

        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['directionInTime', 'amount'], [])
            String directionInTime = validatedBody.get('directionInTime')
            Long amount = validatedBody.get('amount') as Long
            taskShiftService.shift(taskId, projectId, directionInTime, amount)
            respond [:], status: HttpStatus.OK
        } catch (TaskDateTimeException e) {
            render(status: taskService.getErrorCodeForTaskDateTimeException(e), text: e.message)
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def bulkShift() {
        Long projectId = params.project_id as long
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['directionInTime', 'amount', 'tasks'], [])
            String directionInTime = validatedBody.get('directionInTime')
            Long amount = validatedBody.get('amount') as Long
            List<String> tasks = request.JSON.tasks as List<String>
            tasks.forEach { def taskId ->
                {
                    taskShiftService.shift(taskId as long, projectId, directionInTime, amount)
                }
            }
            respond [:], status: HttpStatus.OK
        } catch (TaskDateTimeException e) {
            render(status: taskService.getErrorCodeForTaskDateTimeException(e), text: e.message)
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }
}
