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

import { useMediaQuery, useTheme } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import MilestoneDestinationDialog from '../../dialog/milestone/MilestoneDestinationDialog'
import TextPromptDialog from '../../dialog/text-prompt-dialog/TextPromptDialog'

const CreateMilestoneFlow = props => {
  const {
    milestoneName,
    error,
    displayDestinationDialog,
    handleBack,
    createMilestone,
  } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const getFullScreenMode = useMediaQuery(theme.breakpoints.down('md'))

  const renderEntryDialog = () => {
    return (
      <TextPromptDialog
        titleText={t('milestoneCreation.nameYourNewMilestone')}
        titleIcon={MilestoneIcon}
        placeholderText={t('milestoneCreation.milestoneNamePlaceHolder')}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={t('common.next')}
        cancelHandler={props.cancelHandler}
        actionHandler={displayDestinationDialog}
        fullScreen={getFullScreenMode}
        usageContext="CreateMilestoneFlow"
      />
    )
  }

  return milestoneName.length > 0 ? (
    <MilestoneDestinationDialog
      cancelHandler={handleBack}
      createHandler={createMilestone}
      fullScreen={getFullScreenMode}
      error={error}
      cancelText={t('common.back')}
    />
  ) : (
    renderEntryDialog()
  )
}

CreateMilestoneFlow.propTypes = {
  milestoneName: PropTypes.string,
  error: PropTypes.string,
  parentTask: PropTypes.object,
  cancelHandler: PropTypes.func,
  createMilestoneInContext: PropTypes.func,
  displayDestinationDialog: PropTypes.func,
  handleBack: PropTypes.func,
  createMilestone: PropTypes.func,
}

export default CreateMilestoneFlow
