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

package com.juralio.task.seenBy

import com.juralio.auth.AppUser
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.seenBy.dao.TaskSeenByDAOService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class TaskSeenByService {

    TaskSeenByDAOService taskSeenByDAOService

    void seen(AppUser user, Task task) {
        try {
            taskSeenByDAOService.save(task, user)
        } catch (ignored) {
        }
    }

    TaskSeenBy get(Long id) {
        return TaskSeenBy.get(id)
    }

    void removeAll(AppUser user, Project project) {
        List<Task> tasks = project.getTasks()
        tasks.each { task ->
            taskSeenByDAOService.deleteAll(task as Task, user)
        }
    }
}
