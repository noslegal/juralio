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

import { HTTPS_PROTOCOL } from '../../../app/constants'
export const checkNameIsValidLength = input => input.length <= 35
export const checkTextHasNonWhitespaceContent = input =>
  !!(input && input.trim().length !== 0)

export const isValidEmail = email => {
  // adapted from emailregex.com
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return checkTextHasNonWhitespaceContent(email) && emailRegex.test(email)
}

//accepts
// * https:// or http:// (optional)
// * www. (optional)
// standard url or ipv4 address or server name with port or TLD
// * any route after tld/port
const acceptednUrlRegex =
  /^((https:\/\/)|(http:\/\/))?(www\.)?(([a-zA-Z0-9@:%._\-+~#=]{1,256}((:[0-9]{1,6})|(\.[a-z]{2,6})))|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))\b([-a-zA-Z0-9@:%_+.~#()?&//=!]*)$/
const isUNCLink = url => {
  return url.slice(0, 2) === '\\\\'
}

export const isValidUrl = url => {
  if (!url) {
    return false
  }
  if (isUNCLink(url)) {
    return true
  }
  if (url.includes(' ')) {
    return false
  }

  if (!!url.match(/^(iwl:)/)) {
    return true
  }
  //https://www.regextester.com/104035
  return !!url.match(acceptednUrlRegex)
}

export const hasProtocol = url => {
  if (!url) {
    return false
  }
  // https://tools.ietf.org/html/rfc3986#section-3.1
  return !!url.match(/^[A-Za-z]([A-Za-z0-9+-.])*:/)
}

export const sanitizeUrl = (url, forceProtocol = false) => {
  if (url) {
    const trimmedValue = url.trim()
    if (isUNCLink(trimmedValue)) {
      return trimmedValue
    }

    if (trimmedValue.length) {
      if (
        !hasProtocol(trimmedValue) &&
        forceProtocol &&
        trimmedValue[0] !== '\\'
      ) {
        return `${HTTPS_PROTOCOL}${trimmedValue}`
      }

      return trimmedValue
    }
  }

  return ''
}

export const removeNewLines = (text, replacement) =>
  text ? text.replace(/(\r\n|\n|\r)/gm, replacement || '') : ''

export const capitalise = text => text.charAt(0).toUpperCase() + text.slice(1)

export const truncateString = (str, charNum, addDots = false) => {
  if (str.length <= charNum) {
    return str
  }
  if (addDots) {
    return str.slice(0, charNum) + '...'
  }
  return str.slice(0, charNum)
}
