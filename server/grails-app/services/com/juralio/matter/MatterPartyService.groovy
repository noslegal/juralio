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

import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.dao.MatterPartyDAOService
import grails.gorm.transactions.Transactional

@Transactional
class MatterPartyService {

    MatterPartyDAOService matterPartyDAOService
    MatterService matterService
    MatterAuthorisationService matterAuthorisationService

    MatterParty save(long matterId, String name, String type) {
        if (!matterAuthorisationService.hasUpdateAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        if (!matter.isNeutralMatter) throw new Exception()
        MatterParty matterParty = new MatterParty(name: name, matter: matter, type: type)

        return matterPartyDAOService.save(matterParty)
    }

    void delete(long matterId, long partyId) {
        if (!matterAuthorisationService.hasUpdateAccess(matterId)) {
            throw new Exception()
        }
        matterPartyDAOService.delete(partyId)
    }

    MatterParty update(long matterId, long partyId, ValidatedParameterMap properties) {
        if (!matterAuthorisationService.hasUpdateAccess(matterId)) {
            throw new Exception()
        }
        def matterParty = matterPartyDAOService.get(partyId)
        matterParty.properties = properties
        return matterPartyDAOService.save(matterParty)
    }

    MatterParty get(long matterId, long id) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        return matterPartyDAOService.get(id)
    }

    List<MatterParty> listByMatterId(long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        return matterPartyDAOService.findAllByMatter(matter)
    }

    MatterParty getNeutralParty(long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        return matterPartyDAOService.findByMatterAndType(matter, 'neutral')
    }
}
