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

package com.juralio.task

import com.juralio.task.status.TaskStatus

import java.time.LocalDate

class TaskDatesService {

    def updateActualDates(task) {
        updateStartDate(task)
        updateEndDate(task)
    }

    private def updateStartDate(Task task) {
        if (shouldRemoveActualStartDate(task)) {
            task.actualStartDate = null
        } else if (shouldPopulateActualStartDate(task)) {
            task.actualStartDate =Date.from(LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault()).toInstant())  //new Date()

        }
    }

    private def updateEndDate(Task task) {
        if (shouldRemoveActualEndDate(task)) {
            task.actualEndDate = null
        } else if (shouldPopulateActualEndDate(task)) {
            task.actualEndDate = Date.from(LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault()).plusHours(23).plusMinutes(59).toInstant())
        }
    }

    private def shouldRemoveActualStartDate(task) {
        if (TaskStatus.NOT_STARTED.value() == task.status) {
            return true
        }

        return false
    }

    private def shouldRemoveActualEndDate(task) {
        if (TaskStatus.DONE.value() != task.status) {
            return true
        }

        return false
    }

    private def shouldPopulateActualStartDate(task) {
        if ([TaskStatus.NOT_STARTED.value(), TaskStatus.NOT_REQUIRED.value()].contains(task.previousStatus) &&
                !task.actualStartDate) {
            return true
        }

        return false
    }

    private def shouldPopulateActualEndDate(task) {
        if (TaskStatus.DONE.value() == task.status &&
                !task.actualEndDate) {
            return true
        }

        return false
    }
}
