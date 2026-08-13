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
  CLEAR_TEMPLATE_ERROR_MESSAGE,
  DISABLE_IMMEDIATE_ADD_TEMPLATE,
  ENABLE_IMMEDIATE_ADD_TEMPLATE,
  ENTER_DESCRIPTION_EDITING_TEMPLATE,
  ENTER_NAME_EDITING_TEMPLATE,
  RECEIVE_TEMPLATE,
  RECEIVE_TEMPLATE_OVERVIEW,
  RECEIVE_TEMPLATE_TASKS,
  REQUEST_TEMPLATE,
  REQUEST_TEMPLATE_OVERVIEW,
  RESET_TEMPLATE_OVERVIEW,
  RESET_TEMPLATE_TASKS_STATE,
  SELECT_TASK_TO_MOVE,
  UPDATE_TEMPLATE_SUCCESS,
  SHOW_TEMPLATE_EXPORT_DIALOG,
} from './template-actions'

import selectedTemplateTaskActions from '../template-task-details/selectedTemplateTaskActions'
import templateReducer from './template-reducer'

describe('template-reducer.test', () => {
  let state, output

  describe('given a ENABLE_IMMEDIATE_ADD_TEMPLATE action', () => {
    beforeEach(() => {
      state = {
        immediateAddTask: false,
      }
      output = templateReducer(state, {
        type: ENABLE_IMMEDIATE_ADD_TEMPLATE,
      })
    })

    it('next state is set correctly', () => {
      expect(output.immediateAddTask).toEqual(true)
    })
  })

  describe('given a DISABLE_IMMEDIATE_ADD_TEMPLATE action', () => {
    beforeEach(() => {
      state = {
        immediateAddTask: true,
      }
      output = templateReducer(state, {
        type: DISABLE_IMMEDIATE_ADD_TEMPLATE,
      })
    })

    it('next state is set correctly', () => {
      expect(output.immediateAddTask).toEqual(false)
    })
  })

  describe('given a SHOW_TEMPLATE_EXPORT_DIALOG action default', () => {
    beforeEach(() => {
      state = {
        showExportDialog: true,
      }
      output = templateReducer(state, {
        type: SHOW_TEMPLATE_EXPORT_DIALOG,
        show: false,
      })
    })

    it('next state is set correctly', () => {
      expect(output.showExportDialog).toEqual(false)
    })
  })

  describe('given a SHOW_TEMPLATE_EXPORT_DIALOG action with true', () => {
    beforeEach(() => {
      state = {
        showExportDialog: false,
      }
      output = templateReducer(state, {
        type: SHOW_TEMPLATE_EXPORT_DIALOG,
        show: true,
      })
    })

    it('next state is set correctly', () => {
      expect(output.showExportDialog).toEqual(true)
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
      output = templateReducer(state, {
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

  describe('given a ENTER_NAME_EDITING_TEMPLATE action', () => {
    beforeEach(() => {
      state = {
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = templateReducer(state, {
        type: ENTER_NAME_EDITING_TEMPLATE,
      })
    })

    it('next state is set correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: true,
        isEditingDescription: false,
      })
    })
  })

  describe('given a ENTER_DESCRIPTION_EDITING_TEMPLATE action', () => {
    beforeEach(() => {
      state = {
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = templateReducer(state, {
        type: ENTER_DESCRIPTION_EDITING_TEMPLATE,
      })
    })

    it('next state is set correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: false,
        isEditingDescription: true,
      })
    })
  })

  describe('given a REQUEST_TEMPLATE_OVERVIEW action', () => {
    beforeEach(() => {
      state = {
        areTasksLoaded: false,
        templateTasks: [],
        template: undefined,
        newTemplateTask: undefined,
        overview: { isLoaded: false },
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = templateReducer(state, {
        type: REQUEST_TEMPLATE_OVERVIEW,
        template: 'Dummy Template',
      })
    })

    it('previous state is not mutated', () => {
      expect(state.template).toBeUndefined()
    })

    it('next state is set correctly', () => {
      expect(output.overview.isLoaded).toEqual(false)
    })

    it('should only have 2 property', () => {
      expect(Object.keys(output.overview).length).toEqual(2)
    })
  })

  describe('given a RECEIVE_TEMPLATE_OVERVIEW action', () => {
    beforeEach(() => {
      state = {
        areTasksLoaded: false,
        templateTasks: [],
        template: undefined,
        newTemplateTask: undefined,
        overview: { isLoaded: false },
        editingState: {
          isEditingName: false,
          isEditingDescription: false,
        },
      }
      output = templateReducer(state, {
        type: RECEIVE_TEMPLATE_OVERVIEW,
        template: { postCount: 1234 },
      })
    })

    it('previous state is not mutated', () => {
      expect(state.template).toBeUndefined()
    })

    it('next state is set correctly', () => {
      expect(output.overview.isLoaded).toEqual(true)
      expect(output.template.postCount).toEqual(1234)
    })

    it('should only have 2 properties', () => {
      expect(Object.keys(output.overview).length).toEqual(2)
    })
  })

  describe('given a RESET_TEMPLATE_OVERVIEW action', () => {
    beforeEach(() => {
      state = {
        areTasksLoaded: false,
        newTemplateTask: undefined,
        overview: { isLoaded: true },
        postCount: 1234,
        template: { name: 'aTemplate' },
        templateTasks: [],
        editingState: {
          isEditingName: true,
          isEditingDescription: false,
        },
      }
      output = templateReducer(state, {
        type: RESET_TEMPLATE_OVERVIEW,
      })
    })

    it('previous state is not mutated', () => {
      expect(state.template.name).toBe('aTemplate')
    })

    it('next state is set correctly', () => {
      expect(output.overview.isLoaded).toEqual(false)
    })

    it('should only have 3 properties on overview', () => {
      expect(Object.keys(output.overview).length).toEqual(3)
    })

    it('should have editing state reset correctly', () => {
      expect(output.editingState).toEqual({
        isEditingName: false,
        isEditingDescription: false,
      })
    })
  })

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = templateReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set template to empty', () => {
        expect(Object.keys(output.template).length).toEqual(0)
      })

      it('should set newTemplateTask', () => {
        expect(output.newTemplateTask).toBeUndefined()
      })

      it('should set areTasksLoaded to false', () => {
        expect(output.areTasksLoaded).toEqual(false)
      })

      it('should set selectionMode to false', () => {
        expect(output.selectionMode).toEqual(false)
      })

      it('should set templateTasks array to be empty', () => {
        expect(output.templateTasks.length).toEqual(0)
      })

      it('should set highlightList array to be empty', () => {
        expect(output.highlightList.length).toEqual(0)
      })

      it('should only have 12 properties', () => {
        expect(Object.keys(output).length).toEqual(12)
      })
    })

    describe('given a REQUEST_TEMPLATE action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: false,
          isLoaded: false,
          templateTasks: [],
          template: {},
          newTemplateTask: undefined,
          postCount: 1234,
        }
        output = templateReducer(state, { type: REQUEST_TEMPLATE })
      })

      it('previous state is not mutated', () => {
        expect(Object.keys(output.template).length).toEqual(0)
      })

      it('next state is set correctly', () => {
        expect(output.isLoaded).toEqual(false)
        expect(output.areTasksLoaded).toEqual(false)
        expect(Object.keys(output.template).length).toEqual(0)
        expect(output.templateTasks.length).toEqual(0)
        expect(output.postCount).toEqual(1234)
      })

      it('should only have 6 properties', () => {
        expect(Object.keys(output).length).toEqual(6)
      })
    })

    describe('given a RECEIVE_TEMPLATE_TASKS action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: false,
          templateTasks: [],
          template: 'Parrot',
          newTemplateTask: undefined,
        }
        output = templateReducer(state, {
          type: RECEIVE_TEMPLATE_TASKS,
          templateTasks: [1, 2, 3],
        })
      })

      it('previous state is not mutated', () => {
        expect(output.template).toBe('Parrot')
      })

      it('next state is set correctly', () => {
        expect(output.areTasksLoaded).toEqual(true)
        expect(output.template).toBe('Parrot')
        expect(output.templateTasks.length).toEqual(3)
      })

      it('should only have 4 properties', () => {
        expect(Object.keys(output).length).toEqual(4)
      })
    })

    describe('given a RECEIVE_TEMPLATE action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: false,
          templateTasks: [],
          template: undefined,
          newTemplateTask: undefined,
        }
        output = templateReducer(state, {
          type: RECEIVE_TEMPLATE,
          template: { name: 'Dummy Template' },
        })
      })

      it('previous state is not mutated', () => {
        expect(state.template).toBeUndefined()
      })

      it('next state is set correctly', () => {
        expect(output.areTasksLoaded).toEqual(false)
        expect(output.template.name).toEqual('Dummy Template')
        expect(output.templateTasks.length).toEqual(0)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('given a UPDATE_TEMPLATE_SUCCESS action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: false,
          templateTasks: [],
          newTemplateTask: undefined,
          template: {
            name: 'Updated name',
            description: 'Updated description',
          },
        }
        output = templateReducer(state, {
          type: UPDATE_TEMPLATE_SUCCESS,
          template: {
            name: 'Updated name',
            description: 'Updated description',
          },
        })
      })

      it('next state is set correctly', () => {
        expect(output.areTasksLoaded).toEqual(false)
        expect(output.template.name).toEqual('Updated name')
        expect(output.template.description).toEqual('Updated description')
      })

      it('should only have 6 properties', () => {
        expect(Object.keys(output).length).toEqual(6)
      })
    })

    describe('given a CLEAR_TEMPLATE_ERROR_MESSAGE action', () => {
      beforeEach(() => {
        state = {
          overview: { errorMessage: 'ERROR 1234' },
        }
        output = templateReducer(state, {
          type: CLEAR_TEMPLATE_ERROR_MESSAGE,
        })
      })

      it('next state is set correctly', () => {
        expect(output.overview.errorMessage).toEqual('')
      })
    })

    describe('given a RESET_TEMPLATE_TASKS_STATE action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: true,
          templateTasks: [123],
          template: 'Monkey',
          newTemplateTask: undefined,
        }
        output = templateReducer(state, {
          type: RESET_TEMPLATE_TASKS_STATE,
          template: 'Dummy Template',
        })
      })

      it('previous state is not mutated', () => {
        expect(state.template).toBe('Monkey')
      })

      it('next state is set correctly', () => {
        expect(output.areTasksLoaded).toEqual(false)
        expect(Object.keys(output.template).length).toEqual(0)
        expect(output.templateTasks.length).toEqual(0)
        expect(output.editingState).toEqual({
          isEditingName: false,
          isEditingDescription: false,
        })
      })

      it('should only have 12 properties', () => {
        expect(Object.keys(output).length).toEqual(12)
      })
    })

    describe('given a CREATE_TEMPLATE_TASK_IN_TEMPLATE_CONTEXT_SUCCESS action', () => {
      beforeEach(() => {
        state = {
          areTasksLoaded: true,
          templateTasks: [1, 2, 3],
          template: { name: 'Monkey', tasks: [] },
          newTemplateTask: 'Old task',
        }
        output = templateReducer(state, {
          type: selectedTemplateTaskActions.CREATE_TEMPLATE_TASK_IN_TEMPLATE_CONTEXT_SUCCESS,
          createdTask: 'Dummy Task',
        })
      })

      it('previous state is not mutated', () => {
        expect(state.template.name).toBe('Monkey')
      })

      it('next state is set correctly', () => {
        expect(output.areTasksLoaded).toEqual(true)
        expect(output.template.name).toBe('Monkey')
        expect(output.template.tasks.length).toBe(1)
        expect(output.templateTasks.length).toEqual(3)
        expect(output.newTemplateTask).toEqual('Dummy Task')
      })

      it('should only have 4 properties', () => {
        expect(Object.keys(output).length).toEqual(4)
      })
    })

    describe('given a SELECT_TASK_TO_MOVE action', () => {
      const taskA = { id: 100 }
      const taskB_sub1 = { id: 210 }

      const taskB = { id: 200, tasks: [taskB_sub1] }

      beforeEach(() => {
        state = {
          highlightList: [],
          templateTasks: [taskA, taskB],
        }
        output = templateReducer(state, {
          type: SELECT_TASK_TO_MOVE,
          taskId: taskB.id,
        })
      })

      it('previous state is not mutated', () => {
        expect(state.highlightList).toEqual([])
        expect(state.templateTasks).toEqual([taskA, taskB])
      })

      describe('next state', () => {
        it('should not change exist template tasks', () => {
          expect(output.templateTasks).toEqual([taskA, taskB])
        })

        it('should set highlightList correctly', () => {
          expect(output.highlightList).toEqual([taskB, taskB_sub1])
        })
      })
    })
  })
})
