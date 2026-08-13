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

package com.juralio.task.labels

import com.juralio.auth.BaseAuthorisationService
import com.juralio.auth.ReadAuthorisation
import com.juralio.auth.UpdateAuthorisation
import com.juralio.label.LabelAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.TaskAuthorisationService
import grails.gorm.transactions.Transactional

@Transactional
class TaskLabelAuthorisationService extends BaseAuthorisationService implements ReadAuthorisation, UpdateAuthorisation {

    TaskAuthorisationService taskAuthorisationService
    LabelAuthorisationService labelAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    ProjectService projectService

    @Override
    boolean hasReadAccess(Long entityId) {
        return false
    }

    boolean hasReadAccess(Long taskId, Long labelId) {
        boolean hasTaskReadAccess = taskAuthorisationService.hasReadAccess(taskId)
        if (hasTaskReadAccess) {
            return labelAuthorisationService.hasReadAccess(labelId)
        }
        return false
    }

    @Override
    boolean hasUpdateAccess(Long entityId) {
        return false
    }

    boolean hasUpdateAccess(Long projectId, Long taskId, Long labelId) {
        boolean hasTaskUpdateAccess = taskAuthorisationService.hasWriteAccess(taskId, projectId)
        if (hasTaskUpdateAccess) {
            return labelAuthorisationService.hasUpdateAccess(labelId)
        }
        return false
    }

    boolean hasDeleteAccess(Long projectId, Long taskId, Long labelId) {
        Project project = projectService.getProject(projectId)
        if(!taskAuthorisationService.hasReadAccess(taskId)){
            return false
        }
        boolean isMatterAdmin = matterAuthorisationService.hasUpdateAccess(project.matterId)
        if (isMatterAdmin) {
            return true
        } else {
            return hasUpdateAccess(projectId, taskId, labelId)
        }
    }
}
