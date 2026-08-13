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

package com.juralio.template

import com.juralio.organisation.Organisation
import com.juralio.templateResource.TemplateResource
import grails.plugins.orm.auditable.Auditable
import org.grails.web.json.JSONObject

class ProjectTemplate implements Auditable {
    String name
    String description
    String referenceNumber = 'T0'
    boolean published = false
    boolean archived = false
    boolean isSystemTemplate = false
    Date systemTemplateLastUpdated
    Long systemTemplateUpdateCount =0
    Long height
    Long depth

    Date dateCreated
    Date lastUpdated

    Organisation organisation
    List<TaskTemplate> tasks
    String url
    String urlCredit
    String urlCreditName
    List<ProjectTemplateImageTag> urlTags

    String companyImage
    Boolean companyImageBackground = true
    Boolean isFavourited
    JSONObject metadata
    long postCount = 0
    long publishedPostCount = 0

    static transients = ['levelATasks', 'resources','metadata','urlTags','isFavourited','height','depth','postCount','publishedPostCount']
    List<TaskTemplate> levelATasks
    List<TemplateResource> resources

    def beforeInsert() {
        this.beforeUpdate()
    }

    def beforeUpdate() {
        if (!isSystemTemplate && organisation == null) {
            return false
        }
        if (isSystemTemplate && organisation != null) {
            return false
        }
        if(isSystemTemplate){
            systemTemplateLastUpdated = new Date()
            systemTemplateUpdateCount = systemTemplateUpdateCount+1
        }
    }

    static hasMany = [tasks: TaskTemplate]
    static constraints = {
        name nullable: false, size: 1..70
        dateCreated bindable: false
        systemTemplateLastUpdated bindable:false, nullable:true
        systemTemplateUpdateCount nullable:false
        lastUpdated bindable: false
        description nullable: true, size: 0..30000
        archived nullable: false
        published nullable: false
        referenceNumber nullable: true, bindable: false
        organisation nullable: true, bindable: false
        isSystemTemplate nullable:false, bindable:false
        url nullable:  true
        urlCredit nullable:  true
        urlCreditName nullable:  true
        companyImage nullable:true
        companyImageBackground nullable: false
    }
    static mapping = {
        referenceNumber updateable: false
    }
}
