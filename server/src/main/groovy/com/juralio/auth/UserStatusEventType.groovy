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

enum UserStatusEventType {
    ACTIVATION("ACTIVATION"),
    DEACTIVATION("DEACTIVATION"),
    REACTIVATION("REACTIVATION"),
    CONFIRMED("CONFIRMED"),
    LAPSED("LAPSED"),

    private final String value

    UserStatusEventType(String value) {
        this.value = value
    }

    String value() {
        return value
    }

    static List<String> getAllValues() {
        return values()*.value()
    }

    static UserStatusEventType fromValue(String value) {
        return values().find { it.value() == value }
    }
}
