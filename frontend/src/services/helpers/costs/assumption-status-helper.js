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

import { ASSUMPTION_STATUS } from '../../../app/constants'
import juralioColours from '../../../theme/juralio-colours'

const assumptionStatusColours = {
  [ASSUMPTION_STATUS.ON_TARGET]: juralioColours.assumptionStatus.onTarget,
  [ASSUMPTION_STATUS.AT_RISK]: juralioColours.assumptionStatus.atRisk,
  [ASSUMPTION_STATUS.MET]: juralioColours.assumptionStatus.met,
  [ASSUMPTION_STATUS.NOT_MET]: juralioColours.assumptionStatus.notMet,
}

// Statuses that flag a change notification on associated projections.
export const FLAGGED_ASSUMPTION_STATUSES = [
  ASSUMPTION_STATUS.AT_RISK,
  ASSUMPTION_STATUS.NOT_MET,
]

// Display order for the status dropdown.
export const ASSUMPTION_STATUS_OPTIONS = [
  ASSUMPTION_STATUS.ON_TARGET,
  ASSUMPTION_STATUS.AT_RISK,
  ASSUMPTION_STATUS.MET,
  ASSUMPTION_STATUS.NOT_MET,
]

const getAssumptionStatusColours = status =>
  assumptionStatusColours[status] ||
  assumptionStatusColours[ASSUMPTION_STATUS.ON_TARGET]

export const getAssumptionStatusColour = status =>
  getAssumptionStatusColours(status).background

export const getAssumptionStatusTextColour = status =>
  getAssumptionStatusColours(status).text
