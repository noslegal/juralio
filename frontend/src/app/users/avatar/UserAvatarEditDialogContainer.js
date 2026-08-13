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

import { DialogContent, Typography, useMediaQuery } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import juralioTheme from '../../../theme/juralio-theme'
import { updateSelf } from '../users-actions'
import UserAvatarEditDialog from './UserAvatarEditDialog'
const UserAvatarEditDialogContainer = props => {
  const { t } = useTranslation()
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const [colour, setColour] = useState(props.user.avatarColorIndex)
  const [image, setImage] = useState(props.user.avatarImageIndex)
  const dispatch = useDispatch()

  const close = () => {
    props.closeDialog()
  }

  const submit = () => {
    dispatch(
      updateSelf({ avatarColorIndex: colour, avatarImageIndex: image })
    ).then(() => {
      close()
    })
  }

  return (
    <JuralioDialog
      open={true}
      titleText={
        <div>
          <Typography variant="h6">
            {t('userSettings.editProfileImage')}
          </Typography>
        </div>
      }
      handleCancel={close}
      onClose={close}
      fullScreen={isMobileView}
      handleAction={submit}
      actionLabel={t('common.save')}
      disabled={
        colour === props.user.avatarColorIndex &&
        image === props.user.avatarImageIndex
      }
    >
      <DialogContent>
        <UserAvatarEditDialog
          user={props.user}
          colour={colour}
          image={image}
          setImage={setImage}
          setColour={setColour}
        />
      </DialogContent>
    </JuralioDialog>
  )
}

export default UserAvatarEditDialogContainer
