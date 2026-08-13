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

package com.juralio.project.dao

import com.juralio.auth.AppUser
import com.juralio.project.Project
import grails.gorm.transactions.Transactional
import server.PrivateWorkstreamMember

@Transactional
class PrivateWorkstreamMemberDAOService {

    PrivateWorkstreamMember get(long id) {
        return PrivateWorkstreamMember.get(id)
    }

    PrivateWorkstreamMember findByWorkstreamAndUserId(Project workstream, AppUser user) {
        return PrivateWorkstreamMember.findByWorkstreamAndUser(workstream, user)
    }

    List<PrivateWorkstreamMember> findAllByWorkstream(Project workstream) {
        return PrivateWorkstreamMember.findAllByWorkstream(workstream)
    }

}
