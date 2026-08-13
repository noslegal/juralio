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

import { isInTaskDetails } from '../../components/navigation/common/location-context-helper'

export const Variants = {
  NotApplicable: 0,
  Overview: 1,
  Interactive: 2,
}

export class TaskMapConsistencyHelper {
  constructor() {
    this.variant = Variants.NotApplicable
  }

  getTaskMapVariant = isMobileView => {
    return isMobileView ? Variants.Interactive : this.variant
  }

  updateFromLocationHistory = (currentLocation, lastLocation) => {
    if (lastLocation) {
      const isVisitingFromTaskMap = lastLocation.includes('/taskmap')

      if (isVisitingFromTaskMap) {
        this.variant = Variants.Interactive
      } else {
        const isReturningToTaskMap = this.variant !== Variants.NotApplicable

        if (isReturningToTaskMap) {
          const isVisitingFromTaskDetails = isInTaskDetails(lastLocation)
          const isCurrentlyTaskDetails = isInTaskDetails(currentLocation)
          const isVisitingFromTimeline = lastLocation.includes('/timeline')
          const isCurrentlyTimeline = currentLocation.includes('/timeline')

          const isMovingBetweenTasksInTaskDetails =
            isVisitingFromTaskDetails && isCurrentlyTaskDetails
          const isMovingBetweenTasksInTimeline =
            isVisitingFromTimeline && isCurrentlyTimeline

          if (
            isMovingBetweenTasksInTaskDetails ||
            isMovingBetweenTasksInTimeline
          ) {
            // Make sure we go back to interactive task map now, even if we visited from overview.
            // Also update the selected task to reflect the current state.
            this.variant = Variants.Interactive
          }
        }
      }
    } else {
      this.variant = Variants.Interactive
    }
  }
}
