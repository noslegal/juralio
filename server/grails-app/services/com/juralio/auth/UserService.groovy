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

import asset.pipeline.grails.AssetResourceLocator
import com.juralio.AuditTrail
import com.juralio.auth.dao.UserDAOService
import com.juralio.auth.exception.*
import com.juralio.auth.password.*
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.aws.SESService
import com.juralio.common.DateUtilService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.emailwhitelist.EmailWhitelist
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.MatterAdmin
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAdminUserService
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.exception.UserNotInOrganisationException
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisationgroup.OrganisationGroupService
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import com.juralio.usernotification.UserNotificationService
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import grails.web.databinding.DataBindingUtils
import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.hibernate.Hibernate
import org.springframework.beans.factory.annotation.Autowired

import java.nio.charset.StandardCharsets

@Transactional
class UserService {

    protected final Log logger = LogFactory.getLog(getClass())

    private final long MINUTE_IN_MILLISECONDS = 60000
    UserAuthorisationService userAuthorisationService
    UserStatusEventService userStatusEventService
    UserDAOService userDAOService
    ConfigService configService
    SpringSecurityService springSecurityService
    DateUtilService dateUtilService
    RoleService roleService
    UserRoleService userRoleService
    PasswordValidatorService passwordValidatorService
    TemporaryPasswordService temporaryPasswordService
    OrganisationAdminUserService organisationAdminUserService
    UserAuthTokenService userAuthTokenService
    @Autowired
    SESService sesService
    MagicLinkService magicLinkService
    AssetResourceLocator assetResourceLocator
    MatterService matterService
    PasswordGeneratorService passwordGeneratorService
    InstanceSettingsService instanceSettingsService
    UserNotificationService userNotificationService
    Sql groovySql

    UserAutoAvatarService userAutoAvatarService
    OrganisationService organisationService
    OrganisationDAOService organisationDAOService
    OrganisationGroupService organisationGroupService
    OrganisationGroupDAOService organisationGroupDAOService
    UserSessionEventService userSessionEventService

    List<AppUser> getAllUsers() {
        return userDAOService.getAllUsers()
    }

    AppUser findByUsername(String username, Map options) {
        return userDAOService.findByUsername(username, options)
    }

    List<AppUser> findActiveUsersInOrg(Organisation org) {
        return userDAOService.findByOrganisationAndActive(org)
    }

    AppUser getUserById(long id) {
        AppUser user = userDAOService.getUser(id)

        if (!user) {
            throw new UserDoesNotExistException()
        }

        return user
    }

    boolean isUserExternal(ValidatedParameterMap validatedBody) {
        return validatedBody.containsKey('isExternal') && validatedBody.get('isExternal')
    }

    private AuditTrail getAuditTrail(Long id){
        return AuditTrail.class.get(id)
    }

    private List<AuditTrail> getAllAuditLogActionsForUser(AppUser user){
        List<AuditTrail> auditLogActions = []
        String query = """
            select * from audit_log where actor='${user.username}' order by id desc 
        """
        groovySql.eachRow(query) { row ->
            AuditTrail entry = getAuditTrail(row.id as Long)
            auditLogActions.push(entry)
        }
        return auditLogActions
    }

    def getActivityLog(AppUser user){
        List<UserSessionEvent> loginDetails = userSessionEventService.getAllLogins(user)
        List<AuditTrail> userActivity =  getAllAuditLogActionsForUser(user)
        List<Object> auditLogEntries = []
        loginDetails.each{UserSessionEvent use ->
            def entry = [:]
            entry.put('type','user_session_event')
            entry.put('time',use.time)
            entry.put('event_type',use.eventType)
            auditLogEntries.push(entry)
        }
        userActivity.findAll{AuditTrail at -> at.newValue || at.oldValue}.each{AuditTrail at ->
            def entry = [:]
            entry.put('type','audit_log_event')
            entry.put('time',at.dateCreated)
            entry.put('oldValue',at.oldValue)
            entry.put('newValue',at.newValue)
            entry.put('propertyName',at.propertyName)
            entry.put('eventName',at.eventName)
            entry.put('className',at.className)
            entry.put('persistedObjectId',at.persistedObjectId)
            auditLogEntries.push(entry)
        }
        return auditLogEntries
    }

