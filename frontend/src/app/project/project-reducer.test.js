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
  CLEAR_EDITING,
  CLEAR_PROJECT,
  CLEAR_PROJECT_OVERVIEW,
  DISABLE_IMMEDIATE_ADD_PROJECT,
  ENABLE_IMMEDIATE_ADD_PROJECT,
  ENTER_DESCRIPTION_EDITING_PROJECT,
  ENTER_NAME_EDITING_PROJECT,
  RECEIVE_PROJECT_FAILURE,
  RECEIVE_PROJECT_OVERVIEW_SUCCESS,
  RECEIVE_PROJECT_SUCCESS,
  REQUEST_PROJECT,
  UPDATE_PROJECT_SUCCESS,
  RECEIVE_NEW_TASKS_SUCCESS,
  RECEIVE_NEW_TASKS_FAILURE,
  REQUEST_NEW_TASKS,
} from './project-actions'

import projectReducer from './project-reducer'

describe('project-reducer.test', () => {
  let state, output

  describe('given a ENABLE_IMMEDIATE_ADD_PROJECT action', () => {
    beforeEach(() => {
      state = {
        immediateAddTask: false,
      }
      output = projectReducer(state, {
        type: ENABLE_IMMEDIATE_ADD_PROJECT,
      })
    })

    it('next state is set correctly', () => {
      expect(output.immediateAddTask).toEqual(true)
    })
  })

  describe('given a DISABLE_IMMEDIATE_ADD_PROJECT action', () => {
    beforeEach(() => {
      state = {
        immediateAddTask: true,
      }
      output = projectReducer(state, {
        type: DISABLE_IMMEDIATE_ADD_PROJECT,
      })
    })

    it('next state is set correctly', () => {
      expect(output.immediateAddTask).toEqual(false)
    })
  })

  describe('given a CLEAR_EDITING action', () => {
    beforeEach(() => {
      state = {
        editingState: {
          isEditingName: true,
          isEditingDescription: true,
        },
      }
      output = projectReducer(state, {
        type: CLEAR_EDITING,
      })
    })

    it('next state is set correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: false,
        isEditingDescription: false,
      })
    })
  })

  describe('given a ENTER_NAME_EDITING_PROJECT action', () => {
    beforeEach(() => {
      state = {
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = projectReducer(state, {
        type: ENTER_NAME_EDITING_PROJECT,
      })
    })

    it('next state is set correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: true,
        isEditingDescription: false,
      })
    })
  })

  describe('given a ENTER_DESCRIPTION_EDITING_PROJECT action', () => {
    beforeEach(() => {
      state = {
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = projectReducer(state, {
        type: ENTER_DESCRIPTION_EDITING_PROJECT,
      })
    })

    it('next state is set correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: false,
        isEditingDescription: true,
      })
    })
  })

  describe('given a RECEIVE_PROJECT_OVERVIEW_SUCCESS action', () => {
    beforeEach(() => {
      state = { name: 'Project1', overview: { isLoaded: false } }
      output = projectReducer(state, {
        type: RECEIVE_PROJECT_OVERVIEW_SUCCESS,
        projectOverview: { taskCounts: 123 },
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        taskCounts: 123,
        overview: { isLoaded: true, isLoading: false, isForbidden: false },
      })
    })
  })

  describe('given a CLEAR_PROJECT action', () => {
    beforeEach(() => {
      state = { name: 'Project1', overview: { isLoaded: true } }
      output = projectReducer(state, {
        type: CLEAR_PROJECT,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        immediateAddTask: undefined,
        isForbidden: false,
        isLoaded: false,
        isLoading: false,
        orgProjects: [],
        newTasks: {
          isLoaded: false,
          isLoading: false,
        },
        overview: {
          isLoaded: true,
        },
        selectionMode: false,
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      })
    })
  })

  describe('given a CLEAR_PROJECT_OVERVIEW action', () => {
    beforeEach(() => {
      state = {
        name: 'Project1',
        overview: { isLoaded: true, taskCounts: 123 },
      }
      output = projectReducer(state, {
        type: CLEAR_PROJECT_OVERVIEW,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        overview: {
          isLoaded: false,
          isLoading: false,
          isForbidden: false,
          errorMessage: '',
        },
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      })
    })
  })

  describe('given a UPDATE_PROJECT_SUCCESS action', () => {
    beforeEach(() => {
      state = { name: 'Project1', overview: { isLoaded: true } }
      output = projectReducer(state, {
        type: UPDATE_PROJECT_SUCCESS,
        project: { name: 'Project2', description: 'Test it.' },
        matterId: 213,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project2',
        description: 'Test it.',
        overview: { isLoaded: true },
        editingState: { isEditingName: false, isEditingDescription: false },
      })
    })
  })

  describe('given a REQUEST_PROJECT action', () => {
    beforeEach(() => {
      state = { name: 'Project1' }
      output = projectReducer(state, { type: REQUEST_PROJECT })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ name: 'Project1' })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        isLoaded: false,
        isLoading: true,
        isForbidden: false,
        description: '',
      })
    })
  })

  describe('given a RECEIVE_PROJECT_SUCCESS action', () => {
    beforeEach(() => {
      state = { name: 'Project1' }
      output = projectReducer(state, {
        type: RECEIVE_PROJECT_SUCCESS,
        project: { name: 'Project2' },
        matterId: 213,
      })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ name: 'Project1' })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project2',
        matterId: 213,
        isLoaded: true,
        isForbidden: false,
        isLoading: false,
      })
    })
  })

  describe('given a RECEIVE_PROJECT_FAILURE action', () => {
    beforeEach(() => {
      state = { name: 'Project1' }
      output = projectReducer(state, { type: RECEIVE_PROJECT_FAILURE })
    })

    it('previous state is not mutated', () => {
      expect(state).toEqual({ name: 'Project1' })
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        isLoaded: true,
        isLoading: false,
        isForbidden: true,
      })
    })
  })

  describe('given a RECEIVE_NEW_TASKS_SUCCESS action', () => {
    beforeEach(() => {
      state = { name: 'Project1', newTasks: { isLoaded: false } }
      output = projectReducer(state, {
        type: RECEIVE_NEW_TASKS_SUCCESS,
        newTasks: [{ newTask: 'a task' }],
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        newTasks: {
          newTasks: [{ newTask: 'a task' }],
          isLoaded: true,
          isLoading: false,
        },
      })
    })
  })

  describe('given a RECEIVE_NEW_TASKS_FAILURE action', () => {
    beforeEach(() => {
      state = { name: 'Project1', newTasks: { isLoaded: false } }
      output = projectReducer(state, {
        type: RECEIVE_NEW_TASKS_FAILURE,
        newTasks: [{ newTask: 'error' }],
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        newTasks: {
          newTasks: [{ newTask: 'error' }],
          isLoaded: true,
          isLoading: false,
        },
      })
    })
  })

  describe('given a REQUEST_NEW_TASKS action', () => {
    beforeEach(() => {
      state = { name: 'Project1', newTasks: { isLoaded: false } }
      output = projectReducer(state, {
        type: REQUEST_NEW_TASKS,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.name).toEqual('Project1')
    })

    it('next state is set correctly', () => {
      expect(output).toEqual({
        name: 'Project1',
        newTasks: {
          isLoaded: false,
          isLoading: true,
        },
      })
    })
  })
})
