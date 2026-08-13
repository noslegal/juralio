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

import * as underTest from './filter-tasks'
import { TASK_STATUS } from '../../../app/constants'

let tasks = []
let done = false
let notStarted = false

describe('softFilterTasks', () => {
  describe('when filtering out not started tasks', () => {
    tasks = [
      {
        status: TASK_STATUS.DONE,
        tasks: [{ status: TASK_STATUS.DONE }],
      },
      {
        status: TASK_STATUS.IN_PROGRESS,
        tasks: [{ status: TASK_STATUS.DONE }],
      },
      {
        status: TASK_STATUS.IN_PROGRESS,
        tasks: [
          {
            status: TASK_STATUS.IN_PROGRESS,
            tasks: [{ status: TASK_STATUS.DONE }],
          },
        ],
      },
      {
        status: TASK_STATUS.IN_PROGRESS,
        tasks: [
          {
            status: TASK_STATUS.IN_PROGRESS,
            tasks: [
              {
                status: TASK_STATUS.IN_PROGRESS,
                tasks: [
                  { status: TASK_STATUS.DONE },
                  { status: TASK_STATUS.IN_PROGRESS },
                  { status: TASK_STATUS.NOT_STARTED },
                ],
              },
            ],
          },
        ],
      },
    ]
    done = true
    notStarted = false

    it('the not started tasks are filtered out and children of the not started tasks', () => {
      let expected = [
        {
          filteredOut: false,
          status: TASK_STATUS.DONE,
          tasks: [{ filteredOut: false, status: TASK_STATUS.DONE }],
        },
        {
          filteredOut: false,
          status: TASK_STATUS.IN_PROGRESS,
          tasks: [{ filteredOut: false, status: TASK_STATUS.DONE }],
        },
        {
          filteredOut: false,
          status: TASK_STATUS.IN_PROGRESS,
          tasks: [
            {
              filteredOut: false,
              status: TASK_STATUS.IN_PROGRESS,
              tasks: [{ filteredOut: false, status: TASK_STATUS.DONE }],
            },
          ],
        },
        {
          filteredOut: false,
          status: TASK_STATUS.IN_PROGRESS,
          tasks: [
            {
              filteredOut: false,
              status: TASK_STATUS.IN_PROGRESS,
              tasks: [
                {
                  filteredOut: false,
                  status: TASK_STATUS.IN_PROGRESS,
                  tasks: [
                    { filteredOut: false, status: TASK_STATUS.DONE },
                    { filteredOut: false, status: TASK_STATUS.IN_PROGRESS },
                    { filteredOut: true, status: TASK_STATUS.NOT_STARTED },
                  ],
                },
              ],
            },
          ],
        },
      ]
      underTest.softFilterTasks(tasks, done, notStarted)
      expect(tasks).toStrictEqual(expected)
    })
  })
})
