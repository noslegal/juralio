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
import taskService from '../../../services/task/task-service'
import { TASK_STATUS } from '../../constants'
import { SHOW_SNACKBAR } from '../../global-snackbar/global-snackbar-actions'
import { REQUEST_PROJECT } from '../../project/project-actions'
import { RECEIVE_TASK_SUCCESS } from './selected-task-actions'
import {
  archiveTask,
  ARCHIVE_TASK,
  ARCHIVE_TASK_SUCCESS,
  copyTask,
  COPY_TASK,
  COPY_TASK_SUCCESS,
  moveTask,
  MOVE_TASK,
} from './selected-task-menu-actions'

const middlewares = [thunk]
const mockStore = configureStore(middlewares)

describe('selected-task-menu-actions', () => {
  describe('moveTask', () => {
    describe('on success', () => {
      describe('to a parent whose status is NOT STARTED', () => {
        const mockResponse = {
          status: StatusCodes.OK,
          body: { status: TASK_STATUS.NOT_STARTED, text: 'hello world' },
        }
        let actions

        beforeEach(() => {
          taskService.moveTask = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve(mockResponse))

          const store = mockStore({})

          return store
            .dispatch(
              moveTask(
                5123,
                5456,
                5789,
                'MOCK_DESTINATION',
                4444,
                4444,
                { id: 345 },
                true
              )
            )
            .then(() => {
              actions = store.getActions()
            })
        })

        it('should call moveTask with 5 id parameters', () => {
          expect(taskService.moveTask).toHaveBeenCalledWith(
            5123,
            5456,
            5789,
            'MOCK_DESTINATION',
            4444,
            4444,
            false
          )
        })

        it('should have a MOVE_TASK action', () => {
          expect(actions[0].type).toEqual(MOVE_TASK)
        })

        it('should have a REQUEST_PROJECT action', () => {
          expect(actions[1].type).toEqual(REQUEST_PROJECT)
        })

        it('should have a SHOW_SNACKBAR action', () => {
          expect(actions[2].type).toEqual(SHOW_SNACKBAR)
          expect(actions[2].snackbarMessage).toEqual(
            'Task moved. Any relevant dates have been updated'
          )
        })

        it('should have a RECEIVE_TASK_SUCCESS action', () => {
          expect(actions[3].type).toEqual(RECEIVE_TASK_SUCCESS)
          expect(actions[3].task).toEqual(mockResponse.body)
        })
      })

      describe('to a parent whose status is DONE', () => {
        const mockResponse = {
          status: StatusCodes.OK,
          body: { status: TASK_STATUS.DONE, text: 'hello world' },
        }
        let actions

        beforeEach(() => {
          taskService.moveTask = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve(mockResponse))

          const store = mockStore({})

          return store
            .dispatch(
              moveTask(
                5123,
                5456,
                5789,
                'MOCK_DESTINATION',
                4444,
                4444,
                { id: 345 },
                true
              )
            )
            .then(() => {
              actions = store.getActions()
            })
        })

        it('should call moveTask with 5 id parameters', () => {
          expect(taskService.moveTask).toHaveBeenCalledWith(
            5123,
            5456,
            5789,
            'MOCK_DESTINATION',
            4444,
            4444,
            false
          )
        })

        it('should have a MOVE_TASK action', () => {
          expect(actions[0].type).toEqual(MOVE_TASK)
        })
        it('should have a REQUEST_PROJECT action', () => {
          expect(actions[1].type).toEqual(REQUEST_PROJECT)
        })
        it('should have a SHOW_SNACKBAR action', () => {
          expect(actions[2].type).toEqual(SHOW_SNACKBAR)
          expect(actions[2].snackbarMessage).toEqual(
            'Task moved. Any relevant dates have been updated'
          )
        })

        it('should have a RECEIVE_TASK_SUCCESS action', () => {
          expect(actions[3].type).toEqual(RECEIVE_TASK_SUCCESS)
          expect(actions[3].task).toEqual(mockResponse.body)
        })
      })
    })

    describe('on fail', () => {
      let actions

      beforeEach(() => {
        taskService.moveTask = jest.fn().mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.ERROR,
            body: { text: 'hello world' },
          })
        )
        const store = mockStore({})

        return store
          .dispatch(
            moveTask(
              5123,
              5456,
              5789,
              'MOCK_DESTINATION',
              undefined,
              undefined,
              undefined,
              true
            )
          )
          .then(() => {
            actions = store.getActions()
          })
      })

      it('should call archiveTask with 4 id parameters and undefined', () => {
        expect(taskService.moveTask).toHaveBeenCalledWith(
          5123,
          5456,
          5789,
          'MOCK_DESTINATION',
          undefined,
          undefined,
          false
        )
      })
      it('should have a MOVE_TASK action', () => {
        expect(actions[0].type).toEqual(MOVE_TASK)
      })
      it('should not send any other actions', () => {
        expect(actions.length).toEqual(2)
      })
    })
  })

  describe('archiveTask', () => {
    describe('on success', () => {
      let actions

      beforeEach(() => {
        taskService.archiveTask = jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ status: StatusCodes.OK, text: 'hello world' })
          )
        const store = mockStore({})

        return store.dispatch(archiveTask(123, 456, 789)).then(() => {
          actions = store.getActions()
        })
      })

      it('should call archiveTask with 3 id parameters', () => {
        expect(taskService.archiveTask).toHaveBeenCalledWith(123, 456, 789)
      })
      it('should have a ARCHIVE_TASK action', () => {
        expect(actions[0].type).toEqual(ARCHIVE_TASK)
      })
      it('should have a REQUEST_PROJECT action', () => {
        expect(actions[1].type).toEqual(REQUEST_PROJECT)
      })
      it('should have a ARCHIVE_TASK_SUCCESS action', () => {
        expect(actions[2].type).toEqual(ARCHIVE_TASK_SUCCESS)
      })
    })

    describe('on fail', () => {
      let actions

      beforeEach(() => {
        taskService.archiveTask = jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ status: StatusCodes.ERROR, text: 'hello world' })
          )
        const store = mockStore({})

        return store.dispatch(archiveTask(123, 456, 789)).then(() => {
          actions = store.getActions()
        })
      })

      it('should call archiveTask with 3 id parameters', () => {
        expect(taskService.archiveTask).toHaveBeenCalledWith(123, 456, 789)
      })
      it('should have a ARCHIVE_TASK action', () => {
        expect(actions[0].type).toEqual(ARCHIVE_TASK)
      })
      it('should not send any other actions', () => {
        expect(actions.length).toEqual(1)
      })
    })
  })

  describe('copyTask', () => {
    describe('on success', () => {
      let actions

      beforeEach(() => {
        taskService.copyTask = jest.fn().mockReturnValueOnce(
          Promise.resolve({
            status: StatusCodes.CREATED,
            body: { status: TASK_STATUS.DONE },
          })
        )
        const store = mockStore({})

        return store.dispatch(copyTask(123, 456, 789, 'newName')).then(() => {
          actions = store.getActions()
        })
      })

      it('should call archiveTask with 3 id parameters and the new task name', () => {
        expect(taskService.copyTask).toHaveBeenCalledWith(
          123,
          456,
          789,
          'newName'
        )
      })
      it('should have a COPY_TASK action', () => {
        expect(actions[0].type).toEqual(COPY_TASK)
      })
      it('should have a REQUEST_PROJECT action', () => {
        expect(actions[1].type).toEqual(REQUEST_PROJECT)
      })
      it('should have a SHOW_SNACKBAR action', () => {
        expect(actions[2].type).toEqual(SHOW_SNACKBAR)
      })
      it('should have a COPY_TASK_SUCCESS action', () => {
        expect(actions[3].type).toEqual(COPY_TASK_SUCCESS)
      })
    })
  })
})
