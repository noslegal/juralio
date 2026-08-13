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

import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.TaskParentHelperService
import com.juralio.task.TaskTreeHelperService
import grails.gorm.transactions.Transactional
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Transactional
class ProjectTaskMoveService {

    protected final Log logger = LogFactory.getLog(getClass())
    final Short LEVEL_A = 1

    TaskParentHelperService taskParentHelperService
    TaskTreeHelperService taskTreeHelperService
    ProjectTaskMoveHelperService projectTaskMoveHelperService

    List<Task> moveTaskHierarchyToAnotherProject(Task task, Project destinationProject) {

        Task parentTask = taskParentHelperService.getParentTask(task.id)

        if (parentTask != null) {
            parentTask.removeFromTasks(task)
            logger.debug("removed task with ID ${task.id} from it's parent task with ID ${parentTask.id}")
        }

        Short destinationLevelOffset = getLevelOffset(task, LEVEL_A)
        List<Task> hierarchyAsFlatList = taskTreeHelperService.getFlatTaskList(task)

        hierarchyAsFlatList.each {
            projectTaskMoveHelperService.moveToDestinationProject(it, destinationProject, destinationLevelOffset)
        }

        return hierarchyAsFlatList
    }

    private static Short getLevelOffset(Task task, Short destinationLevel) {
        return (destinationLevel - task.level)
    }
}
