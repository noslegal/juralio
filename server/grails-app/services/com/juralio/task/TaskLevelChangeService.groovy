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

import grails.gorm.transactions.Transactional

@Transactional
class TaskLevelChangeService {

    void applyOffset(def task, Short offset) {
        task.level = (task.level + offset) as Short
    }

    void updateLevel(def task, Long level) {
        task.level = level
        updateLevelForChildTask(task, level)
    }

    private void updateLevelForChildTask(def task, Long level) {
        task.level = level

        if (task.tasks) {
            for (def childTask : task.tasks) {
                updateLevelForChildTask(childTask, level + 1)
            }
        }
    }
}
