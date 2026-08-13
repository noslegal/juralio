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

package com.juralio.task.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.project.Project
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.task.Task
import com.juralio.task.TaskCreationContext
import grails.plugin.springsecurity.SpringSecurityService
import groovy.sql.Sql
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

import jakarta.transaction.Transactional

@Transactional
class TaskDAOService {
    SpringSecurityService springSecurityService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    Sql groovySql

    @CompileDynamic
    List<Task> findAllByProjectAndLevel(Project project, short level) {
        project.tasks.findAll { Task it -> it.level == level } as List<Task>
    }

    Task get(long taskId) {
        return Task.get(taskId)
    }

    Task save(Task task) {
        task.save(failOnError: true)
        return task
    }

    TaskCreationContext taskCreationSave(TaskCreationContext taskCreation) {
        taskCreation.save(failOnError: true)
        return taskCreation
    }

    TaskCreationContext taskCreationDelete(TaskCreationContext taskCreation) {
        taskCreation.delete()
    }

    List<Task> getTasksForUser(String optionalQuery='',String contextType, Long contextId){
        List<Task> tasks = []
        String queryString =''
//        if(optionalQuery != ''){
//            //queryString = "AND (LOWER(task.name) like '%${optionalQuery.toLowerCase()}%' OR LOWER(task.description) like '%${optionalQuery.toLowerCase()}%') "
//            queryString = "AND (LOWER(task.name) like '%${optionalQuery.toLowerCase()}%') "
//        }
        String contextCheck =''
        if(contextType != '' && contextId){
            contextCheck = "AND ${contextType == 'matter'?'project.matter':contextType == 'workstream'?'task.project':'task'}_id = ${contextId}"
        }


        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String query = """
            select task.id from task
            join project on project.id = task.project_id
            join matter on matter.id = project.matter_id
            join matter_team_member mtm on project.matter_id =mtm.matter_id
            where mtm.user_id=${currentUser.id} AND project.active =true AND matter.matter_status='active'  ${contextCheck} ${queryString}
        """

        groovySql.eachRow(query) { row -> tasks << get(row.id as long) }
        tasks = tasks.findAll(t ->{t.name.toLowerCase().contains(optionalQuery.toLowerCase())})
        return tasks.findAll{Task t -> t.project.isPrivate? privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(t.project,currentUser) != null :true}
    }
}
