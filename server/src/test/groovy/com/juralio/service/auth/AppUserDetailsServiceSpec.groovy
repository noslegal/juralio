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

package com.juralio.service.auth

import com.juralio.auth.AppUser
import com.juralio.auth.AppUserDetailsService
import com.juralio.auth.UserService
import grails.plugin.springsecurity.SpringSecurityUtils
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import groovy.util.logging.Slf4j
import spock.lang.Specification

@Slf4j
class AppUserDetailsServiceSpec extends Specification implements ServiceUnitTest<AppUserDetailsService>, DataTest {

    //Setting this to false as a constant as
    //value is not relevant to testing of this class.
    def SHOULD_LOAD_ROLES = false

    def loadedUser

    def setup() {
        mockDomain(AppUser)
        //Set up some configuration that would come from Config.groovy
        //at run-time
        def ConfigObject configObject = new ConfigObject()
        configObject.put('userLookup',
                [userDomainClassName : "com.juralio.auth.AppUser",
                 usernamePropertyName: "username",
                 passwordPropertyName: "password"])
        SpringSecurityUtils.setSecurityConfig(configObject)

        loadedUser = null;
    }

    void "null username should be handled gracefully"() {
        setup:
        service.userService = Mock(UserService)
        when:
        loadedUser = service.loadUserByUsername(null,
                SHOULD_LOAD_ROLES)
        then:
        thrown(Exception)
        0 * service.userService.unlockIfNecessary(_)
        and:
        loadedUser == null
    }

    void "cannot load a user that doesn't exist"() {
        when:
        loadedUser = service.loadUserByUsername("juralio.doesnotexist",
                SHOULD_LOAD_ROLES)
        then:
        thrown(Exception)
        and:
        loadedUser == null
    }

    void "loading user that exists should be returned"() {
        setup:
        AppUser user = saveUser("juralio.user@test.com")
        service.userService = Mock(UserService)
        when:
        loadedUser = service.loadUserByUsername("juralio.user@test.com", SHOULD_LOAD_ROLES)
        then:
        notThrown(Exception)
        and: "should call unlockIfNecessary on juralioUserService"
        1 * service.userService.unlockIfNecessary("juralio.user@test.com")
        and:
        loadedUser != null
        and:
        loadedUser.username == user.username
    }

    void "loading user with different case should be returned"() {
        setup:
        AppUser user = saveUser("juralio.useruppertest@test.com")
        service.userService = Mock(UserService)
        when:
        loadedUser = service.loadUserByUsername("juRaliO.usErupPerTesT@test.com", SHOULD_LOAD_ROLES)
        then:
        notThrown(Exception)
        and: "should call unlockIfNecessary on juralioUserService"
        1 * service.userService.unlockIfNecessary("juralio.useruppertest@test.com")
        and:
        loadedUser != null
        and:
        loadedUser.username == user.username
    }

    AppUser saveUser(def username) {
        AppUser newUser = createUser(username);
        newUser.save(flush: true, failOnError: true);
        return newUser
    }

    AppUser createUser(def username) {
        AppUser newUser = new AppUser();
        newUser.username = username
        newUser.password = "Password1Password1!"
        newUser.firstname = "firstname"
        newUser.lastname = "lastname"

        return newUser;
    }
}