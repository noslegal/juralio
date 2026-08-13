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

package com.juralio.task.label


import com.juralio.label.Label
import com.juralio.label.LabelModifier
import com.juralio.task.Task

class TaskLabel {
    String modifier

    static belongsTo = [label: Label, task: Task]
    static constraints = {
        modifier nullable: true, validator: { colour, taskLabel ->
            if (taskLabel.label.type != 'risk' && colour != null) {
                return false
            }
            if (taskLabel.label.type == 'risk' && colour == null) {
                return true
            }
            return LabelModifier.getAllValues().contains(colour)
        }
    }
}
