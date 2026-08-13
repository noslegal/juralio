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

import com.juralio.auth.AppUser
import com.juralio.matter.dao.MatterPartyMemberDAOService
import grails.gorm.transactions.Transactional

@Transactional
class MatterPartyMemberService {

    MatterPartyMemberDAOService matterPartyMemberDAOService
    MatterPartyService matterPartyService
    MatterService matterService
    MatterTeamMemberService matterTeamMemberService
    MatterAuthorisationService matterAuthorisationService


    MatterPartyMember save(Matter matter, long partyId, AppUser member) {
        if (!matterAuthorisationService.hasAddMatterPartyMemberAccess(matter.id,matter.organisation.id,member)) {
            throw new Exception()
        }
        checkIfMemberAlreadyExistsInParty(matter, partyId, member)

        MatterParty matterParty = matterPartyService.get(matter.id, partyId)
        MatterPartyMember matterPartyMember = new MatterPartyMember(matterParty: matterParty, user: member)

        return matterPartyMemberDAOService.save(matterPartyMember)
    }

    MatterPartyMember delete(long matterId, long matterPartyMemberId) {
        if (!matterAuthorisationService.hasUpdateAccess(matterId)) {
            throw new Exception()
        }
        def userToRemove = matterPartyMemberDAOService.get(matterPartyMemberId)
        matterPartyMemberDAOService.delete(userToRemove)
        return userToRemove
    }

    MatterPartyMember get(long id) {
        //this won't work but we don't use it anyway prob should be getting removed
        if (!matterAuthorisationService.hasReadAccess(id)) {
            throw new Exception()
        }
        return matterPartyMemberDAOService.get(id)
    }

    List<MatterPartyMember> listByMatterId(long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        List<MatterParty> matterParties = matterPartyService.listByMatterId(matterId)
        List<MatterPartyMember> out = new ArrayList<>()
        matterParties.forEach {
            out.addAll(matterPartyMemberDAOService.findAllByMatterParty(it))
        }
        out.forEach {
            matterPartyMember ->
                def a = matter.matterAdmins.find { it.user.id == matterPartyMember.user.id }
                if (a != null) matterPartyMember.matterAdminId = a.id
                def b = matter.teamMembers.find { it.user.id == matterPartyMember.user.id }
                if (b != null) matterPartyMember.teamMemberId = b.id
        }
        return out
    }

    List<MatterPartyMember> listByPartyId(long matterId, long partyId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        MatterParty matterParty = matterPartyService.get(matterId, partyId)
        return matterPartyMemberDAOService.findAllByMatterParty(matterParty)
    }

    private void checkIfMemberAlreadyExistsInParty(Matter matter, long partyId, AppUser member) {
        if (matterPartyMemberDAOService.exists(matter, member)) {
            throw new Exception("Member ${member.username} already exits in party with id ${partyId}")
        }
    }

    private def addMatterMemberRole(Matter matter, AppUser member, MatterPartyMember matterPartyMember) {
        MatterTeamMember matterTeamMember = matterTeamMemberService.saveUser(matter.id, member.id)
        if (matterTeamMember != null) matterPartyMember.teamMemberId = matterTeamMember.id
        return matterPartyMember
    }

    private def createMatterPartyMember(Matter matter, long partyId, AppUser member) {
        MatterParty matterParty = matterPartyService.get(matter.id, partyId)
        MatterPartyMember matterPartyMember = new MatterPartyMember(matterParty: matterParty, user: member)
        return matterPartyMember
    }
}
