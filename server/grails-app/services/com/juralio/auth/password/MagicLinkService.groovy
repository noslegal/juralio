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

package com.juralio.auth.password

import com.juralio.auth.*
import com.juralio.config.ConfigService
import groovy.time.TimeCategory
import org.grails.web.json.JSONObject

import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import java.nio.charset.StandardCharsets
import java.security.Key
import java.security.MessageDigest

class MagicLinkService {
    ConfigService configService
    UserService userService
    PasswordValidatorService passwordValidatorService

    private Long getExpiry(String context) {
        Date expiryDate = new Date()
        switch (context) {
            case 'passwordReset':
                //1hr
                use(TimeCategory) {
                    expiryDate = expiryDate + 60.minutes
                }
                return expiryDate.getTime()
            case 'newUser':
                //7 days
                use(TimeCategory) {
                    expiryDate = expiryDate + 7.days
                }
                return expiryDate.getTime()
            default:
                use(TimeCategory) {
                    expiryDate = expiryDate + 60.minutes
                }
                return expiryDate.getTime()

        }
    }

    private Key generateKey() {
        String passPhrase = configService.magicLinkPassphrase
        if (!passPhrase) {
            // Fail closed. With no passphrase configured there is no secret, so a magic
            // link would be encrypted under a key derived from a publicly-known value
            // (historically the literal "${MAGIC_LINK_PASSPHRASE}" placeholder), making
            // links forgeable by anyone. Refuse rather than issue a guessable token.
            throw new IllegalStateException(
                    'MAGIC_LINK_PASSPHRASE is not configured; magic-link encryption is unavailable')
        }
        byte[] key = passPhrase.getBytes(StandardCharsets.UTF_8)
        MessageDigest sha = MessageDigest.getInstance("SHA3-256")
        key = sha.digest(key)
        key = Arrays.copyOf(key, 16)
        SecretKeySpec secretKey = new SecretKeySpec(key, "AES")
        return secretKey
    }

    private String encryptMagicLink(String magicLinkJSONString) {
        try {
            SecretKeySpec secretKey = generateKey()
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding")
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            return Base64.getEncoder()
                    .encodeToString(cipher.doFinal(magicLinkJSONString.getBytes("UTF-8")))
        } catch (Exception e) {
            System.out.println("Error while encrypting: " + e.toString())
        }
        return null
    }

    String decryptMagicLink(String encryptedMagicLink) {
        try {
            SecretKeySpec secretKey = generateKey()

            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5PADDING")
            cipher.init(Cipher.DECRYPT_MODE, secretKey)
            return new String(cipher.doFinal(Base64.getDecoder().decode(encryptedMagicLink)))
        } catch (Exception e) {
            System.out.println("Error while decrypting: " + e.toString())
        }
        return null
    }

    Boolean magicLinkAlreadyUsed(JSONObject decodedMagicLink) {
        AppUser user = userService.findByUsername(decodedMagicLink.username, [:])
        if (decodedMagicLink.context == 'newUser') {

            List<UserSessionEvent> loginEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS as String, [max: 1, sort: 'time', order: "desc"])
            //if the user has already logged in
            if (loginEvents.size() > 0) {
                return true
            }
            //or if its the wrong password
            if (!passwordValidatorService.isNewPasswordSameAsCurrentPassword(user.password, decodedMagicLink.password)) {
                return true
            }
            return false
        }
        if (decodedMagicLink.context == 'passwordReset') {
            //id not in the password reset state
            if (user.oneTimePasswordReset != null) {
                if (!passwordValidatorService.isNewPasswordSameAsCurrentPassword(user.oneTimePasswordReset, decodedMagicLink.password)) {
                    return true
                }
                return false
            }
            //or if its the wrong password
            if (!passwordValidatorService.isNewPasswordSameAsCurrentPassword(user.password, decodedMagicLink.password)) {
                return true
            }
            return false
        }
        return true
    }

    String generateMagicLinkData(String username, String tempPassword, String context) {
        def authObject = new JSONObject()
        authObject.put('username', username)
        authObject.put('password', tempPassword)
        authObject.put('context', context)
        authObject.put('expiry', getExpiry(context))
        // Fail closed when unconfigured. The previous fallback returned an *unencrypted*
        // base64 payload, which both leaks the temp password and does not round-trip with
        // decryptMagicLink (which only attempts decryption) — so an unconfigured instance
        // could never honour its own links anyway. Require the passphrase instead.
        if (!configService.magicLinkPassphrase) {
            throw new IllegalStateException(
                    'MAGIC_LINK_PASSPHRASE is not configured; cannot issue a magic link')
        }
        return encryptMagicLink(authObject.toString())
    }

}
