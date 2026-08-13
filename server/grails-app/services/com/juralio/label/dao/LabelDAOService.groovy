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

import com.juralio.label.CannotFindLabelException
import com.juralio.label.Label
import com.juralio.matter.Matter
import com.juralio.matter.dao.MatterDAOService
import com.juralio.organisation.Organisation
import com.juralio.task.label.TaskLabel
import grails.gorm.transactions.Transactional

@Transactional
class LabelDAOService {
    InactiveLabelDAOService inactiveLabelDAOService
    MatterDAOService matterDAOService

    Label findLabel(Long labelId) {
        return Label.class.findById(labelId)
    }

    List<Label> findSystemLevelLabels() {
        return Label.class.findAllByOrganisationAndMatter(null, null)
    }

    List<Label> findActiveSystemLevelLabels() {
        List<Label> labels = Label.class.findAllByOrganisationAndMatter(null, null)
        return labels.findAll { Label label -> inactiveLabelDAOService.getInactiveLabel(label, null, null) == null }

    }

    List<Label> findOrganisationLevelLabels(Organisation organisation) {
        return Label.class.findAllByOrganisation(organisation)
    }

    List<Label> findActiveOrganisationLevelLabels(Organisation organisation) {
        List<Label> labels = Label.class.findAllByOrganisation(organisation)
        return labels.findAll { Label label -> inactiveLabelDAOService.getInactiveLabel(label, organisation.id, null) == null }
    }

    List<Label> findMatterLevelLabels(Long matterId) {
        Matter matter = Matter.findById(matterId)
        return Label.class.findAllByMatter(matter)
    }

    List<Label> findOrganisationLevelAndAboveLabels(Organisation organisation) {
        List<Label> organisationLabels = findOrganisationLevelLabels(organisation)
        List<Label> systemLabels = findSystemLevelLabels()
        return organisationLabels + systemLabels
    }

    List<Label> findActiveOrganisationLevelAndAboveLabels(Organisation organisation) {
        List<Label> organisationLabels = findActiveOrganisationLevelLabels(organisation)
        List<Label> systemLabels = findActiveSystemLevelLabels()
        return organisationLabels + systemLabels
    }

    List<Label> findMatterLevelAndAboveLabels(Organisation organisation, Long matterId) {
        List<Label> organisationAndSystemLabels = findActiveOrganisationLevelAndAboveLabels(organisation)
        List<Label> matterLabels = findMatterLevelLabels(matterId)
        return organisationAndSystemLabels + matterLabels
    }

    Label findOrganisationLabel(Long organisationId, Long labelId) throws CannotFindLabelException {
        Label foundLabel = Label.class.findById(labelId)
        if (foundLabel == null || (foundLabel.organisationId != null && foundLabel.organisationId != organisationId)) {
            throw new CannotFindLabelException()
        } else {
            return foundLabel
        }
    }

    Label findMatterLabel(Long matterId, Long labelId) throws CannotFindLabelException {
        Label foundLabel = Label.class.findById(labelId)
        if (foundLabel == null || (foundLabel.matter != null && foundLabel.matter.id != matterId)) {
            throw new CannotFindLabelException()
        } else {
            return foundLabel
        }
    }

    Label save(Label label) {
        label.save(failOnError: true)
        return label
    }

    List<Label> findMatterLevelLabelsWithTheSameName(Integer organisationId, String type, String name) {
        List<Integer> matterIds = matterDAOService.getMattersForUser()
        List<Label> labels = Label.findAllByMatterInListAndTypeAndName(matterIds, type, name)
        return labels
    }

    List<TaskLabel> findTaskLabelsForListOfLabels(List<Label> labels) {
        List<TaskLabel> taskLabels = TaskLabel.findAllByLabelInList(labels)
        return taskLabels
    }
}
