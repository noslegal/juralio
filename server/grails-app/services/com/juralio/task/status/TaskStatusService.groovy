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

package com.juralio.task.status

import com.juralio.auth.AppUser
import com.juralio.costs.CostsService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.task.Task
import com.juralio.task.status.exception.*
import grails.plugin.springsecurity.SpringSecurityService

import java.time.LocalDate

class TaskStatusService {

    TaskStatusHelperService taskStatusHelperService
    SpringSecurityService springSecurityService
    CostsAuthorisationService costsAuthorisationService
    CostsService costsService
    MatterAuthorisationService matterAuthorisationService


    int maintainStatusConsistency(Task task, boolean maintainTaskConsistencyUpdate) throws TaskStatusException {
        List<Task> notStartedParents = [], doneParents = [], notDoneChildren = [], activeAndDoneChildren = [], doneChildren = []
        List<Task> notRequiredParents = [], notRequiredChildren = []
        def statusChangeCount = 0

        if (TaskStatus.NOT_STARTED.value() == task.previousStatus) {
            notStartedParents = taskStatusHelperService.getParentsInStatus(task, task.previousStatus, false)
        }

        if (TaskStatus.NOT_REQUIRED.value() == task.previousStatus) {
            notRequiredParents = taskStatusHelperService.getParentsInStatus(task, task.previousStatus, false)
            notRequiredChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.NOT_REQUIRED])
            doneParents = taskStatusHelperService.getParentsInStatus(task, TaskStatus.DONE.value(), false)
            if (task.status != TaskStatus.NOT_STARTED.value()) {
                notStartedParents = taskStatusHelperService.getParentsInStatus(task, TaskStatus.NOT_STARTED.value(), false)
            }
        }

        if (TaskStatus.DONE.value() == task.previousStatus) {
            doneParents = taskStatusHelperService.getParentsInStatus(task, task.previousStatus, false)
        }

        if (TaskStatus.DONE.value() == task.status) {
            notDoneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS])
        }

        if (TaskStatus.NOT_STARTED.value() == task.status) {
            activeAndDoneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.IN_PROGRESS, TaskStatus.DONE])
        }

        if (TaskStatus.NOT_STARTED.value() == task.status && TaskStatus.DONE.value() == task.previousStatus) {
            doneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.DONE])
        }

        if (maintainTaskConsistencyUpdate) {
            notStartedParents.each { parent ->
                parent.status = TaskStatus.IN_PROGRESS.value()
                parent.actualStartDate = Date.from(LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant())
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
                AppUser currentUser = springSecurityService.getCurrentUser()
                if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && parent.level==1 as short) {
                    costsService.isValidRemoveFromProjectionPeriods(parent)
                }
            }

            doneParents.each { parent ->
                parent.status = TaskStatus.IN_PROGRESS.value()
                parent.actualEndDate = null
                parent.plannedEndDate = null
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notDoneChildren.each { child ->
                child.status = TaskStatus.DONE.value()
                if (!child.actualStartDate) {
                    child.actualStartDate = new Date()
                }
                child.actualEndDate = new Date()
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            activeAndDoneChildren.each { child ->
                child.status = TaskStatus.NOT_STARTED.value()
                child.actualStartDate = null
                child.actualEndDate = null
                child.plannedStartDate = null
                child.plannedEndDate = null
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notRequiredParents.each { parent ->
                parent.status = task.status
                if(parent.status == TaskStatus.DONE.value()){
                    if(!parent.actualEndDate) {
                        parent.actualEndDate = new Date()
                    }
                    if(!parent.actualStartDate) {
                        parent.actualStartDate = new Date()
                    }
                }
                if(parent.status == TaskStatus.IN_PROGRESS.value() && !parent.actualStartDate){
                    parent.actualStartDate = new Date()
                }
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notRequiredChildren.each { child ->
                child.status = task.status
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }
        } else if (notRequiredParents.size() > 0 && notRequiredChildren.size() == 0) {
            task.discard()
            throw new HasNotRequiredParents()
        } else if (notRequiredParents.size() == 0 && notRequiredChildren.size() > 0) {
            task.discard()
            throw new HasNotRequiredChildren()
        } else if (notRequiredParents.size() > 0 && notRequiredChildren.size() > 0) {
            task.discard()
            throw new HasNotRequiredParentsAndChildren()
        } else if (notStartedParents.size() > 0 && notDoneChildren.size() > 0) {
            task.discard()
            throw new HasNotStartedParentsAndNotDoneChildren()
        } else if (doneParents.size() > 0 && doneChildren.size() > 0) {
            task.discard()
            throw new HasDoneParentsAndDoneChildren()
        } else if (notStartedParents.size() > 0) {
            task.discard()
            throw new HasNotStartedParents()
        } else if (doneParents.size() > 0) {
            task.discard()
            throw new HasDoneParents()
        } else if (notDoneChildren.size() > 0) {
            task.discard()
            throw new HasNotDoneChildren()
        } else if (activeAndDoneChildren.size() > 0) {
            task.discard()
            throw new HasActiveAndDoneChildren()
        }
        log.debug("statusChangeCount ${statusChangeCount}")
        statusChangeCount
    }


    ArrayList findStatusConsistencyIssues(Task task, boolean maintainTaskConsistencyUpdate, boolean parentStatusOverride = false) {
        List<Task> notStartedParents = [], doneParents = [], notDoneChildren = [], activeAndDoneChildren = [], doneChildren = []
        List<Task> notRequiredParents = [], notRequiredChildren = []
        def previousStatus = task.previousStatus
        if (parentStatusOverride) {
            previousStatus = task.parent.status
        }
        def statusChangeCount = 0

        if (TaskStatus.NOT_STARTED.value() == previousStatus) {
            notStartedParents = taskStatusHelperService.getParentsInStatus(task, previousStatus, parentStatusOverride).findAll { it.status != task.status }
        }

        if (TaskStatus.NOT_REQUIRED.value() == previousStatus) {
            notRequiredParents = taskStatusHelperService.getParentsInStatus(task, previousStatus, parentStatusOverride).findAll { it.status != task.status }
            notRequiredChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.NOT_REQUIRED]).findAll { it.status != task.status }
            doneParents = taskStatusHelperService.getParentsInStatus(task, TaskStatus.DONE.value(), parentStatusOverride)
            if (task.status != TaskStatus.NOT_STARTED.value()) {
                notStartedParents = taskStatusHelperService.getParentsInStatus(task, TaskStatus.NOT_STARTED.value(), parentStatusOverride).findAll { it.status != task.status }
            }
        }

        if (TaskStatus.DONE.value() == previousStatus) {
            doneParents = taskStatusHelperService.getParentsInStatus(task, previousStatus, parentStatusOverride).findAll { it.status != task.status }
        }

        if (TaskStatus.DONE.value() == task.status) {
            notDoneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS]).findAll { it.status != task.status }
        }

        if (TaskStatus.NOT_STARTED.value() == task.status) {
            activeAndDoneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.IN_PROGRESS, TaskStatus.DONE]).findAll { it.status != task.status }
        }

        if (TaskStatus.NOT_STARTED.value() == task.status && TaskStatus.DONE.value() == previousStatus) {
            doneChildren = taskStatusHelperService.getChildrenInStatuses(task, [TaskStatus.DONE]).findAll { it.status != task.status }
        }

        if (maintainTaskConsistencyUpdate) {
            notStartedParents.each { parent ->
                parent.status = TaskStatus.IN_PROGRESS.value()
                parent.actualStartDate = new Date()
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            doneParents.each { parent ->
                parent.status = TaskStatus.IN_PROGRESS.value()
                parent.actualEndDate = null
                parent.plannedEndDate = null
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notDoneChildren.each { child ->
                child.status = TaskStatus.DONE.value()
                if (!child.actualStartDate) {
                    child.actualStartDate = new Date()
                }
                child.actualEndDate = new Date()
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            activeAndDoneChildren.each { child ->
                child.status = TaskStatus.NOT_STARTED.value()
                child.actualStartDate = null
                child.actualEndDate = null
                child.plannedStartDate = null
                child.plannedEndDate = null
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notRequiredParents.each { parent ->
                parent.status = task.status
                parent.save(flush: true, failOnError: true)
                statusChangeCount++
            }

            notRequiredChildren.each { child ->
                child.status = task.status
                child.save(flush: true, failOnError: true)
                statusChangeCount++
            }
        } else if (notRequiredParents.size() > 0 && notRequiredChildren.size() == 0) {
            task.discard()
            return notRequiredParents
        } else if (notRequiredParents.size() == 0 && notRequiredChildren.size() > 0) {
            task.discard()
            return notRequiredChildren
        } else if (notRequiredParents.size() > 0 && notRequiredChildren.size() > 0) {
            task.discard()
            return notRequiredChildren + notRequiredParents
        } else if (notStartedParents.size() > 0 && notDoneChildren.size() > 0) {
            task.discard()
            return notStartedParents + notDoneChildren
        } else if (doneParents.size() > 0 && doneChildren.size() > 0) {
            task.discard()
            return doneParents + doneChildren
        } else if (notStartedParents.size() > 0) {
            task.discard()
            return notStartedParents
        } else if (doneParents.size() > 0) {
            task.discard()
            return doneParents
        } else if (notDoneChildren.size() > 0) {
            task.discard()
            return notDoneChildren
        } else if (activeAndDoneChildren.size() > 0) {
            task.discard()
            return activeAndDoneChildren
        }
        log.debug("statusChangeCount ${statusChangeCount}")
        task.discard()
        return []
    }
}
