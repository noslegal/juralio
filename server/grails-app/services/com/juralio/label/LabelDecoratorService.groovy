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

package com.juralio.label

import com.juralio.label.dao.InactiveLabelDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.label.TaskLabel
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class LabelDecoratorService {
    InactiveLabelDAOService inactiveLabelDAOService
    ProjectService projectService
    OrganisationService organisationService


    void decorateLabelWithInactivity(Label label, Long organisationId = null, Long matterId = null) {
        InactiveLabel inactiveLabel = inactiveLabelDAOService.getInactiveLabel(label, organisationId, matterId)
        if (inactiveLabel) {
            label.inactive = true
            label.inactiveSince = inactiveLabel.lastUpdated
            if (inactiveLabel.organisation && inactiveLabel.matterId && matterId) {
                label.inactiveBy = LabelInactiveBy.MATTER.value()
            } else if (inactiveLabel.organisation) {
                label.inactiveBy = LabelInactiveBy.ORGANISATION.value()
            } else {
                label.inactiveBy = LabelInactiveBy.SYSTEM.value()
            }
        } else {
            label.inactive = false
        }
    }

    void decorateWithUsageCount(Label label, long matterId) {
        List<Project> projects = projectService.getProjectsByMatterId(matterId, false, true)
        int count = 0
        for (Project project in projects) {
            for (Task task in (project.tasks as List<Task>)) {
                for (TaskLabel taskLabel in task.labels) {
                    if (taskLabel.label.id == label.id) {
                        count++
                        break
                    }
                }
            }
        }
        label.usageCount = count
    }
}
