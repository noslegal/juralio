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

import * as mockFetchHelper from '../helpers/fetch/fetch-helper'
import * as mockMakeCancellable from '../helpers/cancellable-promise-helper'
import taskService from './task-service'

describe('task-service.test', () => {
  describe('getTaskById', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = taskService.getTaskById(matterId, projectId, taskId)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001'
      )
    })

    it('should return the resolved projects', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('updateTask', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001',
      properties = { test: 'test-properties' }
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = taskService.updateTask(
        matterId,
        projectId,
        taskId,
        properties,
        true
      )
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001?maintainTaskConsistencyUpdate=true'
      )
    })

    it('should call PATCH', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('PATCH')
    })

    it('should pass the payload down', () => {
      const expectedPayload = {
        ...properties,
      }
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual(expectedPayload)
    })

    it('should return the expected response', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('archiveTask', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = taskService.archiveTask(matterId, projectId, taskId)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/archive'
      )
    })

    it('should return a response', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('copyTask', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001',
      name = 'test-name'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = taskService.copyTask(matterId, projectId, taskId, name)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/copy'
      )
    })

    it('should pass the POST request type', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('POST')
    })

    it('should return a response', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('moveTask', () => {
    const returnValue = 'move_api result',
      matterId = 'move_test_matter_001',
      projectId = 'move_test_project_001',
      taskId = 'move_test_task_001',
      destination = 'mock_destination'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = taskService.moveTask(matterId, projectId, taskId, destination)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/move_test_matter_001/workstreams/move_test_project_001/task/move_test_task_001/move'
      )
    })

    it('should pass the POST request type', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('POST')
    })

    it('should pass the Destination detail object', () => {
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual({
        destinationParentType: 'mock_destination',
        maintainTaskConsistency: false,
      })
    })

    it('should return a response', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('getTasks', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      mockMakeCancellable.default = jest.fn().mockReturnValueOnce({
        promise: 'Fake Promise',
        cancel() {},
      })
    })

    describe('when called without a searchTerm', () => {
      beforeEach(() => {
        output = taskService.getTasks(matterId, projectId)
      })

      it('should call the make cancellable mock', () => {
        expect(mockMakeCancellable.default.mock.calls[0][0]).toEqual(
          'api result'
        )
      })

      it('should call the correct api path excluding any GET params', () => {
        expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
          'matter/test_matter_001/workstreams/test_project_001/tasks'
        )
      })

      it('should return the resolved notes', () => {
        expect(output.promise).toEqual('Fake Promise')
      })
    })

    describe('when called WITH a searchTerm', () => {
      beforeEach(() => {
        output = taskService.getTasks(matterId, projectId, 'mockSearchTerm')
      })

      it('should call the correct api path including the given search term GET param', () => {
        expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
          'matter/test_matter_001/workstreams/test_project_001/tasks?name=mockSearchTerm'
        )
      })
    })
  })
})
