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
import { displaySnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import { getMatterLabels } from '../../app/matter-details/labels/redux/matter-admin-labels-actions'
import labelService from './label-service'

export const removeLabelUses = (matterId, labelId, taskIds) => dispatch => {
  labelService.removeLabelUses(matterId, labelId, taskIds).then(() => {
    dispatch(getMatterLabels(matterId))
    dispatch(displaySnackbar(i18n.t('labels.actions.removedFromTasks')))
  })
}
