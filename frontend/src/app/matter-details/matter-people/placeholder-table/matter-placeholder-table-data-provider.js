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

import { compareStrings } from '../../../../services/helpers/table/juralio-table-sorting-helper'

const processData = (t, data) => {
  const records = []
  if (data.length > 0) {
    data.forEach(placeholder => {
      records.push({
        id: placeholder.id,
        _placeholder: placeholder,
        fullname: `${placeholder.firstName} ${placeholder.lastName}`,
        emailAddress: placeholder.emailAddress,
        taskCount: placeholder.taskCount,
        postCount: placeholder.postCount,
        _search:
          `${placeholder.emailAddress} ${placeholder.firstName} ${placeholder.lastName}`.toLowerCase(),
      })
    })
  }
  records.sort((a, b) =>
    compareStrings(a._placeholder.firstName, b._placeholder.firstName)
  )
  records.sort((a, b) =>
    compareStrings(a._placeholder.lastName, b._placeholder.lastName)
  )
  return records
}

export default processData
