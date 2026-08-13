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

import { CircularProgress } from '@mui/material'
import React from 'react'

export const loadingComponent = (
  <div
    style={{
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CircularProgress size={200} />
  </div>
)

export const getTasks = task => {
  if (!task) return
  let tasks = task.tasks || []
  if (tasks.length) {
    tasks.forEach(task => (task.taskId = task.id))
  }
  if (task.tasks && task.tasks.length) {
    let subTasks = task.tasks.map(t => getTasks(t))
    tasks = tasks.concat(subTasks).flat()
  }
  return tasks
}
