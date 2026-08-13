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

package com.juralio.auth

import com.juralio.matter.MatterTeamMemberSearchService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class UserSearchController {
    static allowedMethods = [search: "POST"]

    UserSearchService userSearchService
    MatterTeamMemberSearchService matterTeamMemberSearchService
    
    List<AppUser> search() {
        try {
            List<AppUser> results = []
            if (request.JSON.matterId) {
                results = matterTeamMemberSearchService.search(request.JSON.matterId as long, request.JSON.name,request.JSON.showPlaceholders as boolean)
                results*.hydrateRoles()
            } else if (request.JSON.matters) {
                results = matterTeamMemberSearchService.getMattersTeams(request.JSON.matters)
            } else if (request.JSON.name) {
                results = userSearchService.searchByName(request.JSON.name)
                results*.hydrateRoles()
            } else if (request.JSON.username) {
                results = userSearchService.searchByUsername(request.JSON.username)
            }
            respond results
        } catch (Exception exception) {
            render status: HttpStatus.FORBIDDEN, text: exception.message
        }
    }
}
