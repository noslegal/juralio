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

package com.juralio.task.team.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Placeholders
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.team.TaskTeamMember

class TaskTeamMemberDAOService {

    TaskTeamMember save(Task task, AppUser user) {
        return new TaskTeamMember(task: task, user: user).save()
    }
    TaskTeamMember savePlaceHolder(Task task, Placeholders user) {
        return new TaskTeamMember(task: task, placeholder: user).save()
    }

    TaskTeamMember delete(Task task, AppUser user) {
        def record = TaskTeamMember.findByTaskAndUser(task, user)
        task.teamMembers.remove(record)
        if (record) {
            record.delete()
        }
        return record
    }

    TaskTeamMember deletePlaceholder(Task task, Placeholders user) {
        def record = TaskTeamMember.findByTaskAndPlaceholder(task, user)
        task.teamMembers.remove(record)
        if (record) {
            record.delete()
        }
        return record
    }

    List<Task> listTasksByTaskTeamMember(List<Project> projectsUserCanAccess, AppUser user) {

        if (projectsUserCanAccess && projectsUserCanAccess != []) {
            return Task.where {
                project in projectsUserCanAccess
                teamMembers {
                    user == user
                }
            }.list()
        } else {
            return []
        }

    }

    boolean exists(def taskId, def userId) {
        return TaskTeamMember.where {
            user.id == userId && task.id == taskId
        }.get() != null
    }

    boolean existsPlaceholder(def taskId, def userId) {
        return TaskTeamMember.where {
            placeholder.id == userId && task.id == taskId
        }.get() != null
    }

    TaskTeamMember get(Task task, AppUser user) {
        return TaskTeamMember.findByUserAndTask(user,task)
    }

    TaskTeamMember getPlaceholder(Task task, Placeholders user) {
        return TaskTeamMember.findByPlaceholderAndTask(user,task)
    }
}
