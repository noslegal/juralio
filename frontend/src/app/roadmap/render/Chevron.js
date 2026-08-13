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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  pointRightContainer: {
    display: 'flex',
    justifyContent: 'end',
  },
  root: {
    cursor: 'pointer',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const Chevron = props => {
  const { task, getBridgeColour, pointRight, jumpToTask } = props
  const { classes } = useStyles()

  const iconStyle = {
    fontSize: '500%',
    color: getBridgeColour(task),
  }

  return pointRight ? (
    <div className={classes.pointRightContainer}>
      <Typography
        className={classes.root}
        variant="h6"
        id={`${task.id}-chevron-text`}
        data-test={'point-right-chevron-text'}
        onClick={() => jumpToTask(task)}
      >
        {task.name}
      </Typography>
      <ChevronRightIcon
        className={classes.root}
        style={iconStyle}
        fontSize="inherit"
        onClick={() => jumpToTask(task)}
      />
    </div>
  ) : (
    <>
      <ChevronLeftIcon
        className={classes.root}
        style={iconStyle}
        fontSize="inherit"
        onClick={() => jumpToTask(task)}
      />
      <Typography
        className={classes.root}
        variant="h6"
        id={`${task.id}-chevron-text`}
        data-test={'point-left-chevron-text'}
        onClick={() => jumpToTask(task)}
      >
        {task.name}
      </Typography>
    </>
  )
}

PropTypes.propTypes = {
  pointRight: PropTypes.bool,
}

export default Chevron
