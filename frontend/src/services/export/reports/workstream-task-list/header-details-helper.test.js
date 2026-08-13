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
  getCountDetails,
  getWorkstreamLabel,
  getWorkstreamName,
} from './header-details-helper'

const mockTranslation = id => id

describe('getWorkstreamName', () => {
  it('Single workstream', () => {
    const result = getWorkstreamName(mockTranslation, { numProjects: 1 }, {})
    expect(result).toBe('')
  })
  it('Multiple workstream', () => {
    const result = getWorkstreamName(
      mockTranslation,
      { numProjects: 4 },
      { name: 'Workstream Name Mock' }
    )
    expect(result).toBe('Workstream Name Mock')
  })
})

describe('getWorkstreamLabel', () => {
  it('Single workstream', () => {
    const result = getWorkstreamLabel(mockTranslation, { numProjects: 1 }, {})
    expect(result).toBe('')
  })
  it('Multiple workstream', () => {
    const result = getWorkstreamLabel(
      mockTranslation,
      { numProjects: 4 },
      { referenceNumber: 'PWorkstream Ref No' }
    )
    expect(result).toBe('entity.workstream Workstream Ref No:')
  })
})

describe('getCountDetails', () => {
  it('Zero state check', () => {
    const result = getCountDetails(mockTranslation, {
      notStartedCount: 0,
      inProgressCount: 0,
      doneCount: 0,
    })
    expect(result.notStartedCount).toBe('exports.common.noNotStartedTasks')
    expect(result.inProgressCount).toBe('exports.common.noInProgressTasks')
    expect(result.completedCount).toBe('exports.common.noCompletedTasks')
    expect(result.totalCount).toBe('0 exports.common.tasksInTotal')
  })

  it('Total of 1 uses the singular string', () => {
    const result = getCountDetails(mockTranslation, {
      notStartedCount: 1,
      inProgressCount: 0,
      doneCount: 0,
    })
    expect(result.notStartedCount).toBe('1 taskstatus.not-started')
    expect(result.inProgressCount).toBe('exports.common.noInProgressTasks')
    expect(result.completedCount).toBe('exports.common.noCompletedTasks')
    expect(result.totalCount).toBe('exports.common.oneTaskInTotal')
  })

  it('Total is derived from the status counts, excluding not-required', () => {
    const result = getCountDetails(mockTranslation, {
      notRequiredCount: 100,
      notStartedCount: 6,
      inProgressCount: 7,
      doneCount: 15,
    })
    expect(result.notStartedCount).toBe('6 taskstatus.not-started')
    expect(result.inProgressCount).toBe('7 taskstatus.in-progress')
    expect(result.completedCount).toBe('15 exports.common.completed')
    expect(result.totalCount).toBe('28 exports.common.tasksInTotal')
  })
})
