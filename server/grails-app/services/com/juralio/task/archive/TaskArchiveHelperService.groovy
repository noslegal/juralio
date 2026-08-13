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

package com.juralio.task.archive

import com.juralio.task.Task
import com.juralio.task.TaskParentHelperService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class TaskArchiveHelperService {

    SpringSecurityService springSecurityService
    TaskParentHelperService taskParentHelperService

    static final LEVEL_A = 0

    Task recordArchiveDetails(Task task) {
        task.archivedBy = springSecurityService.getCurrentUser()
        task.archivedDate = new Date()
        Task parent = taskParentHelperService.getParentTask(task.id)
        if (parent) {
            task.taskParentWhenArchived = parent.id
        } else {
            task.taskParentWhenArchived = LEVEL_A
        }

        return task
    }

    Task clearArchiveDetails(Task task) {
        task.archivedBy = null
        task.archivedDate = null
        task.taskParentWhenArchived = 0

        return task
    }
}
