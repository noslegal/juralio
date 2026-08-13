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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/SignpostwithBG.png'
import { hasRole } from '../../../services/user/helper/user-role-service'
import rawColours from '../../../theme/raw-colours'
import { USER_ROLES } from '../../constants'

const style = makeStyles()(theme => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '7%',
    alignItems: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
    maxWidth: theme.spacing(80),
  },
  link: {
    color: rawColours.primary.primary.main,
    marginTop: theme.spacing(2),
  },
  title: {
    textAlign: 'center',
  },
}))

const DesktopHomeZeroState = () => {
  const { t } = useTranslation()
  const { classes } = style()
  const user = useSelector(state => state.auth.data.auth)
  const isMatterCreator = hasRole(USER_ROLES.ROLE_MATTER_CREATOR, user)
  return (
    <div className={classes.wrapper}>
      <img
        width="550"
        height="375"
        src={zeroStateImage}
        alt={t('inboxZeroState.imageAlt')}
        data-test="desktop-home-zero-state"
        style={{ pointerEvents: 'none' }}
      />
      <Typography
        variant="h2"
        data-test="desktop-home-zero-state"
        className={classes.title}
      >
        {t('desktop.zeroState.title')}
      </Typography>
      <Typography
        variant="h6"
        className={classes.subtitle}
        data-test="home-zero-state"
      >
        {isMatterCreator
          ? t('desktop.zeroState.matterCreatorSubtitle')
          : t('desktop.zeroState.subtitle')}
      </Typography>
    </div>
  )
}

export default DesktopHomeZeroState
