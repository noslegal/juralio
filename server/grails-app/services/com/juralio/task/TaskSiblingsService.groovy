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

import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional

@Transactional
class TaskSiblingsService {
    ProjectService projectService
    TaskParentHelperService taskParentHelperService

    List<Task> getTaskSiblings(Task task) {
        if (task.level == 1) {
            Project project = projectService.getProjectWithLevelA(task.project.id)
            List<Task> siblings = project.levelATasks
            return siblings.findAll { Task sibling -> sibling.id != task.id }
        } else {
            List<Task> siblings = taskParentHelperService.getParentTask(task.id).tasks
            return siblings.findAll { Task sibling -> sibling.id != task.id }
        }
    }

    void clearSiblingDateLinking(Task updatedTask) {
        List<Task> siblings = getTaskSiblings(updatedTask)
        int linkCount = 0
        siblings.each { Task it -> if (it.datesLinkedToSiblings) { linkCount += 1 } }
        if (linkCount == 1) {
            Task foundTask = siblings.find { tsk -> tsk.datesLinkedToSiblings }
            foundTask.datesLinkedToSiblings = false
            foundTask.save()
        }
    }
}
