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

import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  getMiniMapOverallScaleHeight,
  getMiniMapOverallScaleWidth,
  getViewportHeight,
  getViewportWidth,
  getViewportXPos,
  getViewportYPos,
} from '../taskmap-helpers/minimap-helpers'

const styles = makeStyles()(theme => ({
  viewport: {
    position: 'absolute',
    height: '8px',
    width: '100%',
    backgroundColor: '#F0F0E8',
    borderRadius: '4px',
    border: '1px solid #FFFFFF',
    boxSizing: 'border-box',
    cursor: 'pointer',
    zIndex: 25,
    opacity: 0.44,
  },
}))

const MINIMAP_MARGINS = 4

const Viewport = props => {
  const { classes } = styles()
  const [viewportXPos, setViewportXPos] = useState(4)
  const [viewportYPos, setViewportYPos] = useState(4)
  const [viewportIsDrag, setViewportIsDrag] = useState(false)
  const [triggerResize, setTriggerRise] = useState(0)
  const [initialDragPos, setInitialDragPos] = useState({
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    mouseX: 0,
    mouseY: 0,
    initialVpX: 0,
    initialVpY: 0,
  })

  const triggerViewportMove = e => {
    onViewportMouseMove(e)
  }

  const triggerDragEnd = () => {
    setViewportIsDrag(false)
  }

  useEffect(() => {
    const updateViewportPosition = () => {
      let newXPos = getViewportXPos(getMiniMapOverallScaleWidth())
      let newYPos = getViewportYPos(getMiniMapOverallScaleHeight())
      setViewportXPos(checkBoundries(4, 184, newXPos))
      setViewportYPos(checkBoundries(4, 240, newYPos))
    }
    //Only when we are not dragging the viewport enable the taskmap scroll listener to avoid doubly linking the handling for the scroll
    if (!viewportIsDrag) {
      window.addEventListener('taskmap-scroll', updateViewportPosition)
    }
    if (viewportIsDrag) {
      window.addEventListener('mousemove', triggerViewportMove)
      window.addEventListener('mouseup', triggerDragEnd)
    }

    return () => {
      window.removeEventListener('taskmap-scroll', updateViewportPosition)
      window.removeEventListener('mousemove', triggerViewportMove)
      window.addEventListener('mouseup', triggerDragEnd)
    }
  }, [viewportIsDrag]) //eslint-disable-line

  const handleMouseDown = e => {
    setViewportIsDrag(true)

    e.stopPropagation()

    let bounds = document.getElementById('viewport').getBoundingClientRect()
    const minimapHeight = 240
    setInitialDragPos({
      minX: MINIMAP_MARGINS,
      minY: MINIMAP_MARGINS,
      maxX: 184 - bounds.width + MINIMAP_MARGINS,
      maxY: minimapHeight - bounds.height + 2 * MINIMAP_MARGINS,
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialVpX: viewportXPos,
      initialVpY: viewportYPos,
    })
  }

  const onViewportMouseMove = e => {
    e.stopPropagation()
    if (viewportIsDrag) {
      let mouseX = e.clientX
      let mouseY = e.clientY
      let xDiff = mouseX - initialDragPos.mouseX
      let yDiff = mouseY - initialDragPos.mouseY
      //update viewport position based on the mouse movement
      let newX = checkBoundries(
        initialDragPos.minX,
        initialDragPos.maxX,
        xDiff + initialDragPos.initialVpX
      )
      let newY = checkBoundries(
        initialDragPos.minY,
        initialDragPos.maxY,
        yDiff + initialDragPos.initialVpY
      )
      setViewportXPos(newX)
      setViewportYPos(newY)

      let leftScrollValue = 0
      let topScrollValue = 0
      //check if value will equal 0 to prevent dividing 0
      if (viewportXPos !== 0) {
        //The taskmap scroll value will be the 100% of our scale% so we divide the Mouse move diff by our scale to find the 1% then multiply by 100 to get 100%
        leftScrollValue =
          (newX / 184) *
          document.getElementById('improved-taskmap').getBoundingClientRect()
            .width
      }
      if (viewportYPos !== 0) {
        const minimapHeight = 240 //minimap

        topScrollValue =
          (newY / minimapHeight) *
          document.getElementById('improved-taskmap').getBoundingClientRect()
            .height
      }

      //store scroll values for taskmap in local storage so we can access it in the taskmap container without doubly linking the values of minimap and taskmap
      window.localStorage.setItem('viewportLeftScrollValue', leftScrollValue)
      window.localStorage.setItem('viewportTopScrollValue', topScrollValue)
      window.dispatchEvent(new Event('viewport-move'))
    }
  }

  //Checks if new viewport position is outside boundries/minimap margins and corrects if so
  const checkBoundries = (min, max, value) => {
    if (value > max) {
      return max
    }
    if (value < min) {
      return min
    }
    return value
  }

  const calcWidth = () => {
    return getViewportWidth()
  }

  const calcHeight = () => {
    return getViewportHeight()
  }
  if (calcWidth() === 0) {
    setTimeout(() => {
      setTriggerRise(triggerResize + 1)
    }, 100)
  }

  return (
    <div
      id="viewport"
      className={classes.viewport}
      style={{
        width: `${calcWidth()}px`,
        height: `${calcHeight()}px`,
        top: `${viewportYPos}px`,
        left: `${viewportXPos}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => {
        setViewportIsDrag(false)
      }}
    ></div>
  )
}
export default Viewport
