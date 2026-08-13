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

import com.juralio.auth.AppUser
import com.juralio.common.DateUtilService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationService
import com.juralio.post.Post
import com.juralio.template.post.TemplateTaskPostsService
import grails.converters.JSON
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.grails.web.json.JSONObject
import org.jsoup.Jsoup
import org.jsoup.safety.Safelist

@Transactional
class ProjectTemplateExportService {
    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TemplateTaskPostsService templateTaskPostsService
    TemplateResourceService templateResourceService
    ConfigService configService
    SpringSecurityService springSecurityService
    OrganisationService organisationService
    DateUtilService dateUtilService

    private static final Safelist TEMPLATE_HTML_SAFELIST = new Safelist()
            .addTags('p', 'br', 'ul', 'li', 'u', 'b', 'i', 'em', 'strong', 'a',
                    'table', 'tbody', 'thead', 'tr', 'td', 'th',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6')
            .addAttributes('a', 'href', 'target', 'rel')
            .addAttributes('ul', 'style')
            .addAttributes('p', 'style')
            .addAttributes('tbody', 'style')
            .addAttributes('tr', 'style')
            .addAttributes('td', 'style', 'colspan', 'rowspan')
            .addAttributes('th', 'style', 'colspan', 'rowspan')
            .addAttributes('table', 'style')
            .addProtocols('a', 'href', 'http', 'https', 'mailto')

    private static String sanitizeTemplateHtml(String html) {
        if (!html) {
            return html
        }
        return Jsoup.clean(html, TEMPLATE_HTML_SAFELIST)
    }

    def createTemplate(Map taskDocument, Long templateId, Long parentTaskId = null){

        TaskTemplate task = taskTemplateService.save(templateId,parentTaskId,taskDocument.name as String ,taskDocument.isMilestone as Boolean, taskDocument.isDeliverable as Boolean)
        task.noticeboardText = sanitizeTemplateHtml(taskDocument.description as String)
        task.save(flush:true)
        if(taskDocument.tasks){
            taskDocument.tasks.each{
                createTemplate(it as Map,templateId,task.id)
            }
        }
        if(taskDocument.posts){
            taskDocument.posts.each{
                JSONObject parsedTask = new JSONObject(it)
                def postDescription = parsedTask.description
                if (postDescription instanceof CharSequence) {
                    postDescription = sanitizeTemplateHtml(postDescription as String)
                }
                Post templatePost =  templateTaskPostsService.createTemplateTaskPost(templateId,task.id,parsedTask.name,postDescription,parsedTask.privatePost,parsedTask.type,parsedTask.url, parsedTask.startTime,parsedTask.endTime)
                if (!templatePost) {
                    throw new RuntimeException("Failed to create template task post '${parsedTask.name}' during import")
                }
                boolean isFinalised = parsedTask.has('finalised') ? parsedTask.finalised as boolean : false
                if (isFinalised) {
                    JSONObject finaliseObject = new JSONObject(finalised: true)
                    ValidatedParameterMap validatedParams = ParameterValidatorService.validate(finaliseObject as Map, ['finalised'], [])
                    templateTaskPostsService.updatePost(templatePost, validatedParams, task.id, templateId)
                }
            }
        }
    }


    ProjectTemplate importTemplate(Map templateDocument) {
        Organisation communityOrg = organisationService.getOrganisationDAOService().getOrganisation(16)
        return importTemplate(templateDocument, communityOrg)
    }

    ProjectTemplate importTemplate(Map templateDocument, Organisation targetOrg) {
        if(templateDocument.name) {
            ProjectTemplate newTemplate = projectTemplateService.createTemplateFromScratch(templateDocument.name as String)
            if(templateDocument.tasks){
                templateDocument.tasks.each{
                    createTemplate(it as Map,newTemplate.id)
                }
            }
            if(templateDocument.resources){
                templateDocument.resources.each{
                    JSONObject jsonResource = new JSONObject(it)
                    ValidatedParameterMap validatedParams = ParameterValidatorService.validate(jsonResource as Map, [], ['name', 'url', 'image'])
                    templateResourceService.addResourceToTemplate(validatedParams,newTemplate.id)
                }
            }
            newTemplate.isSystemTemplate = false
            newTemplate.organisation = targetOrg
            newTemplate.description = sanitizeTemplateHtml(templateDocument.description as String)
            newTemplate.save(flush:true)
            return newTemplate
        }
        return null
    }

    JSONObject getExportData(Long templateId){
        String domain = configService.getProperty('domain')
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        JSONObject exportData = new JSONObject()
        exportData.put('instance',domain)
        exportData.put('submitterOrgId',currentUser.organisationId)
        exportData.put('submitterId',currentUser.id)
        exportData.put('submittedTemplateId',templateId)
        exportData.put('version',0)
        exportData.put('schemaVersion', 1)
        exportData.put('submissionDate', dateUtilService.getUTCISO8601String(new Date()))
        return exportData
    }

    def getTaskJSON(TaskTemplate taskTemplate){
        def tasks = []
        if(taskTemplate.tasks.size() > 0){
            tasks = taskTemplate.tasks.collect{getTaskJSON(it)}
        }
        def c = new JSON(taskTemplate)
        def cJsonObject  = new JSONObject(c.toString())
        cJsonObject.put('tasks',tasks)
        cJsonObject.put('posts',taskTemplate.posts.collect{new JSON(it)})
        return cJsonObject
    }
}
