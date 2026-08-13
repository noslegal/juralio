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

import labelReducer from './labels-reducer'
import { LabelsActions } from './labels-action-types'
import { getDefaultLabelStructure } from './labels-data-helper'

describe('labels-reducer.test', () => {
  describe('When using UNKNOWN action', () => {
    let result, state

    beforeEach(() => {
      state = { mockState: 'DummyValue' }
      result = labelReducer(state, { type: 'UNKNOWN' })
    })

    it('should set isLoaded to false', () => {
      expect(result.mockState).toEqual('DummyValue')
    })
  })

  describe('When using ADD_NEW_LABEL action', () => {
    let result, state

    beforeEach(() => {
      state = {
        isLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.organisation.push({ name: 'mockLabel1' })
      state.labels.workflow.organisation.push({ name: 'mockLabel2' })

      result = labelReducer(state, {
        type: LabelsActions.ADD_NEW_LABEL,
        label: { name: 'Added label', type: 'risk' },
      })
    })

    it('should add the label to the risk list', () => {
      expect(result.labels.risks.organisation[0].name).toEqual('Added label')
      expect(result.labels.risks.organisation[0].type).toEqual('risk')
      expect(result.labels.risks.organisation.length).toEqual(2)
      expect(result.labels.workflow.organisation.length).toEqual(1)
      expect(result.labels.totalCount).toEqual(3)
    })
  })

  describe('When using UPDATE_LABEL_NAME action', () => {
    let result, state

    beforeEach(() => {
      state = {
        isLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.organisation.push({ id: 123, name: 'mockLabel1' })
      state.labels.workflow.organisation.push({ id: 125, name: 'mockLabel2' })

      result = labelReducer(state, {
        type: LabelsActions.UPDATE_LABEL_NAME,
        label: { id: 123, name: 'updated name' },
      })
    })

    it('should add the label to the risk list', () => {
      expect(result.labels.risks.organisation[0].name).toEqual('updated name')
      expect(result.labels.risks.organisation.length).toEqual(1)
      expect(result.labels.workflow.organisation.length).toEqual(1)
    })
  })

  describe('When using RESET_LABELS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        isLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.organisation.push({ name: 'mockLabel' })
      state.labels.risks.system.push({ name: 'mockLabel' })
      state.labels.workflow.organisation.push({ name: 'mockLabel' })
      state.labels.workflow.system.push({ name: 'mockLabel' })

      result = labelReducer(state, { type: LabelsActions.RESET_LABELS })
    })

    it('should set isLoaded to false', () => {
      expect(result.isLoaded).toEqual(false)
    })

    it('should clear the list of labels', () => {
      expect(result.labels.risks.organisation.length).toEqual(0)
      expect(result.labels.risks.system.length).toEqual(0)
      expect(result.labels.workflow.organisation.length).toEqual(0)
      expect(result.labels.workflow.system.length).toEqual(0)
      expect(result.labels.totalCount).toEqual(0)
    })
  })

  describe('When using RECEIVE_ALL_LABELS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        isLoaded: false,
        labels: getDefaultLabelStructure(),
      }

      result = labelReducer(state, {
        type: LabelsActions.RECEIVE_ALL_LABELS,
        allLabels: [
          { system: true, type: 'risk', inactive: false },
          { organisation: true, type: 'risk', inactive: false },
          { system: true, type: 'workflow', inactive: false },
          { system: true, type: 'workflow', inactive: false },
          { organisation: true, type: 'risk', inactive: false },
          { system: true, type: 'workflow', inactive: false },
        ],
      })
    })

    it('should set isLoaded to true', () => {
      expect(result.isLoaded).toEqual(true)
    })

    it('should sort the list of labels into the appropriate categories', () => {
      expect(result.labels.risks.organisation.length).toEqual(2)
      expect(result.labels.risks.system.length).toEqual(1)
      expect(result.labels.workflow.organisation.length).toEqual(0)
      expect(result.labels.workflow.system.length).toEqual(3)
    })
  })

  describe('When using UPDATE_LABEL_STATUS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        isLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.organisation.push(
        { id: 1, inactive: false },
        { id: 2, inactive: false }
      )

      result = labelReducer(state, {
        type: LabelsActions.UPDATE_LABEL_STATUS,
        labelId: 1,
        inactive: true,
      })
    })

    it('should leave only the label with id of 2 in the list', () => {
      expect(result.labels.risks.organisation[0].id).toEqual(2)
      expect(result.labels.risks.organisation[0].inactive).toEqual(false)
    })
  })
})
