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

package com.juralio.organisation

import com.juralio.common.ValidatedParameterMap
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.dto.OrganisationDTO
import com.juralio.organisationgroup.OrganisationGroupService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class SysAdminOrganisationService {

    OrganisationDAOService organisationDAOService
    OrganisationService organisationService
    SysAdminOrganisationService sysAdminOrganisationService
    OrganisationAuthorisationService organisationAuthorisationService
    OrganisationGroupService organisationGroupService

    List<Organisation> listOrganisations() {
        return organisationDAOService.list()
    }

    @CompileDynamic
    boolean isOrgPendingDeletion(Organisation organisation) {
        return DeletedOrganisationLog.findByOrganisationIdAndPermanentlyDeletedIsNull(organisation.id) != null
    }

    @CompileDynamic
    DeletedOrganisationLog getDeletedOrgLog(Organisation organisation) {
        return DeletedOrganisationLog.findByOrganisationId(organisation.id)
    }

    @CompileDynamic
    List<DeletedOrganisationLog> getPermanentlyDeletedOrgLogs() {
        return DeletedOrganisationLog.findAllByPermanentlyDeletedIsNotNull()
    }

    List<OrganisationDTO> listOrganisationSummaries() {
        List<Organisation> organisations = sysAdminOrganisationService.listOrganisations()
        List<OrganisationDTO> organisationDTOList = new ArrayList<OrganisationDTO>()

        List<DeletedOrganisationLog> permanentlyDeletedOrgs = getPermanentlyDeletedOrgLogs()

        permanentlyDeletedOrgs.each { DeletedOrganisationLog deletedOrganisationLog ->
            OrganisationDTO summary = new OrganisationDTO()

            summary.id = deletedOrganisationLog.organisationId as long
            summary.name = deletedOrganisationLog.organisationName
            summary.enabled = false
            summary.activeUserCount = 0
            summary.customLogo = false
            summary.microsoftSsoEnabled = false
            summary.oktaSsoEnabled = false
            summary.googleSsoEnabled = false
            summary.samlSsoEnabled = false
            summary.isFrozen = false
            summary.isPendingDeletion = false
            summary.deletedBy = deletedOrganisationLog.deletedBy
            summary.permanentlyDeleted = deletedOrganisationLog.permanentlyDeleted

            organisationDTOList.add(summary)
        }

        organisations.each { Organisation organisation ->
            OrganisationDTO summary = new OrganisationDTO()

            DeletedOrganisationLog deletedOrganisationLog = getDeletedOrgLog(organisation)

                summary.id = organisation.id as long
                summary.name = organisation.name
                summary.enabled = organisation.enabled
                summary.activeUserCount = organisation.users.findAll { user -> user.enabled }.toList().size()
                summary.customLogo = organisation.logo != null && organisation.logo.length > 0
                summary.microsoftSsoEnabled = organisation.microsoftSsoEnabled
                summary.oktaSsoEnabled = organisation.oktaSsoEnabled
                summary.googleSsoEnabled = organisation.googleSsoEnabled
                summary.samlSsoEnabled = organisation.samlSsoEnabled
                summary.isFrozen = organisation.isFrozen
                if (deletedOrganisationLog && !deletedOrganisationLog.permanentlyDeleted) {
                    summary.isPendingDeletion = true
                    summary.markedForDeletion = deletedOrganisationLog.markedForDeletion
                    summary.deletedBy = deletedOrganisationLog.deletedBy
                }
            organisationDTOList.add(summary)
        }
        return organisationDTOList
    }

    @CompileDynamic
    Organisation save(String name, Boolean mfaEnabled, Object sso) {
        Organisation organisation = new Organisation(name: name, mfaEnabled: mfaEnabled).save()
        OrganisationGroup defaultGroup = organisationGroupService.generateDefaults(organisation)
        if (sso) {
            organisation.microsoftSsoEnabled = sso.microsoftSsoEnabled as boolean
            organisation.oktaSsoEnabled = sso.oktaSsoEnabled as boolean
            organisation.googleSsoEnabled = sso.googleSsoEnabled as boolean
        }
        return organisationDAOService.save(organisation)
    }

    Organisation get(long id) {
        Organisation org = organisationDAOService.getOrganisation(id)
        org.isPendingDeletion = isOrgPendingDeletion(org)
        return org
    }

    def update(long id, ValidatedParameterMap params) {
        organisationService.update(id, params)
    }

    @CompileDynamic
    def saveLogo(long id, byte[] logoBytes, String mimeType) {
        Organisation organisation = organisationDAOService.getOrganisation(id)
        organisation.logo = logoBytes
        organisation.logoMimeType = mimeType
        organisation.save(flush: true)
    }

    @CompileDynamic
    def removeLogo(long id) {
        if (!organisationAuthorisationService.hasLogoRemovalAccess()) {
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(id)
        organisation.logo = null
        organisation.logoMimeType = null
        organisation.save(flush: true)
    }
}
