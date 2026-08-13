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

import { TASK_STATUS } from '../../../../app/constants'

export const getCompletionDisplayDate = task => {
  if (task.actualEndDate) return task.actualEndDate
  if (task.plannedEndDate) return task.plannedEndDate
  return '-'
}

export const getDisplayDate = task => {
  if (task.status === TASK_STATUS.NOT_STARTED) {
    return task.plannedStartDate ? task.plannedStartDate : null
  } else if (task.status === TASK_STATUS.IN_PROGRESS) {
    return task.actualStartDate ? task.actualStartDate : null
  } else if (task.status === TASK_STATUS.DONE) {
    return task.actualEndDate ? task.actualEndDate : null
  }
}
