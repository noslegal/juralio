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

import TimeWithCap from '../../../assets/images/JurTimeWithCap'
import Handshake from '../../../assets/images/JurHandshake'
import JurMarketing from '../../../assets/images/JurMarketing'
import JurCharity from '../../../assets/images/JurCharity'
import JurInternal from '../../../assets/images/JurInternal'
import JurAnotherReason from '../../../assets/images/JurAnotherReason'
import JurClock from '../../../assets/images/JurClock'

export const getPricingType = (type, cap, value) => {
  switch (parseInt(type)) {
    case 0:
      if (cap === '1' || cap === true) {
        return `Time-based, capped at ${value
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
      } else {
        return 'Time-based, uncapped'
      }
    case 1:
      return `Fixed fee of ${value
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    case 2:
      return 'No fee'
    default:
      break
  }
}

export const getPricingIcon = (type, cap, reason, t) => {
  switch (parseInt(type)) {
    case 0:
      if (cap === '1' || cap === true) {
        return <TimeWithCap />
      } else {
        return <JurClock />
      }
    case 1:
      return <Handshake />
    case 2:
      if (reason === 'Marketing or sales') {
        return <JurMarketing />
      } else if (reason === t('matterCosts.internalWork')) {
        return <JurInternal />
      } else if (reason === 'Charitable or pro bono') {
        return <JurCharity />
      } else {
        return <JurAnotherReason />
      }
    default:
      break
  }
}
