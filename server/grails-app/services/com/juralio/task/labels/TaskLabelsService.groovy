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

package com.juralio.task.labels

import com.juralio.label.CannotAddLabelToTask
import com.juralio.label.Label
import com.juralio.label.LabelService
import com.juralio.label.LabelTypes
import com.juralio.task.Task
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.label.TaskLabel
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class TaskLabelsService {

    TaskDAOService taskDAOService
    LabelService labelService
    TaskLabelDAOService taskLabelDAOService
    TaskLabelAuthorisationService taskLabelAuthorisationService

    TaskLabel getTaskLabel(Long projectId, Long taskId, Long labelId) {
        if(!taskLabelAuthorisationService.hasReadAccess(taskId,labelId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if(task.projectId != projectId){
            throw new Exception()
        }
        Label label = labelService.getLabel(labelId)
        return taskLabelDAOService.findTaskLabel(task, label)
    }

    TaskLabel addLabelToTask(Long projectId, Long taskId, Long labelId, String modifier = null) throws CannotAddLabelToTask {
        if(!taskLabelAuthorisationService.hasUpdateAccess(projectId,taskId,labelId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        if (task.status == TaskStatus.DONE.value() || task.status == TaskStatus.NOT_REQUIRED.value()) {
            throw new CannotAddLabelToTask()
        }
        Label label = labelService.getLabel(labelId)
        TaskLabel taskLabel = new TaskLabel(task: task, label: label)
        if (modifier != null) {
            taskLabel.modifier = modifier
        }
        taskLabel.save(failOnError: true, flush: true)
        return taskLabel
    }

    TaskLabel updateTaskLabel(Long projectId, Long taskId, Long labelId, String modifier = null) {
        if(!taskLabelAuthorisationService.hasUpdateAccess(projectId,taskId,labelId)){
            throw new Exception()
        }
        TaskLabel taskLabel = getTaskLabel(projectId, taskId, labelId)
        if (taskLabel != null) {
            taskLabel.modifier = modifier
            taskLabel.save()
        }
        return taskLabel
    }

    void deleteLabelFromTask(Long projectId, Long taskId, Long labelId) {
        if(!taskLabelAuthorisationService.hasDeleteAccess(projectId,taskId,labelId)){
            throw new Exception()
        }
        if(!taskLabelAuthorisationService.hasDeleteAccess(projectId,taskId,labelId)){
            throw new Exception()
        }
        TaskLabel taskLabel = getTaskLabel(projectId, taskId, labelId)
        if (taskLabel != null) {
            taskLabel.delete(failOnError: true, flush: true)
        }
    }

    void removeLabelsOnStatusChange(Task task) {
        List<Label> labels = task.labels.collect { taskLabel -> labelService.getLabel(taskLabel.label.id) }
        labels.findAll { it.type != LabelTypes.USER_DEFINED.value() }.each { Label label ->
            TaskLabel taskLabel = getTaskLabel(task.project.id, task.id, label.id)
            task.removeFromLabels(taskLabel)
            deleteLabelFromTask(task.project.id, task.id, label.id)
        }
    }
}
