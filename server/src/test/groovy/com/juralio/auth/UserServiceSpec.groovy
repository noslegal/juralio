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

import com.juralio.auth.exception.UserPasswordChangeException
import com.juralio.auth.password.TemporaryPassword
import com.juralio.auth.password.TemporaryPasswordService
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.aws.SESService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAdminUserService
import grails.plugin.springsecurity.SpringSecurityService
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import org.grails.spring.beans.factory.InstanceFactoryBean
import com.juralio.config.ConfigService
import com.juralio.auth.dao.UserDAOService
import com.juralio.auth.exception.NewPasswordsDoNotMatchException
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.auth.password.UserPasswordChangeRequest
import com.juralio.common.DateUtilService
import spock.lang.Specification

class UserServiceSpec extends Specification implements ServiceUnitTest<UserService>, DataTest {

    void setup() {
        SESService sesServiceMock = Mock()
        defineBeans {
            sesService(InstanceFactoryBean, sesServiceMock, SESService)
        }
        service.userDAOService = Mock(UserDAOService)
        service.userAuthorisationService = Mock(UserAuthorisationService) {
            hasCreateUserAccess() >> true
        }
        service.instanceSettingsService = Mock(InstanceSettingsService) {
            getInstanceSettings() >> new InstanceSettings(enableUserConfirmation: false)
        }
        service.matterService = Mock(MatterService)
        service.configService = Mock(ConfigService) {
            getProperty('domain') >> '${DOMAIN}'
        }
        service.dateUtilService = Mock(DateUtilService)
        service.passwordValidatorService = Mock(PasswordValidatorService)
        service.temporaryPasswordService = Mock(TemporaryPasswordService)
        service.springSecurityService = Mock(SpringSecurityService)
        service.userAuthTokenService = Mock(UserAuthTokenService)
        service.userRoleService = new UserRoleService()
        service.roleService = Mock(RoleService)
        service.userStatusEventService = Mock(UserStatusEventService)
        service.organisationAdminUserService = Mock(OrganisationAdminUserService)
        service.userAutoAvatarService = Mock(UserAutoAvatarService)
        mockDomain(Role)
        mockDomain(AppUser)
        mockDomain(UserRole)
    }

    void "findByUsername"() {
        String mockUsername = "mock"
        Map mockOptions = [mockOption: "mock_value"]
        AppUser mockUser = Mock(AppUser)
        AppUser result

        when: "method is called"
        result = service.findByUsername(mockUsername, mockOptions)

        then: "should call findByUsername on DAO service with given name and options"
        1 * service.userDAOService.findByUsername(mockUsername, mockOptions) >> mockUser

        and: "should return the response from the dao method"
        result == mockUser
    }

    void "createUserWithRoles() - when called with a valid user object2"() {
        final def NEW_USER_NAME = "mock_new_username@test.com"
        Object newUser
        Role userRole
        TemporaryPassword mockTemporaryPassword
        AppUser serviceReturnValue
        AppUser mockUser = new AppUser()
        Organisation mockOrg = new Organisation()
        mockUser.organisation = mockOrg

        setup: "create new un-saved valid User object and bootstrap default role"
        userRole = bootStrapUserRole()
        newUser = createUserObject(NEW_USER_NAME)
        mockTemporaryPassword = new TemporaryPassword('mock_password')

        when: "the createUserWithRoles is called"
        serviceReturnValue = service.createUserWithRoles(newUser, [userRole.authority] as String[])

        then: "should call springSecurityService.getCurrentUser() and return current user"
        2 * service.springSecurityService.getCurrentUser() >> mockUser

        and: "should call temporaryPasswordService.getTemporaryPassword"
        1 * service.temporaryPasswordService.getTemporaryPassword(_ as AppUser) >> { AppUser it ->
            it.password = mockTemporaryPassword.password
            return mockTemporaryPassword
        }

        and: "should call organisationAdminUserService.addUserToOrganisation and return user"
        1 * service.organisationAdminUserService.addUserToOrganisation(_ as Organisation, _ as AppUser) >> { Organisation o, AppUser u -> u.organisation = o; return u}

        then: "should call roleService.getRoleByAuthority and return role"
        1 * service.roleService.getRoleByAuthority(userRole.authority) >> userRole

        then: "should call getCurrentUser again when sending the welcome email"
        1 * service.springSecurityService.getCurrentUser() >> mockUser

        then: "there should be one user saved in the system"
        AppUser.count() == 1

        and: "the persisted user should have the correct username"
        AppUser.list()[0].username == NEW_USER_NAME

        and: "the persisted user should have the current users ORG"
        AppUser.list()[0].organisation == mockUser.organisation

        and: "there should be one user role record"
        UserRole.count() == 1

        and: "the persisted user role should have the correct role"
        UserRole.list()[0].role == userRole

        and: "the persisted user role should have the correct user"
        UserRole.list()[0].user.username == NEW_USER_NAME

        and: "the return value should have the temporary password assigned"
        serviceReturnValue.temporaryPassword == mockTemporaryPassword

        and: "the return value should be the instance of JuralioUser"
        serviceReturnValue instanceof AppUser
    }

