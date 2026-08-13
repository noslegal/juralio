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
import com.juralio.task.recency.TaskFilterUserRecency
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import server.TaskFilterUserRecencyService

@CompileStatic
@Transactional
class TaskFilterUserRecencyDAOService {
    
TaskFilterUserRecencyService taskFilterUserRecencyService

    @CompileDynamic
    List<TaskFilterUserRecency> fetchRecency(AppUser user, Matter matter) {
        return TaskFilterUserRecency.findAllByUserAndMatter(user, matter)
    }

    TaskFilterUserRecency saveRecency(AppUser user, AppUser filterUser, Matter matter) {
        TaskFilterUserRecency filterUserRecency = new TaskFilterUserRecency()
        filterUserRecency.user = user
        filterUserRecency.filterUser = filterUser
        filterUserRecency.matter = matter
        filterUserRecency.save(failOnError: true, flush: true)
    }

    @CompileDynamic
    void maintainRecencyCap(AppUser user, Matter matter) {
        List<TaskFilterUserRecency> results = TaskFilterUserRecency.findAllByUserAndMatter(user, matter).sort { TaskFilterUserRecency it ->
            it.dateCreated
        }.reverse()

        while (results.size() > taskFilterUserRecencyService.MAXIMUM_RECENT_USER_FILTER) {
            TaskFilterUserRecency recencyFilter = results.removeLast()
            recencyFilter.delete()
        }
    }
}
