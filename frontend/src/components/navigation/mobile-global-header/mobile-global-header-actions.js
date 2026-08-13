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

export const SHOW_MOBILE_GLOBAL_HEADER = 'SHOW_MOBILE_GLOBAL_HEADER'
export const HIDE_MOBILE_GLOBAL_HEADER = 'HIDE_MOBILE_GLOBAL_HEADER'

export function showMobileGlobalHeader() {
  return {
    type: SHOW_MOBILE_GLOBAL_HEADER,
  }
}

export function closeMobileGlobalHeader() {
  return {
    type: HIDE_MOBILE_GLOBAL_HEADER,
  }
}

export const displayMobileGlobalHeader = (message, action) => dispatch =>
  dispatch(showMobileGlobalHeader(message, action))

export const hideMobileGlobalHeader = (message, action) => dispatch =>
  dispatch(closeMobileGlobalHeader(message, action))