    void "createUserWithRoles() - when called with a user object with upper-case username"() {
        final def UPPERCASE_USERNAME = "UPPER_CASE_TEST@test.com"
        Object newUser
        Role role
        AppUser mockUser = new AppUser()
        Organisation mockOrg = new Organisation()
        TemporaryPassword mockTemporaryPassword = new TemporaryPassword('mock_password')
        mockUser.organisation = mockOrg

        setup: "create new un-saved User object with upper-case username and bootstrap default role"
        role = bootStrapUserRole()
        newUser = createUserObject(UPPERCASE_USERNAME)
        service.temporaryPasswordService.getTemporaryPassword(_ as AppUser) >> { AppUser it ->
            it.password = mockTemporaryPassword.password
            return mockTemporaryPassword
        }

        when: "the service is called"
        service.createUserWithRoles(newUser, [role.authority] as String[])

        then: "should call springSecuritySerice.getCurrentUser() and return current user"
        2 * service.springSecurityService.getCurrentUser() >> mockUser

        and: "should call organisationAdminUserService.addUserToOrganisation and return user"
        1 * service.organisationAdminUserService.addUserToOrganisation(_ as Organisation, _ as AppUser) >> { Organisation o, AppUser u -> u.organisation = o; return u}

        then: "should call roleService.getRoleByAuthority and return role"
        1 * service.roleService.getRoleByAuthority(role.authority) >> role

        then: "should call getCurrentUser again when sending the welcome email"
        1 * service.springSecurityService.getCurrentUser() >> mockUser

        then: "the persisted user should have a lower-cased username"
        AppUser.list()[0].username == UPPERCASE_USERNAME.toLowerCase()
    }

    void "createUserWithRoles() - when called with an invalid user object"() {
        final String INVALID_USERNAME = ""
        Object newUser
        Role role
        def serviceReturnValue
        AppUser mockUser = new AppUser()
        Organisation mockOrg = new Organisation()
        mockUser.organisation = mockOrg

        setup: "create new invalid un-saved User object and bootstrap default role"
        role = bootStrapUserRole()
        newUser = createUserObject(INVALID_USERNAME)

        when: "the service is called"
        serviceReturnValue = service.createUserWithRoles(newUser, [role.authority] as String[])

        then: "should call springSecuritySerice.getCurrentUser() and return current user"
        2 * service.springSecurityService.getCurrentUser() >> mockUser

        then: "then there should be no user's persisted in the system"
        AppUser.count() == 0

        and: "there should be no user role records persisted in the system"
        UserRole.count() == 0

        and: "the user object returned from the service should have errors"
        serviceReturnValue.hasErrors() == true
    }

