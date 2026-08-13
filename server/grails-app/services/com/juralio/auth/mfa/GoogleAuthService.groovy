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

package com.juralio.auth.mfa

import com.juralio.auth.AppUser
import com.juralio.mfa.GetMfaSeedResponse
import com.warrenstrange.googleauth.GoogleAuthenticator
import com.warrenstrange.googleauth.GoogleAuthenticatorKey
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator
import grails.gorm.transactions.Transactional

@Transactional
class GoogleAuthService {

    private final String ISSUER_NAME = "Juralio"
    GoogleAuthenticator googleAuthenticator = new GoogleAuthenticator()
    GoogleAuthenticatorKey key

    GetMfaSeedResponse generateMfaSeedResponse(AppUser user) {
        key = generateKey()
        def url = getTotpUrl(user, key)
        return new GetMfaSeedResponse(key.getKey(), url)
    }

    private GoogleAuthenticatorKey generateKey() {
        return googleAuthenticator.createCredentials()
    }

    private getTotpUrl(AppUser user, GoogleAuthenticatorKey key) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(ISSUER_NAME, user.username, key)
    }

    boolean verifyToken(String mfaKey, Integer mfaToken) {
        return googleAuthenticator.authorize(mfaKey, mfaToken)
    }
}
