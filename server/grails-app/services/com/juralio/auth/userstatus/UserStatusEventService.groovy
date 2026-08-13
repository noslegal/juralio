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

package com.juralio.auth.userstatus

import com.juralio.AuditTrail
import com.juralio.auth.*
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.codehaus.groovy.runtime.StackTraceUtils
import org.springframework.scheduling.annotation.Scheduled

@Transactional
class UserStatusEventService {

    def springSecurityService
    def dateUtilService

    protected final Log logger = LogFactory.getLog(getClass())

    def recordActivation(long userId) {
        recordEvent(UserStatusEventType.ACTIVATION, userId)
    }

    def recordDeactivation(long userId) {
        recordEvent(UserStatusEventType.DEACTIVATION, userId)
    }

    def recordConfirmed(long userId) {
        recordEvent(UserStatusEventType.CONFIRMED, userId)
    }

    def recordLapsed(long userId) {
        recordCronEvent(UserStatusEventType.LAPSED, userId)
    }

    def recordReactivation(long userId) {
        recordEvent(UserStatusEventType.REACTIVATION, userId)
    }

    def recordLegacyActivation(long userId) {
        Date activationDate = new Date(120, 4, 1) // 1st May 2020
        long currentUserId = springSecurityService.getCurrentUserId()
        UserStatusEvent event = new UserStatusEvent([
                user       : [id: userId],
                performedBy: [id: currentUserId],
                eventType  : UserStatusEventType.ACTIVATION,
                time       : activationDate])
        event.save(flush: true)
    }

    private void recordEvent(UserStatusEventType eventType, long userId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        UserStatusEvent event = new UserStatusEvent([
                user       : [id: userId],
                performedBy: [id: currentUser ? currentUser.id : null],
                eventType  : eventType,
                time       : new Date()])
        event.save(flush: true)
    }

    private  void recordCronEvent(UserStatusEventType eventType, long userId){

        UserStatusEvent event = new UserStatusEvent([
                user       : [id: userId],
                eventType  : eventType,
                time       : new Date()])
        event.save(flush: true)
    }

    def getActiveUsersInInterval(Date startDate, Date endDate) {
        Role sysadminRole = Role.findByAuthority(Roles.SYSADMIN.code())
        def activations = UserStatusEvent.findAllByTimeBetween(startDate, endDate)
        def activatedUserIds = activations ? activations*.userId : []

        def activeUsersInPeriod = activatedUserIds && activatedUserIds.size > 0 ? AppUser.createCriteria().list {
            or {
                eq('enabled', true)
                inList('id', activatedUserIds)
            }
        } : AppUser.findAllByEnabled(true)

        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if(currentUser) {
            AuditTrail auditLog = new AuditTrail(actor: currentUser.username, className: 'activeUserReport', eventName: 'READ', dateCreated: new Date(), lastUpdated: new Date(), oldValue: startDate, newValue: endDate)
            auditLog.save()
        }
        // only count non-sysadmin users
        return activeUsersInPeriod.findAll({ it -> !UserRole.exists(it.id, sysadminRole.id) })
    }

    class ActiveUserRecord {
        Date firstActiveTimeInInterval
        Date lastActiveTimeInInterval
        Date firstActivation
        Date lastDeactivation
        AppUser user
        AppUser lastActivatingUser
        Boolean activeFullMonth = false
        String username
    }

    def getActiveUserRecordsForInterval(Date startDate, Date endDate) {
        def users = getActiveUsersInInterval(startDate, endDate)
        def records = []

        for (def u : users) {
            def firstActivation = UserStatusEvent.findAllByEventTypeAndUser(
                    UserStatusEventType.ACTIVATION, u,
                    [sort: 'time', order: 'asc', limit: 1])
            def firstActivationInInterval = UserStatusEvent.findAllByTimeBetweenAndEventTypeAndUser(
                    startDate, endDate,
                    UserStatusEventType.ACTIVATION, u,
                    [sort: 'time', order: 'asc', limit: 1])
            def lastDeactivationInInterval = UserStatusEvent.findAllByTimeBetweenAndEventTypeAndUser(
                    startDate, endDate,
                    UserStatusEventType.DEACTIVATION, u,
                    [sort: 'time', order: 'desc', limit: 1])
            def lastActivationBeforeEndOfInterval = UserStatusEvent.findAllByTimeLessThanEqualsAndEventTypeAndUser(
                    endDate,
                    UserStatusEventType.ACTIVATION, u,
                    [sort: 'time', order: 'desc', limit: 1])

            if (firstActivation?.size() == 0) firstActivation = null
            if (firstActivationInInterval?.size() == 0) firstActivationInInterval = null
            if (lastDeactivationInInterval?.size() == 0) lastDeactivationInInterval = null
            if (lastActivationBeforeEndOfInterval?.size() == 0) lastActivationBeforeEndOfInterval = null

            if (firstActivation != null && firstActivation.first().time.before(endDate)) {
                records.push(new ActiveUserRecord(
                        firstActiveTimeInInterval: firstActivationInInterval ? firstActivationInInterval.first().time : startDate,
                        lastActiveTimeInInterval: lastDeactivationInInterval ? lastDeactivationInInterval.first().time : endDate,
                        firstActivation: firstActivationInInterval ? firstActivationInInterval.first().time : null,
                        lastDeactivation: lastDeactivationInInterval ? lastDeactivationInInterval.first().time : null,
                        user: u,
                        username: u.username,
                        lastActivatingUser: lastActivationBeforeEndOfInterval ? lastActivationBeforeEndOfInterval.first().performedBy : [username: 'not recorded'],
                        activeFullMonth: firstActivationInInterval == null && lastDeactivationInInterval == null
                ))
            }
        }
        return records
    }

