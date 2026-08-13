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

import { MenuItem, Select, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../../theme/raw-colours'
import { TASK_STATUS } from '../../../../constants'

const styles = makeStyles()(theme => ({
  selector: {
    width: '90%',
    color: rawColours.text.black,
  },
  text: {
    color: rawColours.text.black,
  },
}))

const TaskBlocksToggle = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  return (
    <Select
      data-test="task-blocks-toggle"
      value={props.blocks}
      onChange={props.onChange}
      variant="outlined"
      className={classes.selector}
    >
      <MenuItem value={true} data-test="blcoks-option">
        <Typography className={classes.text}>
          {t('taskBlocksDialog.blocks')}
        </Typography>
      </MenuItem>
      <MenuItem
        value={false}
        disabled={props.task.status === TASK_STATUS.IN_PROGRESS}
        data-test="blocked-by-option"
      >
        <Typography className={classes.text}>
          {t('taskBlocksDialog.isBlockedBy')}
        </Typography>
      </MenuItem>
    </Select>
  )
}
export default TaskBlocksToggle
