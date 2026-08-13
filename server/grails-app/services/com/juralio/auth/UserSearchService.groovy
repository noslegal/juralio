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

import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional(readOnly = true)
class UserSearchService {

    /**
     * TODO: This needs a test. The original test
     * is a unit test with loads of mocking. I think
     * This would be much better done in a black-box grails
     * integration test.
     */

    def userRoleService
    SpringSecurityService springSecurityService

    List<AppUser> searchByUsername(String username) {
        if (username) {
            username = username.trim()
        }

        if (!username || username == "") {
            return []
        }

        List<AppUser> searchResults
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        String searchString = "$username"

        searchResults = AppUser.createCriteria().list() {
            or {
                like(AppUser.USERNAME, searchString)
            }
            if (!isSysadmin) {
                and {
                    eq(AppUser.ORGANISATION, currentUser.organisation)
                }
            }
            order(AppUser.USERNAME, "asc")
        } as List<AppUser>

        return searchResults
    }

    List<AppUser> searchByName(String searchText) {

        if (searchText) {
            searchText = searchText.trim()
        }

        if (!searchText || searchText == "") {
            return []
        }

        List<AppUser> searchResults
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)

        if (searchText.contains(' ')) {
            String[] searchWords = searchText.split(" ")
            searchResults = AppUser.createCriteria().list() {
                and {
                    searchWords.each { word ->
                        String searchString = "%$word%"
                        or {
                            ilike(AppUser.FIRST_NAME, searchString)
                            ilike(AppUser.LAST_NAME, searchString)
                        }
                    }
                }
                if (!isSysadmin) {
                    and {
                        eq(AppUser.ORGANISATION, currentUser.organisation)
                    }
                }
                order(AppUser.FIRST_NAME, "asc")
                order(AppUser.LAST_NAME, "asc")
                order(AppUser.USERNAME, "asc")
            } as List<AppUser>
        } else {
            String searchString = "$searchText%"

            searchResults = AppUser.createCriteria().list() {
                or {
                    ilike(AppUser.USERNAME, searchString)
                    ilike(AppUser.FIRST_NAME, searchString)
                    ilike(AppUser.LAST_NAME, searchString)
                }
                if (!isSysadmin) {
                    and {
                        eq(AppUser.ORGANISATION, currentUser.organisation)
                    }
                }
                order(AppUser.FIRST_NAME, "asc")
                order(AppUser.LAST_NAME, "asc")
                order(AppUser.USERNAME, "asc")
            } as List<AppUser>
        }

        return searchResults.findAll {
            !userRoleService.hasSysadminRole(it)
        }.findAll { it.enabled }
    }
}
