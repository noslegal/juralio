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

import { CONFIMRATION_STATUS } from '../../../app/constants'

export const compareStrings = (a, b) => {
  a = a ? a.toLowerCase() : ''
  b = b ? b.toLowerCase() : ''
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export const compareStringsDescending = (a, b) => compareStrings(a, b) * -1

export const compareNumbers = (a, b) => compareNumbersDescending(a, b) * -1

export const compareNumbersDescending = (a, b) => {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export const compareBools = (a, b) => {
  if (a === b) return 0
  if (a && !b) return -1
  if (!a && b) return 1
}

export const compareBoolsDescending = (a, b) => compareBools(a, b) * -1

export const compareCheckboxes = () => {
  return order =>
    ({ data: val1 }, { data: val2 }) => {
      return order === 'desc'
        ? compareBools(val1.props.checked, val2.props.checked)
        : compareBoolsDescending(val1.props.checked, val2.props.checked)
    }
}

export const compareConfirmationStatus = (a, b) => {
  let e = {}
  e[`${CONFIMRATION_STATUS.TRIALING}`] = 0
  e[`${CONFIMRATION_STATUS.CONFIRMED}`] = 1
  e[`${CONFIMRATION_STATUS.WHITELISTED}`] = 2
  e[`${CONFIMRATION_STATUS.LAPSED}`] = 3
  if (
    a.confirmationStatus === b.confirmationStatus &&
    a.confirmationStatus === CONFIMRATION_STATUS.TRIALING
  ) {
    let t1 = new Date(a.trialStartDate).getTime()
    let t2 = new Date(b.trialStartDate).getTime()
    if (t1 < t2) return -1
    if (t2 < t1) return 1
  }
  if (e[a.confirmationStatus] < e[b.confirmationStatus]) return -1
  if (e[a.confirmationStatus] > e[b.confirmationStatus]) return 1
  return 0
}
