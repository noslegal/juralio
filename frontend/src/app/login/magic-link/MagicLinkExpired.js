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

import { Link, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import image from '../../../assets/images/MartenWalkLeft.png'

const translateContext = (t, context) => {
  switch (context) {
    case 'passwordReset':
      return t('login.magicLink.context.passwordReset')
    case 'newUser':
      return t('login.magicLink.context.invite')
    default:
      return t('login.magicLink.context.magicLink')
  }
}

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    marginTop: theme.spacing(2),
    cursor: 'pointer',
  },
  text: {
    textAlign: 'center',
  },
}))

const MagicLinkExpired = props => {
  const { classes } = style()
  const { t } = useTranslation()

  const handleBack = () => {
    props.clearMagicLink()
  }
  return (
    <div className={classes.wrapper}>
      <img src={image} height={100} alt="expired" />
      <Typography>
        {t('login.magicLink.expired', {
          context: translateContext(t, props.context),
        })}
      </Typography>
      <Typography className={classes.text}>
        {props.context === 'passwordReset'
          ? t('login.magicLink.contact_password_reset')
          : t('login.magicLink.contact_newUser')}
      </Typography>
      <Link className={classes.back} onClick={handleBack}>
        {t('common.back')}
      </Link>
    </div>
  )
}

export default MagicLinkExpired
