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

import { FormControlLabel, FormGroup, Switch } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { showSnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import { updateInstanceSettings } from '../../../redux/actions/instance-management-actions'

const ShowSplashScreen = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const instanceSettings = useSelector(state => state.instanceSettings)
  const [enable, setEnable] = useState(
    instanceSettings.settings.showFirstLoginSplashScreen
  )

  const handleSwitch = () => {
    dispatch(
      updateInstanceSettings({
        showFirstLoginSplashScreen: !enable,
      })
    ).then(res => {
      if (res.type === 'UPDATE_INSTANCE_SETTINGS_SUCCESS') {
        dispatch(
          showSnackbar(t('sysAdmin.instanceManagement.enableLoginSplashScreen'))
        )
        setEnable(!enable)
      }
    })
  }

  return (
    <div>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={enable}
              onChange={() => handleSwitch()}
              color="primary"
            />
          }
          label={t('sysAdmin.instanceManagement.loginSplashScreen')}
        />
      </FormGroup>
    </div>
  )
}
export default ShowSplashScreen
