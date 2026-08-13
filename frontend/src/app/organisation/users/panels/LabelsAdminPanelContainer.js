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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  DeleteIcon,
  LabelsIcon,
} from '../../../../theme/navigation/CommonIcons'
import { LABELS } from '../../../constants'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import LabelsAdminPanel from './LabelsAdminPanel'
import {
  addNewLabel,
  getAllLabels,
  resetLabels,
  updateLabelName,
  updateLabelStatus,
} from './redux/labels-actions'
import { useTranslation } from 'react-i18next'

const confirmationOptions = {
  headerIcon: DeleteIcon,
  actionText: 'common.confirm',
  cancelText: 'common.cancel',
  titleText: 'labels.confirmDelete.header',
  promptText: 'labels.confirmDelete.promptText_org',
  usageContext: 'LabelDeletion',
  cancel: () => {},
}

const LabelsAdminPanelContainer = () => {
  const dispatch = useDispatch()
  const labels = useSelector(state => state.labels.labels)
  const labelsLoaded = useSelector(state => state.labels.isLoaded)
  const isLabelLimitReached =
    labels.totalCount + 1 > LABELS.COUNT_LIMIT.ORGANISATION
  const { t } = useTranslation()
  const updateLabelStatusHandler = (labelId, inactive, label) => {
    const confirmOptions = {
      actionText: t('common.confirm'),
      titleText: inactive
        ? t('labels.confirmation.titleDisable', { label: label.name })
        : t('labels.confirmation.titleEnable', { label: label.name }),
      promptText: inactive
        ? t('labels.confirmation.disablePrompt')
        : t('labels.confirmation.enablePrompt'),
      usageContext: 'ToggleLabelActivity',
      headerIcon: LabelsIcon,
      dontTranslatePromptText: true,
    }
    dispatch(
      displayConfirmationDialog(confirmOptions, () => {
        dispatch(updateLabelStatus(labelId, inactive))
      })
    )
  }
  const deleteHandler = (labelId, labelName) => {
    confirmationOptions.titleExtra = labelName
    dispatch(
      displayConfirmationDialog(confirmationOptions, () =>
        dispatch(updateLabelStatus(labelId, true))
      )
    )
  }
  const addNewLabelHandler = (name, type) => dispatch(addNewLabel(name, type))
  const updateLabelNameHandler = label => dispatch(updateLabelName(label))

  useEffect(() => {
    if (!labelsLoaded) {
      dispatch(getAllLabels())
      return
    }
    return () => dispatch(resetLabels())
  }, [dispatch, labelsLoaded])

  return (
    <LabelsAdminPanel
      labels={labels}
      isLoaded={labelsLoaded}
      isLabelLimitReached={isLabelLimitReached}
      addNewHandler={addNewLabelHandler}
      deleteHandler={deleteHandler}
      updateHandler={updateLabelStatusHandler}
      updateLabelNameHandler={updateLabelNameHandler}
    />
  )
}

export default LabelsAdminPanelContainer