    void "changePassword() - user not in expired password state"() {
        UserPasswordChangeRequest changeRequest
        AppUser mockUser

        setup:
        service.userDAOService = Mock(UserDAOService)

        changeRequest = new UserPasswordChangeRequest(username: 'user@test.com', oldPassword: 'Original', newPassword: 'New_Password1Password1$', newPasswordRepeat: 'New_Password1Password1$')
        mockUser = new AppUser()

        when: "The service method is called"
        service.changePassword(changeRequest)

        then: "The current user should be retrieved"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> mockUser

        and: "passwordValidatorService.validate should not be called"
        0 * service.passwordValidatorService.validate(_, _)

        then: "an UserPasswordChangeException should be thrown"
        thrown UserPasswordChangeException

        and: "invalidateAllSessions should NOT be called on the auth token service"
        0 * service.userAuthTokenService.invalidateAllSessions()
    }

    void "changePassword() - cannot find user"() {
        UserPasswordChangeRequest changeRequest = new UserPasswordChangeRequest(username: 'notExist@test.com', oldPassword: 'Original', newPassword: 'New_Password1Password1$', newPasswordRepeat: 'New_Password1Password1$')

        when: "method is called on service"
        service.changePassword(changeRequest)

        then: "should trying to find the user by username"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> null

        then: "a UserDoesNotExistException should be thrown"
        thrown UserDoesNotExistException

        and: "invalidateAllSessions should NOT be called on the auth token service"
        0 * service.userAuthTokenService.invalidateAllSessions()
    }

    void "changePassword() - Original password is not valid"() {
        UserPasswordChangeRequest changeRequest
        AppUser mockUser

        setup:
        service.userDAOService = Mock(UserDAOService)
        changeRequest = new UserPasswordChangeRequest(username: 'user@test.com', oldPassword: 'Original', newPassword: 'New_Password1Password1$', newPasswordRepeat: 'New_Password1Password1$')

        mockUser = new AppUser()
        mockUser.password = "Original1"
        mockUser.passwordExpired = true

        when: "The service method is called"
        service.changePassword(changeRequest)

        then: "The current user should be retrieved"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> mockUser

        and: "old password should be checked against given value"
        1 * service.passwordValidatorService.isNewPasswordSameAsCurrentPassword(_, _)

        and: "passwordValidatorService.validate should be called, passing the users password and the oldPassword from the change request"
        0 * service.passwordValidatorService.validate('Original', 'New_Password1Password1$') >> false

        then: "userDaoService should not save the user"
        0 * service.userDAOService.save(_)

        then: "an UserPasswordChangeException should be thrown"
        thrown UserPasswordChangeException

        and: "invalidateAllSessions should NOT be called on the auth token service"
        0 * service.userAuthTokenService.invalidateAllSessions()
    }

    void "changePassword() - New passwords do not match"() {
        UserPasswordChangeRequest changeRequest
        AppUser mockUser

        setup:
        service.userDAOService = Mock(UserDAOService)

        changeRequest = new UserPasswordChangeRequest(username: 'user@test.com', oldPassword: 'Original', newPassword: 'New_Password1Password1$', newPasswordRepeat: 'New_Password2Password2$')

        mockUser = new AppUser()
        mockUser.password = "Original"
        mockUser.passwordExpired = true

        when: "The service method is called"
        service.changePassword(changeRequest)

        then: "The current user should be retrieved"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> mockUser

        and: "old password should be checked against given value"
        1 * service.passwordValidatorService.isNewPasswordSameAsCurrentPassword(_, _) >> true

        then: "an NewPasswordsDoNotMatchException should be thrown"
        thrown NewPasswordsDoNotMatchException

        and: "invalidateAllSessions should NOT be called on the auth token service"
        0 * service.userAuthTokenService.invalidateAllSessions()
    }

    void "changePassword() - New passwords not specified"() {
        String NEW_PASSWORD = null
        UserPasswordChangeRequest changeRequest
        AppUser mockUser

        setup:
        service.userDAOService = Mock(UserDAOService)
        changeRequest = new UserPasswordChangeRequest(username: 'user@test.com', oldPassword: 'Original', newPassword: NEW_PASSWORD, newPasswordRepeat: NEW_PASSWORD)
        mockUser = Mock(AppUser)
        mockUser.passwordExpired = true

        when: "The service method is called"
        service.changePassword(changeRequest)

        then: "The current user should be retrieved"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> mockUser

        and: "passwordValidatorService.validate should NOT be called"
        0 * service.passwordValidatorService.validate(_, _)

        then: "an UserPasswordChangeException should be thrown"
        thrown UserPasswordChangeException

        and: "invalidateAllSessions should NOT be called on the auth token service"
        0 * service.userAuthTokenService.invalidateAllSessions(mockUser)
    }