    List<UserStatusEvent> getConfirmationsForPeriod(Date startDate, Date endDate) {
        return UserStatusEvent.findAllByTimeBetweenAndEventType(startDate, endDate, UserStatusEventType.CONFIRMED.value())
    }

    List<UserStatusEvent> getActivationsForPeriod(Date startDate, Date endDate) {
        return UserStatusEvent.findAllByTimeBetweenAndEventType(startDate, endDate, UserStatusEventType.ACTIVATION.value())
    }

    List<UserStatusEvent> getDeactivationsForPeriod(Date startDate, Date endDate) {
        return UserStatusEvent.findAllByTimeBetweenAndEventType(startDate, endDate, UserStatusEventType.DEACTIVATION.value())
    }

    List<UserStatusEvent> getReactivationsForPeriod(Date startDate, Date endDate) {
        return UserStatusEvent.findAllByTimeBetweenAndEventType(startDate, endDate, UserStatusEventType.REACTIVATION.value())
    }

    List<UserStatusEvent> getEventsForUserReport(Date startDate, Date endDate) {
        return UserStatusEvent.findAllByTimeBetween(startDate, endDate, [sort: 'time', order: 'asc'])
    }

    private def createActiveUserRow(ActiveUserRecord record) {
        return """<tr>
            <td>${record.user.username}</td>
            <td>${dateUtilService.getUTCISO8601String(record.firstActiveTimeInInterval)}</td>
            <td>${dateUtilService.getUTCISO8601String(record.lastActiveTimeInInterval)}</td>
            <td>${record.lastActivatingUser.username}</td>
        </tr>"""
    }

    private def createActiveUserTable(List<ActiveUserRecord> activeUsers) {
        return """<table width="100%">
            <thead>
                <tr>
                    <td><b>Username</b></td>
                    <td><b>Time First Active</b></td>
                    <td><b>Time Last Active</b></td>
                    <td><b>Last Activated By</b></td>
                </tr>
            </thead>
            <tbody>
                ${activeUsers.collect { it -> createActiveUserRow(it) }.join()}
            </tbody>
        </table>"""
    }

     def createUsageSummary(Date start, Date end) {
        def organisations = Organisation.findAll()*.name
        def activeUserRecords = getActiveUserRecordsForInterval(start, end)
        def messageContent = """<html>
            <body><h3>Usage Summary</h3>
                <table>
                    <tr><td><b>Start Date</b></td><td>${dateUtilService.getUTCISO8601String(start)}</td></tr>
                    <tr><td><b>End Date</b></td><td>${dateUtilService.getUTCISO8601String(end)}</td></tr>
                    <tr><td><b>Hosted Organisations</b></td><td>${organisations.join(', ')}</td></tr>
                    <tr><td><b>Active User Count</b></td><td>${activeUserRecords ? activeUserRecords.size() : 0}</td></tr>
                </table>
                <h3>Active Users In Period</h3>
                ${createActiveUserTable(activeUserRecords)}
            </body>
        </html>"""

        return messageContent
    }

    def getHostID() {
        try {
            InetAddress inetAddr = InetAddress.getLocalHost()
            byte[] addr = inetAddr.getAddress()

            // Convert to dot representation
            String ipAddr = ""
            for (int i = 0; i < addr.length; ++i) {
                if (i > 0) {
                    ipAddr += "."
                }
                ipAddr += addr[i] & 0xFF
            }

            String hostname = inetAddr.getHostName()

            return "${hostname} (${ipAddr})"
        } catch (UnknownHostException e) {
            return "Unknown Host"
        }
    }

     def getDateOneMonthPreviously() {
        def date = new Date()
        Calendar cal = Calendar.getInstance()
        cal.setTimeZone(TimeZone.getTimeZone('UTC'))
        cal.setTime(date)
        cal.add(Calendar.MONTH, -1)

        return cal.getTime()
    }

     def getStackTraceString(Throwable t) {
        def stringWriter = new StringWriter()
        def printWriter = new PrintWriter(stringWriter)
        StackTraceUtils.printSanitizedStackTrace(t, printWriter)
        return stringWriter.toString()
    }

}
