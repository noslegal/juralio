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

import React, { useCallback, useEffect } from 'react'
import Draggable from 'react-draggable'
import {
  getRoadmapTasksLeftScroll,
  getRoadmapTasksTopScroll,
} from '../../render/roadmap-tasks-helpers'
import {
  useViewportHeight,
  useViewportWidth,
  useViewportX,
  useViewportY,
} from './viewport-hooks'
import styles from './Viewport.module.css'

const Viewport = props => {
  const { mainRoadmapRef, miniIcicleRef, dimensions, scrollingEvent } = props

  const windowWidth = mainRoadmapRef.current?.clientWidth
  const roadmapWidth = dimensions.roadMapWidth
  const miniMapWidth = dimensions.miniMap.width
  const viewportWidth = useViewportWidth(
    roadmapWidth,
    miniMapWidth,
    windowWidth
  )

  const viewportX = useViewportX(
    roadmapWidth,
    miniMapWidth,
    getRoadmapTasksLeftScroll()
  )

  const windowHeight = mainRoadmapRef.current?.clientHeight
  const roadmapHeight = dimensions.roadmapHeight
  const miniMapHeight = dimensions.miniMap.height
  const viewportHeight = useViewportHeight(
    roadmapHeight,
    miniMapHeight,
    windowHeight
  )

  const viewportY = useViewportY(
    roadmapHeight,
    miniMapHeight,
    getRoadmapTasksTopScroll()
  )

  const isPropsReady = useCallback(() => {
    if (!mainRoadmapRef || !miniIcicleRef || !dimensions) return false
    return true
  }, [dimensions, mainRoadmapRef, miniIcicleRef])

  const relocateViewport = useCallback(() => {
    let doc = document.getElementById('roadmap-tasks-wrapper')
    if (!doc) return
  }, [])

  const resizeViewPort = useCallback(() => {
    if (!isPropsReady()) return null
    mainRoadmapRef.onscroll = relocateViewport
    relocateViewport()
  }, [isPropsReady, mainRoadmapRef, relocateViewport])

  useEffect(() => {
    window.addEventListener('resize', () => resizeViewPort())
  }, [resizeViewPort])

  useEffect(() => {
    return () => {
      if (mainRoadmapRef) {
        mainRoadmapRef.onscroll = null
      }
      window.removeEventListener('resize', () => resizeViewPort())
    }
  }, [mainRoadmapRef, resizeViewPort])

  useEffect(() => {
    resizeViewPort()
  }, [dimensions.width, dimensions.height, resizeViewPort, scrollingEvent])

  function onDrag(event, ui) {
    let viewportDragX = ui.x
    let viewportDragY = ui.y

    const scaleX = miniMapWidth / roadmapWidth
    const scaleY = miniMapHeight / roadmapHeight
    const interactiveMapX = viewportDragX / scaleX
    const interactiveMapY = viewportDragY / scaleY

    let top = document.getElementById('roadmap-tasks-wrapper')
    if (top) top.scrollTop = interactiveMapY

    let left = document.getElementById('roadmap-tasks-wrapper')
    if (left) left.scrollLeft = interactiveMapX
  }

  return (
    <Draggable
      bounds="parent"
      onDrag={onDrag}
      position={{
        x: viewportX,
        y: viewportY,
      }}
    >
      <div
        className={styles['viewport']}
        data-test="roadmap-viewport"
        style={{
          width: viewportWidth || 0,
          height: viewportHeight || 0,
        }}
      />
    </Draggable>
  )
}

Viewport.propTypes = {}

export default Viewport
