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

import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.*
import com.juralio.task.exception.InvalidDestinationParent
import com.juralio.task.exception.MaximumTasksExceededException
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class TaskCopyService {

    TaskService taskService
    TaskParentHelperService taskParentHelperService
    ProjectService projectService
    TaskCopyHelperService taskCopyHelperService
    TaskSortService taskSortService
    TaskTreeHelperService taskTreeHelperService
    TaskAuthorisationService taskAuthorisationService


    Task copy(long projectId, long taskId, String newName) throws MaximumTasksExceededException, InvalidDestinationParent {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        if (taskService.isMarkedAsNotRequired(taskId, projectId)) {
            throw new InvalidDestinationParent("Cannot copy a not-required task")
        }
        Task rootTask = taskService.getTaskOnly(taskId, projectId)
        Project project = projectService.getProjectOnly(projectId)
        Task parentTask = taskParentHelperService.getParentTask(rootTask.id)

        if (parentTask != null && parentTask.tasks.size() == Task.MAXIMUM_SUBTASK_COUNT) {
            return null
        }

        if (parentTask == null && taskService.getLevelATasks(project).size() == Task.MAXIMUM_PHASE_COUNT) {
            return null
        }
        int subTaskCounter = taskTreeHelperService.getFlatTaskList(rootTask).size()
        if ((project.tasks.size() + subTaskCounter) > Task.MAXIMUM_PROJECT_TASKS) {
            throw new MaximumTasksExceededException("")
        }

        Task rootCopy = taskCopyHelperService.createTask(newName, rootTask, project, parentTask)
        taskService.taskCreation(rootCopy, null, null, rootTask, 2)
        return copySubTasks(rootTask, rootCopy, project)
    }

    private Task copySubTasks(Task task, Task taskCopy, Project project) {

        if (task.tasks) {
            List<Task> sortedTasks = taskSortService.sortByStatusDescending(task.tasks)

            sortedTasks.each { Task subTask ->

                Task subTaskCopy = taskCopyHelperService.createTask(subTask.name,
                        subTask,
                        project,
                        taskCopy)
                taskService.taskCreation(subTaskCopy, null, null, subTask, 2)
                copySubTasks(subTask, subTaskCopy, project)
            }
        }
        return taskCopy
    }
}
