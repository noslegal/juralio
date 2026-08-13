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

import com.juralio.task.TaskMoveType
import com.juralio.task.move.TaskMoveValidationHelperService
import com.juralio.template.*
import com.juralio.template.exception.MaximumTemplateTasksExceededException
import grails.gorm.transactions.Transactional

@Transactional
class TaskTemplateMoveService {

    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TaskTemplateParentHelperService taskTemplateParentHelperService
    ProjectTemplateTaskMoveHelperService projectTemplateTaskMoveHelperService
    TaskMoveValidationHelperService taskMoveValidationHelperService
    TemplateTreeHelperService templateTreeHelperService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService

    TaskTemplate moveTask(long movingTaskId, TaskMoveType taskMoveType, long destinationParentId, long sourceTemplateId) {
        if(!taskTemplateAuthorisationService.hasMoveAccess(movingTaskId,sourceTemplateId)){
            throw new Exception()
        }
        TaskTemplate taskToMove = taskTemplateService.getTaskTemplate(movingTaskId, sourceTemplateId)
        ProjectTemplate sourceTemplate = projectTemplateService.getProjectTemplateOnly(sourceTemplateId)
        ProjectTemplate destinationTemplate = taskMoveType == TaskMoveType.CROSS_PROJECT || taskMoveType ==TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT ||taskMoveType==TaskMoveType.PROJECT ? projectTemplateService.getProjectTemplate(destinationParentId) : sourceTemplate
      // def destinationParent
        if(taskMoveType ==TaskMoveType.CROSS_PROJECT_SUBTASK){
            destinationTemplate = TaskTemplate.findById(destinationParentId).projectTemplate
        }
       def  destinationParent = taskMoveType == TaskMoveType.TASK  ? taskTemplateService.getTaskTemplateOnly(destinationParentId, sourceTemplateId) : destinationTemplate
        int taskCounter = 0
        if (destinationTemplate.id != sourceTemplate.id) {
            taskCounter = templateTreeHelperService.getFlatTaskTemplateList(taskToMove).size()
        }

        if (taskCounter + destinationTemplate.tasks.size() > TaskTemplate.MAXIMUM_TEMPLATE_TASKS) {
            throw new MaximumTemplateTasksExceededException()
        }
        if(taskMoveType==TaskMoveType.CROSS_PROJECT_SUBTASK){
            destinationParent = taskTemplateService.getTaskTemplate(destinationParentId,destinationTemplate.id)
        }
        if (isValidMove(taskToMove, destinationParent, taskMoveType)) {
            detachFromOldParent(taskToMove)
            updateProjectAndLevels(taskToMove, destinationParent, taskMoveType)
            addToNewParent(taskToMove, destinationParent, taskMoveType)
            destinationParent.save()
            if(taskMoveType==TaskMoveType.PROJECT || taskMoveType==TaskMoveType.CROSS_PROJECT){
                if(taskToMove.isDeliverable){
                    taskToMove.isDeliverable = false
                }else if(taskToMove.isMilestone){
                    taskToMove.isMilestone = false
                }
            }
            return taskToMove.save()
        }

        return null
    }

    private void detachFromOldParent(TaskTemplate taskToMove) {
        if (taskToMove.level > TaskTemplate.NUMBER_TOP_LEVEL_TASK) {
            def oldParent = taskTemplateParentHelperService.getParentTaskTemplate(taskToMove.id)
            oldParent.removeFromTasks(taskToMove)
            oldParent.save()
        }
    }

     boolean isValidMove(TaskTemplate taskToMove, def destinationParent, TaskMoveType taskMoveType) {
        return (taskMoveType == TaskMoveType.TASK || taskMoveType == TaskMoveType.CROSS_PROJECT_SUBTASK) ?
                taskMoveValidationHelperService.isValidMove(taskToMove, destinationParent) :
                taskMoveValidationHelperService.isValidProjectMove(taskToMove, destinationParent)
    }

    private void updateProjectAndLevels(TaskTemplate taskToMove, def destinationParent, TaskMoveType taskMoveType) {
        long destinationLevel = taskMoveType == TaskMoveType.TASK ||taskMoveType== TaskMoveType.CROSS_PROJECT_SUBTASK ? destinationParent.level + 1 : TaskTemplate.NUMBER_TOP_LEVEL_TASK
        ProjectTemplate destinationProject = taskMoveType == TaskMoveType.TASK ||taskMoveType == TaskMoveType.CROSS_PROJECT_SUBTASK ? destinationParent.projectTemplate : destinationParent
        projectTemplateTaskMoveHelperService.updateProjectAndLevels(taskToMove, destinationProject, destinationLevel)
    }

    private void addToNewParent(TaskTemplate taskToMove, def destinationParent, TaskMoveType taskMoveType) {
        if (taskMoveType == TaskMoveType.TASK||taskMoveType== TaskMoveType.CROSS_PROJECT_SUBTASK) {
            destinationParent.addToTasks(taskToMove)
        }
    }
}
