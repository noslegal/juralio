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

import asset.pipeline.grails.AssetResourceLocator
import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import com.juralio.matter.costs.MatterCosts
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.AddedToMatterPayload
import com.juralio.matterevent.payload.RemovedFromMatterPayload
import com.juralio.matter.dao.MatterDAOService
import com.juralio.matter.exception.*
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.jsoup.*

import java.nio.charset.StandardCharsets

@Transactional
class MatterAdminService {

    MatterAuthorisationService matterAuthorisationService
    MatterDAOService matterDAOService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    MatterEventService matterEventService
    MatterService matterService
    UserService userService
    ConfigService configService
    AssetResourceLocator assetResourceLocator
    MatterTeamMemberService matterTeamMemberService
    MatterCostsService matterCostsService
    MatterViewerService matterViewerService

    @Autowired
    SESService sesService

    Boolean isMatterAdmin() {
        List<Matter> matters = getMattersForMatterAdmin()
        return matters.size() > 0
    }

    MatterAdmin getMatterAdmin(Matter matter, AppUser user){
        MatterAdmin matterAdmin = MatterAdmin.findByMatterAndUser(matter,user)
        return matterAdmin
    }

    MatterAdmin save(long matterId, long userId) {
        if (!matterAuthorisationService.hasAddMatterAdminAccess(matterId)) {
           throw new AccessDeniedException('Unable to add')
        }
        Matter matter = Matter.get(matterId)
        AppUser user = AppUser.get(userId)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (userRoleService.hasSysadminRole(user)) {
            throw new CannotAddSysAdminAsMatterAdmin()
        }

        if (user && !user.enabled) {
            throw new CannotAddInactiveUserException()
        }

        if(!userRoleService.hasSysadminRole(currentUser)){
            if (!user.organisation || user.organisation.id != matter.organisation.id||user.organisation.id!=currentUser.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }else {
            if (!user.organisation || user.organisation.id != matter.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }


        MatterAdmin matterAdmin = new MatterAdmin(matter: matter, user: user)
        matterAdmin.validate()

        if (!matterAdmin.hasErrors()) {
            matterAdmin.save(failOnError: true)
            matterEventService.publish(new AddedToMatterPayload(
                matterReference: matter.caseId, matterName: matter.name,
                affectedMemberId: user.id, affectedMemberUsername: user.username,
                affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname,
                adminStatusChanged: true
            ), springSecurityService.getCurrentUser() as AppUser, matter)
            return matterAdmin
        } else {
            throw new CannotAddInvalidMatterAdminException()
        }
    }

    @CompileDynamic
    def delete(long matterId, long matterAdminId) throws AccessDeniedException {
        if (!matterAuthorisationService.hasRemoveMatterAdminAccess(matterAdminId)) {
            throw new AccessDeniedException('Unable to add')
        }
        MatterAdmin matterAdmin = MatterAdmin.get(matterAdminId)
        List<MatterAdmin> matterAdmins = MatterAdmin.findAllByMatter(matterAdmin.matter)
        if (matterAdmin.matter.id != matterId) {
            throw new AccessDeniedException("No access to Matter.")
        }
        if (matterAdmins.size() == 1) {
            throw new CannotRemoveLastMatterAdminException()
        }
        matterEventService.publish(new RemovedFromMatterPayload(
            matterReference: matterAdmin.matter.caseId, matterName: matterAdmin.matter.name,
            affectedMemberId: matterAdmin.user.id, affectedMemberUsername: matterAdmin.user.username,
            affectedMemberFirstName: matterAdmin.user.firstname, affectedMemberLastName: matterAdmin.user.lastname,
            adminStatusChanged: true
        ), springSecurityService.getCurrentUser() as AppUser, matterAdmin.matter)
        matterAdmin.matter.removeFromMatterAdmins(matterAdmin)
        matterAdmin.delete(failOnError: true)
    }

    def removeUser(long matterId, long userId) throws AccessDeniedException {
        if (!matterAuthorisationService.hasUpdateAccess(matterId)) {
            throw new AccessDeniedException('Unable to add')
        }
        AppUser userToDelete = userService.getUserById(userId)
        Matter matter = matterService.getMatter(matterId)
        //if team member
        MatterTeamMember mtm = matterTeamMemberService.getMtm(matter,userToDelete)
        if(mtm){
            mtm.matter.removeFromTeamMembers(mtm)
            mtm.delete()
        }
        //if costs
        MatterCosts matterCosts = matterCostsService.getMatterCosts(matter,userToDelete)
        if(matterCosts){
            matterCosts.delete()
        }
        //if viewer
        MatterViewer matterViewer = matterViewerService.getMatterViewer(matter,userToDelete)
        if(matterViewer){
            matterViewer.delete()
        }
        //if admin
        MatterAdmin matterAdmin = getMatterAdmin(matter,userToDelete)
        if(matterAdmin){
            matterAdmin.delete()
        }
    }

    List<Matter> getAdministrableMatters() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser

        if (userRoleService.hasSysadminRole(currentUser)) {
            return getAllMatters()
        }

        return getMattersForMatterAdmin()
    }


    void notifyNewTeamMembers(Long matterId, List<Long> userIds, String message) {
        if (!matterAuthorisationService.hasAddMatterAdminAccess(matterId)) {
            throw new Exception()
        }
        userIds.each { Long id ->
            AppUser user = userService.getUserById(id)
            if (user) {
                if (matterService.isMatterEditor(matterId, id) || matterService.isMatterAdmin(matterId, id) || matterService.isViewerOnActiveMatter(matterId, id)) {
                    sendAddToMatterEmail(user, matterId, message)
                }
            }
        }
        if (message != '') {
            sendAddEmailToSelf(userIds, matterId, message)
        }
    }

    private void sendAddEmailToSelf(List<Long> userIds, Long matterId, String message) {
        String domain = configService.getProperty('domain')
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Matter matter = matterService.getMatter(matterId)
        if (domain == '${DOMAIN}') {
            return
        }

        String cleanedMessage = Jsoup.parse(message).text()
        String subject = "Message you sent on Juralio matter ${matter.name}"
        def template = assetResourceLocator.findAssetForURI('MessageYouSentOnMatter.html')
        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
        htmlBody = htmlBody.replaceAll('USER_LIST', generateUsersList(userIds))
        htmlBody = htmlBody.replaceAll('MATTER_NAME', matter.name ? matter.name : '')
        htmlBody = htmlBody.replaceAll('MATTER_LINK', "${domain}/#/matter/${matter.id}/overview")
        //need to clean the message twice to account for front end sanitisation issues
        htmlBody = htmlBody.replaceAll('CUSTOM_MESSAGE', Jsoup.parse(cleanedMessage).text())

        String body = htmlBody
        sesService.sendEmail(currentUser.username, subject, body)
    }

    private String generateUsersList(List<Long> userIds) {
        List<String> names = userIds.collect { Long id ->
            AppUser user = userService.getUserById(id)
            if (user.firstname || user.lastname) {
                return "${user.firstname} ${user.lastname}" as String
            } else {
                return user.username as String
            }
        }
        if (names.size() == 1) {
            return names[0]
        } else {
            return names[0..-2].join(', ') + ' and ' + names[-1]
        }

    }

    private void sendAddToMatterEmail(AppUser user, Long matterId, String message) {
        String domain = configService.getProperty('domain')
        Matter matter = matterService.getMatter(matterId)
        if (domain == '${DOMAIN}') {
            return
        }
        String subject = "You've been added to ${matter.name}"
        def template
        if (message != '') {
            template = assetResourceLocator.findAssetForURI('YouveBeenAddedWithMessage.html')
        } else {
            template = assetResourceLocator.findAssetForURI('YouveBeenAddedNoMessage.html')
        }
        String cleanedMessage = Jsoup.parse(message).text()

        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
        htmlBody = htmlBody.replaceAll('MATTER_NAME', matter.name ? matter.name : '')
        htmlBody = htmlBody.replaceAll('MATTER_NUMBER', matter.userDefinedReferenceNumber ? matter.userDefinedReferenceNumber : '')
        htmlBody = htmlBody.replaceAll('CLIENT_NAME', matter.clientName ? matter.clientName : '')
        htmlBody = htmlBody.replaceAll('MATTER_LINK', "${domain}/#/matter/${matter.id}/overview")
        htmlBody = htmlBody.replaceAll('USERNAME', getCurrentUsersName())
        htmlBody = htmlBody.replaceAll('CUSTOM_MESSAGE', Jsoup.parse(cleanedMessage).text())
        String body = htmlBody
        sesService.sendEmail(user.username, subject, body)

    }

    private String getCurrentUsersName() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return currentUser.firstname + ' ' + currentUser.lastname
    }

    private List<Matter> getAllMatters() {
        return matterDAOService.findAllMatters()
    }

    private List<Matter> getMattersForMatterCreator() {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        return matterDAOService.findMattersByMatterCreator(user)
    }

    private List<Matter> getMattersForMatterAdmin() {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        return matterDAOService.findMattersByMatterAdmin(user)
    }
}
