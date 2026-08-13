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

import com.juralio.task.follower.TaskFollower
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMember
import grails.gorm.transactions.Transactional

@Transactional
class TaskNotRequiredUpdateService {
    TaskTreeHelperService taskTreeHelperService

    long updateDetailsAndChildren(Task task) {
        List<Task> tasks = taskTreeHelperService.getFlatTaskList(task) // This list includes 'task'.
        long subTasksUpdated = 0
        for (Task childTask : tasks) {
            childTask.status = TaskStatus.NOT_REQUIRED.value()
            subTasksUpdated++
            clearTaskDetails(childTask)
        }
        subTasksUpdated - 1
    }

    def clearTaskDetails(task) {
        while (task.followers.size() > 0) {
            TaskFollower follower = task.followers.getAt(0)
            task.followers.remove(follower)
            follower.delete()
        }

        while (task.teamMembers.size() > 0) {
            TaskTeamMember member = task.teamMembers.getAt(0)
            task.teamMembers.remove(member)
            member.delete()
        }

        task.actualStartDate = null
        task.actualEndDate = null
        task.plannedStartDate = null
        task.plannedEndDate = null
    }
}
