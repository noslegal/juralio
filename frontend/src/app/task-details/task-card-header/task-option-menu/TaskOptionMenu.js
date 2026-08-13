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

import MoreVertIcon from '@mui/icons-material/MoreVert'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import LightButton from '../../../../components/inputs/light-button/LightButton'
import { TASK_MENU_CONTEXT, TASK_STATUS } from '../../../constants'
import TaskMenuContainer from './TaskMenuContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  optionsDropdownIcon: {
    height: theme.spacing(2),
    width: 'unset',
  },
}))

const TaskOptionMenu = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = useState(null)
  const openOptionMenu = event => setAnchorEl(event.currentTarget)
  const closeOptionMenu = () => setAnchorEl(null)

  return (
    <div className={classes.root}>
      <LightButton
        isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
        caption={t('common.options')}
        clickHandler={openOptionMenu}
        endIcon={
          <MoreVertIcon
            size="0.5"
            className={classes.optionsDropdownIcon}
            data-test="task-card-option-menu-button"
          />
        }
      />
      <TaskMenuContainer
        anchor={anchorEl}
        closeHandler={closeOptionMenu}
        matterId={props.matterId}
        task={props.task}
        taskMenuContext={TASK_MENU_CONTEXT.TASK_HEADER}
        viewOnly={props.viewOnly}
        updateProject={() => {}}
      />
    </div>
  )
}

TaskOptionMenu.propTypes = {
  /** isMatterAdmin */
  isMatterAdmin: PropTypes.bool,
  /** matterId */
  matterId: PropTypes.string.isRequired,
  /** task */
  task: PropTypes.object.isRequired,
}

export default TaskOptionMenu
