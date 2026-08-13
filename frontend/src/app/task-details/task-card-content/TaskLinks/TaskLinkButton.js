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

import { Tooltip } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import LightButton from '../../../../components/inputs/light-button/LightButton'
import { TASK_STATUS } from '../../../constants'
const style = makeStyles()(theme => ({
  button: {
    marginLeft: theme.spacing(1.75),
    marginRight: theme.spacing(0.5),
  },
}))

const TaskLinkButton = props => {
  const { classes } = style()
  return (
    <Tooltip title={props.tooltip}>
      <div className={classes.button}>
        <LightButton
          isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
          caption={props.text}
          viewOnly={props.viewOnly}
          clickHandler={props.onClick}
          data-test={props.dataTest + '-button'}
        />
      </div>
    </Tooltip>
  )
}
export default TaskLinkButton
