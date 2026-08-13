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

import { MatterAdminLabelsActions } from './matter-admin-labels-action-types'
import {
  addNewLabel,
  getDefaultLabelStructure,
  processMatterLabels,
  updateLabelName,
  updateLabelsInactive,
} from './matter-admin-labels-data-helper'

const matterAdminLabelReducer = (
  state = {
    areMatterLabelsLoaded: false,
    labels: getDefaultLabelStructure(),
  },
  action
) => {
  switch (action.type) {
    case MatterAdminLabelsActions.RESET_LABELS:
      return {
        areMatterLabelsLoaded: false,
        labels: getDefaultLabelStructure(),
      }
    case MatterAdminLabelsActions.RECEIVE_MATTER_LABELS:
      state.areMatterLabelsLoaded = true
      state.labels = processMatterLabels(action.allLabels)
      return state
    case MatterAdminLabelsActions.ADD_NEW_LABEL:
      state.labels = addNewLabel(state.labels, action.label)
      return state
    case MatterAdminLabelsActions.UPDATE_LABEL_NAME:
      state.labels = updateLabelName(state.labels, action.label)
      return state
    case MatterAdminLabelsActions.UPDATE_LABEL_STATUS:
      state.labels = updateLabelsInactive(
        state.labels,
        action.labelId,
        action.inactive,
        action.inactiveSince
      )
      return state
    default:
      return state
  }
}

export default matterAdminLabelReducer
