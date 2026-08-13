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

package com.juralio.organisation

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.config.ConfigService
import com.juralio.inboxnotification.NotificationFilterUserRecency
import com.juralio.matter.MatterDeletionService
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.usernotification.NotificationPreference
import com.juralio.usernotification.UserNotification
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import com.juralio.aws.SESService
import org.hibernate.SessionFactory
import org.springframework.beans.factory.annotation.Autowired

import java.util.concurrent.TimeUnit

@Transactional
class OrganisationDeletionService {

    OrganisationAuthorisationService organisationAuthorisationService
    SpringSecurityService springSecurityService
    ConfigService configService
    UserRoleService userRoleService
    MatterDeletionService matterDeletionService
    SessionFactory sessionFactory
    @Autowired
    SESService sesService

    boolean delete(Organisation org) {
        if (!organisationAuthorisationService.hasSysAdminAccess()) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        DeletedOrganisationLog existingLog = DeletedOrganisationLog.findByOrganisationId(org.id)
        DeletedOrganisationLog deletedOrgLog = existingLog
        if (!existingLog) {
            deletedOrgLog = new DeletedOrganisationLog(
                    organisationId: org.id,
                    organisationName: org.name,
                    deletedBy: currentUser.username,
                    markedForDeletion: new Date()
            )
            deletedOrgLog.save()
        }

        if (configService.getProperty('domain') == "\${DOMAIN}") {
            return true
        }
        List<String> sendTo = ['support@example.com']
        List<String> sysAdmins = AppUser.findAll().findAll { it.username != 'sysadmin@juralio.com' && userRoleService.hasSysadminRole(it) }.username as List<String>
        if (sysAdmins.size() > 0) {
            sendTo.addAll(sysAdmins)
        }
        sesService.sendBccEmail(sendTo, 'Organisation marked for deletion', '' +
                '<p>The organisation ' + org.name + ' on ' + configService.getProperty('domain') as String + ' has been deleted by ' + deletedOrgLog.deletedBy + '.</p>' +
                '<p>This can be restored within the next 30 days. After 30 days the organisation and it’s associated data will be permanently deleted.</p>')
        return true
    }

    void restore(Organisation org) {
        if (!organisationAuthorisationService.hasSysAdminAccess()) {
            throw new Exception()
        }
        DeletedOrganisationLog deletedOrganisationLog = DeletedOrganisationLog.findByOrganisationId(org.id)
        if (deletedOrganisationLog) {
            deletedOrganisationLog.delete()
            if (configService.getProperty('domain') == "\${DOMAIN}") {
                return
            }
            List<String> sendTo = ['support@example.com']
            List<String> sysAdmins = AppUser.findAll().findAll { it.username != 'sysadmin@juralio.com' && userRoleService.hasSysadminRole(it) }.username as List<String>
            if (sysAdmins.size() > 0) {
                sendTo.addAll(sysAdmins)
            }
            sesService.sendBccEmail(sendTo, 'Organisation restored before deletion', '' +
                    '<p>The organisation ' + org.name + ' on ' + configService.getProperty('domain') as String + ' has been restored before the scheduled deletion date.</p>' +
                    '<p>Its associated data will not be permanently deleted.</p>')
        } else {
            throw new Exception("Organisation not marked for deletion")
        }
    }


    private boolean _cronPermanentlyDeleteOrganisation(DeletedOrganisationLog deletedOrganisationLog) {
        if (deletedOrganisationLog) {
            Organisation org = Organisation.findById(deletedOrganisationLog.organisationId)
            if (org) {
                long orgId = org.id
                long logId = deletedOrganisationLog.id

                // Several org-owned tables are not cascade-deleted from the org
                // (no FK cascade), so tearing them down explicitly first stops the
                // final org.delete() cascade from tripping a foreign-key constraint.

                // Matters (and everything matter-scoped: events, notifications,
                // parties, posts, costs, projects/tasks) via the matter teardown.
                matterDeletionService.deleteAllMattersForOrg(org)

                // Per-user data referencing app_user with a non-cascading FK - clear
                // it for the org's users before the org delete cascades to (and
                // removes) those users, otherwise that cascade hits an FK constraint.
                UserNotification.executeUpdate(
                    'delete from UserNotification n where n.user.id in (select u.id from AppUser u where u.organisation = :org)',
                    [org: org]
                )
                NotificationPreference.executeUpdate(
                    'delete from NotificationPreference n where n.user.id in (select u.id from AppUser u where u.organisation = :org)',
                    [org: org]
                )
                NotificationFilterUserRecency.executeUpdate(
                    'delete from NotificationFilterUserRecency n where n.user.id in (select u.id from AppUser u where u.organisation = :org) or n.filterUser.id in (select u.id from AppUser u where u.organisation = :org)',
                    [org: org]
                )

                // Org groups and positions are org-owned but not cascade-deleted.
                GroupPosition.executeUpdate('delete from GroupPosition p where p.organisation = :org', [org: org])
                OrganisationGroup.executeUpdate('delete from OrganisationGroup g where g.organisation = :org', [org: org])

                // The teardown above loaded entities (e.g. AppUsers referenced by
                // matter team members) that still reference this organisation in the
                // Hibernate session; flush + clear detaches them so the org delete
                // does not fail with "deleted object would be re-saved by cascade".
                sessionFactory.currentSession.flush()
                sessionFactory.currentSession.clear()

                // Remaining org-owned data (users, grades, rate types, other costs,
                // periods, rate tables, rates, labels, templates) is ON DELETE
                // CASCADE and removed by the org delete itself.
                Organisation orgToDelete = Organisation.get(orgId)
                orgToDelete.delete(flush: true)

                DeletedOrganisationLog freshLog = DeletedOrganisationLog.get(logId)
                freshLog.permanentlyDeleted = new Date()
                freshLog.save(flush: true)
            }
            return true
        }

        return false
    }

    //Used by cron, not for human consumption
    void _cronDeleteOrganisationsMarkedForDeletion() {
        List<DeletedOrganisationLog> orgsForDeletion = DeletedOrganisationLog.findAll().findAll { DeletedOrganisationLog deletedOrganisationLog ->
            if (deletedOrganisationLog.permanentlyDeleted != null) {
                return false
            }
            long diffInMs = Math.abs(new Date().getTime() - deletedOrganisationLog.markedForDeletion.getTime())
            return TimeUnit.DAYS.convert(diffInMs, TimeUnit.MILLISECONDS) >= 30
        }
        if(orgsForDeletion.size()>0){
            orgsForDeletion.forEach {
                _cronPermanentlyDeleteOrganisation(it)
            }
        }
    }
}