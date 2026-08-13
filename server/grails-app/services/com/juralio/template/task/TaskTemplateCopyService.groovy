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

import com.juralio.auth.AppUser
import com.juralio.post.Post
import com.juralio.task.TaskMoveType
import com.juralio.template.*
import com.juralio.template.dao.TaskTemplateDAOService
import com.juralio.template.exception.MaximumTemplateTasksExceededException
import com.juralio.template.post.referencenumber.TemplatePostsReferenceNumberService
import com.juralio.template.referencenumber.TaskTemplateReferenceNumberService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class TaskTemplateCopyService {
    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TaskTemplateParentHelperService taskTemplateParentHelperService
    TaskTemplateReferenceNumberService taskTemplateReferenceNumberService
    TemplateTreeHelperService templateTreeHelperService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService
    ProjectTemplateAuthorisationService projectTemplateAuthorisationService
    SpringSecurityService springSecurityService
    TaskTemplateDAOService taskTemplateDAOService
    TemplatePostsReferenceNumberService templatePostsReferenceNumberService
    TaskTemplateMoveService taskTemplateMoveService

    TaskTemplate copyTaskTemplateTree(long templateId, long taskId, long targetId, String newName, def copyType) throws MaximumTemplateTasksExceededException {
        if(!taskTemplateAuthorisationService.hasWriteAccess(taskId, templateId)){
            throw new Exception()
        }
        TaskTemplate task = taskTemplateService.getTaskTemplate(taskId, templateId)
        TaskTemplate copiedTask
        ProjectTemplate targetTemplate
        if(copyType== TaskMoveType.PROJECT.name()){
             targetTemplate = projectTemplateService.getProjectTemplateOnly(targetId)
            List<TaskTemplate> levelATemplateTasks = targetTemplate.tasks.findAll { it -> it.level == 1 }
            int subtaskCounter = templateTreeHelperService.getFlatTaskTemplateList(task).size()
            if (newName.size() == 0 || levelATemplateTasks.tasks.size() == TaskTemplate.MAXIMUM_SUBTASK_COUNT) {
                return null
            }
            if (targetTemplate.tasks.size() + subtaskCounter > TaskTemplate.MAXIMUM_TEMPLATE_TASKS) {
                throw new MaximumTemplateTasksExceededException()
            }
             copiedTask = createTaskTemplate(newName, 1 as short, targetTemplate,null,task.noticeboardText)
            copiedTask.isMilestone = task.isMilestone
            copiedTask.isDeliverable = task.isDeliverable
            task.posts.forEach { Post post ->{
                copyTemplateTaskPosts(post, copiedTask)
            }
            }
        }
        else{
            TaskTemplate targetTask = TaskTemplate.findById(targetId)
             targetTemplate = projectTemplateService.getProjectTemplateOnly(targetTask.projectTemplate.id)
           if(!taskTemplateMoveService.isValidMove(task,targetTask,copyType as TaskMoveType)){
               return null
           }
             copiedTask = createTaskTemplate(newName, targetTask.level+1 as short, targetTemplate,targetTask,task.noticeboardText)
            task.posts.forEach { Post post ->{
                copyTemplateTaskPosts(post, copiedTask)
            }
            }

        }

        return copySubTasks(task, copiedTask, targetTemplate, true)
    }

    TaskTemplate copyTaskTemplateTree(long templateId, long taskId, String newName) throws MaximumTemplateTasksExceededException {
        if(!taskTemplateAuthorisationService.hasWriteAccess(taskId, templateId)){
            throw new Exception()
        }
        TaskTemplate task = taskTemplateService.getTaskTemplate(taskId, templateId)
        ProjectTemplate template = projectTemplateService.getProjectTemplateOnly(templateId)
        TaskTemplate parentTask = taskTemplateParentHelperService.getParentTaskTemplate(taskId)
        int subtaskCounter = templateTreeHelperService.getFlatTaskTemplateList(task).size()

        if (parentTask?.tasks?.size() == TaskTemplate.MAXIMUM_SUBTASK_COUNT) {
            return null
        }

        if (task.level == 1 && taskTemplateService.getLevelATasks(template).size() == TaskTemplate.MAXIMUM_SUBTASK_COUNT) {
            return null
        }


        if (template.tasks.size() + subtaskCounter > TaskTemplate.MAXIMUM_TEMPLATE_TASKS) {
            throw new MaximumTemplateTasksExceededException()
        }

        TaskTemplate copiedTask = createTaskTemplate(newName, task.level, template, parentTask,task.noticeboardText)
        copiedTask.isMilestone = task.isMilestone
        copiedTask.isDeliverable = task.isDeliverable
        task.posts.forEach { Post post ->{
                copyTemplateTaskPosts(post, copiedTask)
            }
        }
        return copySubTasks(task, copiedTask, template)
    }

    private TaskTemplate copySubTasks(TaskTemplate task, TaskTemplate copiedTask, ProjectTemplate template, Boolean levelChange = false) {
        if (task.projectTemplate.id == template.id && !taskTemplateAuthorisationService.hasWriteAccess(task.id, template.id)) {
            throw new Exception()
        } else if (!taskTemplateAuthorisationService.hasReadAccess(task.id, task.projectTemplate.id) && projectTemplateAuthorisationService.hasWriteAccess(template.id)) {
            //check can write to task and other template
            throw new Exception()
        }
        if (task.tasks) {
            task.tasks.each { TaskTemplate subTask ->
                short level = levelChange ? copiedTask.level + 1 : subTask.level
                TaskTemplate subTaskCopy = createTaskTemplate(subTask.name, level, template, copiedTask,subTask.noticeboardText)
                subTaskCopy.isMilestone = subTask.isMilestone
                subTaskCopy.isDeliverable = subTask.isDeliverable
                subTask.posts.forEach { Post post ->{
                        copyTemplateTaskPosts(post, subTaskCopy)
                    }
                }
                copySubTasks(subTask, subTaskCopy, template, levelChange)
            }
        }
        return copiedTask
    }

    TaskTemplate createTaskTemplate(String name, Short level, ProjectTemplate template, TaskTemplate parentTask = null, String description) {
        TaskTemplate task = new TaskTemplate(name: name, level: level, projectTemplate: template, noticeboardText: description)
        task.referenceNumber = taskTemplateReferenceNumberService.getNextReferenceNumber(template.id)

        if (parentTask && level > 1) {
            parentTask.addToTasks(task)
        }

        return task.save(flush: true)
    }

    Post copyTemplateTaskPosts(Post p, TaskTemplate newTask) {
        AppUser currentUser = springSecurityService.getCurrentUser()

        Post post = Post.findById(p.id)
        Post newPost = new Post(
                name: post.name,
                description: post.description,
                privatePost: post.privatePost,
                type: post.type,
                url: post.url,
                startTime: post.startTime,
                endTime: post.endTime,
                finalised: post.finalised,
                finalisedBy: currentUser
        )
        newPost.creator = currentUser
        newPost.referenceNumber = templatePostsReferenceNumberService.getNextReferenceNumber(newTask.projectTemplate.id)

        newTask.addToPosts(newPost)
        taskTemplateDAOService.save(newTask)
        newPost.save()
    }
}
