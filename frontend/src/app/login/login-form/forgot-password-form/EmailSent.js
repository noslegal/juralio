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
import JurEmailSent from '../../../../assets/images/JurEmailSent'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    cursor: 'pointer',
    marginTop: theme.spacing(),
  },
  text: {
    textAlign: 'center',
  },
}))

const EmailSent = props => {
  const { t } = useTranslation()
  const { classes } = style()
  return (
    <div className={classes.wrapper}>
      <JurEmailSent />

      <Typography className={classes.text}>
        {t('login.resetEmailSent')}
      </Typography>
      <Link className={classes.back} onClick={props.back} data-test="back">
        {t('common.back')}
      </Link>
    </div>
  )
}
export default EmailSent
