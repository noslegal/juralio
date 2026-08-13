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

package com.juralio.label.dao

import com.juralio.label.InactiveLabel
import com.juralio.label.Label
import com.juralio.label.LabelService
import com.juralio.matter.MatterService
import com.juralio.matter.dao.MatterDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class InactiveLabelDAOService {
    MatterService matterService
    MatterDAOService matterDAOService
    OrganisationDAOService organisationDAOService
    ProjectService projectService
    LabelDAOService labelDaoService
    LabelService labelService

    @CompileDynamic
    InactiveLabel getInactiveLabel(Label label, Long organisationId = null, Long matterId = null) {
        InactiveLabel matterInactive
        InactiveLabel orgInactive
        InactiveLabel systemInactive = InactiveLabel.class.findByLabelAndOrganisationAndMatter(label, null, null)
        if (systemInactive) {
            return systemInactive
        }
        if (organisationId) {
            Organisation organisation = organisationDAOService.getOrganisation(organisationId)
            orgInactive = InactiveLabel.class.findByLabelAndOrganisationAndMatter(label, organisation, null)
            if (orgInactive) {
                return orgInactive
            }
        }
        if (matterId) {
            matterInactive = InactiveLabel.class.findByLabelAndMatter(label, matterDAOService.get(matterId))
            if (matterInactive) {
                return matterInactive
            }
        }

        return systemInactive
    }

    Label setInactiveOrganisationLabel(Long labelId, Label label, Long organisationId, Boolean inactive) {
        if (label == null) {
            label = Label.get(labelId)
        }

        if (inactive) {
            InactiveLabel inactiveLabel = new InactiveLabel()
            inactiveLabel.label = label
            if (organisationId != null) {
                Organisation organisation = organisationDAOService.getOrganisation(organisationId)
                inactiveLabel.organisation = organisation
            }
            save(inactiveLabel)
        } else {
            InactiveLabel inactiveLabel = getInactiveLabel(label, organisationId)
            if (inactiveLabel != null) {
                inactiveLabel.delete()
            }
        }

        return label
    }

    void setInactiveMatterLabel(Label label, Long organisationId, Long matterId, Boolean inactive) {
        if (inactive) {
            InactiveLabel inactiveLabel = new InactiveLabel()
            inactiveLabel.label = label
            if (matterId != null) {
                inactiveLabel.matter = matterDAOService.get(matterId)
            }
            inactiveLabel.organisation = organisationDAOService.getOrganisation(organisationId)
            save(inactiveLabel)

        } else {
            InactiveLabel inactiveLabel = getInactiveLabel(label, organisationId, matterId)
            inactiveLabel.delete()
        }
    }

    InactiveLabel save(InactiveLabel inactiveLabel) {
        inactiveLabel.save(failOnError: true)
        return inactiveLabel
    }
}