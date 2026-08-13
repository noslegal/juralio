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

import { Fade, Grow } from '@mui/material'
import Paper from '@mui/material/Paper'
import { scaleLinear } from 'd3-scale'
import React, { Fragment, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import MiniRoadmap from '../MiniRoadmap'
import TimePeriodPickerContainer from '../TimePeriodPicker/TimePeriodPickerContainer'
import styles from './minimap.module.css'
import MinimisedMinimap from './MinimisedMinimap'
import Viewport from './viewport/Viewport'
import MiniMapViewSwitcher from '../../improved-taskmap/taskmap-minimap/MiniMapViewSwitcher'

const miniMapMinimiseStyle = { transformOrigin: '100% 100%' }
const MinimapContainer = props => {
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const [timePeriodOptions, setTimePeriodOptions] = useState(null)
  const miniRoadmapRef = useRef(null)

  const {
    roadmapRef,
    roadmapData,
    roadmapDimensions,
    project,
    dimensions,
    scrollingEvent,
    showMinimised,
    setShowMinimised,
  } = props

  const miniMapWidth = dimensions?.miniMap?.width ?? 0
  const miniMapHeight = dimensions?.miniMap?.height ?? 0
  const roadMapWidth = dimensions?.roadMapWidth ?? 0
  const roadMapHeight = dimensions?.roadMapHeight ?? 0

  const { mapToRoadMapX, mapToRoadMapY, mapToMiniMapX, mapToMiniMapY } =
    useMemo(() => {
      const miniMapToRoadMapXScale = scaleLinear()
        .domain([0, miniMapWidth])
        .range([0, roadMapWidth])
      const miniMapToRoadMapYScale = scaleLinear()
        .domain([0, miniMapHeight])
        .range([0, roadMapHeight])
      const roadMapToMiniMapXScale = scaleLinear()
        .domain([0, roadMapWidth])
        .range([0, miniMapWidth])
      const roadMapToMiniMapYScale = scaleLinear()
        .domain([0, roadMapHeight])
        .range([0, miniMapHeight])
      return {
        mapToRoadMapX: miniMapX => miniMapToRoadMapXScale(miniMapX),
        mapToRoadMapY: miniMapY => miniMapToRoadMapYScale(miniMapY),
        mapToMiniMapX: miniMapY => roadMapToMiniMapXScale(miniMapY),
        mapToMiniMapY: miniMapY => roadMapToMiniMapYScale(miniMapY),
      }
    }, [miniMapWidth, miniMapHeight, roadMapWidth, roadMapHeight])

  if (
    !roadmapDimensions ||
    !roadmapRef ||
    !roadmapRef.current ||
    !miniRoadmapRef ||
    !project
  )
    return null

  const toggleShowMinimised = () => setShowMinimised(!showMinimised)
  const hasDates =
    props.displayTasks.filter(
      t =>
        t.plannedStartDate ||
        t.actualStartDate ||
        t.plannedEndDate ||
        t.actualEndDate
    ).length > 0

  return (
    <Fragment>
      <>
        <TimePeriodPickerContainer
          tasks={project?.tasks}
          roadmapData={props.roadmapData}
          setTimePeriod={props.setTimePeriod}
          disabled={!hasDates}
          timePeriodOptions={timePeriodOptions}
          setTimePeriodOptions={setTimePeriodOptions}
        />
      </>
      <>
        <MiniMapViewSwitcher
          isRoadmap={true}
          timePeriodOptions={timePeriodOptions}
          showMinimised={showMinimised}
        />
      </>

      <Fade in={showMinimised}>
        <Paper
          onClick={() => toggleShowMinimised()}
          className={styles['minimised-minimap-container']}
          data-test="roadmap-minimap-minimized"
          elevation={2}
        >
          <MinimisedMinimap />
        </Paper>
      </Fade>
      <Grow
        in={!showMinimised}
        style={{ backgroundColor: '#B5C4D1', transformOrigin: '100% 100%' }}
      >
        <Paper
          className={styles['minimap-container']}
          data-test="roadmap-minimap"
          elevation={2}
        >
          <div className={styles['mini-icicle']}>
            <MiniRoadmap
              roadMapRef={miniRoadmapRef}
              data={roadmapData}
              canvasOptions={dimensions.miniMap}
              getColourMode={props.getColourMode}
              displayTasks={props.displayTasks}
              rangeEnd={roadmapData?.rangeEnd}
              viewMode={detailedView.viewMode}
            />
            <Viewport
              mainRoadmapRef={roadmapRef}
              miniIcicleRef={miniRoadmapRef}
              partitionData={roadmapData}
              dimensions={dimensions}
              miniMapWidth={dimensions.miniMap.width}
              miniMapHeight={dimensions.miniMap.height}
              mapToRoadMapX={mapToRoadMapX}
              mapToRoadMapY={mapToRoadMapY}
              mapToMiniMapX={mapToMiniMapX}
              mapToMiniMapY={mapToMiniMapY}
              scrollingEvent={scrollingEvent}
            />
          </div>
        </Paper>
      </Grow>
      <Grow in={!showMinimised} style={miniMapMinimiseStyle}>
        <Paper
          className={styles['minimised-minimap-container']}
          data-test="roadmap-minimap-maximized"
          elevation={2}
          onClick={() => toggleShowMinimised()}
        >
          <MinimisedMinimap inverted />
        </Paper>
      </Grow>
    </Fragment>
  )
}

MinimapContainer.propTypes = {}

export default MinimapContainer
