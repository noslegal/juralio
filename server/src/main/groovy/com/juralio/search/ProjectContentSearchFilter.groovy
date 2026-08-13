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

import com.juralio.auth.AppUser
import com.juralio.common.DateUtilService
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.project.Project
import com.juralio.task.status.TaskStatus
import grails.plugin.springsecurity.SpringSecurityService
import grails.web.servlet.mvc.GrailsParameterMap
import jakarta.servlet.http.HttpServletRequest
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

class ProjectContentSearchFilter {

    enum TeamSearchType {
        ANYONE, SPECIFIC_USER, NOBODY
    }

    SpringSecurityService springSecurityService
    ErrorResponseHelperService errorResponseHelperService
    DateUtilService dateUtilService

    protected final Log logger = LogFactory.getLog(getClass());

    Boolean completed = null
    Boolean searchPlanned = null
    Boolean searchActual = null
    String searchTerm = null
    List<AppUser> team = []
    Project project = null
    long taskId

    Date deadlineStartDatetime
    Date deadlineEndDatetime
    Date startStartDatetime
    Date startEndDatetime

    TeamSearchType teamSearchType = null
    ProjectContentSearchSortOption sortOption

    GrailsParameterMap params
    HttpServletRequest request

    List errors = []

    final String KEY_PROJECT_ID = "project_id"

    ProjectContentSearchFilter getInstance(GrailsParameterMap params, HttpServletRequest request) {
        ProjectContentSearchFilter filterObject
        filterObject = new ProjectContentSearchFilter()
        filterObject.springSecurityService = this.springSecurityService
        filterObject.errorResponseHelperService = this.errorResponseHelperService
        filterObject.dateUtilService = this.dateUtilService
        filterObject.populateValues(params, request)
        filterObject
    }

    def hasErrors() {
        errors.size() > 0
    }

    def getErrors() {
        errors
    }

    def populateValues(GrailsParameterMap params, HttpServletRequest request) {
        this.params = params
        this.request = request
        setProject()
        setTaskId()
        setStatus()
        setTeamSearchType()
        setTeam()
        setStartStartDate()
        setStartEndDate()
        setDeadlineStartDate()
        setDeadlineEndDate()
        setSearchPlanned()
        setSearchActual()
        setSearchTerm()
        setSearchOption()
    }

    def setProject() {
        if (params.project_id) {
            project = Project.get(params.long(KEY_PROJECT_ID))
        }
    }

    def setTaskId() {
        if (params.task_id) {
            taskId = params.task_id as long
        }
    }

    def setStatus() {
        completed = params.status ? params.status == TaskStatus.DONE.value() : null
    }

    def setTeamSearchType() {
        try {
            teamSearchType = params.teamSearchType
        } catch (IllegalArgumentException e) {
            logger.debug(e);
            teamSearchType = null
        }
    }

    def setTeam() {
        team = params?.team ? AppUser.findAllByUsernameInList([params.team]) : []
    }

    def setDeadlineStartDate() {
        deadlineStartDatetime = params.deadlineStartDatetime ?
                dateUtilService.parseDatetime(params.deadlineStartDatetime) : null
    }

    def setDeadlineEndDate() {
        deadlineEndDatetime = params.deadlineEndDatetime ?
                dateUtilService.parseDatetime(params.deadlineEndDatetime) : null
    }

    def setStartStartDate() {
        startStartDatetime = params.startStartDatetime ?
                dateUtilService.parseDatetime(params.startStartDatetime) : null
    }

    def setStartEndDate() {
        startEndDatetime = params.startEndDatetime ?
                dateUtilService.parseDatetime(params.startEndDatetime) : null
    }

    def setSearchPlanned() {
        searchPlanned = Boolean.parseBoolean(params.searchPlanned)
    }

    def setSearchActual() {
        searchActual = Boolean.parseBoolean(params.searchActual)
    }

    def setSearchTerm() {
        searchTerm = params.searchTerm && params.searchTerm.length() > 0 ? params.searchTerm : null
    }

    def setSearchOption() {
        sortOption = ProjectContentSearchSortOption.getValue(params.sort) ?: ProjectContentSearchSortOption.END_DATE
    }
}
