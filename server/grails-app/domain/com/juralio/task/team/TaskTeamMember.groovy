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
import com.juralio.matter.Placeholders
import com.juralio.task.Task
import grails.plugins.orm.auditable.Auditable

class TaskTeamMember implements Auditable {
    Boolean isOnAllSubtasks = false
    Boolean isOnSomeSubtasks = false
    static belongsTo = [user: AppUser, task: Task, placeholder: Placeholders]

    static transients = ['isOnAllSubtasks','isOnSomeSubtasks', 'isPlaceholder']

    static constraints = {
        user(unique: 'task',nullable:true)
        placeholder(unique: 'task',nullable: true)
    }

    static mapping = {
        task lazy: false
        placeholder lazy: false
    }
}