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

import { TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { _updateOrgLoginMsg } from '../../../../../admin/organisations/organisation-actions'
import organisationService from '../../../../../services/organisation/organisation-service'
import JuralioDialog from '../../../../dialog/juralio-dialog/JuralioDialog'

const useStyles = makeStyles()(theme => ({
  textEditContainer: {
    margin: theme.spacing(2),
  },
  maxChar: {
    margin: theme.spacing(2),
  },
  inputFieldTrial: {
    width: theme.spacing(40),
    margin: theme.spacing(1),
  },
  inputFieldLapsed: {
    width: theme.spacing(40),
    margin: theme.spacing(1),
  },
}))

const EditLoginMsgDialog = props => {
  const TrialMessage = useSelector(
    state => state.organisation.selectedOrganisation.trialMessage
  )
  const LapsedLoginMessage = useSelector(
    state => state.organisation.selectedOrganisation.lapsedLoginMessage
  )

  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [trialMessage, setTrialMessage] = useState(
    TrialMessage === '' ? 'Your Administartor' : TrialMessage
  )
  const [lapsedLoginMessage, setLapsedLoginMessage] = useState(
    LapsedLoginMessage === ''
      ? 'Your free try-out of Juralio has lapsed. Please contact your administrator if you’d like to continue.'
      : LapsedLoginMessage
  )
  const [trialFieldTooLong, setTrialFieldTooLong] = useState(false)
  const [lapsedFieldTooLong, setLapsedFieldTooLong] = useState(false)

  const handleTrialMessageInput = e => {
    setTrialMessage(e.target.value)
    if (trialMessage?.length && trialMessage?.length > 20) {
      setTrialFieldTooLong(true)
    } else {
      setTrialFieldTooLong(false)
    }
  }

  const handleLapsedLoginMessageInput = e => {
    setLapsedLoginMessage(e.target.value)
    if (lapsedLoginMessage?.length && lapsedLoginMessage?.length > 150) {
      setLapsedFieldTooLong(true)
    } else {
      setLapsedFieldTooLong(false)
    }
  }

  const submitCustomMessages = () => {
    if (LapsedLoginMessage === null) {
      organisationService
        .saveLapsedLoginMessage(props.organisation.id, {
          lapsedLoginMessage: lapsedLoginMessage,
        })
        .then(() => {
          if (TrialMessage === null) {
            organisationService.saveTrialCardMessage(props.organisation.id, {
              trialMessage: trialMessage,
            })
          } else if (trialMessage !== TrialMessage) {
            organisationService.updateTrialCardMessage(props.organisation.id, {
              trialMessage: trialMessage,
            })
          }
        })
    } else if (lapsedLoginMessage !== LapsedLoginMessage) {
      organisationService
        .updateLapsedLoginMessage(props.organisation.id, {
          lapsedLoginMessage: lapsedLoginMessage,
        })
        .then(() => {
          if (TrialMessage === null) {
            organisationService.saveTrialCardMessage(props.organisation.id, {
              trialMessage: trialMessage,
            })
          } else if (trialMessage !== TrialMessage) {
            organisationService.updateTrialCardMessage(props.organisation.id, {
              trialMessage: trialMessage,
            })
          }
        })
    } else if (TrialMessage === null) {
      organisationService.saveTrialCardMessage(props.organisation.id, {
        trialMessage: trialMessage,
      })
    } else if (trialMessage !== TrialMessage) {
      organisationService.updateTrialCardMessage(props.organisation.id, {
        trialMessage: trialMessage,
      })
    }
    dispatch(_updateOrgLoginMsg(lapsedLoginMessage, trialMessage))
    props.cancelHandler()
  }

  return (
    <JuralioDialog
      actionLabel={t('common.save')}
      onClose={() => props.cancelHandler()}
      handleCancel={() => props.cancelHandler()}
      handleAction={() => submitCustomMessages()}
      titleText={t('customMessageDialog.title')}
      disabled={
        trialFieldTooLong ||
        lapsedFieldTooLong ||
        (trialMessage === TrialMessage &&
          lapsedLoginMessage === LapsedLoginMessage)
      }
      open={true}
    >
      <div className={classes.textEditContainer}>
        <div className={classes.textEditContainer}>
          <Typography>{t('customMessageDialog.lapsedLoginHeader')}</Typography>

          {lapsedFieldTooLong && (
            <Typography className={classes.maxChar}>
              {t('matterAdmin.people.maxCharLimitReached')}
            </Typography>
          )}
          <TextField
            data-test="lapsed-login-text-box"
            className={classes.inputFieldLapsed}
            label={t('customMessageDialog.lapsedLoginTextField')}
            onChange={handleLapsedLoginMessageInput}
            error={lapsedFieldTooLong}
            value={lapsedLoginMessage}
            helperText={t('customMessageDialog.lapsedLoginHelper')}
            autoWidth
          ></TextField>
        </div>
        <div className={classes.textEditContainer}>
          <Typography>{t('customMessageDialog.trialHeader')}</Typography>
          {trialFieldTooLong && (
            <Typography className={classes.maxChar}>
              {t('matterAdmin.people.maxCharLimitReached')}
            </Typography>
          )}
          <TextField
            data-test="trial-card-text-box"
            className={classes.inputFieldTrial}
            label={t('customMessageDialog.trialTextField')}
            onChange={handleTrialMessageInput}
            error={trialFieldTooLong}
            value={trialMessage}
            helperText={t('customMessageDialog.trialHelper')}
          ></TextField>
        </div>
      </div>
    </JuralioDialog>
  )
}
export default EditLoginMsgDialog