    String[] autoUpdateOrganisationAuthorities(String[] authorities, Long orgId, AppUser user) throws MaxNumberOfOrganisationOwnersReached {
        String[] newAuthorities = authorities
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        boolean isOrgOwner = userRoleService.hasOrgOwnerRole(currentUser)

        if (orgId) {
            Organisation org = organisationDAOService.getOrganisation(orgId)
            List<AppUser> owners = org.users.findAll { userRoleService.hasOrgOwnerRole(it) } as List<AppUser>
//            if ((org.users.size() == 0 || (org.users.size() ==1 && org.users[0] == user)) && !newAuthorities.contains(Roles.ORG_OWNER.code())) {
            if (owners.size() == 0 && !newAuthorities.contains(Roles.ORG_OWNER.code())) {
                //add user as org owner
                if(isSysadmin || isOrgOwner) {
                    String[] _newAuthorities = new String[newAuthorities.size() + 1]
                    for (int i = 0; i < newAuthorities.size(); i++) {
                        _newAuthorities[i] = newAuthorities[i]
                    }
                    _newAuthorities[newAuthorities.size()] = Roles.ORG_OWNER.code()
                    newAuthorities = _newAuthorities
                }
            }
            if (!userRoleService.hasOrgOwnerRole(user) && newAuthorities.contains(Roles.ORG_OWNER.code()) && owners.size() >= 3) {
                throw new MaxNumberOfOrganisationOwnersReached()
            }
            if (newAuthorities.contains(Roles.ORG_OWNER.code()) && !newAuthorities.contains(Roles.ORG_ADMIN.code())) {
                String[] _newAuthorities = new String[newAuthorities.size() + 1]
                for (int i = 0; i < newAuthorities.size(); i++) {
                    _newAuthorities[i] = newAuthorities[i]
                }
                _newAuthorities[newAuthorities.size()] = Roles.ORG_ADMIN.code()
                newAuthorities = _newAuthorities
            }

        }

        return newAuthorities
    }

    AppUser updateAppUserRolesWhenAddingToAnOrganisation(AppUser user, Organisation org) throws MaxNumberOfOrganisationOwnersReached {
        String[] authorities = user.getAuthorities().collect(it -> it.authority) as String[]
        String[] newAuthorities = autoUpdateOrganisationAuthorities(authorities, org.id as Long, user)
        assignRolesToUser(newAuthorities, user)
        AppUser updatedUser = getUserById(user.id)
        return updatedUser
    }

    AppUser createUserWithRoles(ValidatedParameterMap userProperties, String[] authorities) throws RoleNotProvidedException, InvalidRoleRequestException, MaxNumberOfOrganisationOwnersReached {
        if(!userAuthorisationService.hasCreateUserAccess()){
            throw new Exception()
        }
        AppUser newUser
        AppUser currentUser = springSecurityService.getCurrentUser()

        if (!authorities) {
            throw new RoleNotProvidedException()
        }else if(authorities.contains(Roles.SYSADMIN.code() && !userRoleService.hasSysadminRole(currentUser) )){
            throw new InvalidRoleRequestException()
        } else {
            newUser = getUserInstance(userProperties)
            if(userProperties.group){
                OrganisationGroup group = organisationGroupService.getGroup(userProperties.group as long)
                if (!group) {
                    throw new Exception('Group does not belong to the target organisation')
                }
                // The user joins currentUser's org (non-sysadmin) or the requested org (sysadmin).
                // When a target org is specified the chosen group must belong to it; when it is not
                // (sysadmin creating a user by group alone) the group's own org is authoritative.
                Long targetOrgId = userRoleService.hasSysadminRole(currentUser) ? (userProperties.organisation?.id as Long) : currentUser.organisation?.id
                if (targetOrgId != null && group.organisation.id != targetOrgId) {
                    throw new Exception('Group does not belong to the target organisation')
                }
                newUser.organisationGroup = group
            }
            newUser.temporaryPassword = temporaryPasswordService.getTemporaryPassword(newUser)


            userAutoAvatarService.assignAvatar(newUser)

            if (newUser.validate()) {
                InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
                if (instanceSettings.enableUserConfirmation) {
                    newUser = setUserStatus(newUser)
                }
                newUser.save(flush: true)
                if (userProperties.containsKey('organisation')) {
                    //is sysadmin adding a user
                    authorities = autoUpdateOrganisationAuthorities(authorities, userProperties.organisation.id as Long, newUser)
                }

                if (newUser.isThirdPartyUser) {
                    newUser.password = "thirdPartyUser"
                    newUser.passwordExpired = false
                }
                if(authorities.contains(Roles.SYSADMIN.code())){
                    newUser.mfaEnabled=true
                }

                if (!userRoleService.hasSysadminRole(currentUser)) {
                    newUser = organisationAdminUserService.addUserToOrganisation(currentUser.organisation, newUser)
                } else if (userProperties.containsKey('organisation')) {
                    newUser = organisationAdminUserService.addUserToOrganisation(userProperties.organisation.id, newUser,true)
                }

                if (newUser.enabled) {
                    userStatusEventService.recordActivation(newUser.id)
                } else {
                    userStatusEventService.recordDeactivation(newUser.id)
                }

                assignRolesToUser(authorities, newUser)
            }
        }
        emailNewUserWelcome(newUser)

        matterService.createPersonalMatter(newUser)

        newUser
    }

