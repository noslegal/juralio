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

package com.juralio.common

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.task.Task
import com.juralio.task.TaskTreeHelperService
import com.juralio.task.team.TaskTeamMember
import groovy.transform.CompileStatic

@CompileStatic
class UserDecoratorService {

    MatterService matterService
    TaskTreeHelperService taskTreeHelperService

    List<AppUser> decorateActiveUsersOnMatter(List<AppUser> collaborators, Matter matter) {
        collaborators.each { AppUser it ->
            if (matterService.isTeamMember(matter.id, it.id) || matterService.isViewer(matter.id, it.id, true)) {
                it.isActiveOnMatter = true
            }
            if (matterService.isViewer(matter.id, it.id, true)) {
                it.isViewerOnMatter = true
            }
        }
    }
}