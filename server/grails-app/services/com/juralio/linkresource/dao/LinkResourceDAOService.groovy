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

package com.juralio.linkresource.dao


import com.juralio.linkresource.LinkResource
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

import jakarta.transaction.Transactional

@Transactional
@CompileStatic
class LinkResourceDAOService {

    SpringSecurityService springSecurityService

    LinkResource save(LinkResource linkResource) {
        linkResource.save(flush: true)
        return linkResource
    }

    @CompileDynamic
    List<LinkResource> findAllByMatterId(Long matterId) {
        return LinkResource.class.findAllByMatterId(matterId)
    }


    LinkResource get(long linkResourceId) {
        return LinkResource.get(linkResourceId)
    }

    LinkResource delete(LinkResource linkResource) {
        linkResource.delete()
    }
}
