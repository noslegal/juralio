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

import Skeleton from '@mui/material/Skeleton'
import React from 'react'
import { makeStyles } from 'tss-react/mui'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  skeleton: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(),
  },
}))

const RecentlyVisitedLoadingState = () => {
  const { classes } = style()
  const row = (v, i) => (
    <div className={classes.row} key={i}>
      <Skeleton
        className={classes.skeleton}
        variant="rectangular"
        width={20}
        height={20}
      />
      <Skeleton
        className={classes.skeleton}
        variant="text"
        width={120}
        height={20}
      />
      <Skeleton
        className={classes.skeleton}
        variant="rectangular"
        width={20}
        height={20}
      />
    </div>
  )
  const expandedRow = (v, i) => (
    <div className={classes.row} key={i}>
      <Skeleton
        className={classes.skeleton}
        variant="rectangular"
        width={30}
        height={30}
      />
      <Skeleton
        className={classes.skeleton}
        variant="rectangular"
        width={400}
        height={30}
      />
    </div>
  )
  return (
    <>
      {row()}
      {new Array(3).fill('').map(expandedRow)}
      {new Array(6).fill('').map(row)}
    </>
  )
}

export default RecentlyVisitedLoadingState
