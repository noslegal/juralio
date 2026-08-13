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

package com.juralio.task.status

import com.juralio.task.Task
import com.juralio.task.TaskParentHelperService

class TaskStatusHelperService {
    TaskParentHelperService taskParentHelperService

    List<Task> getParentsInStatus(Task task, String status, Boolean parentOverride) {
        List parents = []
        collectParentsInStatus(task, status, parents, parentOverride)
        return parents
    }

    List<Task> getChildrenInStatuses(Task task, List<TaskStatus> statuses) {
        List children = []
        collectChildrenInStatuses(task, children, statuses)
        return children
    }

    private void collectChildrenInStatuses(Task task, List<Task> children, List<TaskStatus> statuses) {
        task.tasks?.each { Task childTask ->
            if (statusInList(TaskStatus.fromValue(childTask.status), statuses)) {
                children.add(childTask)
            }
            collectChildrenInStatuses(childTask, children, statuses)
        }
    }

    private void collectParentsInStatus(Task task, String status, List<Task> parents, Boolean parentOverride = false) {
        if (parentOverride) {
            def parentTask
            if (task.parent && task.parent.id) {
                parentTask = Task.findById(task.parent.id)
            } else {
                parentTask = taskParentHelperService.getParentTask(task.id)
            }
            if (parentTask) {
                if (parentTask.status == status) {
                    parents.add(parentTask)
                    collectParentsInStatus(parentTask, status, parents, parentOverride)

                }
            }
        } else {
            def parentTask = taskParentHelperService.getParentTask(task.id)
            if (parentTask) {
                if (parentTask.status == status) {
                    parents.add(parentTask)
                    if (parentTask.level > 1) {
                        collectParentsInStatus(parentTask, status, parents, parentOverride)
                    }
                }
            }
        }
    }

    private boolean statusInList(TaskStatus status, List<TaskStatus> statusList) {
        return statusList.contains(status)
    }
}
