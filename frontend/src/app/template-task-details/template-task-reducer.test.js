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

import selectedTemplateTaskReducer, {
  initialTemplateTaskState,
} from './template-task-reducer'
import { getTypeObject } from '../template/project-creation/action-helper'
import selectedTemplateTaskActions from './selectedTemplateTaskActions'

describe('template-task-reducer.test', () => {
  const actions = selectedTemplateTaskActions
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = selectedTemplateTaskReducer(state, { type: 'UNKNOWN' })
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toBe(false)
      })

      it('should set isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should set tasks array to be empty', () => {
        expect(output.tasks.length).toEqual(0)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })

      describe('RECEIVE_TEMPLATE_TASK', () => {
        beforeEach(() => {
          state = initialTemplateTaskState
          output = selectedTemplateTaskReducer(
            state,
            getTypeObject(actions.RECEIVE_TEMPLATE_TASK, {
              templateTask: { id: 1234, tasks: [] },
            })
          )
        })

        it('should set isLoaded to true', () => {
          expect(output.isLoaded).toBe(true)
        })

        it('should set isDeleted to false', () => {
          expect(output.isDeleted).toEqual(false)
        })

        it('should set tasks array to be empty', () => {
          expect(output.tasks.length).toEqual(0)
        })

        it('should only have 5 properties', () => {
          expect(Object.keys(output).length).toEqual(5)
        })
      })
    })

    describe('DELETE_TEMPLATE_TASK_SUCCESS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.DELETE_TEMPLATE_TASK_SUCCESS, {
            templateTaskId: 42,
            deletingSelectedTemplateTask: false,
          })
        )
      })

      it('should keep isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should remove a task from the array', () => {
        expect(output.tasks.length).toEqual(1)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('REQUEST_UPDATE_TEMPLATE_TASKS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.REQUEST_UPDATE_TEMPLATE_TASKS, {
            taskOrder: [{ id: 42 }, { id: 43 }],
          })
        )
      })

      it('should keep isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 2 tasks', () => {
        expect(output.tasks.length).toEqual(2)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('TEMPLATE_TASK_RESET_STATE', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.TEMPLATE_TASK_RESET_STATE)
        )
      })

      it('should set isLoaded to false', () => {
        expect(output.isLoaded).toBe(false)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 0 tasks', () => {
        expect(output.tasks.length).toEqual(0)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('CREATE_TEMPLATE_TASK_IN_TASK_CONTEXT_SUCCESS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.CREATE_TEMPLATE_TASK_IN_TASK_CONTEXT_SUCCESS, {
            createdTask: {},
          })
        )
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 3 tasks', () => {
        expect(output.tasks.length).toEqual(3)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('UPDATE_TEMPLATE_TASKS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.UPDATE_TEMPLATE_TASKS, {
            templateTask: { tasks: [{ id: 42 }, { id: 43 }, { id: 44 }] },
          })
        )
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 3 tasks', () => {
        expect(output.tasks.length).toEqual(3)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('COPY_TEMPLATE_TASK_SUCCESS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.COPY_TEMPLATE_TASK_SUCCESS, {
            templateTask: {
              id: 19,
              tasks: [{ id: 42 }, { id: 43 }, { id: 44 }],
            },
          })
        )
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 3 tasks', () => {
        expect(output.tasks.length).toEqual(3)
      })

      it('should have a copied task set', () => {
        expect(output.copiedTask.id).toEqual(19)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })

    describe('SUBTASK_MOVED_SUCCESS', () => {
      beforeEach(() => {
        state = {
          ...initialTemplateTaskState,
          isLoaded: true,
          isDeleted: false,
          tasks: [{ id: 42 }, { id: 43 }],
        }

        output = selectedTemplateTaskReducer(
          state,
          getTypeObject(actions.SUBTASK_MOVED_SUCCESS, {
            templateTask: {
              movedSubtaskId: 43,
            },
          })
        )
      })

      it('should set isLoaded to true', () => {
        expect(output.isLoaded).toBe(true)
      })

      it('should keep isDeleted to false', () => {
        expect(output.isDeleted).toEqual(false)
      })

      it('should have 2 tasks', () => {
        expect(output.tasks.length).toEqual(2)
      })

      it('should only have 5 properties', () => {
        expect(Object.keys(output).length).toEqual(5)
      })
    })
  })
})
