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

package com.juralio.template.task

import com.juralio.template.ProjectTemplate
import com.juralio.template.TaskTemplate
import grails.gorm.transactions.Transactional

@Transactional
class ProjectTemplateTaskMoveHelperService {

    TaskTemplate updateProjectAndLevels(TaskTemplate task, ProjectTemplate destinationProject, long destinationLevel) {
        removeFromCurrentProject(task)
        task.level = destinationLevel
        addToDestinationProject(task, destinationProject)

        for (TaskTemplate child : task.tasks) {
            updateProjectAndLevels(child, destinationProject, destinationLevel + 1)
            child.save()
        }

        return task
    }

    private void removeFromCurrentProject(TaskTemplate task) {
        ProjectTemplate currentProject = task.projectTemplate
        currentProject.removeFromTasks(task)
    }

    private void addToDestinationProject(TaskTemplate task, ProjectTemplate destinationProject) {
        destinationProject.addToTasks(task)
    }
}
