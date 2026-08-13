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
import projectService from '../../services/project/project-service'
import {
  fetchProject,
  RECEIVE_PROJECT_FAILURE,
  RECEIVE_PROJECT_SUCCESS,
  REQUEST_PROJECT,
} from './project-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('project-actions', () => {
  describe('fetchProjectDetails', () => {
    describe('on success', () => {
      let actions
      const mockFetchedProject = 'mock_fetched_project'

      beforeEach(() => {
        projectService.getProject = jest.fn().mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.OK,
            body: mockFetchedProject,
          })
        )
        const store = mockStore({})

        return store
          .dispatch(
            fetchProject(123, 456, { someQueryParam: 'someQueryParam' })
          )
          .then(() => {
            actions = store.getActions()
          })
      })

      it('should call getProject with two id parameters', () => {
        expect(projectService.getProject).toHaveBeenCalledWith(123, 456, {
          someQueryParam: 'someQueryParam',
        })
      })
      it('should have a REQUEST_PROJECT action', () => {
        expect(actions[0].type).toEqual(REQUEST_PROJECT)
      })
      it('should have a RECEIVE_PROJECT_SUCCESS action', () => {
        expect(actions[1].type).toEqual(RECEIVE_PROJECT_SUCCESS)
      })
      it('should have a project', () => {
        expect(actions[1].project).toEqual(mockFetchedProject)
      })

      it('should have a matter id', () => {
        expect(actions[1].matterId).toEqual(123)
      })
    })

    describe('on failure', () => {
      let actions
      beforeEach(() => {
        projectService.getProject = jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ status: StatusCodes.FORBIDDEN })
          )

        const store = mockStore({})
        return store.dispatch(fetchProject(123, 456)).then(() => {
          actions = store.getActions()
        })
      })

      it('should call getProject with two id parameters', () => {
        expect(projectService.getProject).toHaveBeenCalledWith(
          123,
          456,
          undefined
        )
      })
      it('should have a REQUEST_PROJECT action', () => {
        expect(actions[0].type).toEqual(REQUEST_PROJECT)
      })
      it('should have a RECEIVE_PROJECT_FAILURE action', () => {
        expect(actions[1].type).toEqual(RECEIVE_PROJECT_FAILURE)
      })
    })
  })
})
