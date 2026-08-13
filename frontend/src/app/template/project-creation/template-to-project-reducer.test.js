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

import templateToProjectReducer from './template-to-project-reducer'
import { getTypeObject } from './action-helper'
import { templateToProjectActions as actions } from './template-to-project-actions'

describe('template-to-project-reducer.test', () => {
  let state, output

  describe('given no initial state and unknown action', () => {
    beforeEach(() => {
      state = undefined
      output = templateToProjectReducer(state, getTypeObject('UNKNOWN'))
    })

    it('previous state is not mutated', () => {
      expect(state).toBeUndefined()
    })

    describe('and the initial state is returned', () => {
      it('should set includePosts to true', () => {
        expect(output.includePosts).toEqual(true)
      })
    })
  })

  describe('given  initial state and UPDATE_INCLUDE_POSTS_OPTION action with false', () => {
    beforeEach(() => {
      state = {
        includePosts: true,
        useFullTemplate: false,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_INCLUDE_POSTS_OPTION, {
          includePosts: false,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.includePosts).toBe(true)
    })

    describe('and the updated state is returned', () => {
      it('should set includePosts to false', () => {
        expect(output.includePosts).toEqual(false)
      })
    })
  })

  describe('given  initial state and UPDATE_INCLUDE_POSTS_OPTION action with true', () => {
    beforeEach(() => {
      state = {
        includePosts: false,
        useFullTemplate: false,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_INCLUDE_POSTS_OPTION, {
          includePosts: true,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.includePosts).toBe(false)
    })

    describe('and the updated state is returned', () => {
      it('should set includePosts to true', () => {
        expect(output.includePosts).toEqual(true)
      })
    })
  })

  describe('given  initial state and RESET_TEMPLATE_TO_PROJECT_STATE action with true', () => {
    beforeEach(() => {
      state = {
        newProjectName: 'ProjectPizza',
        includePosts: false,
        useFullTemplate: false,
        useTemplateOptionConfirmed: true,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.RESET_TEMPLATE_TO_PROJECT_STATE)
      )
    })

    it('previous state is not mutated', () => {
      expect(state.includePosts).toBe(false)
    })

    describe('and the updated state is returned', () => {
      it('should set includePosts to true', () => {
        expect(output.includePosts).toEqual(true)
      })
      it('should set newProjectName to blank', () => {
        expect(output.newProjectName).toEqual('')
      })
      it('should set useFullTemplate to true', () => {
        expect(output.useFullTemplate).toEqual(true)
      })
      it('should set useTemplateOptionConfirmed to false', () => {
        expect(output.useTemplateOptionConfirmed).toEqual(false)
      })
    })
  })

  describe('given initial state and UPDATE_USE_FULL_TEMPLATE action with false', () => {
    beforeEach(() => {
      state = {
        includePosts: true,
        useFullTemplate: true,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_USE_FULL_TEMPLATE, {
          useFullTemplate: false,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.useFullTemplate).toBe(true)
    })

    describe('and the updated state is returned', () => {
      it('should set useFullTemplate to false', () => {
        expect(output.useFullTemplate).toEqual(false)
      })
    })
  })

  describe('given initial state and UPDATE_USE_FULL_TEMPLATE action with true', () => {
    beforeEach(() => {
      state = {
        includePosts: false,
        useFullTemplate: false,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_USE_FULL_TEMPLATE, {
          useFullTemplate: true,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.useFullTemplate).toBe(false)
    })

    describe('and the updated state is returned', () => {
      it('should set useFullTemplate to true', () => {
        expect(output.useFullTemplate).toEqual(true)
      })
    })
  })

  describe('given initial state and UPDATE_USE_TEMPLATE_OPTION_CONFIRMED action with false', () => {
    beforeEach(() => {
      state = {
        includePosts: true,
        useTemplateOptionConfirmed: true,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_USE_TEMPLATE_OPTION_CONFIRMED, {
          useTemplateOptionConfirmed: false,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.useTemplateOptionConfirmed).toBe(true)
    })

    describe('and the updated state is returned', () => {
      it('should set useFullTemplate to false', () => {
        expect(output.useTemplateOptionConfirmed).toEqual(false)
      })
    })
  })

  describe('given initial state and UPDATE_USE_TEMPLATE_OPTION_CONFIRMED action with true', () => {
    beforeEach(() => {
      state = {
        includePosts: false,
        useFullTemplate: false,
        useTemplateOptionConfirmed: false,
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_USE_TEMPLATE_OPTION_CONFIRMED, {
          useTemplateOptionConfirmed: true,
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.useTemplateOptionConfirmed).toBe(false)
    })

    describe('and the updated state is returned', () => {
      it('should set useFullTemplate to true', () => {
        expect(output.useTemplateOptionConfirmed).toEqual(true)
      })
    })
  })

  describe('given initial state and UPDATE_NEW_PROJECT_NAME action with a new name', () => {
    beforeEach(() => {
      state = {
        includePosts: false,
        useFullTemplate: false,
        useTemplateOptionConfirmed: false,
        newProjectName: '',
      }

      output = templateToProjectReducer(
        state,
        getTypeObject(actions.UPDATE_NEW_PROJECT_NAME, {
          newProjectName: 'The Legal Project',
        })
      )
    })

    it('previous state is not mutated', () => {
      expect(state.newProjectName).toBe('')
    })

    describe('and the updated state is returned', () => {
      it('should set newProjectName to The Legal Project', () => {
        expect(output.newProjectName).toEqual('The Legal Project')
      })
    })
  })
})
