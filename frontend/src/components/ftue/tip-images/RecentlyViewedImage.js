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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../../app/constants'
import { getStatusColourLight } from '../../../services/helpers/task/task-status-colour-helper'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(0.5),
  },
  wrapper: {
    width: '100%',
    display: 'flex',
    height: '100%',
    margin: theme.spacing(),
    flexDirection: 'column',
    marginTop: theme.spacing(1.5),
  },
  loadingBar: {
    backgroundColor: rawColours.primary.grey.main,
    borderRadius: theme.spacing(),

    height: theme.spacing(0.5),
    width: '30%',
  },
  cube: {
    height: theme.spacing(1.5),
    width: theme.spacing(1.5),
    borderRadius: theme.spacing(0.25),
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    backgroundColor: rawColours.primary.grey.main,
  },
  statusBar: {
    height: theme.spacing(1.75),
    marginTop: 'auto',
    marginBottom: 'auto',
    width: theme.spacing(7),
    marginLeft: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
  },
}))

const Cell = props => {
  const { classes } = style()

  return (
    <div>
      <div className={classes.row}>
        <div className={classes.loadingBar} style={{ marginRight: '4px' }} />
        <div className={classes.loadingBar} />
      </div>
      <div className={classes.row}>
        <div className={classes.cube} />
        <div
          className={classes.statusBar}
          style={{ backgroundColor: props.colour }}
        />
      </div>
    </div>
  )
}

const RecentlyViewedImage = () => {
  const { classes } = style()
  return (
    <div className={classes.wrapper}>
      <Cell colour={getStatusColourLight(TASK_STATUS.DONE)} />
      <Cell colour={getStatusColourLight(TASK_STATUS.IN_PROGRESS)} />
      <Cell colour={getStatusColourLight(TASK_STATUS.NOT_STARTED)} />
    </div>
  )
}

export default RecentlyViewedImage
