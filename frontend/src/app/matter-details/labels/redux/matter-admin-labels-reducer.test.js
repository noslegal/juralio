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

import { MatterAdminLabelsActions } from './matter-admin-labels-action-types'
import { getDefaultLabelStructure } from './matter-admin-labels-data-helper'
import matterAdminLabelReducer from './matter-admin-labels-reducer'

describe('matter-admin-labels-reducer', () => {
  describe('When using UNKNOWN action', () => {
    let result, state

    beforeEach(() => {
      state = { mockState: 'DummyValue' }
      result = matterAdminLabelReducer(state, { type: 'UNKNOWN' })
    })

    it('should set areMatterLabelsLoaded to false', () => {
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
      state.labels.risks.bespoke.push({ name: 'mockLabel1' })
      state.labels.workflow.bespoke.push({ name: 'mockLabel2' })

      result = matterAdminLabelReducer(state, {
        type: MatterAdminLabelsActions.ADD_NEW_LABEL,
        label: { name: 'Added label', type: 'risk' },
      })
    })

    it('should add the label to the risk list', () => {
      expect(result.labels.risks.bespoke[0].name).toEqual('Added label')
      expect(result.labels.risks.bespoke[0].type).toEqual('risk')
      expect(result.labels.risks.bespoke.length).toEqual(2)
      expect(result.labels.workflow.bespoke.length).toEqual(1)
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
      state.labels.risks.bespoke.push({ id: 123, name: 'mockLabel1' })
      state.labels.workflow.bespoke.push({ id: 125, name: 'mockLabel2' })

      result = matterAdminLabelReducer(state, {
        type: MatterAdminLabelsActions.UPDATE_LABEL_NAME,
        label: { id: 123, name: 'updated name' },
      })
    })

    it('should add the label to the risk list', () => {
      expect(result.labels.risks.bespoke[0].name).toEqual('updated name')
      expect(result.labels.risks.bespoke.length).toEqual(1)
      expect(result.labels.workflow.bespoke.length).toEqual(1)
    })
  })

  describe('When using RESET_LABELS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        areMatterLabelsLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.bespoke.push({ name: 'mockLabel' })
      state.labels.risks.system.push({ name: 'mockLabel' })
      state.labels.workflow.bespoke.push({ name: 'mockLabel' })
      state.labels.workflow.system.push({ name: 'mockLabel' })

      result = matterAdminLabelReducer(state, {
        type: MatterAdminLabelsActions.RESET_LABELS,
      })
    })

    it('should set areMatterLabelsLoaded to false', () => {
      expect(result.areMatterLabelsLoaded).toEqual(false)
    })

    it('should clear the list of labels', () => {
      expect(result.labels.risks.bespoke.length).toEqual(0)
      expect(result.labels.risks.system.length).toEqual(0)
      expect(result.labels.workflow.bespoke.length).toEqual(0)
      expect(result.labels.workflow.system.length).toEqual(0)
      expect(result.labels.totalCount).toEqual(0)
    })
  })

  describe('When using RECEIVE_MATTER_LABELS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        areMatterLabelsLoaded: false,
        labels: getDefaultLabelStructure(),
      }

      result = matterAdminLabelReducer(state, {
        type: MatterAdminLabelsActions.RECEIVE_MATTER_LABELS,
        allLabels: [
          { system: true, type: 'risk', inactive: false },
          { system: false, type: 'risk', inactive: false },
          { system: true, type: 'workflow', inactive: false },
          { system: true, type: 'workflow', inactive: false },
          { system: false, type: 'risk', inactive: false },
          { system: true, type: 'workflow', inactive: false },
        ],
      })
    })

    it('should set areMatterLabelsLoaded to true', () => {
      expect(result.areMatterLabelsLoaded).toEqual(true)
    })

    it('should sort the list of labels into the appropriate categories', () => {
      expect(result.labels.risks.bespoke.length).toEqual(0)
      expect(result.labels.risks.system.length).toEqual(1)
      expect(result.labels.workflow.bespoke.length).toEqual(0)
      expect(result.labels.workflow.system.length).toEqual(3)
    })
  })

  describe('When using UPDATE_LABEL_STATUS action', () => {
    let result, state

    beforeEach(() => {
      state = {
        areMatterLabelsLoaded: true,
        labels: getDefaultLabelStructure(),
      }
      state.labels.risks.system.push(
        { id: 1, inactive: true },
        { id: 2, inactive: true }
      )

      result = matterAdminLabelReducer(state, {
        type: MatterAdminLabelsActions.UPDATE_LABEL_STATUS,
        labelId: 1,
        inactive: false,
      })
    })

    it("should invert a label's inactive property", () => {
      expect(result.labels.risks.system[0].inactive).toEqual(false)
    })

    it("should not change a label's inactive property if it doesn't match the id", () => {
      expect(result.labels.risks.system[1].inactive).toEqual(true)
    })
  })
})
