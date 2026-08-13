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

package com.juralio.task.datetime

import com.juralio.task.Task
import com.juralio.task.datetime.exception.*
import com.juralio.task.status.TaskStatus

class TaskDateTimeService {

    TaskDateTimeHelperService taskDateTimeHelperService

    int maintainAEDConsistency(Task task, Date originalActualEndDate, boolean maintainTaskConsistencyUpdate) throws TaskDateTimeException {
        int updatedTaskCount = 0

        if ((task.plannedEndDate && task.status == TaskStatus.NOT_STARTED.value()) && !task.actualEndDate) {
            List<Task> parentsWithAEDBefore = taskDateTimeHelperService.getParentsByDateBefore("plannedEndDate", task, maintainTaskConsistencyUpdate, true)
            if (parentsWithAEDBefore.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
        }


        if (task.actualEndDate == null) {
            return updatedTaskCount
        } //if task has no AED jump out before doing any  checks

        //checks internal logic for actual dates
        if (task.actualStartDate && task.actualStartDate > task.actualEndDate) {
            task.discard()
            throw new DateBoundaryException()
        }
        if (task.actualEndDate && task.actualEndDate != originalActualEndDate) {
            List<Task> childrenAEDAfterParent = taskDateTimeHelperService.getChildrenByDateAfter("actualEndDate", task, "actualEndDate", maintainTaskConsistencyUpdate)
            if (childrenAEDAfterParent.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            List<Task> parentsWithAEDBefore = taskDateTimeHelperService.getParentsByDateBefore("actualEndDate", task, maintainTaskConsistencyUpdate)

            if (parentsWithAEDBefore.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            if (maintainTaskConsistencyUpdate) {
                childrenAEDAfterParent.each { Task child ->
                    if (child.actualStartDate > task.actualEndDate) {
                        child.actualStartDate = task.actualEndDate
                    }
                    child.actualEndDate = task.actualEndDate
                    child.save(flush: true, failOnError: true)
                }


                updatedTaskCount += childrenAEDAfterParent.size()
            }
        }

        return updatedTaskCount
    }


    int maintainPEDConsistency(Task task, Date originalPlannedEndDate, boolean maintainTaskConsistencyUpdate) throws TaskDateTimeException {
        int updatedTaskCount = 0
        if (task.plannedEndDate == null || task.actualEndDate != null) {
            return updatedTaskCount
        } //jump out if task has no PED

        //internal logic check for planned dates
        Calendar cal = Calendar.getInstance()
        Date startDate = task.actualStartDate ? task.actualStartDate : task.plannedStartDate
        if (task.actualStartDate || task.plannedStartDate) {
            cal.setTime(task.actualStartDate ? task.actualStartDate : task.plannedStartDate)
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            startDate = cal.getTime()
        }
        cal.setTime(task.plannedEndDate)
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date ped = cal.getTime()


        if (startDate && startDate > ped && !task.actualStartDate) { // check they're the same day
            task.discard()
            throw new DateBoundaryException()
        }
        if (task.plannedEndDate && task.plannedEndDate != originalPlannedEndDate) {
            List<Task> childrenPEDAfterParent = taskDateTimeHelperService.getChildrenByDateAfter("plannedEndDate", task, "plannedEndDate", maintainTaskConsistencyUpdate)
            if (childrenPEDAfterParent.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            List<Task> childrenASDAfterParentPED = taskDateTimeHelperService.getChildrenByDateAfter("plannedEndDate", task, "actualStartDate", maintainTaskConsistencyUpdate)
            if (childrenASDAfterParentPED.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            List<Task> parentPEDBeforeChild = taskDateTimeHelperService.getParentsByDateBefore("plannedEndDate", task, maintainTaskConsistencyUpdate)
            if (parentPEDBeforeChild.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            if (maintainTaskConsistencyUpdate) {
                childrenPEDAfterParent.each { Task child ->
                    if (child.actualStartDate && child.actualStartDate > task.plannedEndDate) {
                        child.actualStartDate = task.plannedEndDate
                    } else if (child.plannedStartDate && child.plannedStartDate > task.plannedEndDate) {
                        child.plannedStartDate = task.plannedEndDate
                    }

                    if (child.actualEndDate) {
                        child.actualEndDate = task.plannedEndDate
                    } else {
                        child.plannedEndDate = task.plannedEndDate
                    }
                    child.save(flush: true, failOnError: true)
                }
                childrenASDAfterParentPED.each { Task child ->
                    child.actualStartDate = task.plannedEndDate
                    child.save(flush: true, failOnError: true)
                }
                updatedTaskCount += childrenASDAfterParentPED.size()


                updatedTaskCount += childrenPEDAfterParent.size()
            }
        }

        return updatedTaskCount
    }

    int maintainASDConsistency(Task task, Date originalActualStartDate, boolean maintainTaskConsistencyUpdate) throws TaskDateTimeException {
        int updatedTaskCount = 0

        if ((task.plannedStartDate && task.status == TaskStatus.NOT_STARTED.value()) && !task.actualStartDate) {
            List<Task> parentsWithASDAfter = taskDateTimeHelperService.getParentsByDateAfter("plannedStartDate", task, maintainTaskConsistencyUpdate, true)
            if (parentsWithASDAfter.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
        }
        if (task.actualStartDate == null) {
            return updatedTaskCount
        } // jumps out if task has no ASD

        //internal logic for actual dates
        if (task.actualEndDate && task.actualStartDate > task.actualEndDate) {
            task.discard()
            throw new DateBoundaryException()
        }
        if (task.actualStartDate && task.actualStartDate != originalActualStartDate) {
            List<Task> childrenASDBeforeParent = taskDateTimeHelperService.getChildrenByDateBefore("actualStartDate", task, maintainTaskConsistencyUpdate)
            if (childrenASDBeforeParent.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            List<Task> childrenPSDBeforeParentASD = taskDateTimeHelperService.getChildrenByDateBefore("actualStartDate", task, "plannedStartDate", maintainTaskConsistencyUpdate)
            if (childrenPSDBeforeParentASD.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }

            List<Task> parentsASDAfterChild = taskDateTimeHelperService.getParentsByDateAfter("actualStartDate", task, maintainTaskConsistencyUpdate)

            if (parentsASDAfterChild.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }


            if (maintainTaskConsistencyUpdate) {

                childrenASDBeforeParent.each { Task child ->
                    child.actualStartDate = task.actualStartDate
                    if (child.actualEndDate && child.actualEndDate < child.actualStartDate) {
                        child.actualEndDate = child.actualStartDate
                    }
                    child.save(flush: true, failOnError: true)
                }

                childrenPSDBeforeParentASD.each { Task child ->
                    child.plannedStartDate = task.actualStartDate
                    child.save(flush: true, failOnError: true)
                }

                updatedTaskCount += childrenASDBeforeParent.size()
                updatedTaskCount += childrenPSDBeforeParentASD.size()
            }
        }


        return updatedTaskCount
    }


    void wipeInconsistentDatesWhenChangingStatus(Task task) {
        if (task.status == TaskStatus.NOT_STARTED.value()) {
            if (task.plannedStartDate) {
                List<Task> childrenPSDBeforeParent = taskDateTimeHelperService.getChildrenByDateBefore("plannedStartDate", task, true)
                if (childrenPSDBeforeParent.size() > 0) {
                    task.plannedStartDate = null
                    task.save()
                    if (childrenPSDBeforeParent.size() > 1) {
                        childrenPSDBeforeParent.each { wipeInconsistentDatesWhenChangingStatus(it) }
                    }

                } else { //do we need to do this?
                    List<Task> parentsPSDAfterChild = taskDateTimeHelperService.getParentsByDateAfter("plannedStartDate", task, true)
                    if (parentsPSDAfterChild.size() > 0) {
                        task.plannedStartDate = null
                        task.save()

                    }
                }
            }
            if (task.plannedEndDate) {
                List<Task> childrenPEDAfterParent = taskDateTimeHelperService.getChildrenByDateAfter("plannedEndDate", task, "plannedEndDate", true)
                if (childrenPEDAfterParent.size() > 0) {
                    task.plannedEndDate = null
                    task.save()

                    if (childrenPEDAfterParent.size() > 1) {
                        childrenPEDAfterParent.each { wipeInconsistentDatesWhenChangingStatus(it) }
                    }

                } else {
                    List<Task> parentsPEDAfterChild = taskDateTimeHelperService.getParentsByDateBefore("plannedEndDate", task, true)
                    if (parentsPEDAfterChild.size() > 0) {
                        task.plannedEndDate = null
                        task.save()

                    }


                }
            }
        } else if (task.status == TaskStatus.IN_PROGRESS.value()) {
            if (task.plannedEndDate) {
                List<Task> childrenPEDAfterParent = taskDateTimeHelperService.getChildrenByDateAfter("plannedEndDate", task, "plannedEndDate", true)
                if (childrenPEDAfterParent.size() > 0) {
                    task.plannedEndDate = null
                    task.save()

                    if (childrenPEDAfterParent.size() > 1) {
                        childrenPEDAfterParent.each { wipeInconsistentDatesWhenChangingStatus(it) }
                    }

                } else {
                    List<Task> parentsPEDAfterChild = taskDateTimeHelperService.getParentsByDateBefore("plannedEndDate", task, true)
                    if (parentsPEDAfterChild.size() > 0) {
                        task.plannedEndDate = null
                        task.save()

                    }


                }
            }
        }
    }

    int maintainPSDConsistency(Task task, Date originalPlannedStartDate, boolean maintainTaskConsistencyUpdate) throws TaskDateTimeException {
        int updatedTaskCount = 0
        if (task.plannedStartDate == null || task.actualStartDate != null) {

            return updatedTaskCount
        }//jumps out if task has no PSD

        //internal logic for planned dates
        Date startDate = task.actualStartDate ? task.actualStartDate : task.plannedStartDate
        if (task.plannedEndDate && startDate > task.plannedEndDate) {
            task.discard()
            throw new DateBoundaryException()
        }
        if (task.plannedStartDate && task.plannedStartDate != originalPlannedStartDate) {
            List<Task> childrenPSDBeforeParent = taskDateTimeHelperService.getChildrenByDateBefore("plannedStartDate", task, maintainTaskConsistencyUpdate)
            if (childrenPSDBeforeParent.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }
            List<Task> parentsPSDAfterChild = taskDateTimeHelperService.getParentsByDateAfter("plannedStartDate", task, maintainTaskConsistencyUpdate, true)
            if (parentsPSDAfterChild.size() > 0 && !maintainTaskConsistencyUpdate) {
                task.discard()
                throw new DateConsistencyException()
            }

            if (maintainTaskConsistencyUpdate) {
                childrenPSDBeforeParent.each { Task child ->
                    child.plannedStartDate = task.plannedStartDate
                    if (child.plannedEndDate && child.plannedEndDate < task.plannedStartDate) {
                        child.plannedEndDate = task.plannedStartDate
                    }
                    child.save(flush: true, failOnError: true)
                }

                updatedTaskCount += childrenPSDBeforeParent.size()
            }
        }

        return updatedTaskCount
    }

    def checkInProgressASDIsNotLaterThanDoneAED(Task task, Boolean maintainTaskConsistency) throws TaskDateTimeException {
        if (task.status == TaskStatus.IN_PROGRESS.value()) {
            List<Task> childrenAEDBeforeParent = taskDateTimeHelperService.getChildrenByDateBefore("actualStartDate", task, "actualEndDate", maintainTaskConsistency)
            if (childrenAEDBeforeParent.size() > 0 && !maintainTaskConsistency) {
                throw new DateConsistencyException()
            }
        }
    }
}
