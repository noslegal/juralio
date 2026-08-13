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

import { compareStrings } from './juralio-table-sorting-helper'

export const userNameComparator = (v1, v2) =>
  compareStrings(
    v1.lastname + ' ' + v1.firstname,
    v2.lastname + ' ' + v2.firstname
  )

export const userRolesComparator = (v1, v2) =>
  compareStrings(v1.toString(), v2.toString())
