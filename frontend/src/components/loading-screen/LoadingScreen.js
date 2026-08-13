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

import HelpIcon from '@mui/icons-material/Help'
import { Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../theme/raw-colours'
import { getRandomLoadingScreenTip } from './loading-screen-tips'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  tip: {},
  icon: {
    height: theme.spacing(8),
    width: theme.spacing(8),
    marginBottom: theme.spacing(2),
    color: rawColours.primary.primary.main,
  },
}))

const LoadingScreen = () => {
  const { t } = useTranslation()
  const [text, setText] = useState(getRandomLoadingScreenTip(t))
  const { classes } = styles()
  return (
    <div className={classes.wrapper}>
      <HelpIcon className={classes.icon} />
      <Typography variant={'h6'} className={classes.title}>
        {t('loadingScreen.didYouKnow')}
      </Typography>
      <Typography className={classes.tip}>{text}</Typography>
    </div>
  )
}
export default LoadingScreen
