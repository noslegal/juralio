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
import { DeleteIcon } from '../../../theme/navigation/CommonIcons'
import { ACTIVITIES, LABELS, LABEL_TYPES } from '../../constants'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import LabelsMatterAdminPanel from './LabelsMatterAdminPanel'
import {
  addNewLabel,
  getMatterLabels,
  resetLabels,
  updateLabelName,
  updateLabelStatus,
} from './redux/matter-admin-labels-actions'

const confirmationOptions = {
  headerIcon: DeleteIcon,
  actionText: 'common.proceed',
  cancelText: 'common.cancel',
  titleText: 'labels.confirmDelete.header',
  promptText: 'labels.confirmDelete.promptText_matter',
  usageContext: 'LabelDeletion',
  cancel: () => {},
}

const LabelsMatterAdminPanelContainer = props => {
  const dispatch = useDispatch()
  const { matter } = props
  const labels = useSelector(state => state.matterAdminLabels.labels)
  const areMatterLabelsLoaded = useSelector(
    state => state.matterAdminLabels.areMatterLabelsLoaded
  )
  const isLabelLimitReached =
    labels.totalCount + 1 > LABELS.COUNT_LIMIT.MATTER_ADMIN
  var isMatterEditor
  if (matter.activities !== null) {
    isMatterEditor =
      matter?.activities.indexOf(ACTIVITIES.MATTER_TEAM_MEMBER) > -1
  }
  const updateLabelStatusHandler = (labelId, inactive) =>
    dispatch(updateLabelStatus(matter.id, labelId, inactive))
  const deleteHandler = (labelId, labelName) => {
    confirmationOptions.titleExtra = labelName
    dispatch(
      displayConfirmationDialog(confirmationOptions, () =>
        dispatch(updateLabelStatus(matter.id, labelId, true))
      )
    )
  }
  const addNewLabelHandler = (name, type) => {
    // if a deleted label that's in tasks is being reactivated, reload the labels to display it accurately
    if (checkInactiveLabelName(name, type)) {
      dispatch(addNewLabel(matter.id, name, type))
      dispatch(resetLabels())
    } else {
      dispatch(addNewLabel(matter.id, name, type))
    }
  }

  const updateLabelNameHandler = label =>
    dispatch(updateLabelName(matter.id, label))

  useEffect(() => {
    if (!areMatterLabelsLoaded && matter.matterStatus !== 'closed') {
      dispatch(getMatterLabels(matter.id))
      return
    }
    return () => dispatch(resetLabels())
  }, [dispatch, matter.id, areMatterLabelsLoaded, matter.matterStatus])

  const checkInactiveLabelName = (name, type) => {
    const items =
      type === LABEL_TYPES.RISK
        ? Object.entries(labels.risks.bespoke)
        : type === LABEL_TYPES.WORKFLOW
          ? Object.entries(labels.workflow.bespoke)
          : Object.entries(labels.userDefined)

    for (let i = 0; i < items.length; i++) {
      if (items[i][1].inactive && items[i][1].name === name) {
        return true
      }
    }
    return false
  }

  return (
    <LabelsMatterAdminPanel
      labels={labels}
      matter={matter}
      isMatterEditor={isMatterEditor}
      isLabelLimitReached={isLabelLimitReached}
      isLoaded={areMatterLabelsLoaded}
      addNewHandler={addNewLabelHandler}
      deleteHandler={deleteHandler}
      updateHandler={updateLabelStatusHandler}
      updateLabelNameHandler={updateLabelNameHandler}
    />
  )
}

export default LabelsMatterAdminPanelContainer
