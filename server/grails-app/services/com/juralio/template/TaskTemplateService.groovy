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

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import com.juralio.post.Post
import com.juralio.post.author.PostAuthorService
import com.juralio.project.Project
import com.juralio.task.Creation_type
import com.juralio.task.Task
import com.juralio.task.TaskCreationContext
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.status.TaskStatus
import com.juralio.template.dao.ProjectTemplateDAOService
import com.juralio.template.dao.TaskTemplateDAOService
import com.juralio.template.exception.MaximumNumberOfLevelATasksExceededException
import com.juralio.template.exception.MaximumNumberOfSubTasksExceededException
import com.juralio.template.exception.MaximumTemplateTasksExceededException
import com.juralio.template.exception.TaskTemplateMaximumLevelsExceededException
import com.juralio.template.post.TaskTemplatePostGeneratorService
import com.juralio.template.post.TemplateTaskPostsService
import com.juralio.template.referencenumber.TaskTemplateReferenceNumberService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.grails.web.json.JSONObject
import org.springframework.security.access.AccessDeniedException

@Transactional
class TaskTemplateService {

    TaskTemplateParentHelperService taskTemplateParentHelperService
    TaskDAOService taskDAOService
    TaskTemplateDAOService taskTemplateDAOService
    ProjectTemplateDAOService projectTemplateDAOService
    TemplateTreeHelperService templateTreeHelperService
    TaskTemplateReferenceNumberService taskTemplateReferenceNumberService
    TemplateTaskHierarchyHelperService templateTaskHierarchyHelperService
    MatterContentReferenceNumberService matterContentReferenceNumberService
    TaskTemplatePostGeneratorService taskTemplatePostGeneratorService
    SpringSecurityService springSecurityService
    TaskService taskService
    ProjectTemplateService projectTemplateService
    PostAuthorService postAuthorService
    TemplateTaskPostsService templateTaskPostsService
    UserRoleService userRoleService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService
    ProjectTemplateAuthorisationService projectTemplateAuthorisationService

    TaskTemplate getTaskTemplate(long id, long templateId) {
        if(!taskTemplateAuthorisationService.hasReadAccess(id,templateId)){
            throw new Exception()
        }
        TaskTemplate taskTemplate = taskTemplateDAOService.get(id)
        decorateTaskWithDetails(taskTemplate)
        if (!userRoleService.hasKnowledgeManagerRole(springSecurityService.getCurrentUser())) {
            taskTemplate.posts = taskTemplate.posts.findAll { Post post -> post.finalised == true }
        }
        return taskTemplate
    }

    TaskTemplate getTaskTemplateOnly(long id, long templateId) {
        if(!taskTemplateAuthorisationService.hasReadAccess(id,templateId)){
            throw new Exception()
        }
        return taskTemplateDAOService.get(id)
    }

    private def decorateTaskWithDetails(TaskTemplate taskTemplate) {
        taskTemplate.parent = templateTaskHierarchyHelperService.getAncestor(taskTemplate, taskTemplate.projectTemplate)
        taskTemplate.tasks.each {
            subtask -> subtask.parent = taskTemplate
        }
    }

    TaskTemplate save(Long templateId, Long parentTaskId, String name, Boolean isMilestone = false,Boolean isDeliverable) throws MaximumTemplateTasksExceededException {
        if(!projectTemplateAuthorisationService.hasWriteAccess(templateId)){
            throw new Exception()
        }
        TaskTemplate parentTask
        TaskTemplate newTask = new TaskTemplate()
        ProjectTemplate projectTemplate = projectTemplateDAOService.get(templateId)

        parentTask = parentTaskId ? getTaskTemplate(parentTaskId, templateId) : null
        newTask.level = getLevelForTask(parentTask)
        newTask.referenceNumber = taskTemplateReferenceNumberService.getNextReferenceNumber(projectTemplate.id)
        newTask.isMilestone = isMilestone
        if(isDeliverable){
            newTask.isDeliverable = isDeliverable
        }
        if (parentTask && parentTask.tasks != null && parentTask.tasks.size() >= TaskTemplate.MAXIMUM_SUBTASK_COUNT) {
            throw new MaximumNumberOfSubTasksExceededException()
        } else if (newTask.level > TaskTemplate.NUMBER_MAX_LEVEL_TASK) {
            throw new TaskTemplateMaximumLevelsExceededException()
        } else if (!parentTaskId && getLevelATasks(projectTemplate).size() >= TaskTemplate.MAXIMUM_PHASE_COUNT) {
            throw new MaximumNumberOfLevelATasksExceededException()
        } else if (projectTemplate.tasks && projectTemplate.tasks.size() >= TaskTemplate.MAXIMUM_TEMPLATE_TASKS) {
            throw new MaximumTemplateTasksExceededException()
        }

        if (projectTemplate) {
            projectTemplate.addToTasks(newTask)
        }

        newTask.name = name

        if (newTask.validate()) {
            newTask.save()
            addTaskToParentIfApplicable(parentTask, newTask)
        }

        decorateTaskWithDetails(newTask)

        return newTask
    }

