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

import i18n from 'i18next'
import labelService from '../../../../../services/label/label-service'
import { showSnackbar } from '../../../../global-snackbar/global-snackbar-actions'
import { LabelsActions } from './labels-action-types'

const _resetLabels = () => {
  return { type: LabelsActions.RESET_LABELS }
}

const _updateLabelStatus = (labelId, inactive) => {
  return {
    type: LabelsActions.UPDATE_LABEL_STATUS,
    labelId: labelId,
    inactive: inactive,
    inactiveSince: new Date().toISOString(),
  }
}

const _addNewLabel = label => {
  return {
    type: LabelsActions.ADD_NEW_LABEL,
    label,
  }
}

const _updateLabelName = label => {
  return {
    type: LabelsActions.UPDATE_LABEL_NAME,
    label,
  }
}

const _getAllLabels = allLabels => {
  return {
    type: LabelsActions.RECEIVE_ALL_LABELS,
    allLabels: allLabels,
  }
}

export const addNewLabel = (name, type) => dispatch => {
  labelService.addOrganisationLabel(name, type).then(response => {
    if (response.status === 200) {
      dispatch(_addNewLabel(response.body))
    } else if (response.status === 400 && response.body.text) {
      dispatch(showSnackbar(i18n.t('labels.errors.labelAlreadyExists')))
    } else {
      dispatch(showSnackbar(i18n.t('commonValidationMessages.unknownError')))
    }
  })
}

export const getAllLabels = () => dispatch => {
  labelService.getOrganisationLabels(true).then(response => {
    dispatch(_getAllLabels(response.body))
  })
}

export const updateLabelStatus = (labelId, inactive) => dispatch => {
  dispatch(_updateLabelStatus(labelId, inactive)) // Immediate GUI update. (Experimental).
  labelService.updateOrganisationLabel(labelId, { inactive }).then(() => {
    dispatch(_updateLabelStatus(labelId, inactive))
  })
}

export const updateLabelName = label => dispatch => {
  labelService.updateOrganisationLabel(label.id, label).then(response => {
    if (response.status === 200) {
      dispatch(_updateLabelName(response.body))
    } else if (response.status === 400 && response.body.text) {
      dispatch(showSnackbar(i18n.t('labels.errors.labelAlreadyExists')))
    } else {
      dispatch(showSnackbar(i18n.t('commonValidationMessages.unknownError')))
    }
  })
}

export const resetLabels = () => dispatch => dispatch(_resetLabels())