    void "changePassword() - Happy Path"() {
        String NEW_PASSWORD = "ThisIsTheNewPassword2Password2!016"
        UserPasswordChangeRequest changeRequest
        AppUser mockUser

        setup:
        service.userDAOService = Mock(UserDAOService)
        service.passwordValidatorService = Mock(PasswordValidatorService)

        changeRequest = new UserPasswordChangeRequest(username: 'user@test.com', oldPassword: 'Original', newPassword: NEW_PASSWORD, newPasswordRepeat: NEW_PASSWORD)

        mockUser = Mock(AppUser)

        when: "The service method is called"
        service.changePassword(changeRequest)

        then: "The current user should be retrieved"
        1 * service.userDAOService.findByUsername(changeRequest.username, [lock: true]) >> mockUser

        then: "The current user should be in an expired password state"
        1 * mockUser.isPasswordExpired() >> true

        and: "old password should be checked against given value"
        1 * service.passwordValidatorService.isNewPasswordSameAsCurrentPassword(_, _) >> true

        and: "passwordValidatorService.validate should be called which returns that the old password is valid"
        1 * service.passwordValidatorService.validate(_, _) >> true

        then: "The password should be updated on the current user"
        1 * mockUser.setPassword(NEW_PASSWORD)

        then: "should reset the expired flag on user"
        1 * mockUser.setPasswordExpired(false)

        and: "The user should be saved"
        1 * service.userDAOService.save(mockUser)

        and: "invalidateAllSessions should be called on the auth token service"
        1 * service.userAuthTokenService.invalidateAllSessions(mockUser)
    }

    void "handleFailedLogin() - user does not exist"() {

        final String USERNAME = "does_not_exist"

        when: "the function is called with a username that does not exists"
        service.handleFailedLogin(USERNAME)

        then: "juralioUserDaoService.findByUsername should be called with the given user name"
        1 * service.userDAOService.findByUsername(USERNAME, [lock: true]) >> null

        and: "juralioUserDaoService.save should not be called"
        0 * service.userDAOService.save(_ as AppUser)
    }

    void "handleFailedLogin() - user exists"() {

        final String USERNAME = "user_exists"
        final AppUser mockUser = new AppUser()
        final mockNow = GroovyMock(Date)

        setup:
        mockUser.failedLoginAttempts = 0
        mockUser.accountLocked = false

        when: "the function is called with a username that exists"
        service.handleFailedLogin(USERNAME)

        then: "juralioUserDaoService.findByUsername should be called with the given user name and lock option"
        1 * service.userDAOService.findByUsername(USERNAME, [lock: true]) >> mockUser

        and: "configService.getMaxLoginAttempts should be called"
        1 * service.configService.getMaxLoginAttempts() >> 1

        and: "dateUtilService.getCurrentTime should be called"
        1 * service.dateUtilService.getCurrentDateTime() >> mockNow

        and: """juralioUserDaoService.save should be called with a user who's
                failed login attempts have been incremented by 1 AND
                accountLocked been set to true AND
                accountLockedTime has been set to now"""
        1 * service.userDAOService.save({ AppUser user ->
            user.failedLoginAttempts == 1 &&
                    user.accountLocked == true &&
                    user.accountLockedTime == mockNow
        })
    }

    void "resetLoginAttempts"() {
        String mockUsername = "mock"
        AppUser mockUser = Mock(AppUser)

        setup:
        service.userDAOService = Mock(UserDAOService)

        when: "method is called"
        service.resetLoginAttempts(mockUsername)

        then: "should retrieve the user"
        1 * service.userDAOService.findByUsername(mockUsername, [lock: true]) >> mockUser

        and: "should reset the user's login attempts"
        1 * mockUser.setFailedLoginAttempts(0)

        and: "should save the user"
        1 * service.userDAOService.save(mockUser)
    }

