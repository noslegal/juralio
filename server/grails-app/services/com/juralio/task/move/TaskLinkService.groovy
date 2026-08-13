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
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskSiblingsService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class TaskLinkService {

    TaskSiblingsService taskSiblingsService
    TaskAuthorisationService taskAuthorisationService
    TaskDAOService taskDAOService

    private List<String> validTaskStatuses = [TaskStatus.NOT_STARTED.value(), TaskStatus.IN_PROGRESS.value()]

    private Boolean hasValidSiblings(List<Task> siblings) {
        List<Task> validSiblings = siblings.findAll { it.status in validTaskStatuses }
        return validSiblings.size() > 0
    }

    Boolean isValidTaskToLink(long taskId) {
        if(!taskAuthorisationService.hasReadAccess(taskId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        List<Task> siblings = taskSiblingsService.getTaskSiblings(task)

        return task.status in validTaskStatuses && hasValidSiblings(siblings)
    }

    Task link(Long taskId, Long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        if (isValidTaskToLink(taskId)) {
            Task taskToLink = taskDAOService.get(taskId)
            taskToLink.setDatesLinkedToSiblings(true)
            taskToLink.save(flush: true)
        }
    }


    void linkListOfTasks(List<Long> taskIds, Long projectId, List<Boolean> taskLinks) {
        if(!taskAuthorisationService.hasWriteAccess(taskIds,projectId)){
            throw new Exception()
        }
        int index = 0
        for (id in taskIds) {
            Task task = taskDAOService.get(id)
            task.setDatesLinkedToSiblings(taskLinks[index++])
            task.save(flush: true)
        }
    }

    List<Task> linkAllSiblings(Long taskId, Long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task taskToLink = taskDAOService.get(taskId)
        if (isValidTaskToLink(taskId)) {
            taskToLink.setDatesLinkedToSiblings(true)
            taskToLink.save(flush: true)
        }
        List<Task> siblings = taskSiblingsService.getTaskSiblings(taskToLink)
        siblings.each { it ->
            if (isValidTaskToLink(it.id)) {
                it.setDatesLinkedToSiblings(true)
                it.save(flush: true)
            }
        }
    }

    def unlink(Long taskId, Long projectId) throws AccessDeniedException {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task taskToLink = taskDAOService.get(taskId)
        taskToLink.setDatesLinkedToSiblings(false)
        taskToLink.save(flush: true)
    }

    def unlinkAllSiblings(Long taskId, Long projectId) {
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task taskToLink = taskDAOService.get(taskId)
        taskToLink.setDatesLinkedToSiblings(false)
        taskToLink.save(flush: true)
        List<Task> siblings = taskSiblingsService.getTaskSiblings(taskToLink)
        siblings.each { it ->
            if (isValidTaskToLink(it.id)) {
                it.setDatesLinkedToSiblings(false)
                it.save(flush: true)
            }
        }
    }
}
