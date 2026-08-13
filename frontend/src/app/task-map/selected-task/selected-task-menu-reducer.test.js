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

import {
  ARCHIVE_TASK,
  ARCHIVE_TASK_SUCCESS,
} from './selected-task-menu-actions'
import selectedTaskMenuReducer from './selected-task-menu-reducer'

describe('selected-task-menu-reducer.test', () => {
  let state, output

  describe('given a ARCHIVE_TASK action', () => {
    beforeEach(() => {
      state = { archiveComplete: false }
      output = selectedTaskMenuReducer(state, { type: ARCHIVE_TASK })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ archiveComplete: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        archiveComplete: false,
      })
    })
  })

  describe('given a ARCHIVE_TASK_SUCCESS action', () => {
    beforeEach(() => {
      state = { archiveComplete: false }
      output = selectedTaskMenuReducer(state, {
        type: ARCHIVE_TASK_SUCCESS,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ archiveComplete: false })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        archiveComplete: true,
      })
    })
  })
})
