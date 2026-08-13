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

import com.juralio.auth.UserService
import com.juralio.common.ParameterValidatorService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterPartyMemberController {
    static allowedMethods = [index: "GET", show: "GET", save: "POST", delete: "DELETE"]
    MatterService matterService
    UserService userService
    MatterTeamMemberService matterTeamMemberService
    MatterPartyMemberService matterPartyMemberService

    def index() {
        try {
            List<MatterPartyMember> matterPartyMemberList = matterPartyMemberService.listByMatterId(params.matter_id as long)
            respond matterPartyMemberList, [status: HttpStatus.OK, view: '/matterPartyMember/_matterPartyMemberList']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def show() {
        try {
            MatterPartyMember matterPartyMember = matterPartyMemberService.get(params.id as long)
            respond matterPartyMember, [status: HttpStatus.OK, view: '/matterPartyMember/_matterPartyMember']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        try {
            def validatedBody = ParameterValidatorService.validate(request.JSON, ['members'], [])
            List<MatterPartyMember> matterPartyMemberList = new ArrayList<>()
            validatedBody.get("members").each { member ->
                def memberMap = ParameterValidatorService.validate(member, ['id'], [])
                MatterPartyMember matterPartyMember = matterPartyMemberService.save(
                        matterService.getMatterOnly(params.matter_id as long),
                        params.party_id as long,
                        userService.getUserById(memberMap.get("id") as long))
                matterPartyMemberList.add(matterPartyMember)
                MatterTeamMember matterTeamMember = matterTeamMemberService.saveUser(params.matter_id as long, memberMap.get("id") as long)
                if (matterTeamMember != null) matterPartyMember.teamMemberId = matterTeamMember.id
            }
            respond matterPartyMemberList, [status: HttpStatus.OK, view: '/matterPartyMember/_matterPartyMemberList']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def delete() {
        try {
            def deletedUser = matterPartyMemberService.delete(params.matter_id as long, params.id as long)
            respond deletedUser, [status: HttpStatus.OK, view: '/matterPartyMember/_matterPartyMember']
        } catch (ignored) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
