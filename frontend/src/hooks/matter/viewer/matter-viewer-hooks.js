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
import { useSelector } from 'react-redux'
import { ACTIVITIES } from '../../../app/constants'

export function useIsViewOnly(matter) {
  const [isViewOnly, setIsViewOnly] = useState(true)
  const userDetails = useSelector(state => state.auth.data.details)

  useEffect(() => {
    if (!matter || !matter.activities) return
    let matterIsViewOnly = matter?.activities.includes(ACTIVITIES.MATTER_VIEWER)

    if (userDetails.roles.includes('FROZEN_ORG_USER')) {
      matterIsViewOnly = true
    }
    setIsViewOnly(matterIsViewOnly)
  }, [matter]) // eslint-disable-line

  return isViewOnly
}
