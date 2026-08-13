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
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import TwoColumnList from '../../components/layouts/two-column-list/TwoColumnList'
import PasswordResetContainer from './password/PasswordResetContainer'
import UserSettings from './UserSettings'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: `calc(100% - ${theme.spacing(4)})`,
  },
}))

const UserSettingsContainer = () => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const auth = useSelector(state => state.auth)

  useEffect(() => {
    document.title = t('userSettings.title')
  }, [t])

  let listItems = {
    userSettings: {
      dataTest: 'userSettings',
      prompt: t('userSettings.caption'),
      header: t('userSettings.header'),
      subtitle: t('userSettings.subtitle'),
      icon: <PersonIcon />,
      component: <UserSettings user={auth.data.details} />,
    },
  }
  if (!auth.data.details.isThirdPartyUser) {
    listItems.password = {
      dataTest: 'password',
      prompt: t('passwordSettings.caption'),
      header: t('passwordSettings.header'),
      subtitle: t('passwordSettings.subtitle'),
      icon: <VpnKeyIcon />,
      component: <PasswordResetContainer user={auth.data.details} />,
    }
  }

  return (
    <div className={classes.root}>
      <TwoColumnList listItems={listItems} />
    </div>
  )
}

export default UserSettingsContainer
