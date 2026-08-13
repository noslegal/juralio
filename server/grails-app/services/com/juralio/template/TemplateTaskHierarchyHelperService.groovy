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

import groovy.transform.CompileStatic

@CompileStatic
class TemplateTaskHierarchyHelperService {

    TaskTemplateParentHelperService taskTemplateParentHelperService

    final short MINIMUM_TASK_LEVEL = 1 // Importing this from Task was failing due to lack of typing.
    final short MAXIMUM_TASK_LEVEL = 6 // Importing this from Task was failing due to lack of typing.

    Map getAncestor(TaskTemplate task, ProjectTemplate project) {
        if (task.level == MINIMUM_TASK_LEVEL) {
            return constructProjectResponse(project)
        } else {
            TaskTemplate parentTask = taskTemplateParentHelperService.getParentTaskTemplate(task.id)

            if (!parentTask) {
                return null
            }

            Map parentDetails = getAncestor(parentTask, project)
            return constructTaskResponse(parentTask, parentDetails)
        }
    }

    private Map constructProjectResponse(ProjectTemplate project) {
        return [
                name : project.name,
                id   : project.id,
                type : "PROJECT",
                level: 0
        ]
    }

    private Map constructTaskResponse(TaskTemplate task, Map parent) {
        return [
                name           : task.name,
                id             : task.id,
                type           : "TASK",
                parent         : parent,
                level          : task.level,
                canHaveChildren: task.level < MAXIMUM_TASK_LEVEL,
                referenceNumber: task.referenceNumber
        ]

    }
}
