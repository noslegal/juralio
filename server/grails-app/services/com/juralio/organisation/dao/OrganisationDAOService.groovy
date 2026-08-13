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

package com.juralio.organisation.dao

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional
import groovy.sql.Sql
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.hibernate.Hibernate

@CompileStatic
@Transactional
class OrganisationDAOService {
    Sql groovySql
    UserService userService

    Organisation getOrganisation(long id) {
        return Organisation.get(id)
    }

    List<Organisation> list() {
        return Organisation.list()
    }

    Organisation save(Organisation organisation) {
        if (organisation.validate()) {
            organisation.save()
        }
        return organisation
    }

    @CompileDynamic
    List<AppUser> getUsersFromOrg(Organisation org) {
        ArrayList<AppUser> users = []
        AppUser.findAllByOrganisation(org).each {
            users.push(Hibernate.unproxy(it) as AppUser)
        }
        return users
    }

    @CompileDynamic
    List<AppUser> getActiveUsersFromOrg(Organisation org) {
        ArrayList<AppUser> users = []
        AppUser.findAllByOrganisationAndEnabled(org, true).each {
            users.push(Hibernate.unproxy(it) as AppUser)
        }
        return users
    }
}