    AppUser setUserStatus(AppUser newUser) {
        if (EmailWhitelist.findByWhitelisted_email(newUser.username)) {
            newUser.confirmationStatus = UserConfirmedStatus.WHITELISTED.value()
        } else if (newUser.confirmationStatus != UserConfirmedStatus.WHITELISTED.value()) {
            newUser.trialStartDate = new Date()
            newUser.confirmationStatus = UserConfirmedStatus.TRIALING.value()
        }
        return newUser
    }

    void changePassword(UserPasswordChangeRequest changeRequest, Boolean selfService = false) throws UserPasswordChangeException, ValidationException {
        AppUser currentUser
        if (selfService) {
            currentUser = springSecurityService.getCurrentUser() as AppUser
            if (currentUser.username != changeRequest.username) {
                throw new UserPasswordChangeException('You can only update your own password')
            }
        } else {
            currentUser = userDAOService.findByUsername(changeRequest.username, [lock: true])
        }

        if (!currentUser) {
            throw new UserDoesNotExistException()
        }

        if (currentUser.accountLocked) {
            throw new UserLockedException()
        }
        if (currentUser.oneTimePasswordReset == null && !selfService && !currentUser.isPasswordExpired()) {
            throw new UserPasswordChangeException('User not in expired password state')
        }
        if (currentUser.oneTimePasswordReset != null) {
            if (!passwordValidatorService.isNewPasswordSameAsCurrentPassword(currentUser.oneTimePasswordReset, changeRequest.oldPassword)) {
                throw new OldPasswordNotValidException()
            }
        } else if (!changeRequest.oldPassword || !passwordValidatorService.isNewPasswordSameAsCurrentPassword(currentUser.getPersistentValue('password'), changeRequest.oldPassword)) {
            throw new OldPasswordNotValidException()
        }

        logger.debug("Changing password for $currentUser.username")

        if ((!changeRequest.newPassword || !changeRequest.newPasswordRepeat) || (changeRequest.newPassword != changeRequest.newPasswordRepeat)) {
            throw new NewPasswordsDoNotMatchException()
        }

        boolean valid = passwordValidatorService.validate(currentUser.password, changeRequest.newPassword)

        if (valid) {
            currentUser.setPassword(changeRequest.newPassword)
            currentUser.passwordExpired = false
            userDAOService.save(currentUser)
            userAuthTokenService.invalidateAllSessions(currentUser)
        }
    }

    void handleFailedLogin(String username) {
        logger.debug("Attempting to log failed login attempt for user $username")
        AppUser user = findByUsername(username, [lock: true])

        if (user) {
            handleFailedAuthentication(user)
            logger.debug("User $username now has $user.failedLoginAttempts failed login attempts")
        } else {
            logger.debug("User $username does not exist. Cannot log failed login attempt")
        }
    }

    void handleFailedAuthentication(AppUser user) {
        user.failedLoginAttempts++

        Integer maxFailedAttempts = configService.maxLoginAttempts
        if (user.failedLoginAttempts >= maxFailedAttempts) {
            user.accountLocked = true
            user.accountLockedTime = dateUtilService.getCurrentDateTime()
            logger.debug("User $user.username has been locked")
        }

        userDAOService.save(user)
    }

    void resetLoginAttempts(String username) {
        AppUser user = findByUsername(username, [lock: true])
        if (user) {
            user.failedLoginAttempts = 0
            logger.debug("Reset failedLoginAttempts for $username.")
            userDAOService.save(user)
        }
    }

    void unlockIfNecessary(String username) {
        AppUser user = findByUsername(username, [lock: true])

        if (user && user.accountLocked) {
            Long current = dateUtilService.getCurrentDateTime().getTime()
            Long accountLockDuration = configService.lockDurationMinutes * MINUTE_IN_MILLISECONDS
            if (user.accountLockedTime && (current - user.accountLockedTime.getTime()) > accountLockDuration) {
                user.accountLocked = false
                user.failedLoginAttempts = 0
                user.accountLockedTime = null
                userDAOService.save(user)
                logger.debug("Unlocked $username.")
            }
        }
    }

    void magicLinkUnlockUser(String username) {
        AppUser user = findByUsername(username, [lock: true])

        if (user && user.accountLocked) {
            user.accountLocked = false
            user.failedLoginAttempts = 0
            user.accountLockedTime = null
            userDAOService.save(user)
            logger.debug("Unlocked $username.")

        }
    }

