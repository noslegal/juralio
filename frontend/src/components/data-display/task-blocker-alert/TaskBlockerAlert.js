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

import AlertIcon from '@mui/icons-material/ReportProblem'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  linkAlertWrapper: {
    display: 'flex',
    left: theme.spacing(5),
    top: theme.spacing(51.25),
    position: 'absolute',
  },
  alertIcon: {
    color: juralioColours.alert,
    alignSelf: 'center',
    marginRight: theme.spacing(1),
  },
}))

const TaskBlockerAlert = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()

  return (
    <div
      data-test="task-blocker-alert"
      style={{ marginTop: '-40px' }}
      className={classes.linkAlertWrapper}
    >
      <AlertIcon className={classes.alertIcon} />
      <Typography>
        {t('taskChange.taskBlocker1') +
          props.task.blockers.length +
          t('taskChange.taskBlocker2', {
            plural: props.task.blockers.length > 1 ? 's' : '',
            singular: props.task.blockers.length > 1 ? 'them' : 'it',
          })}
      </Typography>
    </div>
  )
}

export default TaskBlockerAlert
