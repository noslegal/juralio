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

import PersonIcon from '@mui/icons-material/Person'
import { DialogContent, useMediaQuery, useTheme } from '@mui/material'
import TextField from '@mui/material/TextField'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'

const useStyles = makeStyles()(theme => ({
  dialogContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '0px !important',
    flexDirection: 'column',
  },
  nameTextField: {
    flex: 1,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  welcomeImage: {
    height: theme.spacing(10),
    marginBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
  },
}))

const UserProfileDialog = props => {
  const {
    dialogOpen,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    actionDisabled,
    handleSave,
    showLoadingBar,
  } = props
  const { t } = useTranslation()
  const { classes } = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <JuralioDialog
      open={dialogOpen}
      dialogHeightShort={true}
      hideCancel={true}
      onClose={props.handleCloseDialog}
      disabled={actionDisabled}
      actionLabel={t('common.save')}
      handleAction={handleSave}
      fullScreen={isMobileView}
      titleIcon={PersonIcon}
      titleText={'Welcome! Please enter your name'}
      showLoadingBar={showLoadingBar}
      loadingText={t('userSettings.loadingText')}
    >
      <DialogContent className={classes.dialogContent}>
        {/* <img src={logo} alt={'temp'} className={classes.welcomeImage} /> */}
        <div className={classes.row}>
          <TextField
            label={t('userDetails.firstNameLabel')}
            className={classes.nameTextField}
            data-test="first-name-field"
            placeholder={t('userDetails.firstNameLabel')}
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <TextField
            label={t('userDetails.lastNameLabel')}
            className={classes.nameTextField}
            data-test="last-name-field"
            placeholder={t('userDetails.lastNameLabel')}
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}

export default UserProfileDialog
