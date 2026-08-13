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

import grails.plugin.springsecurity.annotation.Secured

@Secured("!hasRole('ROLE_SYSADMIN')")
class MatterSharedController {

    static allowedMethods = [getSharedMatters: "POST"]

    MattersTeamsMembersSearchService mattersTeamsMembersSearchService

    def getSharedMatters() {
        List<Matter> sharedMatters = []
        long userId = request.JSON.userId != null ? request.JSON.userId : -1

        if (userId > -1) {
            sharedMatters = mattersTeamsMembersSearchService.getSharedMatters(userId)
        }
        respond sharedMatters
    }
}
