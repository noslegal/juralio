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

package com.juralio.task.seenBy.dao

import com.juralio.auth.AppUser
import com.juralio.task.Task
import com.juralio.task.seenBy.TaskSeenBy
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class TaskSeenByDAOService {

    TaskSeenBy save(Task task, AppUser user) {
        return new TaskSeenBy(task: task, user: user).save()
    }

    @CompileDynamic
    TaskSeenBy delete(Task task, AppUser user) {
        TaskSeenBy record = TaskSeenBy.findByTaskAndUser(task, user)

        if (record) {
            task.seenBy.remove(record)
            task.save()
            record.delete(flush: true)
        }

        return record
    }

    Boolean deleteAll(Task task, AppUser user) {
        return task.seenBy.removeAll() { TaskSeenBy it -> it.userId == user.id }
    }
}