    void "unlockIfNecessary - user doest not exist or is not locked"() {
        String mockUsername = "mock"

        when: "method is called"
        service.unlockIfNecessary(mockUsername)

        then: "should fetch the user"
        1 * service.userDAOService.findByUsername(mockUsername, [lock: true]) >> user

        and: "should not check the expired time of the account"
        0 * service.dateUtilService.getCurrentDateTime()
        0 * service.configService.getLockDurationMinutes()

        and: "user should not be saved"
        0 * service.userDAOService.save(_)

        where:
        user << [null, new AppUser(accountLocked: false)]
    }

    void "unlockIfNecessary - accountLockDuration is not expired"() {
        String mockUsername = "mock"
        Date mockNow = GroovyMock(Date) {
            getTime() >> 2000
        }
        Date mockAccountLockedTime = GroovyMock(Date) {
            getTime() >> 1000
        }
        AppUser mockUser = Mock(AppUser) {
            getAccountLockedTime() >> mockAccountLockedTime
            isAccountLocked() >> true
        }

        when: "method is called"
        service.unlockIfNecessary(mockUsername)

        then: "should fetch the user"
        1 * service.userDAOService.findByUsername(mockUsername, [lock: true]) >> mockUser

        and: "should get the current time"
        1 * service.dateUtilService.getCurrentDateTime() >> mockNow

        and: "should get the configured account lock duration"
        1 * service.configService.getLockDurationMinutes() >> 1000

        and: "should not unlock user"
        0 * mockUser.setAccountLocked(_)
        0 * mockUser.setFailedLoginAttempts(_)
        0 * mockUser.setAccountLockedTime(_)
        0 * service.userDAOService.save(_)
    }

    void "unlockIfNecessary"() {
        String mockUsername = "mock"
        AppUser mockUser = Mock(AppUser)
        long mockCurrentInMillisecond = 61001
        Date mockCurrentDateTime = Mock(Date)
        long mockAccountLockDurationInMinutes = 1
        Date mockAccountLockedTime = Mock(Date)
        long mockAccountLockedTimeInMiliSeconds = 1000

        when: "method is called"
        service.unlockIfNecessary(mockUsername)

        then: "should retrieve the user"
        1 * service.userDAOService.findByUsername(mockUsername, [lock: true]) >> mockUser

        and: "should check the accountLocked flag on the user"
        1 * mockUser.isAccountLocked() >> true

        and: "should get current time"
        1 * service.dateUtilService.getCurrentDateTime() >> mockCurrentDateTime

        and: "should calculate current time to millisecond"
        1 * mockCurrentDateTime.getTime() >> mockCurrentInMillisecond

        and: "should retrieve account lock duration from configService"
        1 * service.configService.getLockDurationMinutes() >> mockAccountLockDurationInMinutes

        and: "should get accountLockedTime on the user"
        2 * mockUser.getAccountLockedTime() >> mockAccountLockedTime

        and: "should calculate accountLockedTime to milisecond"
        1 * mockAccountLockedTime.getTime() >> mockAccountLockedTimeInMiliSeconds

        and: "should unlock the user"
        1 * mockUser.setAccountLocked(false)

        and: "should reset the user's fail login count"
        1 * mockUser.setFailedLoginAttempts(0)

        and: "should reset the accountLockTime"
        1 * mockUser.setAccountLockedTime(null)

        and: "should save the unlocked user"
        1 * service.userDAOService.save(mockUser)
    }


    ValidatedParameterMap createUserObject(username) {
        return new ValidatedParameterMap([username: username, password: "Password1Password1!", firstname: "abc", lastname: "def"])
    }

    def bootStrapUserRole() {
        Role role = new Role(authority: Roles.USER.code());
        role.save(flush: true, failOnError: true);
        return role;
    }

    def bootstrapSystemAdminRole() {
        Role role = new Role(authority: Roles.SYSADMIN.code());
        role.save(flush: true, failOnError: true);
        return role;
    }
}
