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

package com.juralio.template

import com.juralio.common.ArrayHelperService
import com.juralio.template.dao.TaskTemplateDAOService
import grails.gorm.transactions.Transactional

@Transactional
class TemplateTreeHelperService {

    ArrayHelperService arrayHelperService
    TaskTemplateDAOService taskTemplateDAOService

    List<TaskTemplate> getFlatTaskTemplateList(TaskTemplate taskTemplate) {
        List<TaskTemplate> taskTemplateList = new ArrayList<TaskTemplate>()
        addChildTasksToList(taskTemplate, taskTemplateList)
        taskTemplateList.push(taskTemplate)
        return taskTemplateList
    }

    private void addChildTasksToList(TaskTemplate taskTemplate, List<TaskTemplate> taskTemplateList) {
        for (TaskTemplate childTask : taskTemplate.tasks) {
            addChildTasksToList(childTask, taskTemplateList)
            taskTemplateList.push(childTask)
        }
    }

    def updateTaskTemplatesForParent(def parent, def taskOrder) {
        def tasksAsInDatabase = parent.tasks.collect()
        parent.tasks.clear()
        taskOrder.each { inputTask ->
            if (inputTask.id) {
                TaskTemplate task = taskTemplateDAOService.get(inputTask.id)
                if (task) {
                    parent.addToTasks(task)
                }
            }
        }

        def tasksNotAdded = arrayHelperService.determineMissingElementsInArray(parent.tasks, tasksAsInDatabase)
        tasksNotAdded.each { parent.addToTasks(it) }

        return parent
    }
}
