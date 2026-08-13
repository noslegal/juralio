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

package com.juralio.recency.dao

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.matter.Matter
import com.juralio.matter.MatterRecency
import com.juralio.matter.MatterStatus
import com.juralio.project.Project
import com.juralio.project.ProjectRecency
import com.juralio.project.ProjectVisitRecency
import com.juralio.project.dao.TaskCountsDAOService
import com.juralio.task.Task
import com.juralio.task.TaskRecency
import com.juralio.task.status.TaskStatus
import com.juralio.template.ProjectTemplate
import com.juralio.template.ProjectTemplateRecency
import grails.gorm.transactions.Transactional

@Transactional
class RecencyDAOService {

    def matterClazz = MatterRecency.class
    def projectVisitClazz = ProjectVisitRecency.class
    def projectClazz = ProjectRecency.class
    def projectTemplateClazz = ProjectTemplateRecency.class
    def taskClazz = TaskRecency.class
    TaskCountsDAOService taskCountsDAOService
    UserRoleService userRoleService

    void saveNewMatterRecency(MatterRecency recency) {
        try {
            recency.save(failOnError: false, flush: false)
        } catch (Exception e) {
            println(e)
        }
    }

    void saveMatterRecency(MatterRecency recency) {
        try {
            recency.save(failOnError: false, flush: false)
        } catch (Exception e) {
            println(e)
        }
    }

    MatterRecency getMatterRecencyByUserAndMatter(AppUser user, Matter matter) {
        List<MatterRecency> recents = matterClazz.findAllByUserAndMatter(user, matter, [lock: true, sort: 'lastVisit', order: 'desc'])
        if (recents.size() > 0) {
            MatterRecency toBeReturned = recents[0]
            if (recents.size() > 1) {
                //delete the extra
                recents.each {
                    if (it != recents.first()) {
                        it.delete()
                    }
                }

            }
            return toBeReturned
        } else {
            return null
        }
    }

    List<MatterRecency> getMatterRecenciesByUser(AppUser user) {
        return matterClazz.findAllByUser(user)
    }
    List<ProjectRecency> getProjectRecenciesByUser(AppUser user) {
        return projectClazz.findAllByUser(user)
    }
    List<ProjectTemplateRecency> getProjectTemplateRecenciesByUser(AppUser user) {
        return projectTemplateClazz.findAllByUser(user)
    }

    void saveProjectRecency(ProjectRecency recency, boolean newRecency = false) {
        if (!newRecency) {
            recency.save()
            return
        }
        try {
            recency.save()
        } catch (Exception e) {
            // We catch this to prevent duplicated recency records breaking the current transaction.
        }
    }

    void saveProjectVisitRecency(ProjectVisitRecency recency, boolean newRecency = false) {
        if (!newRecency) {
            recency.save()
            return
        }
        try {
            recency.save()
        } catch (Exception e) {
            // We catch this to prevent duplicated recency records breaking the current transaction.
        }
    }

    void saveTemplateRecency(ProjectTemplateRecency recency, boolean newRecency = false) {
        if (!newRecency) {
            recency.save()
            return
        }
        try {
            recency.save()
        } catch (Exception e) {
            // We catch this to prevent duplicated recency records breaking the current transaction.
        }
    }

    void saveTaskRecency(TaskRecency taskRecency) {
        try {
            taskRecency.save(failOnError: false)
        } catch (Exception e) {
            // We catch this to prevent duplicated recency records breaking the current transaction.
        }
    }

    void deleteTaskRecency(TaskRecency recency) {
        recency.delete()
    }

    int getRecencyCount(AppUser user) {
        return TaskRecency.countByUser(user)
    }

    int getRecencyCount(AppUser user, Matter matter) {
        return TaskRecency.countByUserAndMatter(user, matter)
    }

    void deleteOldRecencyRecords(AppUser user, Matter matter, int recordLimitCount) {
        List<TaskRecency> taskRecencyRecords = getTaskRecencyRecordsByUserAndMatter(user, matter)
        taskRecencyRecords.sort({ TaskRecency it -> it.lastVisit })
        taskRecencyRecords = taskRecencyRecords.reverse()
        List<TaskRecency> toRemove = taskRecencyRecords.subList(recordLimitCount - 1, taskRecencyRecords.size())
        TaskRecency.deleteAll(toRemove)
    }

    ProjectVisitRecency getProjectVisitRecencyByUserAndProject(AppUser user, Project project) {
        List<ProjectVisitRecency> recents = projectVisitClazz.findAllByUserAndProject(user, project, [lock: true, sort: 'lastVisit', order: 'desc'])
        if (recents.size() > 0) {
            ProjectVisitRecency toBeReturned = recents[0]
            if (recents.size() > 1) {
                //delete the extra
                recents.each {
                    if (it != recents.first()) {
                        it.delete()
                    }
                }

            }
            return toBeReturned
        } else {
            return null
        }
    }