    private void informOwnerOfOwnerRoleRemoval(AppUser user) {
        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String orgName = user.organisation.name
        String userWhoRemoved = currentUser.username
        if (currentUser.firstname && currentUser.lastname) {
            userWhoRemoved = "${currentUser.firstname} ${currentUser.lastname}"
        }
        String htmlBody
        def template = assetResourceLocator.findAssetForURI('OwnerRemoved.html')
        htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
        htmlBody = htmlBody.replaceAll('ORG_NAME', orgName)
        htmlBody = htmlBody.replaceAll('USER_WHO_REMOVED', userWhoRemoved)

        String body = htmlBody
        String subject = 'You have been removed as an organisation owner'

        sesService.sendEmail(user.username, subject, body)
    }

    AppUser update(long userId, ValidatedParameterMap properties) throws InvalidRoleRequestException, ExternalUserRolesNotForced, OnlyOrganisationOwner, OrganisationOwnerMustBeAdmin, MaxNumberOfOrganisationOwnersReached, ActivateLapsedUserException {
        if(!userAuthorisationService.hasMutateUserAccess(userId)){
            throw new Exception()
        }
        AppUser user = getUserById(userId)
        def originalThirdPartyProvider = user.properties.get('thirdPartyProvider')
        def originalProperties = user.properties
        if (user.externalUser != null && properties.isExternal != false) {
            Boolean force = properties.forceUpdate
            if (!force && properties.roles && properties.roles.contains(Roles.MATTER_CREATOR.code())) {
                throw new InvalidRoleRequestException()
            }
            if (!force && properties.roles && properties.roles.contains(Roles.ORG_OWNER.code())) {
                throw new InvalidRoleRequestException()
            }
            if (!force && properties.roles && properties.roles.contains(Roles.TEMPLATE_PROVIDER.code())) {
                throw new InvalidRoleRequestException()
            }
            if (!force && properties.roles && properties.roles.contains(Roles.ORG_ADMIN.code())) {
                throw new InvalidRoleRequestException()
            }
            if (!force && properties.roles && properties.roles.contains(Roles.KNOWLEDGE_MANAGER.code())) {
                throw new InvalidRoleRequestException()
            }
            if (force && properties.roles && properties.roles.contains(Roles.KNOWLEDGE_MANAGER.code())) {
                user.setExternalUser(null)
            }
            if (force && properties.roles && properties.roles.contains(Roles.ORG_ADMIN.code())) {
                user.setExternalUser(null)
            }
            if (force && properties.roles && properties.roles.contains(Roles.ORG_OWNER.code())) {
                user.setExternalUser(null)
            }
            if (force && properties.roles && properties.roles.contains(Roles.TEMPLATE_PROVIDER.code())) {
                user.setExternalUser(null)
            }
            if (force && properties.roles && properties.roles.contains(Roles.MATTER_CREATOR.code())) {
                user.setExternalUser(null)
            }

        }

        if(properties.group && (user.organisationGroupId != (properties.group.id as long))){
            OrganisationGroup group = organisationGroupService.getGroup(properties.group.id as long)
            if (!group || group.organisation.id != user.organisation?.id) {
                throw new Exception('Group does not belong to the user\'s organisation')
            }
            user.organisationGroup = group
        }

        // Safety net: an organisation member must always belong to a group.
        if (user.organisation && !user.organisationGroup) {
            user.organisationGroup = organisationGroupDAOService.getInternalGroupForOrg(user.organisation)
        }

        if (properties.get('isExternal') == true) {
            Set<String> roles = user.getAuthorities().collect(it -> Hibernate.unproxy(it).authority) as Set<String>
            List<MatterAdmin> matterAdminList = MatterAdmin.findAllByUser(user)
            if (roles.contains(Roles.ORG_OWNER.code())) {
                Organisation userOrg = organisationDAOService.getOrganisation(user.organisationId)
                List<AppUser> orgOwners = userOrg.users.findAll { AppUser it -> userRoleService.hasOrgOwnerRole(it) } as List<AppUser>
                if (orgOwners.size() < 2) {
                    throw new OnlyOrganisationOwner()
                }
            }

            if (roles.contains(Roles.MATTER_CREATOR.code()) || roles.contains(Roles.ORG_ADMIN.code()) || roles.contains(Roles.ORG_OWNER.code()) || roles.contains(Roles.KNOWLEDGE_MANAGER.code()) || roles.contains(Roles.TEMPLATE_PROVIDER.code()) || matterAdminList.size() > 0) {
                Boolean force = properties.forceUpdate
                if (!force) {
                    throw new ExternalUserRolesNotForced()
                } else {
                    properties.roles = [Roles.USER.code()]
                    //remove form matter admin
                    matterAdminList.each { MatterAdmin ma -> ma.delete() }

                    user.setExternalUser(new ExternalUser().save())
                }
            }
        }

        if (isInternalBeingSetToExternal(user, properties)) {
            properties.roles = [Roles.USER.code()]
            user.setExternalUser(new ExternalUser().save())
        } else if (isExternalBeingSetToInternal(user, properties)) {
            user.externalUser.delete()
            user.externalUser = null
            //internal users must be part of internal group so need to update if not
            OrganisationGroup newGroup = organisationGroupDAOService.getInternalGroupForOrg(user.organisation)
            user.organisationGroup = newGroup

        }


        if (properties.roles) {
            String[] roles = properties.roles as String[]
            Boolean isOrgOwner = userRoleService.hasOrgOwnerRole(user)
            List<AppUser> orgOwners = []
            if (user.organisation) {
                orgOwners = user.organisation.users.findAll { AppUser u -> userRoleService.hasOrgOwnerRole(u) } as List<AppUser>
            }
            if (isOrgOwner && !roles.contains(Roles.ORG_OWNER.code())) {
                if (orgOwners.size() < 2) {
                    throw new OnlyOrganisationOwner()
                }

            }
            if (isOrgOwner && !roles.contains(Roles.ORG_ADMIN.code()) && roles.contains(Roles.ORG_OWNER.code())) {
                //org owner must be org admin
                throw new OrganisationOwnerMustBeAdmin()
            }
            if (!isOrgOwner && roles.contains(Roles.ORG_OWNER.code())) {
                if (orgOwners.size() >= 3) {
                    throw new MaxNumberOfOrganisationOwnersReached()
                }
            }
            String[] newRoles = autoUpdateOrganisationAuthorities(roles, user.organisationId, user)
            assignRolesToUser(newRoles, user)
            if (isOrgOwner && !newRoles.contains(Roles.ORG_OWNER.code())) {
                //send email to user informing them they are no longer an owner
                informOwnerOfOwnerRoleRemoval(user)
            }
            properties.remove('roles')
        }
        user.properties = properties

        if (properties.get('enabled') == false) {
            if (userRoleService.hasOrgOwnerRole(user)) {
                List<AppUser> orgOwners = user.organisation.users.findAll { AppUser u -> userRoleService.hasOrgOwnerRole(u) } as List<AppUser>
                if (orgOwners.size() < 2) {
                    throw new OnlyOrganisationOwner()
                }
            }
            user.avatarImageIndex = -1
            user.avatarColorIndex = -1
        } else if (properties.get('enabled') == true) {
            Boolean force = properties.forceUpdate
            InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
            Boolean isSysadmin = userRoleService.hasSysadminRole(user)
            if (!isSysadmin && instanceSettings.enableUserConfirmation && !force && user.confirmationStatus == UserConfirmedStatus.LAPSED.value()){
                throw new ActivateLapsedUserException()
            }else if(!isSysadmin && instanceSettings.enableUserConfirmation && !force && user.confirmationStatus == UserConfirmedStatus.CONFIRMED.value()){
                int confirmedActiveUsers = organisationService.organisationDAOService.getActiveUsersFromOrg(user.organisation).findAll{ AppUser userInOrg -> userInOrg.getConfirmationStatus() == UserConfirmedStatus.CONFIRMED.value() }.size() as int
                if(user.organisation.confirmedUserCount < confirmedActiveUsers +1){
                    //making confirmed user active causes the number of active users to be greater than umber of seats so we need to update seat count
                    ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(['updateConfirmedCount': user.organisation.confirmedUserCount += 1], [], ['updateConfirmedCount'])
                    organisationService.update(user.organisationId, validatedParameters)
                }
            }
            userAutoAvatarService.assignAvatar(user)
        }

        if (user.isDirty('mfaEnabled')) {
            user.mfaRegistered = false
            user.mfaKey = null
        }


        if (properties.get('isThirdPartyUser') == true && properties.get('thirdPartyProvider') == 'okta' && originalThirdPartyProvider != 'okta') {
            //we've converted the user to a okta user, don't expire their non-existent password
            user.passwordExpired = false
            userAuthTokenService.invalidateAllSessions(user)
        }

        if (properties.get('isThirdPartyUser') == true && properties.get('thirdPartyProvider') == 'microsoft' && originalThirdPartyProvider != 'microsoft') {
            //we've converted the user to a ms user, don't expire their non-existent password
            user.passwordExpired = false
            userAuthTokenService.invalidateAllSessions(user)
        }

        if (properties.get('isThirdPartyUser') == true && properties.get('thirdPartyProvider') == 'google' && originalThirdPartyProvider != 'google') {
            //we've converted the user to a google user, don't expire their non-existent password
            user.passwordExpired = false
            userAuthTokenService.invalidateAllSessions(user)
        }

        if (properties.get('thirdPartyUserId') == null && originalProperties.get('thirdPartyUserId') != null && properties.get('isThirdPartyUser') == false) {
            //tidy up the user object when we convert back to a juralio user
            user.thirdPartyUserId = null
            userAuthTokenService.invalidateAllSessions(user)
        }

        if (user.isDirty('enabled') &&
                user.getProperty('enabled') != user.getPersistentValue('enabled')) {

            if (user.getProperty('enabled')) {
                userStatusEventService.recordActivation(user.id)
                userStatusEventService.recordReactivation(user.id)
            } else {
                userStatusEventService.recordDeactivation(user.id)
            }
        }

        if (user.isDirty('confirmationStatus')) {
            if (user.getProperty('confirmationStatus') == UserConfirmedStatus.CONFIRMED.value()) {
                userStatusEventService.recordConfirmed(user.id)
            } else if (user.getProperty('confirmationStatus') == UserConfirmedStatus.LAPSED.value()) {
                userStatusEventService.recordLapsed(user.id)
            }
        }

        userDAOService.save(user)
    }

