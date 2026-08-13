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

package com.juralio.search


import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional

@Transactional
class ProjectContentSearchService {

    TaskSearchService taskSearchService
    ProjectContentSearchSortService projectContentSearchSortService
    ProjectContentSearchAuthorisationService projectContentSearchAuthorisationService

    def performSearch(ProjectContentSearchFilter filterObject) {
        if (!projectContentSearchAuthorisationService.hasAccess(filterObject)) {
            throw new Exception()
        }
        List<ProjectContentSearchResultDTO> combined = []
        searchTasks(combined, filterObject)
        return projectContentSearchSortService.sort(combined, filterObject.sortOption, filterObject.searchTerm)
    }

    private searchTasks(def responseList, ProjectContentSearchFilter filterObject) {
        def tasks = taskSearchService.performSearch(filterObject)
        tasks.each { Task task ->
            responseList.push(formatDTO(task))
        }
    }

    private ProjectContentSearchResultDTO formatDTO(Task task) {
        ProjectContentSearchResultDTO item = new TaskSearchResultDTO()
        item.id = task.id
        item.projectId = task.project.id
        item.matterId = task.project.matter.id
        item.matterName = task.project.matter.name
        item.level = task.level
        item.projectName = task.project.name
        item.name = task.name
        item.description = task.description
        item.plannedStartDatetime = task.plannedStartDate
        item.plannedEndDatetime = task.plannedEndDate
        item.actualEndDatetime = task.actualEndDate
        item.type = "TASK"
        item.isCompleted = (task.status == TaskStatus.DONE.value())
        item.previousStatus = task.previousStatus ? task.previousStatus : null
        item.status = task.status
        item.referenceNumber = task.referenceNumber
        return item
    }
}
