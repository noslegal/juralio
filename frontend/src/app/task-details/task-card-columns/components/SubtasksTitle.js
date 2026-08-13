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
import { withStyles } from 'tss-react/mui'
import AddButton from '../../../../components/inputs/add-button/AddButton'
import juralioColours from '../../../../theme/juralio-colours'
import { CONFIG } from '../../../constants'

const styles = theme => ({
  root: {
    padding: theme.spacing(),
    paddingLeft: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(2),
    },
    display: 'flex',
  },
  title: {
    cursor: 'default',
    color: juralioColours.darkText.primary,
    fontWeight: theme.typography.fontWeightBold,
  },
  button: {
    marginLeft: 'auto',
  },
  levelFText: {
    marginLeft: theme.spacing(15),
  },
})

const SubtasksTitle = props => {
  const { t } = useTranslation()
  const subtasksFull = props.taskCount === CONFIG.SUBTASK_LIMIT
  const isLevelF = props.taskLevel === 6

  return (
    <div className={props.classes.root}>
      <Typography
        data-test="subtasks-title"
        variant="h6"
        className={props.classes.title}
      >
        {t('entity.subtask_other')}
      </Typography>
      {!subtasksFull && !props.isReadOnly && !isLevelF && (
        <div className={props.classes.button}>
          <AddButton
            text={t('subTaskPanel.createASubtask')}
            onClick={props.addTask}
            data-test="create-subtask-button"
            trackingId="TaskCardCommon"
            trackingValue="CreateSubtask"
          />
        </div>
      )}
    </div>
  )
}
export default withStyles(SubtasksTitle, styles)
