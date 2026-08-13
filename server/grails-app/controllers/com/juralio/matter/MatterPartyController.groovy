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

import com.juralio.common.ParameterValidatorService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterPartyController {

    static allowedMethods = [index: "GET", show: "GET", save: "POST", update: "PATCH"]

    MatterPartyService matterPartyService
    MatterPartyMemberService matterPartyMemberService

    def index() {
        try {
            List<MatterParty> matterPartyList = matterPartyService.listByMatterId(params.matter_id as long)
            matterPartyList.collect {
                it.members = matterPartyMemberService.listByPartyId(params.matter_id as long, it.id)
            }
            respond matterPartyList, [status: HttpStatus.OK, view: '/matterParty/_matterPartyList']
        } catch (Exception e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def show() {
        try {
            MatterParty matterParty = matterPartyService.get(params.matter_id as long, params.party_id as long)
            respond matterParty, [status: HttpStatus.OK, view: '/matterParty/_matterParty']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        try {
            def validatedBody = ParameterValidatorService.validate(request.JSON, ['parties'], [])
            validatedBody.get("parties").each { party ->
                def partyMap = ParameterValidatorService.validate(party, ['name', 'type', 'matterId'], [])
                matterPartyService.save(
                        partyMap.get("matterId") as long,
                        partyMap.get("name") as String,
                        partyMap.get("type") as String)
            }
            respond status: HttpStatus.OK
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def delete() {
        try {
            matterPartyService.delete(params.matter_id as long, params.party_id as long)
            respond status: HttpStatus.OK
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def update() {
        try {
            def validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'type'])
            MatterParty matterParty = matterPartyService.update(params.matter_id as long, params.party_id as long, validatedBody)
            respond matterParty, [status: HttpStatus.OK, view: '/matterParty/_matterParty']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
