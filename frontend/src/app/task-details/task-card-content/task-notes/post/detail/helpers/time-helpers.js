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

const getHours = (value, defaultOffset = 0) => {
  let [date, isDefault] = getDate(value)
  if (isDefault) {
    return [
      (date.getHours() + defaultOffset).toString().padStart(2, '0'),
      isDefault,
    ]
  }
  return [date.getHours().toString().padStart(2, '0'), isDefault]
}

const getMinutes = value => {
  if (value === null) {
    return '00'
  }
  let [date] = getDate(value)
  return date.getMinutes().toString().padStart(2, '0')
}

const getDate = value => {
  if (value instanceof Date) {
    return [value, false]
  }
  if (value === null) {
    return [new Date(), true]
  }
  try {
    return [new Date(value), false]
  } catch {
    return [new Date(), true]
  }
}

//https://stackoverflow.com/questions/1091372/getting-the-clients-timezone-offset-in-javascript
const userTimeZone = new Date().toString().match(/([A-Z]+[+-][0-9]+)/)[1]

export { getHours, getMinutes, getDate, userTimeZone }
