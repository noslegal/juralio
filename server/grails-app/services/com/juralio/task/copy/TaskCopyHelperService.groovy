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

package com.juralio.task.copy

import com.juralio.auth.AppUser
import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class TaskCopyHelperService {

    MatterContentReferenceNumberService matterContentReferenceNumberService
    SpringSecurityService springSecurityService

    Task createTask(String name, Task rootTask, Project project, Task parentTask) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Task task = new Task(name: name, level: rootTask.level, project: project, status: getStatus(parentTask), isParked: rootTask.isParked, datesLinkedToSiblings: false, isMilestone: rootTask.isMilestone)

        if (TaskStatus.DONE.value() == task.status) {
            task.actualStartDate = rootTask.actualStartDate
            task.actualEndDate = rootTask.actualEndDate
        }

        if (TaskStatus.NOT_STARTED.value() == task.status) {
            task.plannedStartDate = rootTask.plannedStartDate
            task.plannedEndDate = rootTask.plannedEndDate
        }

        task.referenceNumber = matterContentReferenceNumberService.getNextReferenceNumber(project.matter.id)

        if (parentTask && rootTask.level > 1) {
            parentTask.addToTasks(task)
        }
        task.createdBy = currentUser

        return task.save(flush: true)
    }

    private String getStatus(Task parentTask) {
        if (parentTask) {
            return parentTask.status == TaskStatus.DONE.value() ? TaskStatus.DONE.value() : TaskStatus.NOT_STARTED.value()
        }
        return TaskStatus.NOT_STARTED.value()

    }
}
