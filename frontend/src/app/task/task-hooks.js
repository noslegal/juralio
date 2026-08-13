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

import { useEffect, useState } from 'react'

export const useDateSelector = (taskStatus, psd, ped, asd, aed) => {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  useEffect(() => {
    switch (taskStatus) {
      case 'not-started': {
        setStartDate(psd)
        setEndDate(ped)
        break
      }
      case 'in-progress': {
        setStartDate(asd)
        setEndDate(ped)
        break
      }
      case 'done': {
        setStartDate(asd)
        setEndDate(aed)
        break
      }
      default: {
        console.info('Error in task-hooks.js')
        return
      }
    }
  }, [psd, ped, asd, aed]) // eslint-disable-line

  return [startDate, endDate]
}
