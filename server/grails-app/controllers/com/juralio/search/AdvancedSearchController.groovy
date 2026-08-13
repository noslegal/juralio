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

package com.juralio.search

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.http.HttpStatus


@Secured(['IS_AUTHENTICATED_FULLY'])
class AdvancedSearchController {
    static allowedMethods = [search: "GET"]
    AdvancedSearchService advancedSearchService

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def search() {
        try {
            String query = params.query as String
            boolean includeMatters = params.includeMatters ? params.includeMatters == 'true' : true
            boolean includeWorkstreams = params.includeWorkstreams ? params.includeWorkstreams == 'true' : true
            boolean includeTasks = params.includeTasks ? params.includeTasks == 'true' : true
            boolean includePosts = params.includePosts ? params.includePosts == 'true' : true
            boolean includeTemplates = params.includeTemplates ? params.includeTemplates == 'true' : true
            boolean includeTemplateTasks = params.includeTemplateTasks ? params.includeTemplateTasks == 'true' : true
            boolean includeTemplateTaskPosts = params.includeTemplateTaskPosts ? params.includeTemplateTaskPosts == 'true' : true
            Long context = params.context ? Long.valueOf(params.context) : null
            String contextType = params.context && params.contextType ? params.contextType : null

            def options = [
                    includeMatters          : includeMatters,
                    includeWorkstreams      : includeWorkstreams,
                    includeTasks            : includeTasks,
                    includePosts            : includePosts,
                    includeTemplates        : includeTemplates,
                    includeTemplateTasks    : includeTemplateTasks,
                    includeTemplateTaskPosts: includeTemplateTaskPosts,
                    context                 : context,
                    contextType             : contextType
            ]

            def results = advancedSearchService.performSearch(query, options)
            respond results, status: HttpStatus.OK
        } catch(Exception e){
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }
}
