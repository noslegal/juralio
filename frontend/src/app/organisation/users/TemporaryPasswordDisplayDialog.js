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

import { DialogContent, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JurEmailSent from '../../../assets/images/JurEmailSent'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import { resetTemporaryPasswordState } from '../../users/users-actions'

const useStyles = makeStyles()(theme => ({
  content: {
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}))

const TemporaryPasswordDisplayDialog = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const temporaryPasswordState = useSelector(
    state => state.users?.temporaryPassword
  )
  const resetState = () => dispatch(resetTemporaryPasswordState())

  const getContextAwareLabel = (identifier, additionalProps) => {
    if (temporaryPasswordState?.isNewUser) {
      return t('userCreation.completed.newAccount')
    } else if (temporaryPasswordState?.isAuthChange) {
      return t('userCreation.completed.authChange')
    } else {
      return t('userCreation.completed.passwordReset')
    }
  }

  if (temporaryPasswordState?.isNewUser) {
    return null
  }

  return (
    <JuralioDialog
      data-test="temporary-password-dialog"
      onClose={resetState}
      open={temporaryPasswordState?.password !== undefined}
      titleText={getContextAwareLabel()}
      hideCancel={true}
      actionLabel={t('common.close')}
      handleAction={resetState}
    >
      <DialogContent className={classes.content}>
        <JurEmailSent />
        <Typography>{t('userCreation.completed.emailSent')}</Typography>
      </DialogContent>
    </JuralioDialog>
  )
}

export default TemporaryPasswordDisplayDialog
