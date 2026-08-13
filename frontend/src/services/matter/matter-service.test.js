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
import matterService from './matter-service'

describe('matter-service.test', () => {
  const returnValue = 'api result'
  let output

  describe('getMatters', () => {
    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = matterService.getMatters()
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual('matters')
    })

    it('should return the resolved matters', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('getMatter', () => {
    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = matterService.getMatter(123)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual('matter/123')
    })

    it('should return the resolved matters', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('getMatterTeam', () => {
    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = matterService.getMatterTeam(123)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/123/team?includeTaskCount=false&includePlaceholders=false'
      )
    })

    it('should return the resolved matters', () => {
      expect(output).toEqual(returnValue)
    })
  })

  describe('getMatterTeam includeTaskCount', () => {
    beforeEach(() => {
      mockFetchHelper.default = jest.fn().mockReturnValueOnce(returnValue)
      output = matterService.getMatterTeam(123, true)
    })

    it('should call the correct api path', () => {
      expect(mockFetchHelper.default.mock.calls[0][0]).toEqual(
        'matter/123/team?includeTaskCount=true&includePlaceholders=false'
      )
    })

    it('should return the resolved matters', () => {
      expect(output).toEqual(returnValue)
    })
  })
})