    List<TaskTemplate> getTasks(long projectTemplateId, boolean flatList=false) {
        if(!projectTemplateAuthorisationService.hasReadAccess(projectTemplateId)){
            throw new Exception()
        }
        List<TaskTemplate> results = []
        ProjectTemplate template = projectTemplateDAOService.get(projectTemplateId)
        List<TaskTemplate> tasks = template.tasks
        boolean nullTasksFound = false

        tasks.each { task ->
            if(task != null){
                if(flatList){
                    task.parent = taskTemplateParentHelperService.getParentTaskTemplate(task.id)
                    results.add(task)
                } else if(task.level ==1){
                    results.add(task)
                }
            }
            if (task == null) {
                nullTasksFound = true
            }
        }

        // Fix for null entries
        if (nullTasksFound) {
            tasks.removeIf({ it -> it == null })
            template.tasks = tasks
        }

        return results
    }

    List<TaskTemplate> getLevelATasks(ProjectTemplate projectTemplate) {
        if(!projectTemplateAuthorisationService.hasReadAccess(projectTemplate.id)){
            throw new Exception()
        }
        List<TaskTemplate> taskTemplates = projectTemplate.tasks
        List<TaskTemplate> levelATaskTemplates = []

        taskTemplates.each { taskTemplate ->
            if (taskTemplate.level == 1) {
                levelATaskTemplates << taskTemplate
            }
        }

        return levelATaskTemplates
    }

    void delete(long taskId, long templateId) {
        if(!taskTemplateAuthorisationService.hasWriteAccess(taskId,templateId)){
            throw new Exception()
        }
        TaskTemplate taskTemplate = taskTemplateDAOService.get(taskId)
        ProjectTemplate projectTemplate = projectTemplateDAOService.get(taskTemplate.projectTemplate.id)

        List<TaskTemplate> flatList = templateTreeHelperService.getFlatTaskTemplateList(taskTemplate)
        flatList.each {
            TaskTemplate parent = taskTemplateDAOService.getParentTaskTemplate(it)
            def taskCreationObject = TaskCreationContext.findAllByTemplate_task(it)
            def projects = Project.findAllByTemplate_task(it)
            //this is needed to stop fk issues will be removed when template task archiving is added
            projects.each {
                it.template_task = null
                it.save()
            }
            if (taskCreationObject.size() != 0) {
                taskCreationObject.each { taskDAOService.taskCreationDelete(it) }
            }
            if (parent) {
                parent.removeFromTasks(it)
            }
            projectTemplate.removeFromTasks(it)
            taskTemplateDAOService.delete(it)
        }
    }

    List<TaskTemplate> listTemplateTasks(long templateId, def name) {
        if(!projectTemplateAuthorisationService.hasReadAccess(templateId)){
            throw new Exception()
        }
        List<TaskTemplate> tasks = TaskTemplate.createCriteria().list() {
            eq("projectTemplate", projectTemplateDAOService.get(templateId))
            if (name) {
                ilike(TaskTemplate.NAME, "%$name%")
            }
            order("id", "desc")
        }
        return tasks
    }

    TaskTemplate updateTaskTemplate(TaskTemplate taskTemplate, properties, long templateId) {
        if(!taskTemplateAuthorisationService.hasWriteAccess(taskTemplate.id,templateId)){
            throw new Exception()
        }
        if(properties.isMilestone){
            taskTemplate.isDeliverable = false
        }
        if(properties.isDeliverable){
            taskTemplate.isMilestone = false
        }
        if(properties.newListIdx >=0){
            templateReorderListIndexes(taskTemplate.id,templateId,properties)
        } else {
            taskTemplate.properties = properties
            taskTemplate.save()
        }
        return taskTemplate
    }

    def templateReorderListIndexes(long taskId, long templateId, def validatedBody){
        ProjectTemplate template = ProjectTemplate.lock(templateId)
        TaskTemplate movedTask = getTaskTemplate(taskId, templateId)
        def currentTasks = template.tasks.stream().filter( {task -> task.level > 1}).collect().toList()
        def endIndex = validatedBody.newListIdx
        def startIndex = movedTask.listIdx
        currentTasks.forEach {TaskTemplate task -> {
//            def fullParentObj = taskTemplateParentHelperService.getParentTaskTemplate(task.id as long)
//            JSONObject parent = new JSONObject()
//            parent.put('id', fullParentObj.id)
//            parent.put('level', fullParentObj.level)
//            task.parent = parent
            if(task.id != movedTask.id){
                if (task.listIdx < endIndex && task.listIdx > startIndex) {
                    task.listIdx = task.listIdx - 1
                    task.save()
                } else if (task.listIdx < startIndex && task.listIdx > endIndex) {
                    task.listIdx = task.listIdx + 1
                    task.save()
                } else if (task.listIdx == endIndex || task.listIdx == startIndex) {
                    if (endIndex > startIndex) {
                        task.listIdx = task.listIdx - 1
                        task.save()
                    } else {
                        task.listIdx = task.listIdx + 1
                        task.save()
                    }
                }
            }else{
                movedTask.listIdx = endIndex
                movedTask.save()
            }
        }}
        return currentTasks
    }

