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

import { Fade, Grow, Paper } from '@mui/material'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { improvedCanvasMinimap } from '../../../components/icicle/desktop/helper/canvas-render-helper'
import rawColours from '../../../theme/raw-colours'
import { MINI_MAP_VISIBILITY_THRESHOLD } from '../../constants'
import MinimisedMinimap from './MinimisedMinimap'
import Viewport from './Viewport'
import MiniMapViewSwitcher from './MiniMapViewSwitcher'

const styles = makeStyles()(theme => ({
  minimapContainer: {
    position: 'absolute',
    bottom: '56px',
    right: '10px',
    zIndex: 1300,
    display: 'flex',
    flexDirection: 'column',
    padding: '4px',
    overflow: 'hidden',
    backgroundColor: rawColours.minimap.workstream,
  },

  minimisedMinimapContainer: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    bottom: '10px',
    right: '10px',

    display: 'flex',
    zIndex: 20,
  },
}))

const MiniMap = props => {
  const { showMinimised, setShowMinimised } = props
  const { classes } = styles()

  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const newTaskIds = useSelector(state => state.improvedTaskmap.newTasks)
  const structure = props.structure

  useEffect(() => {
    setShowMinimised(props.height < MINI_MAP_VISIBILITY_THRESHOLD)
  }, [props.height, setShowMinimised])

  const handleOnClick = () => {
    setShowMinimised(!showMinimised)
  }

  const renderCanvas = () => {
    setTimeout(() => {
      improvedCanvasMinimap(
        structure,
        props.tasks,
        props.height,
        props.width,
        taskMapFilter,
        newTaskIds
      )
    }, 1000)
    return <canvas width={184} height={240} id="minimap"></canvas>
  }

  return (
    <>
      <Fade in={showMinimised}>
        <Paper
          onClick={handleOnClick}
          className={classes.minimisedMinimapContainer}
          data-test="icicle-minimap-minimized"
          elevation={2}
        >
          <MinimisedMinimap />
        </Paper>
      </Fade>
      <MiniMapViewSwitcher isRoadmap={false} showMinimised={showMinimised} />
      <Grow
        in={!showMinimised}
        style={{
          backgroundColor: rawColours.minimap.workstream,
          transformOrigin: '100% 100%',
        }}
      >
        <div>
          <Paper
            className={classes.minimapContainer}
            data-test="icicle-minimap"
            id="icicle-minimap"
            elevation={2}
          >
            {renderCanvas()}
            <Viewport />
          </Paper>
        </div>
      </Grow>
      <Grow in={!showMinimised} style={{ transformOrigin: '100% 100%' }}>
        <Paper
          className={classes.minimisedMinimapContainer}
          data-test="icicle-minimap-maximized"
          elevation={2}
          onClick={handleOnClick}
        >
          <MinimisedMinimap inverted={true} />
        </Paper>
      </Grow>
    </>
  )
}
export default MiniMap
