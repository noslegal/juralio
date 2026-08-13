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

import { getTimeStampUTC } from '../../../helpers/date-helper'

// https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file
const invalidCharacters = ['>', '<', ':', '"', '/', '\\', '?', '*', '|']

export const sanitiseFilename = name => {
  invalidCharacters.forEach(char => (name = name.replace(char, '_')))
  return name
}

export const generateDownloadFilename = (contentName, fileExtension) => {
  const filename = `${contentName} - ${getTimeStampUTC(
    new Date()
  )} UTC.${fileExtension}`
  return sanitiseFilename(filename)
}