    private void checkSubtasksValidForReorder(TaskTemplate task, def tasks) throws AccessDeniedException {
        for (subtask in tasks) {
            TaskTemplate parentTask = taskTemplateParentHelperService.getParentTaskTemplate(subtask.id as long)
            if (parentTask == null || parentTask.id != task.id) {
                throw new AccessDeniedException("Unexpected task id")
            }
        }
    }

    TaskTemplate updateTaskTemplatesForParent(long parentId, def taskOrder, long templateId) throws AccessDeniedException {
        if(!taskTemplateAuthorisationService.hasWriteAccess(parentId,templateId)){
            throw new Exception()
        }
        TaskTemplate taskTemplate = taskTemplateDAOService.get(parentId)
        checkSubtasksValidForReorder(taskTemplate, taskOrder)
        templateTreeHelperService.updateTaskTemplatesForParent(taskTemplate, taskOrder)
        taskTemplate.save(flush: true, failOnError: true)
        decorateTaskWithDetails(taskTemplate)
        return taskTemplate
    }

    List<Task> generateTasksFromTaskTemplates(List<TaskTemplate> sourceTasks, Project project, boolean insertedAsSubtask, Task parentTask, TaskStatus status, boolean includePosts, long templateId, boolean includeDescriptions) {
        List<Task> result = []
        long level = sourceTasks[0].level

        for (TaskTemplate sourceTask in sourceTasks) {

            Task task = generateTaskFromTaskTemplate(sourceTask, status, includeDescriptions)

            task.referenceNumber = matterContentReferenceNumberService.getNextReferenceNumber(project.matter.id)
            if (includePosts) {
                sourceTask.posts = templateTaskPostsService.getPostsByTemplateTaskId(sourceTask.id, templateId)
            }

            if (sourceTask.tasks) {
                generateTasksFromTaskTemplates(sourceTask.tasks, project, insertedAsSubtask,task, status, includePosts, templateId, includeDescriptions)
            }

            if (includePosts && sourceTask.posts) {
                taskTemplatePostGeneratorService.generatePostsFromTaskTemplate(sourceTask.posts as List<Post>, task, project.matter.id)
            }

            if (parentTask) {
                parentTask.addToTasks(task)
            }

            project.addToTasks(task)
            taskService.taskCreation(task, getTaskTemplate(sourceTask.id, templateId), projectTemplateService.getProjectTemplateOnly(templateId), null, Creation_type.FROM_TEMPLATE.value())

            if(!insertedAsSubtask){if(task.level > 1){
                if(task.tasks){
                    List<Task> subtasks = task.tasks
                    Integer highestIdx = 0
                    if(subtasks.size() > 1){
                        for( int i = 1; i < subtasks.size(); i++) {
                            if (subtasks[i].listIdx > subtasks[i - 1].listIdx) {
                                highestIdx = subtasks[i].listIdx
                            }
                        }
                    }else{
                        highestIdx = subtasks[0].listIdx
                    }
                    task.listIdx = highestIdx + 1
                }else{
                    task.listIdx = project.tasks.stream().filter( {t -> t.level > 1}).collect().toList().size() -1
                }
            }}


            for (Post post in task.posts) {
                if (!postAuthorService.isPostAuthor(springSecurityService.getCurrentUser() as AppUser, post)) {
                    postAuthorService.addPostAuthor(springSecurityService.getCurrentUser().id, task.id, post.id, task.projectId)
                }

            }
            if (task.level == level) {
                result.add(task)
            }
        }

        return result
    }

    private def generateTaskFromTaskTemplate(def taskTemplate, TaskStatus status, boolean includeDescription = false) {
        Date currentTime = new Date()
        Date oneSecondEarlier = new Date(currentTime.getTime() - 1000)
        AppUser currentUser = springSecurityService.getCurrentUser()

        Task newTask = new Task(
                name: taskTemplate.name,
                level: taskTemplate.level,
                status: status.value(),
                isMilestone: taskTemplate.isMilestone,
                isDeliverable:taskTemplate.isDeliverable ?  taskTemplate.isDeliverable : false,
                actualStartDate: status.value() == TaskStatus.DONE.value() ? oneSecondEarlier : null,
                actualEndDate: status.value() == TaskStatus.DONE.value() ? currentTime : null,
        )
        if (includeDescription) {
            newTask.description = taskTemplate.noticeboardText
        }
        newTask.createdBy = currentUser
        return newTask
    }

    private Short getLevelForTask(TaskTemplate parentTask) {
        Short level = TaskTemplate.NUMBER_TOP_LEVEL_TASK
        if (parentTask) {
            level = parentTask.getLevel() + 1
        }
        return level
    }

    private void addTaskToParentIfApplicable(TaskTemplate parentTask, TaskTemplate newTask) {
        if (parentTask && !newTask.hasErrors()) {
            parentTask.addToTasks(newTask)
            parentTask.save()
        }
    }

}