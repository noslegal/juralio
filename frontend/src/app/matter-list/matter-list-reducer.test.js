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

import { deepCopy } from '../../services/helpers/object-helper'
import {
  MATTER_LIST_RESET_STATE,
  RECEIVE_MATTERS,
  RECEIVE_PROJECTS_SUCCESS,
  REQUEST_MATTERS,
  REQUEST_PROJECTS,
} from './matter-list-actions'
import matterListReducer from './matter-list-reducer'

describe('matter-list-reducer', () => {
  let state, action, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = matterListReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set matters as an empty array', () => {
        expect(output.matters).toEqual([])
      })

      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toEqual(false)
      })

      it('should only have five properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })
  })

  describe('given MATTER_LIST_RESET_STATE action', () => {
    beforeEach(() => {
      state = { matters: ['Matter1'] }
      output = matterListReducer(state, { type: MATTER_LIST_RESET_STATE })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ matters: ['Matter1'] })
    })

    it('next state is reset', () => {
      expect(output.matters).toEqual([])
    })
  })

  describe('given a REQUEST_MATTERS action', () => {
    beforeEach(() => {
      state = { matters: ['Matter1'] }
      output = matterListReducer(state, { type: REQUEST_MATTERS })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ matters: ['Matter1'] })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({ isLoading: true, matters: ['Matter1'] })
    })
  })

  describe('given a RECEIVE_MATTERS action', () => {
    beforeEach(() => {
      state = { matters: ['Matter1'], isLoaded: false }
      output = matterListReducer(state, {
        type: RECEIVE_MATTERS,
        matters: ['Matter2', 'Matter3'],
      })
    })

    it('previous state is not mutated', () => {
      expect(state.matters).toEqual(['Matter1'])
      expect(state.isLoaded).toEqual(false)
    })

    describe('the next state', () => {
      it('should set matters as the payload matters from the action', () => {
        expect(output.matters).toEqual(['Matter2', 'Matter3'])
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toEqual(true)
      })

      it('should only have two properties', () => {
        expect(Object.keys(output).length).toEqual(3)
      })
    })
  })

  describe('given a REQUEST_PROJECTS action', () => {
    const action = {
      type: REQUEST_PROJECTS,
    }

    it('the new state should continue to include other non-matter properties', () => {
      const output = matterListReducer(
        { nonMatterProp: 'non_matter_prop', matters: [] },
        action
      )
      expect(output).toEqual({ nonMatterProp: 'non_matter_prop', matters: [] })
    })

    describe('when the action matterId matches no matters in state', () => {
      let initialState, output
      const matter1 = { id: 'matter1' }
      const matter2 = { id: 'matter2' }

      beforeEach(() => {
        initialState = { matters: [matter1, matter2] }
        output = matterListReducer(initialState, { ...action, matterId: 123 })
      })

      it('number of matters should still be 2', () => {
        expect(output.matters.length).toEqual(2)
      })

      it('matter 1 should not have been changed', () => {
        expect(output.matters[0]).toEqual(matter1)
      })

      it('matter 2 should not have been changed', () => {
        expect(output.matters[1]).toEqual(matter2)
      })

      it('matters array reference should not be the same', () => {
        expect(output.matters).not.toBe(initialState.matters)
      })
    })

    describe('when the action matterId matches a matter in state', () => {
      let initialState, output
      const matter1 = { id: 'matter1' }
      const matter2 = { id: 123 }

      beforeEach(() => {
        initialState = { matters: [matter1, matter2] }
        output = matterListReducer(initialState, { ...action, matterId: 123 })
      })

      it('number of matters should still be 2', () => {
        expect(output.matters.length).toEqual(2)
      })

      it('matter 1 should not have been changed', () => {
        expect(output.matters[0]).toEqual(matter1)
      })

      it('matter 2 should have the "isLoaded" property set to false', () => {
        expect(output.matters[1].projects).toEqual({ isLoaded: false })
      })

      it('matters array reference should not be the same', () => {
        expect(output.matters).not.toBe(initialState.matters)
      })
    })
  })

  describe('given a RECEIVE_PROJECTS_SUCCESS action', () => {
    describe('when the matters in state contain the matter id in the action', () => {
      let inputState

      beforeEach(() => {
        action = {
          type: RECEIVE_PROJECTS_SUCCESS,
          matterId: 456,
          projects: ['text_a', 'text_b'],
        }
        state = {
          matters: [
            {
              id: 123,
              projects: { items: [], isLoaded: 'mock_loaded_initial' },
            },
            {
              id: 456,
              projects: { items: [], isLoaded: 'mock_loaded_initial' },
            },
          ],
        }

        inputState = deepCopy(state)
        output = matterListReducer(inputState, action)
      })

      it('previous state is not mutated', () => {
        expect(inputState).toEqual(state)
      })

      describe('the new state', () => {
        it('should not update the wrong matters state', () => {
          expect(output.matters[0].projects.items.length).toEqual(0)
          expect(output.matters[0].projects.isLoaded).toEqual(
            'mock_loaded_initial'
          )
        })

        it('should update state on the correct matter', () => {
          expect(output.matters[1].projects.isLoaded).toEqual(true)
          expect(output.matters[1].projects.items.length).toEqual(2)
          expect(output.matters[1].projects.items[0]).toEqual('text_a')
          expect(output.matters[1].projects.items[1]).toEqual('text_b')
        })

        it('should not mutate the projects in action', () => {
          expect(output.matters[1].projects.items).not.toBe(action.projects)
        })
      })
    })
  })
})
