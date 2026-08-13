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

import { LABEL_MODIFIERS, LABEL_TYPES } from '../../constants'

export const sortLabels = (a, b) => {
  if (a.type === LABEL_TYPES.RISK && b.type === LABEL_TYPES.WORKFLOW) {
    return 1
  }
  if (a.type === LABEL_TYPES.WORKFLOW && b.type === LABEL_TYPES.RISK) {
    return -1
  }

  if (a.type === LABEL_TYPES.USER_DEFINED && b.type === LABEL_TYPES.WORKFLOW) {
    return 1
  }
  if (a.type === LABEL_TYPES.WORKFLOW && b.type === LABEL_TYPES.USER_DEFINED) {
    return -1
  }

  if (a.type === LABEL_TYPES.RISK && b.type === LABEL_TYPES.USER_DEFINED) {
    return -1
  }
  if (a.type === LABEL_TYPES.USER_DEFINED && b.type === LABEL_TYPES.RISK) {
    return 1
  }
  if (a.type === LABEL_TYPES.RISK && b.type === LABEL_TYPES.RISK) {
    return sortByRisk(a, b)
  }

  if (a.name < b.name) {
    return -1
  }
  if (b.name < a.name) {
    return 1
  }
  return 0
}

export const sortByRisk = (a, b) => {
  if (a.modifier === LABEL_MODIFIERS.RED) {
    return -1
  }
  if (
    a.modifier === LABEL_MODIFIERS.AMBER &&
    b.modifier === LABEL_MODIFIERS.RED
  ) {
    return 1
  }
  if (
    a.modifier === LABEL_MODIFIERS.AMBER &&
    b.modifier === LABEL_MODIFIERS.GREEN
  ) {
    return -1
  }
  if (a.modifier === LABEL_MODIFIERS.GREEN) {
    return 1
  }
  if (a.name < b.name) {
    return -1
  }
  if (b.name < a.name) {
    return 1
  }
  return 0
}

export const getHighestRisk = labels => {
  if (!labels) {
    return null
  }
  const riskLabels = labels.filter(l => l.type === LABEL_TYPES.RISK)
  if (riskLabels.length === 0) {
    return null
  }
  return riskLabels.sort(sortByRisk)[0]
}
