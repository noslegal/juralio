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

package com.juralio.auth.dao

import com.juralio.auth.AppUser
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional


@Transactional
class UserDAOService {

    List<AppUser> getAllUsers() {
        return AppUser.list()
    }

    AppUser save(AppUser user) {
        user.save(failOnError: true)

        return user
    }

    AppUser getUser(long id) {
        return AppUser.get(id)
    }

    AppUser findByUsername(String username, Map options) {
        if (username) {
            def user = AppUser.findByUsername(username.toLowerCase(), options)
            return user
        }
        return null
    }

    List<AppUser> findByOrganisationAndActive(Organisation org) {
        return AppUser.findAllByOrganisationAndEnabled(org, true)
    }


}
