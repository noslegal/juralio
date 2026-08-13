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

import { StatusCodes } from 'http-status-codes'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import matterService from '../../services/matter/matter-service'
import {
  fetchMatterDetails,
  RECEIVE_MATTER_DETAILS_FAILURE,
  RECEIVE_MATTER_DETAILS_SUCCESS,
  REQUEST_MATTER_DETAILS,
  updateMatterDetails,
  UPDATE_MATTER,
} from './matter-details-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('matter-details-actions', () => {
  describe('fetchMatterDetails', () => {
    describe('on success', () => {
      let actions
      const mockfetchedMatter = 'mock_fetched_matter'

      beforeEach(() => {
        matterService.getMatter = jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ status: StatusCodes.OK, body: mockfetchedMatter })
          )
        const store = mockStore({})

        return store.dispatch(fetchMatterDetails(123)).then(() => {
          actions = store.getActions()
        })
      })

      it('should call getMatter with an id parameter', () => {
        expect(matterService.getMatter).toHaveBeenCalledWith(123)
      })
      it('should have a REQUEST_MATTER_DETAILS action', () => {
        expect(actions[0].type).toEqual(REQUEST_MATTER_DETAILS)
      })
      it('should have a RECEIVE_MATTER_DETAILS_SUCCESS action', () => {
        expect(actions[1].type).toEqual(RECEIVE_MATTER_DETAILS_SUCCESS)
      })
      it('should have a matter', () => {
        expect(actions[1].matter).toEqual(mockfetchedMatter)
      })
    })

    describe('on failure', () => {
      let actions
      beforeEach(() => {
        matterService.getMatter = jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ status: StatusCodes.FORBIDDEN })
          )

        const store = mockStore({})
        return store.dispatch(fetchMatterDetails(123)).then(() => {
          actions = store.getActions()
        })
      })

      it('should call getMatter with an id parameter', () => {
        expect(matterService.getMatter).toHaveBeenCalledWith(123)
      })
      it('should have a REQUEST_MATTER_DETAILS action', () => {
        expect(actions[0].type).toEqual(REQUEST_MATTER_DETAILS)
      })
      it('should have a RECEIVE_MATTER_DETAILS_FAILURE action', () => {
        expect(actions[1].type).toEqual(RECEIVE_MATTER_DETAILS_FAILURE)
      })
    })
  })

  describe('updateMatterDetails', () => {
    describe('on success', () => {
      let store, actions
      const mockfetchedMatter = 'mock_fetched_matter'
      const data = { clientName: 'test_client_name_update' }

      beforeEach(done => {
        matterService.updateMatter = jest.fn().mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.OK,
            body: mockfetchedMatter,
          })
        )

        store = mockStore({})
        store.dispatch(updateMatterDetails(123, data)).then(() => {
          actions = store.getActions()
          done()
        })
      })

      it('should call updateMatter with an id and a data object', () => {
        expect(matterService.updateMatter).toHaveBeenCalledWith(123, data)
      })

      it('should have an action of UPDATE_MATTER', () => {
        expect(actions[0].type).toEqual(UPDATE_MATTER)
      })

      it('should have an action of RECEIVE_MATTER_DETAILS_SUCCESS', () => {
        expect(actions[1].type).toEqual(RECEIVE_MATTER_DETAILS_SUCCESS)
      })
    })

    describe('on failure', () => {
      let store, actions
      beforeEach(done => {
        matterService.updateMatter = jest.fn().mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.FORBIDDEN,
          })
        )

        store = mockStore({})
        store.dispatch(updateMatterDetails(123)).then(() => {
          actions = store.getActions()
          done()
        })
      })

      it('should call updateMatter with an id and an undefined data object', () => {
        expect(matterService.updateMatter).toHaveBeenCalledWith(123, undefined)
      })

      it('should have an action of UPDATE_MATTER', () => {
        expect(actions[0].type).toEqual(UPDATE_MATTER)
      })

      it('should have an action of RECEIVE_MATTER_DETAILS_FAILURE', () => {
        expect(actions[1].type).toEqual(RECEIVE_MATTER_DETAILS_FAILURE)
      })
    })
  })
})
