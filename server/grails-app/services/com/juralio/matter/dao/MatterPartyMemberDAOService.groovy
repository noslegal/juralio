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

package com.juralio.matter.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterParty
import com.juralio.matter.MatterPartyMember
import grails.gorm.transactions.Transactional

@Transactional
class MatterPartyMemberDAOService {

    def clazz = MatterPartyMember.class

    MatterPartyMember save(MatterPartyMember matterPartyMember) {
        if (matterPartyMember.validate()) {
            matterPartyMember.save(flush: true)
        }
        return matterPartyMember
    }

    MatterPartyMember get(long id) {
        return clazz.get(id)
    }

    void delete(MatterPartyMember toDelete) {
        toDelete.delete()
    }

    List<MatterPartyMember> findAllByMatterParty(MatterParty matterParty) {
        return clazz.findAllByMatterParty(matterParty)
    }

    List<MatterPartyMember> findAllByMatter(Matter matter) {
        return clazz.findAllByMatter(matter)
    }

    List<MatterPartyMember> findAllByUser(AppUser user) {
        return clazz.findAllByUser(user)
    }

    boolean exists(Matter matter, AppUser user) {
        return findAllByUser(user).find {
            it.matterParty.matter.id == matter.id
        } != null
    }
}
