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
import noteService from './post-service'

describe('note-service.test', () => {
  describe('getPostsByTaskId', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = noteService.getPostsByTaskId(matterId, projectId, taskId)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/posts'
      )
    })

    it('should return the resolved posts', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('getPost', () => {
    const returnValue = 'api result getPost',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001',
      postId = 'test_post_001'

    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = noteService.getPost(matterId, projectId, taskId, postId)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/post/test_post_001'
      )
    })

    it('should return the promise', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('createPost', () => {
    const returnValue = 'api result createPost',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001'

    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = noteService.createPost(
        matterId,
        projectId,
        taskId,
        'test-name',
        false
      )
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/posts'
      )
    })

    it('should specify a POST request', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('POST')
    })

    it('should specifiy the correct payload', () => {
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual({
        name: 'test-name',
        privatePost: false,
      })
    })

    it('should return the promise', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('updatePost', () => {
    const returnValue = 'api result updatePost',
      matterId = 'test_matter_001',
      projectId = 'test_project_001',
      taskId = 'test_task_001',
      postId = 'test_post_001',
      contentUpdate = 'I am new post content. Fear me.'

    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = noteService.updatePost(matterId, projectId, taskId, postId, {
        description: contentUpdate,
      })
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams/test_project_001/task/test_task_001/post/test_post_001'
      )
    })

    it('should specify a PATCH request', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('PATCH')
    })

    it('should specifiy the correct payload', () => {
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual({
        description: 'I am new post content. Fear me.',
      })
    })

    it('should return the promise', () => {
      expect(output).toEqual(returnValue)
    })
  })
})
