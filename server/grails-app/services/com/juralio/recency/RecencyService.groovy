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

package com.juralio.recency

import com.juralio.auth.AppUser
import com.juralio.common.DateUtilService
import com.juralio.matter.Matter
import com.juralio.matter.MatterRecency
import com.juralio.matter.dao.MatterDAOService
import com.juralio.project.Project
import com.juralio.project.ProjectRecency
import com.juralio.project.ProjectVisitRecency
import com.juralio.recency.dao.RecencyDAOService
import com.juralio.task.Task
import com.juralio.task.TaskRecency
import com.juralio.task.seenBy.TaskSeenByService
import com.juralio.template.ProjectTemplate
import com.juralio.template.ProjectTemplateRecency
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic
import org.grails.orm.hibernate.cfg.GrailsHibernateUtil
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException
import org.springframework.retry.annotation.Recover
import org.springframework.retry.annotation.Retryable

@CompileStatic
@Transactional
class RecencyService {
    private final int MAXIMUM_RECENT_TASK_COUNT = 150
    private final int MAX_RECENT_RECORDS = 10

    SpringSecurityService springSecurityService
    RecencyDAOService recencyDAOService
    MatterDAOService matterDAOService
    DateUtilService dateUtilService
    TaskSeenByService taskSeenByService

    void updateMatterRecency(Matter matter) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        MatterRecency recency = recencyDAOService.getMatterRecencyByUserAndMatter(user, matter)

        if (recency) {
            recency.lastVisit = dateUtilService.getCurrentDateTime()
            recencyDAOService.saveMatterRecency(recency)
        } else {
            recency = new MatterRecency()
            recency.matter = matter
            recency.user = user
            recencyDAOService.saveNewMatterRecency(recency)
        }

    }

    void updateProjectVisitRecency(Project project) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        ProjectVisitRecency recency = recencyDAOService.getProjectVisitRecencyByUserAndProject(user, project)

        if (recency) {
            recency.lastVisit = dateUtilService.getCurrentDateTime()
            taskSeenByService.removeAll(user, project)
            recencyDAOService.saveProjectVisitRecency(recency)
        } else {
            recency = new ProjectVisitRecency()
            recency.project = project
            recency.user = user
            recencyDAOService.saveProjectVisitRecency(recency)
        }
    }

    void updateProjectRecency(Project project) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        ProjectRecency recency = recencyDAOService.getProjectRecencyByUserAndProject(user, project)

        if (recency) {
            recency.lastVisit = dateUtilService.getCurrentDateTime()
            recencyDAOService.saveProjectRecency(recency)
        } else {
            recency = new ProjectRecency()
            recency.project = project
            recency.user = user
            recencyDAOService.saveProjectRecency(recency, true)
        }
    }

    @Retryable(value = HibernateOptimisticLockingFailureException.class)
    //retry will happen up to 3 times, with a delay of 1 second in between
    void updateTemplateRecency(ProjectTemplate projectTemplate) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        ProjectTemplateRecency recency = recencyDAOService.getProjectTemplateRecencyByUserAndTemplate(user, projectTemplate)

        if (recency) {
            recency.lastVisit = dateUtilService.getCurrentDateTime()
            recencyDAOService.saveTemplateRecency(recency)
        } else {
            recency = new ProjectTemplateRecency()
            recency.projectTemplate = projectTemplate
            recency.user = user
            recencyDAOService.saveTemplateRecency(recency, true)
        }
    }

    void updateTaskRecency(Task task, boolean newTask = false) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        TaskRecency recency = null

        if (!newTask) {
            recency = recencyDAOService.getTaskRecencyByUserAndTask(user, task)
        }

        if (recency) {
            recency.lastVisit = dateUtilService.getCurrentDateTime()
            recencyDAOService.saveTaskRecency(recency)
        } else {
            recency = new TaskRecency()
            recency.task = task
            recency.user = user
            recency.matter = matterDAOService.get(task.project.matterId as long) as Matter

            if (recencyDAOService.getRecencyCount(user, recency.matter) >= MAX_RECENT_RECORDS) {
                recencyDAOService.deleteOldRecencyRecords(user, recency.matter, MAX_RECENT_RECORDS)
            }

            recencyDAOService.saveTaskRecency(recency)
        }
    }

    ProjectVisitRecency getMostRecentProjectVisitRecency(Project project) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        return recencyDAOService.getProjectVisitRecencyByUserAndProject(user, project)
    }

    List<Project> getRecentProjectsForUser(int count) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        List<Project> projects = recencyDAOService.getRecentProjectsForUser(user, count)
        return projects
    }

    List<ProjectTemplate> getRecentProjectTemplatesForUser(boolean filterOutDrafts = true) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        List<ProjectTemplate> projectTemplates = recencyDAOService.getRecentProjectTemplatesForUser(user, filterOutDrafts)
        return projectTemplates
    }

    List<Task> getRecentTasksForUser() {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        List<MatterRecency> matters = recencyDAOService.getMatterRecenciesByUser(user)
        matters.sort({ it.lastVisit })
        matters = matters.reverse()
        if (matters.size() > MAX_RECENT_RECORDS) {
            matters = matters.subList(0, MAX_RECENT_RECORDS)
        }

        List<Task> recentTaskList = []
        matters.forEach({ MatterRecency matterRecency ->
            List<TaskRecency> recentMatterTasks = recencyDAOService.getTaskRecencyRecordsByUserAndMatter(user as AppUser, matterRecency.matter as Matter)
            recentMatterTasks.sort({ it.lastVisit })
            recentMatterTasks = recentMatterTasks.reverse()
            recentMatterTasks.each { TaskRecency record ->
                if (recencyDAOService.isActiveTask(record.task)) recentTaskList.add(GrailsHibernateUtil.unwrapIfProxy(record.task) as Task)
            }
        })
        return recentTaskList
    }

    List<TaskRecency> removeRecencyForUser(AppUser user, long matterId) {
        recencyDAOService.getTaskRecencyRecordsForUser(user).findAll { TaskRecency recency -> recency.task.project.matter.id == matterId }.each { TaskRecency recency ->
            recencyDAOService.deleteTaskRecency(recency)
        }
    }

    void deleteRecentTaskRecords(Task task) {
        recencyDAOService.deleteTaskFromRecencyRecords(task)
    }
}
