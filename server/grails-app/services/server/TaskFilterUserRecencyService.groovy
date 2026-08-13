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

package server

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.task.dao.TaskFilterUserRecencyDAOService
import com.juralio.task.recency.TaskFilterUserRecency
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic
import org.springframework.security.access.AccessDeniedException

@CompileStatic
@Transactional
class TaskFilterUserRecencyService {
    public static final int MAXIMUM_RECENT_USER_FILTER = 5

    MatterService matterService
    UserService userService
    TaskFilterUserRecencyDAOService taskFilterUserRecencyDAOService
    MatterAuthorisationService matterAuthorisationService

    List<AppUser> retrieveUserFilterRecency(AppUser user, long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        List<TaskFilterUserRecency> recency = taskFilterUserRecencyDAOService.fetchRecency(user, matter)
        return recency.sort {
            it.dateCreated.getTime()
        }.reverse()
                .collect {
                    userService.getUserById(it.filterUser.id)
                }.unique { a, b -> a.id <=> b.id }
    }

    void recordUserFilterRecency(AppUser user, AppUser filterUser, long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new AccessDeniedException('')
        }
        Matter matter = matterService.getMatterOnly(matterId)
        taskFilterUserRecencyDAOService.saveRecency(user, filterUser, matter)
        taskFilterUserRecencyDAOService.maintainRecencyCap(user, matter)
    }
}
