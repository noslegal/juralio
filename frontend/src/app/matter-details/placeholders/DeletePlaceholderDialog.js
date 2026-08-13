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

import { Button } from '@mui/material'
import React, { useState } from 'react'
import { DeleteIcon } from '../../../theme/navigation/CommonIcons'
import ConfirmationDialog from '../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import placeholderService from '../../../services/placeholders/placeholder-service'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { fetchTeam } from '../../../redux/ducks/matter-team'

const DeletePlaceholderDialog = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [showDialog, setShowDialog] = useState(false)
  const handleConfirm = () => {
    placeholderService
      .disablePlaceholder(props.placeholder.matter.id, props.placeholder.id)
      .then(res => {
        if (res.status === 200) {
          setShowDialog(false)
          dispatch(fetchTeam(props.placeholder.matter.id, false, true))
          props.callBack()
        }
      })
  }

  const handleCancel = () => {
    setShowDialog(false)
  }

  return (
    <>
      <Button
        variant="text"
        color="primary"
        onClick={() => setShowDialog(true)}
        startIcon={<DeleteIcon />}
        data-test="delete-placeholder-button"
      >
        {t('common.delete')}
      </Button>
      {showDialog && (
        <ConfirmationDialog
          headerIcon={DeleteIcon}
          titleText={t(
            'matterAdmin.placeholders.dialog.deletePlaceholderHeader',
            {
              placeholderName:
                props.placeholder.firstName + ' ' + props.placeholder.lastName,
            }
          )}
          actionText={t('common.delete')}
          promptText={t(
            'matterAdmin.placeholders.dialog.deletePlaceholderPrompt'
          )}
          actionHandler={handleConfirm}
          cancelHandler={handleCancel}
          data-test="delete-confirmation-dialog"
          usageContext="DeletePlaceholder"
          warningText={null}
        />
      )}
    </>
  )
}
export default DeletePlaceholderDialog
