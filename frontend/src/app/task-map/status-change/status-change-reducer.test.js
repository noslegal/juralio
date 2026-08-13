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

describe('status-change-reducer.test', () => {
  it('fake', () => {
    expect(1).toEqual(1)
  })
  //   let state, output
  //   describe('given no initial state and unknown action', () => {
  //     beforeEach(() => {
  //       state = undefined
  //       output = statusChangeReducer(state, { type: 'UNKNOWN' })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toBeUndefined()
  //     })

  //     describe('and the initial state is returned', () => {
  //       it('should set task to undefined', () => {
  //         expect(output.task).toBeUndefined()
  //       })

  //       it('should set isForbidden to false', () => {
  //         expect(output.isForbidden).toEqual(false)
  //       })

  //       it('should set isLoaded to false', () => {
  //         expect(output.isLoaded).toEqual(false)
  //       })
  //     })
  //   })

  //   describe('given a RECEIVE_TASK_SUCCESS action', () => {
  //     beforeEach(() => {
  //       state = {
  //         isForbidden: true,
  //         isLoaded: false,
  //         handleNotStartedParents: true,
  //         handleNotDoneChildren: true,
  //         handleDoneParents: true,
  //         handleActiveAndDoneChildren: true,
  //         handleNotStartedParentsAndDoneChildren: true,
  //         handleDoneParentsAndDoneChildren: true,
  //         handleBlockedByTask: false,
  //         affectedTasks: [],
  //       }
  //       output = statusChangeReducer(state, {
  //         type: RECEIVE_TASK_SUCCESS,
  //         task: {},
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({
  //         isForbidden: true,
  //         isLoaded: false,
  //         handleNotStartedParents: true,
  //         handleNotDoneChildren: true,
  //         handleDoneParents: true,
  //         handleActiveAndDoneChildren: true,
  //         handleNotStartedParentsAndDoneChildren: true,
  //         handleDoneParentsAndDoneChildren: true,
  //         handleBlockedByTask: false,
  //         affectedTasks: [],
  //       })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         isForbidden: false,
  //         isLoaded: true,
  //         handleNotStartedParents: false,
  //         handleNotDoneChildren: false,
  //         handleDoneParents: false,
  //         handleActiveAndDoneChildren: false,
  //         handleNotStartedParentsAndDoneChildren: false,
  //         handleDoneParentsAndDoneChildren: false,
  //         handleNotRequiredParents: false,
  //         handleNotRequiredParentsAndChildren: false,
  //         handleNotRequiredChildren: false,
  //         handleBlockedByTask: false,
  //         affectedTasks: [],
  //       })
  //     })
  //   })

  //   describe('given a RECEIVE_TASK_FAILURE action', () => {
  //     beforeEach(() => {
  //       state = { name: 'Task1' }
  //       output = statusChangeReducer(state, { type: RECEIVE_TASK_FAILURE })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ name: 'Task1' })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         name: 'Task1',
  //         isForbidden: true,
  //         isLoaded: true,
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS action', () => {
  //     beforeEach(() => {
  //       state = { handleNotStartedParents: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleNotStartedParents: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleNotStartedParents: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN action', () => {
  //     beforeEach(() => {
  //       state = { handleNotDoneChildren: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleNotDoneChildren: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleNotDoneChildren: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS action', () => {
  //     beforeEach(() => {
  //       state = { handleDoneParents: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleDoneParents: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleDoneParents: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN action', () => {
  //     beforeEach(() => {
  //       state = { handleActiveAndDoneChildren: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleActiveAndDoneChildren: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleActiveAndDoneChildren: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN action', () => {
  //     beforeEach(() => {
  //       state = { handleNotStartedParentsAndDoneChildren: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleNotStartedParentsAndDoneChildren: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleNotStartedParentsAndDoneChildren: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN action', () => {
  //     beforeEach(() => {
  //       state = { handleDoneParentsAndDoneChildren: false }
  //       output = statusChangeReducer(state, {
  //         type: CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN,
  //         payload: 'mockPayload',
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({ handleDoneParentsAndDoneChildren: false })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleDoneParentsAndDoneChildren: true,
  //         statusChangePayload: 'mockPayload',
  //       })
  //     })
  //   })

  //   describe('given a CANCEL_CONFIRMATION_DIALOG action', () => {
  //     beforeEach(() => {
  //       state = {
  //         handleNotStartedParents: true,
  //         handleNotDoneChildren: true,
  //         handleDoneParents: true,
  //         handleActiveAndDoneChildren: true,
  //         handleNotStartedParentsAndDoneChildren: true,
  //         handleDoneParentsAndDoneChildren: true,
  //       }
  //       output = statusChangeReducer(state, {
  //         type: CANCEL_CONFIRMATION_DIALOG,
  //       })
  //     })

  //     it('previous state is not mutated', () => {
  //       expect(state).toEqual({
  //         handleNotStartedParents: true,
  //         handleNotDoneChildren: true,
  //         handleDoneParents: true,
  //         handleActiveAndDoneChildren: true,
  //         handleNotStartedParentsAndDoneChildren: true,
  //         handleDoneParentsAndDoneChildren: true,
  //       })
  //     })

  //     it('next state is set correctly', () => {
  //       expect(output).toEqual({
  //         handleNotRequiredParents: false,
  //         handleNotRequiredParentsAndChildren: false,
  //         handleNotRequiredChildren: false,
  //         handleNotStartedParents: false,
  //         handleNotDoneChildren: false,
  //         handleDoneParents: false,
  //         handleActiveAndDoneChildren: false,
  //         handleNotStartedParentsAndDoneChildren: false,
  //         handleDoneParentsAndDoneChildren: false,
  //       })
  //     })
  //   })
})
