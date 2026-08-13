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

import { Button, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import React from 'react'
import { updateTaskmapZoomLevel } from '../../redux/ducks/improved-taskmap'
import { useDispatch } from 'react-redux'
import rawColours from '../../theme/raw-colours'
import juralioColours from '../../theme/juralio-colours'

const styles = makeStyles()(theme => ({
  zoomContainer: {
    position: 'absolute',
    right: theme.spacing(7),
    zIndex: 1000,
    borderRadius: theme.spacing(1),
    border: 'solid 1px lightgrey',
    display: 'flex',
    alignItems: 'center',
    bottom: '14px',
    height: '32px',
    background: 'white',
    boxShadow:
      '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
  },
  plusButton: {
    borderRadius: '0px 6px 6px 0px',
    backgroundColor: juralioColours.whiteText.primary,
    color: rawColours.primary.black[200],
    alignItems: 'center',
    padding: theme.spacing(0.5),
    minWidth: '40px',
    borderLeft: '1px solid lightgrey',
  },
  minusButton: {
    borderRadius: '6px 0px 0px 6px',
    backgroundColor: juralioColours.whiteText.primary,
    color: rawColours.primary.black[200],
    alignItems: 'center',
    padding: theme.spacing(0.5),
    minWidth: '40px',
    borderRight: '1px solid lightgrey',
  },
  percentageDisplay: {
    width: 50,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
}))

const ImprovedTaskmapZoom = props => {
  const dispatch = useDispatch()
  const { classes } = styles()
  const zoom = props.zoom

  return (
    <div className={classes.zoomContainer}>
      <Button
        data-test="taskmap-zoom-out"
        disabled={zoom < 0.5}
        className={classes.minusButton}
        onClick={() => {
          dispatch(updateTaskmapZoomLevel(zoom - 0.1))
        }}
      >
        -
      </Button>
      <div className={classes.percentageDisplay}>
        <Typography style={{ width: 'fit-content', margin: 'auto' }}>
          {(zoom * 100).toFixed(0) + '%'}
        </Typography>
      </div>
      <Button
        data-test="taskmap-zoom-in"
        disabled={zoom > 1.1}
        className={classes.plusButton}
        onClick={() => {
          dispatch(updateTaskmapZoomLevel(zoom + 0.1))
        }}
      >
        +
      </Button>
    </div>
  )
}
export default ImprovedTaskmapZoom
