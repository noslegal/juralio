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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Tooltip } from '@mui/material'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../../theme/juralio-colours'

const DRAG_BUTTON_SIZE = 24

const styles = () => ({
  createTaskMoveButton: {
    position: 'absolute',
    boxSizing: 'border-box',
    width: DRAG_BUTTON_SIZE,
    height: DRAG_BUTTON_SIZE,
    background: 'white',
    borderRadius: 2,
    border: `${juralioColours.darkText.secondary} solid 2px`,
    color: juralioColours.darkText.secondary,
    zIndex: 4,
    cursor: 'pointer',
    pointerEvents: 'auto',
    right: -DRAG_BUTTON_SIZE / 2,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
})

const CreateTaskMoveButton = props => {
  return (
    <Tooltip
      className={props.classes.Tooltip}
      title={props.t('taskMoveButton.moveHere')}
      placement="left"
    >
      <div
        className={props.classes.createTaskMoveButton}
        data-test={'move-button-right'}
        data-create-task-move-button={'right'}
      >
        <ArrowForwardIcon className={props.classes.icon} />
      </div>
    </Tooltip>
  )
}

export default withTranslation()(withStyles(CreateTaskMoveButton, styles))
