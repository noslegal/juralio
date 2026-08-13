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

import grails.gorm.transactions.Transactional

@Transactional
class TaskTreeHelperService {

    TaskParentHelperService taskParentHelperService

    List<Task> getFlatTaskList(Task task) {
        List<Task> taskList = new ArrayList<Task>()
        addChildTasksToList(task, taskList)
        taskList.push(task)
        return taskList
    }

    private void addChildTasksToList(Task task, List<Task> taskList) {
        for (Task childTask : task.tasks) {
            addChildTasksToList(childTask, taskList)
            taskList.push(childTask)
        }
    }

    int getHierarchicalDepthForNode(def task) {
        int depth = 0
        if (task.tasks && task.tasks.size() > 0) {
            depth = getHighestLevelFromHierarchy(task, task.level) - task.level
        }
        depth
    }

    private int getHighestLevelFromHierarchy(def task, int highestLevel) {
        highestLevel = task.level > highestLevel ? task.level : highestLevel
        if (task.tasks && task.tasks.size() > 0) {
            task.tasks.each { thisTask ->
                int highestFromChildren = getHighestLevelFromHierarchy(thisTask, highestLevel)
                highestLevel = highestFromChildren > highestLevel ? highestFromChildren : highestLevel
            }
        }
        highestLevel
    }

    boolean isTaskADescendant(def expectedParentTask, def expectedChildTask) {
        def parentOfChild = taskParentHelperService.getParentTask(expectedChildTask.id)

        if (parentOfChild == null) {
            return false
        }

        if (parentOfChild.id == expectedParentTask.id) {
            return true
        }

        return isTaskADescendant(expectedParentTask, parentOfChild)
    }
}
