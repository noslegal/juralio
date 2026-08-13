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

package com.juralio.usernotification.resolvers

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matterevent.payload.MatterEventPayload
import com.juralio.matterevent.payload.TaskScopedPayload
import com.juralio.auth.UserService
import com.juralio.task.Task
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.team.TaskTeamMemberService
import com.juralio.usernotification.MatterEventRecipientResolver
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
class TaskTeamRecipientResolverService implements MatterEventRecipientResolver {

    TaskDAOService taskDAOService
    TaskTeamMemberService taskTeamMemberService
    UserService userService

    @CompileDynamic
    Set<AppUser> resolveRecipients(MatterEventPayload payload, AppUser performedBy, Matter matter) {
        List<Long> snapshot = payload.snapshotRecipientIds()
        if (snapshot != null) {
            return snapshot.collect { userService.getUserById(it) }.findAll { it }.toSet()
        }

        TaskScopedPayload p = payload as TaskScopedPayload
        Task task = taskDAOService.get(p.taskId)
        if (!task) return [] as Set
        return taskTeamMemberService
            .getTaskTeamMembersAndFollowersExcludingSelfAndPlaceholders(task, task.project)
            .toSet()
    }
}
