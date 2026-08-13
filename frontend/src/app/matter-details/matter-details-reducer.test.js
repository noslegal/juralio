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

import { OPERATION_MODE } from '../constants'
import {
  RECEIVE_MATTER_DETAILS_FAILURE,
  RECEIVE_MATTER_DETAILS_SUCCESS,
  REQUEST_MATTER_DETAILS,
  UPDATE_MATTER,
} from './matter-details-actions'
import matterDetailsReducer from './matter-details-reducer'

describe('matter-details-reducer.test', () => {
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = matterDetailsReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set matter to null', () => {
        expect(output.matter).toBeUndefined()
      })

      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toEqual(false)
      })

      it('should only have three properties', () => {
        expect(Object.keys(output).length).toEqual(4)
      })
    })
  })

  describe('given a REQUEST_MATTER_DETAILS action', () => {
    beforeEach(() => {
      state = { matter: 'Matter1' }
      output = matterDetailsReducer(state, { type: REQUEST_MATTER_DETAILS })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ matter: 'Matter1' })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        matter: 'Matter1',
        isLoaded: false,
        isForbidden: false,
      })
    })
  })

  describe('given a RECEIVE_MATTER_DETAILS_SUCCESS action', () => {
    describe('and the user is a Matter Admin', () => {
      beforeEach(() => {
        state = { matter: 'Matter1', isLoaded: false }
        output = matterDetailsReducer(state, {
          type: RECEIVE_MATTER_DETAILS_SUCCESS,
          matter: {
            name: 'Matter2',
            activities: ['MATTER_ADMIN'],
          },
        })
      })

      it('previous state is not mutated', () => {
        expect(state.matter).toEqual('Matter1')
        expect(state.isLoaded).toEqual(false)
      })

      describe('the next state', () => {
        it('should set matter as the payload matter from the action', () => {
          expect(output.matter.name).toEqual('Matter2')
          expect(output.matter.activities).toEqual(['MATTER_ADMIN'])
        })

        it('should set isLoaded to true', () => {
          expect(output.isLoaded).toEqual(true)
        })

        it('should set mode to Edit', () => {
          expect(output.mode).toEqual(OPERATION_MODE.EDIT)
        })

        it('should only have three properties', () => {
          expect(Object.keys(output).length).toEqual(3)
        })
      })
    })

    describe('and the user is not a Matter Admin', () => {
      beforeEach(() => {
        state = { matter: 'Matter1', isLoaded: false }
        output = matterDetailsReducer(state, {
          type: RECEIVE_MATTER_DETAILS_SUCCESS,
          matter: {
            name: 'Matter2',
            activities: [],
          },
        })
      })

      it('previous state is not mutated', () => {
        expect(state.matter).toEqual('Matter1')
        expect(state.isLoaded).toEqual(false)
      })

      describe('the next state', () => {
        it('should set matter as the payload matter from the action', () => {
          expect(output.matter.name).toEqual('Matter2')
          expect(output.matter.activities).toEqual([])
        })

        it('should set isLoaded to true', () => {
          expect(output.isLoaded).toEqual(true)
        })

        it('should set mode to VIEW', () => {
          expect(output.mode).toEqual(OPERATION_MODE.VIEW)
        })

        it('should only have three properties', () => {
          expect(Object.keys(output).length).toEqual(3)
        })
      })
    })
  })

  describe('given a RECEIVE_MATTER_DETAILS_FAILURE action', () => {
    beforeEach(() => {
      state = { matter: 'Matter1', isLoaded: false }
      output = matterDetailsReducer(state, {
        type: RECEIVE_MATTER_DETAILS_FAILURE,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.matter).toEqual('Matter1')
      expect(state.isLoaded).toEqual(false)
    })

    describe('the next state', () => {
      it('should not change the matter in state', () => {
        expect(output.matter).toEqual('Matter1')
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toEqual(true)
      })

      it('should set isForbidden to true', () => {
        expect(output.isForbidden).toEqual(true)
      })

      it('should only have three properties', () => {
        expect(Object.keys(output).length).toEqual(3)
      })
    })
  })

  describe('given a UPDATE_MATTER action', () => {
    beforeEach(() => {
      state = {
        matter: { name: 'Matter1', clientName: 'OldClient' },
        isLoaded: false,
      }
      output = matterDetailsReducer(state, {
        type: UPDATE_MATTER,
        payload: { data: { clientName: 'NewClient' } },
      })
    })

    it('previous state is not mutated', () => {
      expect(state.matter).toEqual({ name: 'Matter1', clientName: 'OldClient' })
      expect(state.isLoaded).toEqual(false)
    })

    describe('the next state', () => {
      it('should merge the updated data into matter', () => {
        expect(output.matter).toEqual({
          name: 'Matter1',
          clientName: 'NewClient',
        })
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toEqual(true)
      })

      it('should set isForbidden to false', () => {
        expect(output.isForbidden).toEqual(false)
      })

      it('should only have three properties', () => {
        expect(Object.keys(output).length).toEqual(3)
      })
    })
  })
})