    TemporaryPassword assignTemporaryPasswordToExistingUser(long userId, String context) {
        if(!userAuthorisationService.hasMutateUserAccess(userId)){
            throw new Exception()
        }
        AppUser user = getUserById(userId)
        TemporaryPassword temporaryPassword = temporaryPasswordService.getTemporaryPassword(user)
        temporaryPasswordService.sendPasswordResetEmail(user, temporaryPassword, context)
        return temporaryPassword
    }

    private void assignRolesToUser(String[] roles, AppUser targetUser) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Set<String> requestedAuthorities = roles.findAll { role -> role != 'FROZEN_ORG_USER' }
        requestedAuthorities.add(Roles.USER.code()) // always assume ROLE_USER, everyone should always have it
        Set<Roles> allowedRoles = [Roles.USER, Roles.ORG_ADMIN, Roles.MATTER_CREATOR, Roles.KNOWLEDGE_MANAGER, Roles.NEUTRAL_MATTER_CREATOR,Roles.TEMPLATE_PROVIDER]
        if (currentUser && (userRoleService.hasSysadminRole(currentUser))){
            allowedRoles.add(Roles.SYSADMIN)
        }
        if (currentUser && (userRoleService.hasSysadminRole(currentUser) || userRoleService.hasOrgOwnerRole(currentUser))) {
            allowedRoles.add(Roles.ORG_OWNER)
        }
        if (currentUser && (userRoleService.hasSysadminRole(currentUser) )) {
            allowedRoles.add(Roles.TEMPLATE_PROVIDER)
        }
        if (targetUser && (userRoleService.hasSysadminRole(targetUser) )) {
            allowedRoles.add(Roles.SYSADMIN)
            allowedRoles.add(Roles.SYSTEM_TEMPLATE_MANAGER)
        }
        Set<String> allowedAuthorities = allowedRoles*.code()
        def forbiddenAuthorities = requestedAuthorities.minus(allowedAuthorities)

