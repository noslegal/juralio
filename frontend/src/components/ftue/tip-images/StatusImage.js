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
import { TASK_STATUS } from '../../../app/constants'
import {
  getStatusColour,
  getStatusColourLight,
} from '../../../services/helpers/task/task-status-colour-helper'

const style = makeStyles()(theme => ({
  wrapper: {
    width: '100%',
    height: '100%',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
  },
  cell: {
    backgroundColor: 'red',
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    height: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(2)})`,
    display: 'flex',
  },
  text: {
    fontSize: theme.spacing(),
    lineHeight: theme.spacing(2),
    marginLeft: theme.spacing(),
  },
}))

const StatusImage = () => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <div className={classes.wrapper}>
      <div
        className={classes.cell}
        style={{
          backgroundColor: getStatusColourLight(TASK_STATUS.NOT_STARTED),
          borderBottom: `2px solid ${getStatusColour(TASK_STATUS.NOT_STARTED)}`,
          width: '100%',
        }}
      >
        <Typography className={classes.text}>
          {t('taskStatus.not-started')}
        </Typography>
      </div>
      <div
        className={classes.cell}
        style={{
          backgroundColor: getStatusColourLight(TASK_STATUS.IN_PROGRESS),
          borderBottom: `2px solid ${getStatusColour(TASK_STATUS.IN_PROGRESS)}`,
          width: '100%',
        }}
      >
        <Typography className={classes.text}>
          {t('taskStatus.in-progress')}
        </Typography>
      </div>
      <div
        className={classes.cell}
        style={{
          backgroundColor: getStatusColourLight(TASK_STATUS.DONE),
          borderBottom: `2px solid ${getStatusColour(TASK_STATUS.DONE)}`,
          width: '100%',
        }}
      >
        <Typography className={classes.text}>{t('taskStatus.done')}</Typography>
      </div>
      <div
        className={classes.cell}
        style={{
          backgroundColor: getStatusColourLight(TASK_STATUS.NOT_REQUIRED),
          borderBottom: `2px solid ${getStatusColour(
            TASK_STATUS.NOT_REQUIRED
          )}`,
          width: '100%',
        }}
      >
        <Typography className={classes.text}>
          {t('taskStatus.task-not-required')}
        </Typography>
      </div>
    </div>
  )
}

export default StatusImage
