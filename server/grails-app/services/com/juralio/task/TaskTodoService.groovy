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

package com.juralio.task

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterStatus
import com.juralio.matter.dao.MatterDAOService
import com.juralio.project.ProjectService
import com.juralio.task.follower.TaskFollower
import com.juralio.task.team.TaskTeamMember
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.grails.orm.hibernate.cfg.GrailsHibernateUtil

@CompileStatic
@Transactional
class TaskTodoService {

    MatterDAOService matterDAOService
    ProjectService projectService

    private boolean isValidTask(Task task) {
        if (task.plannedStartDate && task.actualStartDate == null) {
            return true
        }
        if (task.plannedEndDate && task.actualEndDate == null) {
            return true
        }
    }

    private Date getDate(Task task) {
        if (task.plannedEndDate != null) {
            return task.plannedEndDate
        } else if (task.plannedStartDate != null) {
            return task.plannedStartDate
        }
    }


    @CompileDynamic
    List<Task> getTaskTodosByUser(AppUser user) {
        List<TaskTeamMember> teamMembers = TaskTeamMember.findAllByUser(user)
        List<TaskFollower> taskFollowers = TaskFollower.findAllByUser(user)
        List<Task> tasks = []
        teamMembers.each { TaskTeamMember ttm ->
            if (isValidTask(ttm.task)) {
                tasks.add(ttm.task)
            }
        }
        taskFollowers.each { TaskFollower tf ->
            if (isValidTask(tf.task)) {
                tasks.add(tf.task)
            }
        }
        tasks = tasks.toSet().toList().findAll { Task t -> t.project.active && matterDAOService.get(t.project.matterId).matterStatus == MatterStatus.ACTIVE.value() }
        tasks = tasks.findAll { t -> projectService.canAccessPrivateWorkstream(t.project) }
        tasks = tasks.sort({ Task a, Task b ->
            Date date1 = getDate(a)
            Date date2 = getDate(b)
            if (date1 < date2) {
                return -1
            } else if (date1 > date2) {
                return 1
            } else {
                Matter matterA = matterDAOService.get(a.project.matterId)
                Matter matterB = matterDAOService.get(b.project.matterId)
                if (matterA.clientName != matterB.clientName) {
                    String firstClientName = [matterA.clientName, matterB.clientName].sort()[0]
                    if (firstClientName == matterA.clientName) {
                        return -1
                    } else {
                        return 1
                    }
                } else if (matterA.name != matterB.name) {
                    String firstMatterName = [matterA.name, matterB.name].sort()[0]
                    if (firstMatterName == matterA.name) {
                        return -1
                    } else {
                        return 1
                    }
                } else if (a.level < b.level) {
                    return -1
                } else if (a.level > b.level) {
                    return 1
                }
                String firstTaskNumber = [a.referenceNumber, b.referenceNumber].sort()[0]
                if (firstTaskNumber == a.referenceNumber) {
                    return -1
                } else {
                    return 1
                }
            }
        } as Closure)

        for (int i = 0; i < tasks.size(); i++) {
            tasks[i] = GrailsHibernateUtil.unwrapIfProxy(tasks[i]) as Task
        }

        return tasks
    }
}
