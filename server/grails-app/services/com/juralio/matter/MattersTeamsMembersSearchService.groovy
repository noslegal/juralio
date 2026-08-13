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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.auth.UserSearchService
import com.juralio.auth.UserService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class MattersTeamsMembersSearchService {
    MatterService matterService
    MatterTeamService matterTeamService
    MatterTeamMemberSearchService matterTeamMemberSearchService
    UserSearchService userSearchService
    UserService userService

    List<Matter> getSharedMatters(long userId) {
        AppUser filterUser = userService.getUserById(userId)
        List<Matter> sharedMatters = []
        List<Matter> matters = matterService.getMattersForUser(-1)

        for (int i = 0; i < matters.size(); i++) {
            List<AppUser> users = matterTeamService.getMatterTeamMembers(matters[i].id)
            if (users.contains(filterUser)) {
                sharedMatters.add(matters[i])
            }
        }
        return sharedMatters
    }

    List<AppUser> getTeamMembers(String search) {
        List<AppUser> searchUsers = userSearchService.searchByName(search)
        List<Matter> matters = matterService.getMattersForUser(-1)
        List<AppUser> results = []

        for (int i = 0; i < matters.size(); i++) {
            List<AppUser> users = matterTeamService.getMatterTeamMembersExcludingSelf(matters[i])

            for (int j = 0; j < searchUsers.size(); j++) {
                if (users.contains(searchUsers[j])) {
                    results.add(searchUsers[j])
                }
            }
        }

        results.unique { a, b -> a.id <=> b.id }
        return matterTeamMemberSearchService.sortAppUsers(results)
    }
}