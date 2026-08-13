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

package com.juralio.common

enum DaysOfWeek {

    MON("MON", 0),
    TUE("TUE", 1),
    WED("WED", 2),
    THU("THU", 3),
    FRI("FRI", 4),
    SAT("SAT", 5),
    SUN("SUN", 6)

    private final String label
    private final int value

    DaysOfWeek(String label, int value) {
        this.label = label
        this.value = value
    }
}
