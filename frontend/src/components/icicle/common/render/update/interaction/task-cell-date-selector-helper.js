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

import { selectAll } from 'd3-selection'
import { ICICLE_CSS_NAME } from '../../../selection/selector'
import { showTaskmapDatePickerForTask } from '../../../../../../app/task-details/task-actions'
import store from '../../../../../../store/configure-store'

export const setUpTaskDatePicker = cells => {
  selectAll('[id^=taskCellDatePicker-start]').on('click', e => {
    e.stopPropagation()
    let id = parseInt(e.target.closest(`.${ICICLE_CSS_NAME}`).id.substring(1))
    let cell = cells.data().filter(d => {
      return d.data.id === id
    })[0]
    const projectId = cells.data()[0].data.id
    let data = cell.data
    data.projectId = projectId
    store.dispatch(
      showTaskmapDatePickerForTask({
        task: data,
        dateType: 'start',
      })
    )
  })

  selectAll('[id^=taskCellDatePicker-end]').on('click', e => {
    e.stopPropagation()
    let id = parseInt(e.target.closest(`.${ICICLE_CSS_NAME}`).id.substring(1))
    let cell = cells.data().filter(d => {
      return d.data.id === id
    })[0]
    const projectId = cells.data()[0].data.id
    let data = cell.data
    data.projectId = projectId

    store.dispatch(
      showTaskmapDatePickerForTask({ task: data, dateType: 'end' })
    )
  })
}
