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
  getPrivilegedAndConfidentialText,
  getProjectReferenceAndName,
  getTaskStatusText,
} from './report-text-helpers'

describe('report-text-helper', () => {
  const mockProject = { name: 'mockProject', referenceNumber: 'P1234' }
  let result

  describe('getProjectReferenceAndName', () => {
    beforeEach(() => {
      result = getProjectReferenceAndName(mockProject)
    })
    it('format the name and refernce number', () => {
      expect(result).toEqual('P1234 - mockProject')
    })
  })

  describe('getTaskStatusText', () => {
    beforeEach(() => {
      result = getTaskStatusText(id => id, { status: 'done' })
    })
    it('returns the expected status id', () => {
      expect(result).toEqual('taskStatus.done')
    })
  })

  describe('getPrivilegedAndConfidentialText', () => {
    beforeEach(() => {
      result = getPrivilegedAndConfidentialText(id => id)
    })
    it('returns the expected id', () => {
      expect(result).toEqual('exports.common.privilegedAndConfidential')
    })
  })
})
