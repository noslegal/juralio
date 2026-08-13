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
import rawColours from '../../../theme/raw-colours'
const style = makeStyles()(theme => ({
  privateLosenge: {
    backgroundColor: rawColours.primary.black.black,
    borderRadius: theme.spacing(0.5),
    width: theme.spacing(10),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.spacing(3),
    marginLeft: theme.spacing(2),
    justifySelf: 'center',
  },
  privateLosengeText: {
    color: 'white',
    textTransform: 'capitalize',
  },
}))
const PrivateLozenge = () => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <div className={classes.privateLosenge} data-test="private-losenge">
      <Typography className={classes.privateLosengeText}>
        {t('common.private')}
      </Typography>
    </div>
  )
}
export default PrivateLozenge
