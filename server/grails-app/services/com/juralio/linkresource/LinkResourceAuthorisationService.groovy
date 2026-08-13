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

package com.juralio.linkresource

import com.juralio.auth.*
import com.juralio.matter.MatterService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class LinkResourceAuthorisationService extends BaseAuthorisationService
        implements ReadAuthorisation, UpdateAuthorisation, CreateAuthorisation {
    SpringSecurityService springSecurityService
    MatterService matterService

    @Override
    boolean hasReadAccess(Long entityId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return matterService.isMatterEditor(entityId, currentUser.id) || matterService.isViewer(entityId, currentUser.id)
    }

    @Override
    boolean hasCreateAccess(Long parentEntityId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return matterService.isMatterEditor(parentEntityId, currentUser.id)
    }

    @Override
    boolean hasUpdateAccess(Long entityId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return matterService.isMatterEditor(entityId, currentUser.id)
    }
}
