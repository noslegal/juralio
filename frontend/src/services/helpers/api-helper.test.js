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

import getAPIUrl, { _getAPIUrl } from './api-helper'

describe('api-helper', () => {
  describe('given a development port', () => {
    const window = {
      top: {
        location: { protocol: 'http:', hostname: 'myhost', port: '9090' },
      },
    }

    it('should return valid development API url', () => {
      const result = _getAPIUrl(window)
      expect(result).toEqual('http://myhost:8080/api/')
    })
  })

  describe('given a non-development port', () => {
    const window = {
      top: {
        location: { protocol: 'https:', hostname: 'myhost', port: '8080' },
      },
    }

    it('should return valid API url', () => {
      const result = _getAPIUrl(window)
      expect(result).toEqual('https://myhost:8080/api/')
    })
  })

  describe('given a production url - port not specified', () => {
    const window = {
      top: {
        location: { protocol: 'https:', hostname: 'myhost' },
      },
    }

    it('should return valid API url', () => {
      const result = _getAPIUrl(window)
      expect(result).toEqual('https://myhost/api/')
    })
  })

  describe('getAPIUrl', () => {
    it('on calling with JSDOM window object returns default URL', () => {
      const result = getAPIUrl()
      expect(result).toEqual('http://localhost/api/')
    })
  })
})
