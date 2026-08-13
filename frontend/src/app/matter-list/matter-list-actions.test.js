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
import projectService from '../../services/project/project-service'
import {
  cleanState,
  fetchMatters,
  fetchProjects,
  MATTER_LIST_RESET_STATE,
  RECEIVE_PROJECTS_SUCCESS,
  REQUEST_MATTERS,
  REQUEST_PROJECTS,
} from './matter-list-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('matter-list-actions.test', () => {
  describe('cleanState', () => {
    let store, actions

    beforeEach(done => {
      store = mockStore({})
      store.dispatch(cleanState())
      actions = store.getActions()
      done()
    })

    it('should dispatch MATTER_LIST_RESET_STATE', () => {
      expect(actions[0].type).toEqual(MATTER_LIST_RESET_STATE)
    })
  })

  describe('fetchMatters', () => {
    const mockMatters = [
      { matterStatus: 'active', activities: [] },
      { matterStatus: 'closed', activities: [] },
      { matterStatus: 'closed', activities: ['MATTER_ADMIN'] },
    ]

    beforeEach(() => {
      matterService.getMatters = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ body: mockMatters }))
    })

    it('should dispatch requestMatters and receiveMatters on successful fetch request', () => {
      const store = mockStore({})

      return store.dispatch(fetchMatters()).then(() => {
        const actions = store.getActions()
        expect(matterService.getMatters).toHaveBeenCalled()
        expect(actions[0].type).toEqual(REQUEST_MATTERS)
      })
    })
  })

  describe('fetchProjects', () => {
    const projects = 'mock_projects'

    beforeEach(() => {
      projectService.getProjectsByMatterId = jest.fn().mockReturnValueOnce(
        Promise.resolve({
          header: { status: StatusCodes.OK },
          body: projects,
        })
      )
    })

    it('should dispatch requestProjects and receiveProjects on successful fetch request', () => {
      const store = mockStore({})
      const matter = { id: 'test_matter_001' }

      return store.dispatch(fetchProjects(matter)).then(() => {
        const actions = store.getActions()
        expect(projectService.getProjectsByMatterId).toHaveBeenCalledWith(
          matter.id
        )
        expect(actions[0].type).toEqual(REQUEST_PROJECTS)
        expect(actions[0].matterId).toEqual(matter.id)

        expect(actions[1].type).toEqual(RECEIVE_PROJECTS_SUCCESS)
        expect(actions[1].projects).toEqual(projects)
      })
    })
  })
})
