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

package com.juralio.auth.token

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.GrantedAuthority

class UserAuthenticationToken extends UsernamePasswordAuthenticationToken {
    Integer mfaToken
    boolean isMfaTokenPresent

    UserAuthenticationToken(Object principal, Object credentials) {
        super(principal, credentials)
    }

    UserAuthenticationToken(Object principal, Object credentials, boolean isMfaTokenPresent, Integer mfaToken) {
        super(principal, credentials)
        this.isMfaTokenPresent = isMfaTokenPresent
        this.mfaToken = mfaToken
    }

    UserAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(principal, credentials, authorities)
    }
}