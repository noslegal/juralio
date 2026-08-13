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

package com.juralio.search

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.sql.GroovyRowResult
import groovy.sql.Sql
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException
import org.springframework.retry.annotation.Recover
import org.springframework.retry.annotation.Retryable

@CompileStatic
@Transactional
class FuzzySearchService {
    Sql groovySql
    MatterService matterService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    SpringSecurityService springSecurityService

    private String generateWhereString(String searchToken) {
        String searchString = searchToken.toLowerCase()
        return "(lower(case_id) like '%${searchString}%' or lower(name) like '%${searchString}%' or lower(client_name) like '%${searchString}%' or lower(user_defined_reference_number) like '%${searchString}%' or lower(firstname) like '%${searchString}%' or lower(lastname) like '%${searchString}%' or lower(username) like '%${searchString}%')"
    }

    private Boolean canAccessPrivateSingleWorkstreamMatter(Matter matter) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (matter.projects.size() == 1 && matter.projects[0].isPrivate) {
            return privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(matter.projects[0], currentUser) != null || matterService.isMatterAdmin(matter.id, currentUser.id)
        }
        return true
    }

    @CompileDynamic
    @Retryable(value = HibernateOptimisticLockingFailureException.class)
    //retry will happen up to 3 times, with a delay of 1 second in between
    Long[] search(String searchString, Boolean mattersOnly) {
        if (searchString == null) {
            return [] //bail out early
        }
        String[] searchTokens = searchString.split(' ')
        List<Long> matterIds = []
        if (mattersOnly) {
            String queryForAdmins = "select matter.id, lower(case_id) as case_id, lower(name) as name, lower(client_name) as client_name,lower(user_defined_reference_number) as user_defined_reference_number, lower(firstname) as firstname, lower(lastname) as lastname, lower(username) as username from matter join matter_admin on matter_admin.matter_id = matter.id join app_user on matter_admin.user_id = app_user.id"
            String queryForEditors = "select matter.id, lower(case_id) as case_id, lower(name) as name, lower(client_name) as client_name,lower(user_defined_reference_number) as user_defined_reference_number, lower(firstname) as firstname, lower(lastname) as lastname, lower(username) as username from matter join matter_team_member on matter_team_member.matter_id = matter.id join app_user on matter_team_member.user_id = app_user.id"

            String whereQuery = 'where '
            searchTokens.eachWithIndex { String token, Integer index ->
                String whereString = generateWhereString(token)
                if (index > 0) {
                    whereQuery = whereQuery + ' and '
                }
                whereQuery = whereQuery + whereString
            }

            String query = queryForAdmins + ' ' + whereQuery + ' union ' + queryForEditors + ' ' + whereQuery

            List<GroovyRowResult> rows = groovySql.rows(query, 0, 10000)
            List<Long> foundMatterIds = []
            rows.forEach { GroovyRowResult it -> foundMatterIds.add(it.id) }
            matterService.getMattersForUser(-1).findAll { matter -> foundMatterIds.contains(matter.id) && canAccessPrivateSingleWorkstreamMatter(matter) }.each { matterIds.add(it.id) }
            return matterIds
        }
        return matterIds
    }
}