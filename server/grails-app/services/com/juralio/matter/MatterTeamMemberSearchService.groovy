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
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class MatterTeamMemberSearchService {

    MatterService matterService
    MatterAuthorisationService matterAuthorisationService
    PlaceholdersService placeholdersService

    @CompileDynamic
    List<AppUser> getMattersTeams(def matters) {
        List<AppUser> results = []

        matters.each { long matterId ->
            results.addAll(getUsersForMatter(matterId))
        }

        results.unique { a, b -> a.id <=> b.id }
        return sortAppUsers(results)
    }

    @CompileDynamic
    private List<AppUser> getUsersForMatter(long matterId) {
        if (!matterAuthorisationService.hasTeamMemberAccess(matterId)) {
            throw new Exception()
        }
        if(!matterAuthorisationService.hasTeamMemberAccess(matterId)){
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        List<AppUser> users = MatterTeamMember.findAllByMatter(matter).user
        return users
    }

    List<AppUser> search(long matterId, String searchText,boolean showPlaceholders=false) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        if (searchText) {
            searchText = searchText.trim()
        }

        if (!searchText || searchText == "") {
            return []
        }

        searchText = searchText.toLowerCase()
        List<AppUser> mtms = getMatterUsers(matterId,-1,showPlaceholders)

        return sortAppUsers(mtms.findAll { AppUser mtm ->
            if (!mtm.enabled) return false
            String firstname = mtm.firstname != null ? mtm.firstname.toLowerCase() : ''
            String lastname = mtm.lastname != null ? mtm.lastname.toLowerCase() : ''
            String username = mtm.username != null ? mtm.username.toLowerCase() : ''
            if (searchText.contains(" ")) {
                String[] words = searchText.split(" ")
                (firstname.contains(words[0]) || lastname.contains(words[0]) || username.contains(words[0])) &&
                        (firstname.contains(words[1]) || lastname.contains(words[1]) || username.contains(words[1]))
            } else {
                firstname.contains(searchText) ||
                        lastname.contains(searchText) ||
                        username.contains(searchText)
            }
        })
    }

    @CompileDynamic
    List<AppUser> getMatterUsers(long matterId, int limit = -1,showPlaceholders) {
        Matter matter = matterService.getMatterOnly(matterId)
        List<AppUser> mtms

        if (limit != -1) {
            mtms = MatterTeamMember.findAllByMatter(matter, [sort: 'dateCreated', order: 'desc', max: limit]).user
        } else {
            mtms = MatterTeamMember.findAllByMatter(matter).user
        }
        if(showPlaceholders==true){
            List<Placeholders> placeholders = placeholdersService.getAllPlaceholdersForMatter(matterId)
            placeholders.each { Placeholders placeholder ->
                {
                    AppUser fakeUser = new AppUser(firstname: placeholder.firstName, lastname: placeholder.lastName, enabled: placeholder.enabled)
                    fakeUser.username = placeholder.emailAddress != null ? placeholder.emailAddress : ''
                    fakeUser.id = placeholder.id
                    fakeUser.isPlaceholder = true
                    mtms.add(fakeUser)
                }
            }
        }
        return mtms
    }

    List<AppUser> sortAppUsers(List<AppUser> users) {
        users.sort { a, b ->
            a.firstname <=> b.firstname ?:
                    a.lastname <=> b.lastname ?:
                            a.username <=> b.username
        }
        return users
    }
}
