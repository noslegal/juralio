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

import Typography from '@mui/material/Typography'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  donePip: {
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  inProgressPip: {
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  notStartedPip: {
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  taskCountForTab: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const TaskCountPips = props => {
  const { classes } = useStyles()
  const { project } = props
  return (
    <div className={classes.root}>
      <div className={classes.notStartedPip} />
      <Typography
        data-test="not-started-tasks"
        className={classes.taskCountForTab}
      >
        {project.taskCounts?.notStartedCount}
      </Typography>

      <div className={classes.inProgressPip} />
      <Typography
        data-test="in-progress-tasks"
        className={classes.taskCountForTab}
      >
        {project.taskCounts?.inProgressCount}
      </Typography>
      <div className={classes.donePip} />
      <Typography data-test="done-tasks" className={classes.taskCountForTab}>
        {project.taskCounts?.doneCount}
      </Typography>
    </div>
  )
}

export default TaskCountPips
