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

package com.juralio.task.followers.dao

import com.juralio.auth.AppUser
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.follower.TaskFollower
import grails.gorm.transactions.Transactional

@Transactional
class TaskFollowerDAOService {
    TaskFollower save(Task task, AppUser user) {
        return new TaskFollower(task: task, user: user).save()
    }

    List<Task> listTasksByTaskFollower(List<Project> projectsUserCanAccess, AppUser user) {

        if (projectsUserCanAccess && projectsUserCanAccess != []) {
            return Task.where {
                project in projectsUserCanAccess
                followers {
                    user == user
                }
            }.list()
        } else {
            return []
        }

    }
}
