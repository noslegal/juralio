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

import { Avatar, Card, Typography } from '@mui/material'
import CardHeader from '@mui/material/CardHeader'
import Skeleton from '@mui/material/Skeleton'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  wrapper: {
    width: '100%',
  },
  grid: {
    display: 'grid',
    gridGap: theme.spacing(2),
    gridTemplateColumns: 'repeat(auto-fill, minmax(382px,1fr))',
    gridAutoRows: '1px',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    width: `calc(100% - ${theme.spacing(2)})`,
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  card: {
    width: '100%',
    height: theme.spacing(14.25),
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: rawColours.primary.anotherBlue.light,
  },
  skeletonRow: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  circle: {
    borderRadius: '50%',
    backgroundColor: rawColours.primary.anotherBlue.dark,
  },
}))

export const LoadingCard = () => {
  const { classes } = style()

  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Skeleton variant="circular" className={classes.circle}>
            <Avatar />
          </Skeleton>
        }
        title={
          <Typography variant="caption">
            <Skeleton animation="wave" width={170} />
          </Typography>
        }
        subheader={
          <Typography>
            <Skeleton animation="wave" width={170} />
          </Typography>
        }
      />
      <Typography variant="caption" className={classes.skeletonRow}>
        <Skeleton animation="wave" />
      </Typography>
    </Card>
  )
}

// 'Class'es required for layout.
const getLoadingCard = () => {
  return (
    <div className="item">
      <div className="content">
        <LoadingCard />
      </div>
    </div>
  )
}

const MatterMasonryLoadingState = () => {
  const { classes } = style()
  const [wrapperHeight, setWrapperHeight] = useState(window.innerHeight - 88)

  window.addEventListener('resize', () => {
    setWrapperHeight(window.innerHeight - 88)
  })

  return (
    <div
      className={classes.wrapper}
      style={{
        height: `${wrapperHeight}px`,
      }}
    >
      <div id="grid" className={classes.grid}>
        {getLoadingCard()}
        {getLoadingCard()}
        {getLoadingCard()}
        {getLoadingCard()}
        {getLoadingCard()}
        {getLoadingCard()}
      </div>
    </div>
  )
}

export default MatterMasonryLoadingState
