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
  REQUEST_PROJECTS,
  RECEIVE_PROJECTS_SUCCESS,
  RECEIVE_PROJECTS_FAILURE,
  CREATE_PROJECT_SUCCESS,
  CREATE_PROJECT_FAILURE,
  UPDATE_PROJECT_IN_LIST_SUCCESS,
  RESET_CREATE_VALIDATION,
  RESET_UPDATE_VALIDATION,
} from './projects-actions'
import projectsReducer from './projects-reducer'

describe('projects-reducer.test', () => {
  describe('given no initial state and unknown action', () => {
    let state, output

    beforeEach(() => {
      state = undefined
      output = projectsReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set items empty', () => {
        expect(output.items).toEqual([])
      })

      it('should set meta.isLoaded to false', () => {
        expect(output.meta.isLoaded).toEqual(false)
      })
    })
  })

  describe('given a REQUEST_PROJECTS action', () => {
    let state, output

    beforeEach(() => {
      state = { items: ['Project1'], meta: { isLoaded: true } }
      output = projectsReducer(state, { type: REQUEST_PROJECTS })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ items: ['Project1'], meta: { isLoaded: true } })
    })

    it('next state is set correctly', () => {
      expect(output.items).toEqual(['Project1'])
      expect(output.meta).toEqual({ isLoaded: false })
    })
  })

  describe('given a RECEIVE_PROJECTS_SUCCESS action', () => {
    let state, output

    beforeEach(() => {
      state = { items: ['Project1'] }
      output = projectsReducer(state, {
        type: RECEIVE_PROJECTS_SUCCESS,
        projects: ['Project2'],
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ items: ['Project1'] })
    })

    it('next state is set correctly', () => {
      expect(output.items).toEqual(['Project2'])
      expect(output.meta).toEqual({ isLoaded: true, canViewProjects: true })
    })
  })

  describe('given a RECEIVE_PROJECTS_FAILURE action', () => {
    let state, output

    beforeEach(() => {
      state = { items: ['Project1'], meta: { isLoaded: false } }
      output = projectsReducer(state, {
        type: RECEIVE_PROJECTS_FAILURE,
        projects: ['Project2'],
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ items: ['Project1'], meta: { isLoaded: false } })
    })

    it('next state is set correctly', () => {
      expect(output.items).toEqual([])
      expect(output.meta).toEqual({ isLoaded: true, canViewProjects: false })
    })
  })

  describe('given a CREATE_PROJECT_SUCCESS action', () => {
    let state, output

    beforeEach(() => {
      state = { items: ['Project1'], meta: { isLoaded: true } }
      output = projectsReducer(state, {
        type: CREATE_PROJECT_SUCCESS,
        project: 'Project0',
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ items: ['Project1'], meta: { isLoaded: true } })
    })

    it('next state is set correctly', () => {
      expect(output.items).toEqual(['Project0', 'Project1'])
      expect(output.meta).toEqual({ isLoaded: true })
    })
  })

  describe('given a CREATE_PROJECT_FAILURE action', () => {
    let state, output

    beforeEach(() => {
      state = { items: ['Project1'], meta: { isLoaded: true } }
      output = projectsReducer(state, {
        type: CREATE_PROJECT_FAILURE,
        errorMessage: 'test-error-message',
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ items: ['Project1'], meta: { isLoaded: true } })
    })

    it('next state is set correctly', () => {
      expect(output.items).toEqual(['Project1'])
      expect(output.meta).toEqual({
        isLoaded: true,
        errorMessage: 'test-error-message',
      })
    })
  })

  describe('given an UPDATE_PROJECT_IN_LIST_SUCCESS action', () => {
    let state, output

    beforeEach(() => {
      state = {
        items: [
          { id: 111, name: 'project_a' },
          { id: 222, name: 'project_b' },
        ],
      }
      output = projectsReducer(state, {
        type: UPDATE_PROJECT_IN_LIST_SUCCESS,
        project: { id: 111, name: 'project_a_new_name' },
      })
    })

    it('previous state should not be muted', () => {
      expect(state.items[0]).toEqual({ id: 111, name: 'project_a' })
      expect(state.items[1]).toEqual({ id: 222, name: 'project_b' })
    })

    describe('next state', () => {
      it('should update the name of the first project', () => {
        expect(output.items[0]).toEqual({ id: 111, name: 'project_a_new_name' })
      })

      it('should not update the second project', () => {
        expect(output.items[1]).toEqual({ id: 222, name: 'project_b' })
      })
    })
  })

  describe('given RESET_CREATE_VALIDATION action', () => {
    let state, output

    beforeEach(() => {
      state = { meta: { errorMessage: 'test-error-message' } }
      output = projectsReducer(state, {
        type: RESET_CREATE_VALIDATION,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.meta).toEqual({ errorMessage: 'test-error-message' })
    })

    it('should clear error message in new state', () => {
      expect(output.meta.errorMessage).toEqual('')
    })
  })

  describe('given RESET_UPDATE_VALIDATION action', () => {
    let state, output

    beforeEach(() => {
      state = {
        items: [
          { id: 111, name: 'project_a', errorMessage: 'test-error-message-a' },
          { id: 222, name: 'project_b', errorMessage: 'test-error-message-b' },
        ],
      }
      output = projectsReducer(state, {
        type: RESET_UPDATE_VALIDATION,
        projectId: 111,
      })
    })

    it('previous state should not be mutated', () => {
      expect(state.items[0]).toEqual({
        id: 111,
        name: 'project_a',
        errorMessage: 'test-error-message-a',
      })
      expect(state.items[1]).toEqual({
        id: 222,
        name: 'project_b',
        errorMessage: 'test-error-message-b',
      })
    })

    describe('in next state', () => {
      it('should reset the errorMessage on the first project', () => {
        expect(output.items[0]).toEqual({
          id: 111,
          name: 'project_a',
          errorMessage: undefined,
        })
      })

      it('should not change the second project', () => {
        expect(output.items[1]).toEqual({
          id: 222,
          name: 'project_b',
          errorMessage: 'test-error-message-b',
        })
      })
    })
  })
})
