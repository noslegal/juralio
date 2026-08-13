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
import projectService from './project-service'

describe('project-service.test', () => {
  describe('getProjectsByMatterId', () => {
    describe('when include closed projects', () => {
      const returnValue = 'api result',
        matterId = 'test_matter_001'
      let output

      beforeEach(() => {
        mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
        output = projectService.getProjectsByMatterId(matterId)
      })

      it('should call the correct api path', () => {
        expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
          'matter/test_matter_001/workstreams?levelATasksOnly=false&allTasks=false&includePosts=false'
        )
      })

      it('should return the resolved projects', () => {
        expect(output).toEqual(returnValue)
      })
    })

    describe('when exclude closed projects', () => {
      const returnValue = 'api result',
        matterId = 'test_matter_001'
      let output

      beforeEach(() => {
        mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
        output = projectService.getProjectsByMatterId(matterId, true)
      })

      it('should call the correct api path', () => {
        expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
          'matter/test_matter_001/workstreams?excludeClosed=true&levelATasksOnly=false&allTasks=false&includePosts=false'
        )
      })

      it('should return the resolved projects', () => {
        expect(output).toEqual(returnValue)
      })
    })
  })

  describe('createProject', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      name = 'test_project_name'

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      projectService.createProject(matterId, { name: name })
    })

    it('should call with the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/test_matter_001/workstreams'
      )
    })

    it('should call POST', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('POST')
    })

    it('with the correct payload', () => {
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual({
        matterId: 'test_matter_001',
        name: 'test_project_name',
      })
    })
  })

  describe('updateProject', () => {
    const returnValue = 'api result',
      matterId = 'test_matter_001',
      projectId = 'test_project_002',
      properties = { name: 'test_project_new_name' }

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      projectService.updateProject(matterId, projectId, properties)
    })

    it('should call with the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'admin/matter/test_matter_001/workstreams/test_project_002'
      )
    })

    it('should call PATCH', () => {
      expect(mockFetchHelper.default.mock.calls[0][1]).toEqual('PATCH')
    })

    it('with the correct payload', () => {
      expect(mockFetchHelper.default.mock.calls[0][2]).toEqual({
        name: 'test_project_new_name',
      })
    })
  })

  describe('getRecentProjects', () => {
    const returnValue = 'api result'
    let output

    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = projectService.getRecentProjects(5)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'projects/recentprojects?count=5'
      )
    })

    it('should return the resolved projects', () => {
      expect(output).toEqual(returnValue)
    })
  })
})
