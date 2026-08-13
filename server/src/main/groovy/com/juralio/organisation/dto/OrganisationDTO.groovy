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

package com.juralio.organisation.dto

class OrganisationDTO {
    long id
    String name
    boolean enabled = true
    boolean customLogo = false
    long activeUserCount
    boolean microsoftSsoEnabled = false
    boolean oktaSsoEnabled = false
    boolean googleSsoEnabled = false
    boolean samlSsoEnabled = false
    boolean isFrozen = false
    boolean isPendingDeletion
    String markedForDeletion
    String deletedBy
    String permanentlyDeleted
}