        if (forbiddenAuthorities) {
            throw new InvalidRoleRequestException()
        } else {
            def existingRoles = targetUser.getAuthorities()
            Set<Role> requestedRoles = requestedAuthorities.collect { roleService.getRoleByAuthority(it) }
            def newRoles = requestedRoles.minus(existingRoles)
            def oldRoles = existingRoles.minus(requestedRoles)
            def orgAdminRole = roleService.getRoleByAuthority(Roles.ORG_ADMIN.code())

            for (def newRole : newRoles) {
                userRoleService.assignRoleToUser(targetUser, newRole)
            }

            for (def oldRole : oldRoles) {
                if (currentUser == targetUser && oldRole == orgAdminRole) {
                    // Cannot remove org admin role from self
                    throw new InvalidRoleRequestException()
                } else {
                    userRoleService.removeRoleFromUser(targetUser, oldRole)
                }
            }
        }
    }

    private AppUser getUserInstance(ValidatedParameterMap userProperties) {
        AppUser newUser = new AppUser()
        if (userProperties.getProperty("isThirdPartyUser")) {
            DataBindingUtils.bindObjectToInstance(newUser, userProperties, ['firstname', 'lastname', 'enabled', 'isThirdPartyUser'], [], null)
            newUser.thirdPartyProvider = userProperties['thirdPartyProvider']
        } else {
            DataBindingUtils.bindObjectToInstance(newUser, userProperties, ['firstname', 'lastname', 'enabled'], [], null)
        }
        newUser.setUsername userProperties.username.toLowerCase()
        if (isUserExternal(userProperties)) {
            newUser.setExternalUser(new ExternalUser().save())
        }
        newUser
    }

    private boolean isInternalBeingSetToExternal(AppUser user, ValidatedParameterMap properties) {
        return user.externalUser == null && isUserExternal(properties)
    }

    private boolean isExternalBeingSetToInternal(AppUser user, ValidatedParameterMap properties) {
        return user.externalUser != null && !isUserExternal(properties) && properties.enabled !=false
    }

    void forgotPasswordReset(AppUser user) {
        //we set the one time password as this is a self service and don't actually want to lock the user out with their old password yet
        TemporaryPassword temporaryPassword = passwordGeneratorService.generatePassword()
        user.oneTimePasswordReset = temporaryPassword.password
        user.save()
        temporaryPasswordService.sendForgotPasswordEmail(user, temporaryPassword, 'selfServiceReset')
    }

    void emailNewSSOUserWelcome(AppUser user){
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String username
        if (currentUser.firstname != null && currentUser.lastname != null) {
            username = currentUser.firstname + ' ' + currentUser.lastname
        } else {
            username = currentUser.username
        }

        String subject = username + " has invited you to Juralio"
        if (currentUser.username == 'sysadmin@juralio.com') {
            subject = 'Welcome to Juralio! Your account awaits.'
        }

        String domain = configService.getProperty('domain')

        if (domain == '${DOMAIN}') {
            return
        }
        String ssoMethod = user.thirdPartyProvider.substring(0,1).toUpperCase() + user.thirdPartyProvider.substring(1)

        if (ssoMethod = 'Microsoft') {
            URL base = new URL(domain)
            domain = new URL(base, 'mslogin').toString()
        }

        def template
        String htmlBody

        if (user.organisation != null) {
            if (ssoMethod = 'Microsoft') {
                template = assetResourceLocator?.findAssetForURI('WelcomeToJuralioMicrosoftSSO.html')
            } else {
                template = assetResourceLocator?.findAssetForURI('WelcomeToJuralioSSO.html')
            }

            htmlBody = new String(template?.getInputStream()?.bytes, StandardCharsets.UTF_8)
            htmlBody = htmlBody.replaceAll('PERSON_NAME', user.username)
            htmlBody = htmlBody.replaceAll('ORG_NAME_HERE', user.organisation.name)
            htmlBody = htmlBody.replaceAll('LOGIN_LINK', domain)
            htmlBody = htmlBody.replaceAll('SSO_METHOD', ssoMethod)
            String body = htmlBody
            sesService.sendEmail(user.username, subject, body)
        }


    }

    void emailNewUserWelcome(AppUser user) {
        if(user.isThirdPartyUser){
            emailNewSSOUserWelcome(user)
        } else {
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            String username
            if (currentUser.firstname != null && currentUser.lastname != null) {
                username = currentUser.firstname + ' ' + currentUser.lastname
            } else {
                username = currentUser.username
            }
            String username_2 = currentUser.username

            String subject = username + " has invited you to Juralio"
            if (currentUser.username == 'sysadmin@juralio.com') {
                subject = 'Welcome to Juralio! Your account awaits.'
                username = 'A system administrator'
                username_2 = 'a system administrator'
            }

            String domain = configService.getProperty('domain')

            if (domain == '${DOMAIN}') {
                return
            }
            String magicLink = domain + '/#/login?magic_link=' + magicLinkService.generateMagicLinkData(user.username, user.temporaryPassword.password, 'newUser')


            def template
            String htmlBody

            if (user.organisation == null) {
                template = assetResourceLocator.findAssetForURI('WelcomeToJuralioNoOrg.html')
                htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
                htmlBody = htmlBody.replaceAll('PERSON_NAME', username)
                htmlBody = htmlBody.replaceAll('PERSON_USERNAME', username_2)
                htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)
            } else {
                template = assetResourceLocator?.findAssetForURI('WelcomeToJuralio.html')
                htmlBody = new String(template?.getInputStream()?.bytes, StandardCharsets.UTF_8)
                htmlBody = htmlBody.replaceAll('PERSON_NAME', username)
                htmlBody = htmlBody.replaceAll('ORG_NAME_HERE', user.organisation.name)
                htmlBody = htmlBody.replaceAll('PERSON_USERNAME', username_2)
                htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)
            }

            String body = htmlBody
            sesService.sendEmail(user.username, subject, body)
        }
    }

    private String getAuthMethod(AppUser user) {
        if (!user.isThirdPartyUser) {
            return 'a password'
        } else {
            switch (user.thirdPartyProvider) {
                case 'microsoft':
                    return 'Microsoft single sign-on'
                case 'okta':
                    return 'Okta single sign-on'
                case 'saml':
                    return 'SAML single sign-on'
                case 'google':
                    return 'Google single sign-on'
                default:
                    return 'a password'
            }
        }
    }

    void emailAuthChange(AppUser user, Boolean isPasswordReset) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String username
        if (currentUser.firstname != null && currentUser.lastname != null) {
            username = currentUser.firstname + ' ' + currentUser.lastname
        } else {
            username = currentUser.username
        }
        String username_2 = currentUser.username

        String subject = username + " has changed how you sign in to Juralio"
        if (currentUser.username == 'sysadmin@juralio.com') {
            subject = 'The way you sign into Juralio has changed'
            username = 'A system administrator'
            username_2 = 'a system administrator'
        }

        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }

        def template = assetResourceLocator.findAssetForURI('AuthChange.html')
        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)

        String magicLink = domain + '/#/login'
        if (isPasswordReset) {
            magicLink = domain + '/#/login?magic_link=' + magicLinkService.generateMagicLinkData(user.username, user.temporaryPassword.password, isPasswordReset ? 'passwordReset' : 'newUser')
            htmlBody = htmlBody.replaceAll('confirm', 'set your password')

        }

        htmlBody = htmlBody.replaceAll('PERSON_NAME', username)
        htmlBody = htmlBody.replaceAll('PERSON_USERNAME', username_2)
        htmlBody = htmlBody.replaceAll('ORG_NAME_HERE', user.organisation.name)
        htmlBody = htmlBody.replaceAll('AUTH_METHOD', getAuthMethod(user))
        htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)
        String body = htmlBody
        sesService.sendEmail(user.username, subject, body)

    }

    void emailUsernameChange(AppUser user, String oldEmail, String newEmail, Boolean hasChangedOwnEmail) {
        AppUser currentUser
        if (hasChangedOwnEmail) {
            currentUser = user
        } else {
            currentUser = springSecurityService.getCurrentUser() as AppUser
        }

        String username
        if (currentUser.firstname != null && currentUser.lastname != null) {
            username = currentUser.firstname + ' ' + currentUser.lastname
        } else {
            username = currentUser.username
        }
        String username_2 = currentUser.username

        String subject

        if (hasChangedOwnEmail && user.username != 'sysadmin@juralio.com') {
            subject = "You have changed your Juralio account email address"
        } else {
            subject = username + " has changed your Juralio account email address"
        }

        if (!hasChangedOwnEmail && currentUser.username == 'sysadmin@juralio.com') {
            subject = 'A system administrator has changed your Juralio account email address'
            username = 'A system administrator'
            username_2 = 'a system administrator'
        }

        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }

        def template = assetResourceLocator.findAssetForURI('EmailChange.html')
        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)

        String magicLink = domain + '/#/login'

        if (hasChangedOwnEmail) {
            htmlBody = htmlBody.replaceAll('PERSON_NAME', 'You')
            htmlBody = htmlBody.replaceAll('HAS_HAVE', 'have')
            htmlBody = htmlBody.replaceAll('USER_USERNAME', oldEmail)
            htmlBody = htmlBody.replaceAll('CONTACT_PERSON', 'your administrator')
        } else {
            htmlBody = htmlBody.replaceAll('PERSON_NAME', username)
            htmlBody = htmlBody.replaceAll('HAS_HAVE', 'has')
            htmlBody = htmlBody.replaceAll('USER_USERNAME', username_2)
            htmlBody = htmlBody.replaceAll('CONTACT_PERSON', 'them')
        }
        htmlBody = htmlBody.replaceAll('ORGANISATION_NAME', user.organisation.name)
        htmlBody = htmlBody.replaceAll('OLD_EMAIL', oldEmail)
        htmlBody = htmlBody.replaceAll('NEW_EMAIL', newEmail)
        htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)
        String body = htmlBody

        sesService.sendEmail(oldEmail, subject, body)
        sesService.sendEmail(user.username, subject, body)
    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def deleteUser(long user_id) {
        AppUser delUser = getUserById(user_id)
        AppUser currentUser = springSecurityService.getCurrentUser()

        if (hasUserLoggedInBefore(delUser)) {
            throw new UserException('User has previously logged in')
        }

        if (userRoleService.hasSysadminRole(delUser)) {
            throw new UserException('Cannot delete sys admin')
        }

        if (!userRoleService.hasSysadminRole(currentUser) && delUser.organisationId && currentUser.organisationId != delUser.organisationId) {
            throw new UserNotInOrganisationException()
        }

        if (delUser.organisationId) {
            organisationAdminUserService.removeUserForDeletionFromOrganisation(delUser)
        }
        userNotificationService.deleteAllForUser(delUser)

        delUser.delete()
    }

    boolean hasUserLoggedInBefore(AppUser user) {
        return userSessionEventService.getLatestLogin(user) != null
    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    AppUser getConfirmationDates(AppUser user){
        AppUser u = user
        UserStatusEvent date
        if(user.confirmationStatus == 'confirmed'){
            date = UserStatusEvent.findByUserAndEventType( u, "CONFIRMED",[sort: 'time', order: 'asc'])
            if(date){
                user.confirmationDate = date.time
            }
        } else if (user.confirmationStatus == 'lapsed'){
            date = UserStatusEvent.findByUserAndEventType( u, "LAPSED",[sort: 'time', order: 'asc'])
            if(date){
                user.lapsedDate = date.time
            }
        }
        return user
    }
}
