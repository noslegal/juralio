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

package com.juralio.project.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.MatterStatus
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.ProjectWithPostsService
import com.juralio.recency.RecencyService
import com.juralio.task.Task
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import server.PrivateWorkstreamMember
import server.PrivateWorkstreamMemberService

@Transactional
class ProjectDAOService {

    protected final Log logger = LogFactory.getLog(getClass())
    def clazz = Project.class
    Sql groovySql
    SpringSecurityService springSecurityService
    TaskCountsDAOService taskCountsDAOService
    ProjectWithPostsService projectWithPostsService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    ProjectService projectService
    MatterService matterService
    PrivateWorkstreamMemberService privateWorkstreamMemberService
    RecencyService recencyService

    Project save(Project project) {
        project.save(failOnError: true, flush: true)
        return project
    }

    Project get(long projectId) {
        return clazz.get(projectId)
    }

    boolean projectExist(long projectId) {
        return clazz.findAllById(projectId).size() > 0
    }

    Project lock(long projectId) {
        Project project = clazz.lock(projectId)
        return project
    }

    List<Project> findAllByMatterInList(List<Matter> matters) {
        return matters && matters.size() > 0 ? clazz.findAllByMatterInListAndActive(matters, true, [sort: Project.NAME]) : []
    }

    List<Project> findAllByMatterInListIncludeClosed(List<Matter> matters) {
        return matters && matters.size() > 0 ? clazz.findAllByMatterInList(matters, [sort: Project.NAME]) : []
    }

    List<Project> findAllByMatterInListAndName(List<Matter> matters, String name) {
        return matters && matters.size() > 0 ? Project.findAllByMatterInListAndNameLike(matters, '%' + name + '%', [sort: Project.NAME]) : []
    }

    Project findByDeletedMirror(Project deletedMirror) {
        if (deletedMirror == null) {
            throw new IllegalArgumentException('deletedMirror cannot be null')
        }

        return clazz.findByDeletedMirror(deletedMirror)
    }

    List<Project> getProjectsByMatterId(long matterId, boolean excludeClosed, boolean levelATasksOnly, boolean allTasks = false, boolean includePosts = false, includePrivate = false) {
        List<Project> projects = []

        AppUser currentUser = springSecurityService.getCurrentUser()

        String whereClause = """project.matter_id = ${matterId}"""

        if (excludeClosed) {
            whereClause = whereClause + """ AND project.active = true """
        }

        String query = """
            WITH most_recent_project_visits AS (
                SELECT project_id, MAX(last_visit) last_visit FROM project_recency WHERE user_id = ${currentUser.id} GROUP BY project_id
                )
                SELECT project.id as pid
                FROM project
                    LEFT JOIN most_recent_project_visits r 
                    ON project.id = r.project_id
                    WHERE ${whereClause}
                    ORDER BY 
                        CASE 
                            WHEN r.last_visit IS NULL 
                            THEN 1 ELSE 0 END, 
                        r.last_visit DESC, 
                        project.name
        """

        groovySql.eachRow(query) { row ->
            Project fetchedProject = get(row.pid as long)
            fetchedProject.taskCounts = taskCountsDAOService.getTaskCounts(fetchedProject.id)
            fetchedProject.mostRecentVisit = recencyService.getMostRecentProjectVisitRecency(fetchedProject)
            if (levelATasksOnly) {
                fetchedProject.levelATasks = Task.findAllByProjectAndLevel(fetchedProject, 1)
            }
            if (includePosts) {
                fetchedProject.postCount = projectWithPostsService.getUsersWorkstreamPostCount(fetchedProject)
            }
            if (fetchedProject.isPrivate) {
                if (projectService.canAccessPrivateWorkstream(fetchedProject) || matterService.isMatterAdmin(matterId, currentUser.id) && includePrivate) {
                    List<PrivateWorkstreamMember> privateWorkstreamMembers = privateWorkstreamMemberService.getMembers(fetchedProject.matter, fetchedProject)
                    fetchedProject.privateWorkstreamTeam = privateWorkstreamMembers
                    projects << fetchedProject
                }
            } else {
                projects << fetchedProject
            }
        }

        return projects
    }

    Date getEarliestStartDateInProject(Long projectId){
        Date startDate = null
        String query = """
            select planned_start_date as date from task where planned_start_date is not NULL and project_id = ${projectId}
            union
            select actual_start_date as date from task  where actual_start_date is not null and project_id = ${projectId}
            order by date asc limit 1
        """
        groovySql.eachRow(query) { row ->
            startDate = row.getDate('date')
        }

        return startDate

    }
    Date getLatestEndDateInProject(Long projectId){
        Date endDate = null
        String query = """
            select planned_end_date as date from task where planned_end_date is not NULL and project_id = ${projectId}
            union
            select actual_end_date as date from task  where actual_end_date is not null and project_id = ${projectId}
            order by date desc limit 1
        """
        groovySql.eachRow(query) { row ->
            endDate = row.getDate('date')
        }

        return endDate
    }

    List<Project> getProjectForUser(String optionalQuery='',String contextType='',Long contextId) {
        List<Project> projects = []
        String queryString =''
        String contextCheck = ''
//        if(optionalQuery != ''){
//            //queryString = "AND (LOWER(project.name) like '%${optionalQuery.toLowerCase()}%' OR LOWER(project.description) like '%${optionalQuery.toLowerCase()}%') "
//            queryString = "AND (LOWER(project.name) like '%${optionalQuery.toLowerCase()}%' ) "
//        }
        if(contextType != '' && contextId){
            contextCheck = "AND ${contextType == 'matter'?'project.matter':contextType == 'workstream'?'task.project':'task'}_id = ${contextId}"
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        String query = """
            select project.id, project.matter_id, project.name, project.description from project
            join matter_team_member mtm on project.matter_id =mtm.matter_id
            where mtm.user_id=${currentUser.id} ${contextCheck} ${queryString} 
        """

        groovySql.eachRow(query) { row -> projects << get(row.id as long) }
        projects = projects.findAll(p ->{p.name.toLowerCase().contains(optionalQuery.toLowerCase())})
        return projects.findAll{Project p -> p.isPrivate? privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(p,currentUser) != null :true}
    }
}
