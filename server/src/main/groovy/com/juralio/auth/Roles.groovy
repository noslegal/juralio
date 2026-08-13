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

enum Roles {
    SYSADMIN("ROLE_SYSADMIN"),
    USER("ROLE_USER"),
    DEMO("ROLE_DEMO"),
    MATTER_ADMIN("ROLE_MATTER_ADMIN"), // not a real role, used to denote matter admin on frontend
    MATTER_CREATOR("ROLE_MATTER_CREATOR"),
    UPDATES("ROLE_UPDATES"),
    WIP("ROLE_WIP"),
    ANALYSIS("ROLE_ANALYSIS"),
    ORG_ADMIN("ROLE_ORG_ADMIN"),
    KNOWLEDGE_MANAGER("ROLE_KNOWLEDGE_MANAGER"),
    NEUTRAL_MATTER_CREATOR("ROLE_NEUTRAL_MATTER_CREATOR"),
    ORG_OWNER("ROLE_ORG_OWNER"),
    SYSTEM_TEMPLATE_MANAGER('SYSTEM_TEMPLATE_MANAGER'),
    FROZEN_ORG_USER('FROZEN_ORG_USER'), //not a real role, used to denote when the org is frozen to put the user in read only mode
    TEMPLATE_PROVIDER("ROLE_TEMPLATE_PROVIDER"),


    private final String code

    Roles(String code) {
        this.code = code
    }

    String code() {
        return code
    }

    String toString() {
        return code
    }

    boolean equals(String code) {
        this.code == code
    }
}