    ProjectRecency getProjectRecencyByUserAndProject(AppUser user, Project project) {
        List<ProjectRecency> recents = projectClazz.findAllByUserAndProject(user, project, [lock: true, sort: 'lastVisit', order: 'desc'])
        if (recents.size() > 0) {
            ProjectRecency toBeReturned = recents[0]
            if (recents.size() > 1) {
                //delete the extra
                recents.each {
                    if (it != recents.first()) {
                        it.delete()
                    }
                }

            }
            return toBeReturned
        } else {
            return null
        }
    }

    ProjectTemplateRecency getProjectTemplateRecencyByUserAndTemplate(AppUser user, ProjectTemplate projectTemplate) {
        List<ProjectTemplateRecency> recents = projectTemplateClazz.findAllByUserAndProjectTemplate(user, projectTemplate, [lock: true, sort: 'lastVisit', order: 'desc'])
        if (recents.size() > 0) {
            ProjectTemplateRecency toBeReturned = recents[0]
            if (recents.size() > 1) {
                //delete the extra
                recents.each {
                    if (it != recents.first()) {
                        it.delete()
                    }
                }
            }
            return toBeReturned
        } else {
            return null
        }
    }

    TaskRecency getTaskRecencyByUserAndTask(AppUser user, Task task) {
        return taskClazz.findByUserAndTask(user, task, [lock: true])
    }

    List<Project> getRecentProjectsForUser(AppUser user, long count) {
        return projectClazz.findAllByUser(user, [max: count, sort: ProjectRecency.LAST_VISIT, order: "desc"])
                .collect { ProjectRecency it ->
                    it.project.taskCounts = taskCountsDAOService.getTaskCounts(it.project.id)
                    return it.project
                }
    }

    private findByOrgOrSystem(ProjectTemplate projectTemplate, AppUser appUser) {
        if (appUser.organisation && projectTemplate.organisation) {
            return projectTemplate.organisation?.id == appUser.organisation?.id
        }
        if (projectTemplate.isSystemTemplate && userRoleService.hasSystemTemplateManagerRole(appUser)) {
            return true
        }
        return false
    }

    List<ProjectTemplate> getRecentProjectTemplatesForUser(AppUser user, boolean filterOutDrafts = true) {
        List<ProjectTemplateRecency> templates = projectTemplateClazz.findAllByUser(user, [sort: ProjectTemplateRecency.LAST_VISIT, order: "desc"])
        templates.unique { ProjectTemplateRecency a, b -> a.projectTemplate.id <=> b.projectTemplate.id }.findAll {
            ProjectTemplateRecency templateRecency -> (!templateRecency.projectTemplate.archived && findByOrgOrSystem(templateRecency.projectTemplate, user))
        }.collect {
            ProjectTemplateRecency templateRecency -> templateRecency.projectTemplate
        }
    }

    List<TaskRecency> getTaskRecencyRecordsForUser(AppUser user) {
        return TaskRecency.findAllByUser(user, [sort: TaskRecency.LAST_VISIT, order: "desc"])
    }

    List<TaskRecency> getTaskRecencyRecordsByUserAndMatter(AppUser user, Matter matter) {
        return TaskRecency.findAllByUserAndMatter(user, matter)
    }

    List<Task> getRecentTasksForUser(AppUser user) {
        List<TaskRecency> recencyRecords = getTaskRecencyRecordsForUser(user)
        List<Task> recentTaskList = []
        recencyRecords.each { TaskRecency record ->
            if (isActiveTask(record.task.id)) recentTaskList.add(Task.get(record.task.id))
        }
        return recentTaskList
    }

    List<Matter> getRecentMattersForUser(AppUser user) {
        List<MatterRecency> recencyRecords = getMatterRecenciesByUser(user)
        List<Matter> recentMatterList = []
        recencyRecords.each { MatterRecency record ->
            if (isActiveMatter(record.matter.id)) recentMatterList.add(Matter.get(record.matter.id))
        }
        return recentMatterList
    }

    boolean isActiveMatter(long matterId) {
        Matter matter = Matter.get(matterId)
        return matter.matterStatus == MatterStatus.ACTIVE.value()
    }

    boolean isActiveTask(long taskId) {
        Task task = Task.get(taskId)
        return task.status != TaskStatus.NOT_REQUIRED.value() &&
                task.project.active
    }

    boolean isActiveTask(Task task) {
        return task.status != TaskStatus.NOT_REQUIRED.value() &&
                task.project.active
    }

    void deleteTaskFromRecencyRecords(Task task) {
        taskClazz.findAllByTask(task).each { TaskRecency it -> it.delete(flush: true) }
    }

    void clearAllMatterRecency(Matter matter) {
        TaskRecency.deleteAll(TaskRecency.findAllByMatter(matter))

        List<Project> projects = Project.findAllByMatter(matter)
        projects.forEach { Project project ->
            ProjectRecency.deleteAll(ProjectRecency.findAllByProject(project))
            ProjectVisitRecency.deleteAll(ProjectVisitRecency.findAllByProject(project))
        }

        MatterRecency.deleteAll(MatterRecency.findAllByMatter(matter))
    }
}
