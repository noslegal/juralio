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

import { sortLabels, sortByRisk, getHighestRisk } from './task-label-helpers'
const unsortedLabels = [
  { name: 'workflow 2', type: 'workflow' },
  { name: 'risk A', type: 'risk' },
  { name: 'user def 1', type: 'user_defined' },
  { name: 'risk B', type: 'risk' },
  { name: 'user def A', type: 'user_defined' },
  { name: 'workflow 1', type: 'workflow' },
]
const sortedLabels = [
  { name: 'workflow 1', type: 'workflow' },
  { name: 'workflow 2', type: 'workflow' },
  { name: 'risk A', type: 'risk' },
  { name: 'risk B', type: 'risk' },
  { name: 'user def 1', type: 'user_defined' },
  { name: 'user def A', type: 'user_defined' },
]

const unsortedRiskLabels = [
  { name: 'risk A', type: 'risk', modifier: 'amber' },
  { name: 'risk B', type: 'risk', modifier: 'green' },
  { name: 'risk C', type: 'risk', modifier: 'amber' },
  { name: 'risk D', type: 'risk', modifier: 'red' },
]
const sortedRiskLabels = [
  { name: 'risk D', type: 'risk', modifier: 'red' },
  { name: 'risk A', type: 'risk', modifier: 'amber' },
  { name: 'risk C', type: 'risk', modifier: 'amber' },
  { name: 'risk B', type: 'risk', modifier: 'green' },
]
describe('task-label-helper', () => {
  describe('when sorting a list of labels', () => {
    it('should sort by workflow, risk ,user defined, then by name', () => {
      expect(unsortedLabels.sort(sortLabels)).toEqual(sortedLabels)
    })
  })
  describe('when sorting a list of risklabels', () => {
    it('should sort risk', () => {
      expect(unsortedRiskLabels.sort(sortByRisk)).toEqual(sortedRiskLabels)
    })
  })
  describe('when getting the riskiest label', () => {
    it('should return a red label', () => {
      expect(getHighestRisk(unsortedRiskLabels)).toEqual(sortedRiskLabels[0])
      expect(getHighestRisk(unsortedRiskLabels).modifier).toEqual('red')
    })
  })
})
