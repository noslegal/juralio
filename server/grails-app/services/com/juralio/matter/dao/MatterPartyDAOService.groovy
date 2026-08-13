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

import com.juralio.matter.Matter
import com.juralio.matter.MatterParty
import grails.gorm.transactions.Transactional

@Transactional
class MatterPartyDAOService {

    def clazz = MatterParty.class

    MatterParty save(MatterParty matterParty) {
        if (matterParty.validate()) {
            matterParty.save()
        }
        return matterParty
    }

    MatterParty get(long id) {
        return clazz.get(id)
    }

    void delete(long id) {
        clazz.get(id).delete()
    }

    List<MatterParty> findAllByMatter(Matter matter) {
        return clazz.findAllByMatter(matter)
    }

    MatterParty findByMatterAndType(Matter matter, String type) {
        return clazz.findByMatterAndType(matter, type)
    }
}
