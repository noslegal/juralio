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

package com.juralio.costs

enum AssumptionStatus {
    ON_TARGET("on-target"),
    AT_RISK("at-risk"),
    MET("met"),
    NOT_MET("not-met")

    private final String value

    AssumptionStatus(String value) {
        this.value = value
    }

    String value() {
        return value
    }

    static List<String> getAllValues() {
        return values()*.value()
    }

    static AssumptionStatus fromValue(String value) {
        return values().find { it.value() == value }
    }
}
