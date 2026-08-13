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
import com.juralio.task.TaskParentHelperService
import com.juralio.task.status.TaskStatus

class TaskDateTimeHelperService {
    TaskParentHelperService taskParentHelperService

    List<Task> getChildrenByDateAfter(String parentFieldName, Task task, String childFieldName = parentFieldName,Boolean maintainTaskConsistencyUpdate) {
        Date date = task[parentFieldName]
        List<Task> collectChildren = []
        collectChildrenWithBiggerDates(task, childFieldName, date, collectChildren, maintainTaskConsistencyUpdate)

        return collectChildren
    }

    private collectChildrenWithBiggerDates(Task task, String fieldName, Date parentDate, List<Task> childrenWithBiggerDates, Boolean maintainTaskConsistencyUpdate) {
        task.tasks?.each { Task childTask ->
            if (fieldName == 'plannedEndDate' && childTask.status == TaskStatus.DONE.value()) {
                fieldName = 'actualEndDate'
            }
            Date childDate = childTask[fieldName]

            if (parentDate && childDate && childDate.getTime() > parentDate.getTime()) {
                childrenWithBiggerDates.add(childTask)
            }
            if (childrenWithBiggerDates.size() > 0 && !maintainTaskConsistencyUpdate) {
                return childrenWithBiggerDates
            }
            collectChildrenWithBiggerDates(childTask, fieldName, parentDate, childrenWithBiggerDates, maintainTaskConsistencyUpdate)
        }
    }


    List<Task> getParentsByDateBefore(String fieldName, Task task, Boolean maintainTaskConsistencyUpdate, Boolean zeroDates = false) {
        Date date = task[fieldName]
        List<Task> collectParents = []
        collectParentsWithSmallerDates(task, fieldName, date, collectParents, maintainTaskConsistencyUpdate, zeroDates)

        return collectParents
    }


    private collectParentsWithSmallerDates(Task task, String fieldName, Date taskDate, List<Task> parentsWithSmallerDates, Boolean maintainTaskConsistencyUpdate, Boolean zeroDates = false) {
        def parentTask = taskParentHelperService.getParentTask(task.id)

        if (parentTask) {
            if (fieldName == 'plannedEndDate' && parentTask.status == TaskStatus.DONE.value()) {
                fieldName = 'actualEndDate'
            }
            Calendar cal = Calendar.getInstance()

            Date parentDate = parentTask[fieldName]
            if (zeroDates && parentDate) {
                cal.setTime(parentDate)
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                parentDate = cal.getTime()
            }

            cal.setTime(taskDate)
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            Date td = cal.getTime()


            if (td && parentDate && td.getTime() > parentDate.getTime()) {
                parentsWithSmallerDates.add(parentTask)
            }
            if (parentsWithSmallerDates.size() > 0 && !maintainTaskConsistencyUpdate) {
                return parentsWithSmallerDates
            }

            collectParentsWithSmallerDates(parentTask, fieldName, taskDate, parentsWithSmallerDates, maintainTaskConsistencyUpdate, zeroDates)
        }
    }


    private collectParentsWithBiggerDates(Task task, String fieldName, Date taskDate, List<Task> parentsWithBiggerDates, Boolean maintainTaskConsistencyUpdate, Boolean zeroDates = false) {
        def parentTask = taskParentHelperService.getParentTask(task.id)

        if (parentTask && taskDate != null) {
            if (fieldName == 'plannedStartDate' && parentTask.status != TaskStatus.NOT_STARTED.value()) {
                fieldName = 'actualStartDate'
            }
            Calendar cal = Calendar.getInstance()

            Date parentDate = parentTask[fieldName]
            if (zeroDates && parentDate) {
                cal.setTime(parentDate)
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                parentDate = cal.getTime()
            }
            cal.setTime(taskDate)
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            Date td = cal.getTime()

            if (td && parentDate && td.getTime() < parentDate.getTime()) {
                parentsWithBiggerDates.add(parentTask)
            }
            if (parentsWithBiggerDates.size() > 0 && !maintainTaskConsistencyUpdate) {
                return parentsWithBiggerDates
            }
            collectParentsWithBiggerDates(parentTask, fieldName, taskDate, parentsWithBiggerDates, maintainTaskConsistencyUpdate, zeroDates)
        }
    }

    List<Task> getChildrenByDateBefore(String parentFieldName, Task task, String childFieldName = parentFieldName, Boolean maintainTaskConsistency) {
        Date date = task[parentFieldName]
        List<Task> collectChildren = []
        collectChildrenWithSmallerDates(task, childFieldName, date, collectChildren, maintainTaskConsistency)

        return collectChildren
    }

    private collectChildrenWithSmallerDates(Task task, String fieldName, Date parentDate, List<Task> childrenWithSmallerDates, Boolean maintainTaskConsistency) {
        task.tasks?.each { Task childTask ->
            Date childDate = childTask[fieldName]

            if (parentDate && childDate && childDate.getTime() < parentDate.getTime()) {
                childrenWithSmallerDates.add(childTask)
            }
            if (childrenWithSmallerDates.size() > 0 && !maintainTaskConsistency) {
                return childrenWithSmallerDates
            }
            collectChildrenWithSmallerDates(childTask, fieldName, parentDate, childrenWithSmallerDates, maintainTaskConsistency)
        }
    }


    List<Task> getParentsByDateAfter(String fieldName, Task task, Boolean maintainTaskConsistencyUpdate, boolean zeroDates = false) {
        Date date = task[fieldName]
        List<Task> collectParents = []
        collectParentsWithBiggerDates(task, fieldName, date, collectParents, maintainTaskConsistencyUpdate, zeroDates)

        return collectParents
    }

    List<Task> getParentsWithNoDate(String fieldName, Task task, Boolean maintainTaskConsistencyUpdate) {
        Date date = task[fieldName]
        List<Task> collectParents = []
        collectParentsWithNoDates(task, fieldName, date, collectParents, maintainTaskConsistencyUpdate)

        return collectParents
    }


    private collectParentsWithNoDates(Task task, String fieldName, Date taskDate, List<Task> parentsWithNoDates, Boolean maintainTaskConsistencyUpdate) {
        def parentTask = taskParentHelperService.getParentTask(task.id)
        if (parentTask) {
            Date parentDate = parentTask[fieldName]
            if (parentTask && parentDate == null && parentTask.getStatus() == 'not-started') {
                parentsWithNoDates.add(parentTask)
            }
            if (parentsWithNoDates.size() > 0 && !maintainTaskConsistencyUpdate) {
                return parentsWithNoDates
            }
            collectParentsWithNoDates(parentTask, fieldName, taskDate, parentsWithNoDates, maintainTaskConsistencyUpdate)
        }
    }


    List<Task> getMovedTasksParentsByDateAfter(String fieldName, Task parentTask, Task childTask) {
        Date date = childTask[fieldName]
        List<Task> collectParents = []
        collectParentsWithBiggerDates(parentTask, fieldName, date, collectParents, false, false)
        return collectParents
    }


    List<Task> getMovedTasksParentsByDateBefore(String fieldName, Task parentTask, Task childTask) {
        Date date = childTask[fieldName]
        List<Task> collectParents = []
        collectParentsWithSmallerDates(parentTask, fieldName, date, collectParents, false, false)
        return collectParents
    }
}