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
import { makeStyles } from 'tss-react/mui'
import loginBackgroundImage from '../assets/images/background-pattern.svg'
import Image from '../assets/images/Martensitting.png'

const style = makeStyles()(theme => ({
  wrapper: {
    height: '100%',
    width: '100%',
    background: `url(${loginBackgroundImage})`,
    backgroundColor: '#7FB4B7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    width: '80%',
    textAlign: 'center',
    marginBottom: theme.spacing(),
  },
  card: {
    width: '100%',
    height: 'fit-content',
    backgroundColor: 'rgba(255,255,255,0.92)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
}))

const MobileVisit = props => {
  const { t } = useTranslation()
  const { classes } = style()
  return (
    <div className={classes.wrapper} data-test="mobile-visit-screen">
      <div className={classes.card}>
        <img width="326" src={Image} alt={'marten-sitting'} />
        <Typography className={classes.text} variant="h6">
          {t('mobileVisitPage.thankYou')}
        </Typography>
        <Typography className={classes.text}>
          {t('mobileVisitPage.messageLine1')}
        </Typography>
        <Typography className={classes.text}>
          {t('mobileVisitPage.messageLine2')}
        </Typography>
      </div>
    </div>
  )
}
export default MobileVisit
