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

package com.juralio.task.move


import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.TaskTreeHelperService
import com.juralio.task.exception.TaskException
import grails.gorm.transactions.Transactional

@Transactional
class TaskMoveValidationHelperService {

    private final String DESTINATION_TASK_INVALID_OR_NOT_SPECIFIED = "com.jlt.juralio.project.task.Task.move.invalidDestination"
    private final String IS_DESCENDANT_ERROR_CODE = "com.jlt.juralio.project.task.Task.move.isdescendant"
    private final String TOO_DEEP_ERROR_CODE = "com.jlt.juralio.project.task.Task.move.toodeep"
    private final String SUBTASKS_FULL_ERROR_CODE = "com.jlt.juralio.project.task.Task.move.subtasksfull"

    TaskService taskService
    TaskTreeHelperService taskTreeHelperService

    boolean isValidMove(def taskToMove, def newParentTask) {
        if (!newParentTask) {
            taskToMove.errors.reject(DESTINATION_TASK_INVALID_OR_NOT_SPECIFIED)
        } else if (!canTaskHaveAnotherSubtask(newParentTask)) {
            taskToMove.errors.reject(SUBTASKS_FULL_ERROR_CODE)
            throw new TaskException("Selected parent task already has 8 sub tasks, the maximum possible.")
        } else if (isBeingMovedToDescendant(newParentTask, taskToMove)) {
            taskToMove.errors.reject(IS_DESCENDANT_ERROR_CODE)
        } else if (isParentLevelInvalidForTaskOfDepth(taskToMove, newParentTask)) {
            taskToMove.errors.reject(TOO_DEEP_ERROR_CODE)
            if (newParentTask.level == Task.LEVEL_F) {
                throw new TaskException("Selected parent task is at level F, the lowest possible level in a project.")
            } else {
                throw new TaskException("The task has too many levels of sub task to fit under the selected parent task. Only 6 levels are allowed in a project.")
            }
        }
        !taskToMove.hasErrors()
    }

    boolean isValidProjectMove(def taskToMove, def project) {
        if (!projectHasCapacityForLevelATasks(project)) {
            taskToMove.errors.reject(SUBTASKS_FULL_ERROR_CODE)
        }
        if (taskToMove.hasErrors()) {
            throw new TaskException("There are already 16 level A tasks, the maximum possible.")
        }
        !taskToMove.hasErrors()
    }

    private boolean projectHasCapacityForLevelATasks(def targetProject) {
        return targetProject.tasks == null || (targetProject.tasks != null && taskService.getLevelATasks(targetProject).size() < (int) Task.MAXIMUM_PHASE_COUNT)
    }

    private boolean canTaskHaveAnotherSubtask(def task) {
        return (task.tasks == null) || (task.tasks != null && task.tasks.size() < (int) Task.MAXIMUM_SUBTASK_COUNT)
    }

    private boolean isBeingMovedToDescendant(def newParentTask, def taskToMove) {
        return taskTreeHelperService.isTaskADescendant(taskToMove, newParentTask)
    }

    private boolean isParentLevelInvalidForTaskOfDepth(def taskToMove, def newParentTask) {
        if (newParentTask.level < taskToMove.level) {
            return false
        }

        int taskToMoveDepth = taskTreeHelperService.getHierarchicalDepthForNode(taskToMove)
        return (taskToMoveDepth + (int) newParentTask.level) >= (int) Task.MAXIMUM_TASK_LEVEL
    }
}
