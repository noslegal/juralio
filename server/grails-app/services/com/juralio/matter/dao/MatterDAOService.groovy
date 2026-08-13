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

package com.juralio.matter.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterAdmin
import com.juralio.matter.MatterSortService
import com.juralio.matter.MatterStatus
import com.juralio.matter.MatterTeamMember
import grails.gorm.DetachedCriteria
import grails.plugin.springsecurity.SpringSecurityService
import groovy.sql.Sql
import org.hibernate.sql.JoinType

class MatterDAOService {

    MatterSortService matterSortService
    SpringSecurityService springSecurityService
    Sql groovySql
    def clazz = Matter.class

    Matter save(Matter matter) {
        matter.save(flush: true)
        return matter
    }

    void delete(Matter matter){
        matter.delete(flush:true)
    }

    Matter get(long matterId) {
        return clazz.get(matterId)
    }

    List<Matter> findAllMatters() {
        List<Matter> matters = clazz.createCriteria().list {
            and {
                isNotNull("deletedMirror")
            }
        }
        return matterSortService.sortMatterList(matters)
    }

    List<Matter> findMattersByMatterAdmin(AppUser user) {
        List<Matter> matters = clazz.createCriteria().list {
            matterAdmins {
                eq("user", user)
            }
        }
        return matterSortService.sortMatterList(matters)
    }

    List<Matter> findMattersByMatterCreator(AppUser user) {
        //cannot test this as requires integration test

        List<Matter> matters = clazz.createCriteria().list() {
            createAlias("matterAdmins", "ma", JoinType.LEFT_OUTER_JOIN)
            or {
                and {
                    eq("matterStatus", MatterStatus.INACTIVE.value())
                    eq("creator", user)
                    isNotNull("deletedMirror")
                }
                eq("ma.user", user)
            }
        }
        return matterSortService.sortMatterList(matters)
    }

    List<Matter> getActiveMatterListForTeamMember() {
        List<Matter> matters = []
        AppUser currentUser = springSecurityService.getCurrentUser()

        String query = """
            SELECT matter.id as mid FROM matter 
            INNER JOIN matter_team_member 
            ON matter.id = matter_team_member.matter_id AND matter_team_member.user_id = ${currentUser.id} AND matter.organisation_id = ${currentUser.organisationId}      
            WHERE matter.matter_status = '${MatterStatus.ACTIVE.value()}' 
        """

        groovySql.eachRow(query) { row -> matters << get(row.mid as long) }
        return matters
    }

    List<Matter> getAllMattersForUsersOrganisation() {
        AppUser user = springSecurityService.getCurrentUser()
        return Matter.findAllByOrganisationAndCaseIdIsNotNull(user.organisation, [sort: 'id', order: 'asc'])
    }

    private static final List<String> ORG_MATTERS_SORT_FIELDS = ['clientName', 'name', 'matterStatus']

    Map findOrganisationMattersPaged(
            Long organisationId,
            Long userId,
            String query,
            List<String> statuses,
            String sortField,
            String sortOrder,
            int offset,
            int pageSize
    ) {
        String sortColumn = ORG_MATTERS_SORT_FIELDS.contains(sortField) ? sortField : 'id'
        String direction = (sortOrder == 'desc') ? 'desc' : 'asc'

        List<Long> adminMatterIds = MatterAdmin.createCriteria().list {
            eq 'user.id', userId
            projections { property 'matter.id' }
        } as List<Long>
        List<Long> memberMatterIds = MatterTeamMember.createCriteria().list {
            eq 'user.id', userId
            projections { property 'matter.id' }
        } as List<Long>
        List<Long> personalAccessibleMatterIds = ((adminMatterIds ?: []) + (memberMatterIds ?: [])).unique()

        DetachedCriteria<Matter> mattersQuery = new DetachedCriteria(Matter).build {
            eq 'organisation.id', organisationId
            isNotNull 'caseId'
            ne 'matterStatus', MatterStatus.PENDING_DELETION.value()
            or {
                eq 'isPersonal', false
                if (personalAccessibleMatterIds) {
                    inList 'id', personalAccessibleMatterIds
                }
            }
            if (statuses) {
                inList 'matterStatus', statuses
            }
            if (query) {
                String pattern = "%${query}%".toString()
                or {
                    ilike 'name', pattern
                    ilike 'clientName', pattern
                }
            }
        }

        Long totalCount = mattersQuery.count() as Long
        List<Matter> matters = mattersQuery.list(
                offset: offset,
                max: pageSize,
                sort: sortColumn,
                order: direction
        )

        return [matters: matters, totalCount: totalCount]
    }

    List<Matter> getMattersForUser(String optionalQuery='') {
        List<Matter> matters = []
        String queryString =''
//        if(optionalQuery != ''){
//            queryString = "AND (LOWER(pvm.name) like '%${optionalQuery.toLowerCase()}%' OR LOWER(pvm.client_name) like '%${optionalQuery.toLowerCase()}%') "
//        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        String query = """
            WITH most_recent_matter_visits AS (
                SELECT matter_id, MAX(last_visit) last_visit FROM matter_recency WHERE user_id = ${currentUser.id}  GROUP BY matter_id),
            visible_matters AS (
                SELECT matter_id FROM matter_team_member WHERE user_id = ${currentUser.id} 
                UNION 
                SELECT matter_id FROM matter_admin WHERE user_id = ${currentUser.id}
                UNION 
                SELECT matter_id FROM matter_viewer WHERE user_id = ${currentUser.id}),
            populated_visible_matters AS (
                SELECT * FROM visible_matters INNER JOIN matter ON visible_matters.matter_id = matter.id)
            SELECT pvm.id, pvm.name, pvm.matter_status FROM populated_visible_matters pvm 
                LEFT JOIN most_recent_matter_visits rv 
                    ON pvm.id = rv.matter_id
                WHERE pvm.matter_status = '${MatterStatus.ACTIVE.value()}' AND pvm.organisation_id = ${currentUser.organisationId} ${queryString} OR 
                      pvm.matter_status = '${MatterStatus.CLOSED.value()}'AND pvm.organisation_id = ${currentUser.organisationId} ${queryString}
                ORDER BY 
                    pvm.matter_status,
                    CASE WHEN rv.last_visit IS NULL THEN 1 ELSE 0 END, 
                    rv.last_visit DESC, 
                    pvm.name
        """

        groovySql.eachRow(query) { row -> matters << get(row.id as long) }
        return  matters.findAll(m -> {m.name.toLowerCase().contains(optionalQuery.toLowerCase()) || m.clientName.toLowerCase().contains(optionalQuery.toLowerCase())})
    }
}
