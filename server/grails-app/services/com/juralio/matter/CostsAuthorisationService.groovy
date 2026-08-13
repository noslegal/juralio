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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.costs.OtherCost
import com.juralio.costs.ProjectionPeriodService
import com.juralio.costs.RateTableDetailsService
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class CostsAuthorisationService {
    RateTableDetailsService rateTableDetailsService
    InstanceSettingsService instanceSettingsService
    SpringSecurityService springSecurityService
    ProjectionPeriodService projectionPeriodService
    MatterGroupPositionDAOService matterGroupPositionDAOService

    boolean instanceCostsEnabled(Organisation organisation) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled) {
            return true
        } else {
            return false
        }
    }

    boolean organisationCostsEnabled(Organisation organisation) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled && (rateTableDetailsService.organisationPositionRateTableDetails(currentUser.organisation.id, GroupPosition.findByOrganisationAndName(organisation, 'Advisor').id).size() > 0 || OtherCost.findAllByOrganisationAndGroupPosition(currentUser.organisation, GroupPosition.findByOrganisationAndName(organisation, 'Client')).size() > 0)) {
            return true
        } else {
            return false
        }
    }

    boolean organisationCostsEnabledClient(Organisation organisation) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled && OtherCost.findAllByOrganisationAndGroupPosition(currentUser.organisation, GroupPosition.findByOrganisationAndName(organisation, 'Client')).size() > 0) {
            return true
        } else {
            return false
        }
    }

    boolean organisationCostsEnabledAdvisor(Organisation organisation) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled && (rateTableDetailsService.organisationPositionRateTableDetails(currentUser.organisation.id, GroupPosition.findByOrganisationAndName(organisation, 'Advisor').id).size() > 0)) {
            return true
        } else {
            return false
        }
    }


    boolean orgCostsSetupForMatterPosition(AppUser currentUser, Matter matter) {
        //getUsers position in matter
        MatterGroupPosition matterGroupPosition = matterGroupPositionDAOService.getMatterGroupPosition(matter, currentUser.organisationGroup)

        //no position in the matter means no costs-edit access
        if (!matterGroupPosition) return false

        //get the position
        GroupPosition usersPosition = matterGroupPosition.groupPosition

        //if not internal then no costs edit access
        if (!matterGroupPosition.organisationGroup.isInternal) return true

        if (usersPosition.name == 'Client') {
            return instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled && OtherCost.findAllByOrganisationAndGroupPosition(currentUser.organisation, usersPosition).size() > 0
        } else if (usersPosition.name == 'Advisor') {
            return instanceSettingsService.getInstanceSettings().getCostsEnabled() && currentUser.organisation.costsEnabled && rateTableDetailsService.organisationPositionRateTableDetails(currentUser.organisation.id, GroupPosition.findByOrganisationAndName(currentUser.organisation, 'Advisor').id).size() > 0
        }

    }

    // Returns true when the projection period belongs to the given matter.
    boolean checkProjectionPeriodMatter(long projectionPeriodId, long matterId) {
        return projectionPeriodService.getProjectionPeriod(projectionPeriodId).matterId == matterId
    }


}
