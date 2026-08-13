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

import {
  Button,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { showSnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import { updateInstanceSettings } from '../../../redux/actions/instance-management-actions'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(),
  },
}))

const DefaultTemplateSetup = () => {
  const instanceSettings = useSelector(state => state.instanceSettings)
  const { t } = useTranslation()
  const [templateId, setTemplateId] = useState(
    instanceSettings?.settings?.initialTemplateId
  )
  useEffect(() => {
    setTemplateId(instanceSettings?.settings?.initialTemplateId)
  }, [instanceSettings])
  const dispatch = useDispatch()
  const { classes } = style()
  const submit = () => {
    dispatch(
      updateInstanceSettings({
        initialTemplateId: parseInt(templateId),
      })
    ).then(res => {
      if (res.type === 'UPDATE_INSTANCE_SETTINGS_SUCCESS') {
        dispatch(
          showSnackbar(
            t('sysAdmin.instanceManagement.updatedInitialTemplateId')
          )
        )
      }
    })
  }

  return (
    <div className={classes.wrapper}>
      <FormGroup>
        <FormControlLabel
          label={
            <Typography>
              {t('sysAdmin.instanceManagement.initalTemplateId')}
            </Typography>
          }
          control={
            <TextField
              type="number"
              value={templateId}
              onChange={e => {
                e.stopPropagation()
                setTemplateId(e.target.value)
              }}
            />
          }
        />
      </FormGroup>
      <Button variant="contained" color="primary" onClick={submit}>
        {t('common.save')}
      </Button>
    </div>
  )
}

export default DefaultTemplateSetup
