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

import { Base64 } from 'js-base64'

export const encode = (username, password) => {
  const jsonObj = JSON.stringify({ username: username, password: password })
  const base64Obj = btoa(jsonObj)
  return base64Obj
}

export const decode = token => {
  const userObj = Base64.decode(token.replace(' ', '+'))
  return JSON.parse(userObj)
}
