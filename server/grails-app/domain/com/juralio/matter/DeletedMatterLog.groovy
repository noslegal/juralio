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

package com.juralio.matter

class DeletedMatterLog {
    Long matterId
    Long organisationId
    String matterName
    String matterClient
    String deletedBy
    Date markedForDeletion
    Date permanentlyDeleted

    static constraints = {
        matterId nullable: false, blank: false
        organisationId nullable: false, blank: false
        matterName nullable: false, blank: false
        matterClient nullable: false, blank: false
        deletedBy nullable: false, blank: false
        markedForDeletion nullable: false, blank: false
        permanentlyDeleted nullable: true, blank: true
    }
}
