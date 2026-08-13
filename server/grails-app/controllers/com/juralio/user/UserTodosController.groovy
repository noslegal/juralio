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

package com.juralio.user

import com.juralio.auth.AppUser
import com.juralio.task.Task
import com.juralio.task.TaskTodoService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

import static org.springframework.http.HttpStatus.OK

@Secured('IS_AUTHENTICATED_FULLY')

class UserTodosController {
    static allowedMethods = [show: "GET"]
    SpringSecurityService springSecurityService
    TaskTodoService taskTodoService

    def show() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (currentUser.id != params.id as Long) { // may in future want the admin to see this
            render status: HttpStatus.FORBIDDEN
            return
        }
        List<Task> tasks = taskTodoService.getTaskTodosByUser(currentUser)
        respond tasks, [status: OK, view: '/task/_taskTodoList']
    }
}
