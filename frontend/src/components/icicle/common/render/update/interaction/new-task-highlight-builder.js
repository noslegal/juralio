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

import { select, selectAll } from 'd3-selection'
import { line } from 'd3-shape'
import uniq from 'lodash/uniq'

import {
  getCardinals,
  removeNewTaskHighlight,
} from './new-task-highlight-helper'

export const applyNewTaskFilter = (
  cells,
  newTasks,
  dismissNewTasks = () => {},
  mainIcicleRef,
  translationHandler
) => {
  if (!newTasks) return
  removeNewTaskHighlight()
  const newText = translationHandler('common.new')

  // key=taskId value=cell in task map
  let cellCoords = {}
  cells
    .filter(cell => newTasks.includes(cell.data.id))
    .each(cell => {
      let data = document
        .getElementById(`C${cell.data.id}`)
        ?.getBoundingClientRect()
      cellCoords[cell.data.id] = data
    })

  const generateSvgPoints = task => {
    let me = cellCoords[task]
    if (me === undefined) {
      return []
    }
    let lineData = []

    // generate the 4 points of the task cell
    lineData.push({
      x: me.left,
      y: me.top,
    })
    lineData.push({
      x: me.left + me.width,
      y: me.top + me.height,
    })
    lineData.push({
      x: me.left + me.width,
      y: me.top,
    })
    lineData.push({
      x: me.left,
      y: me.top + me.height,
    })

    //remove duplicate points
    uniq(lineData)

    //transform to be at correct location on taskmap
    lineData = lineData.map(p => {
      return { x: p.x, y: p.y - 73 }
    })

    const findPath = (lineData, previousPoints = [], finalPoint = null) => {
      //function to find a path through given points
      // linedata=points available, previousPoints=points we've already visited, finalPoihnt = point we need to finish on to complete the circular path
      // This function recusrses on itself to find the valid path

      if (lineData.length === 0) {
        return [] //return if there is no data
      }
      if (lineData.length === 1 && lineData[0] !== finalPoint) {
        //if there is one point left and its not the final point
        // check the finalPoint is a valid next step, if not, it's an invalid path
        let cardinals = getCardinals([finalPoint], lineData[0])
        if (cardinals.length === 0) {
          return false
        } else {
          return [lineData[0], finalPoint]
        }
      }
      if (lineData.length === 1) {
        return lineData
      }
      const startPoint = lineData.shift()
      if (finalPoint === null) {
        //if no final point is set, means we must be at the first itteration of findPath, so this will be our end point
        finalPoint = startPoint
      }

      let nextInCardinalDirections = getCardinals(lineData, startPoint)
      //find the next available point in each direction (N/S/E/W)
      nextInCardinalDirections = nextInCardinalDirections.filter(cardinal => {
        //filter out points that would require us to cross a point we have already been to
        let i
        for (i = 0; i < previousPoints.length; i++) {
          if (previousPoints[i] === cardinal) {
            return false
          }
          if (startPoint.x === previousPoints[i].x) {
            if (previousPoints[i].y < startPoint.y) {
              if (
                cardinal.y < startPoint.y &&
                cardinal.y < previousPoints[i].y
              ) {
                return false
              }
            }
          }
          if (startPoint.y === previousPoints[i].y) {
            if (previousPoints[i].x < startPoint.x) {
              if (
                cardinal.x < startPoint.x &&
                cardinal.x < previousPoints[i].x
              ) {
                return false
              }
            }
          }
        }

        return true
      })

      if (nextInCardinalDirections.length === 0) {
        // if there is no valid cardinal, its a bad path
        return false
      }

      let pathCheck = false
      nextInCardinalDirections.some(directionalPoint => {
        //recursivly find the path for each cardinal
        let foundPath = findPath(
          [
            directionalPoint,
            lineData.filter(p => p !== directionalPoint),
          ].flat(),
          [previousPoints, startPoint].flat(),
          finalPoint
        )

        if (foundPath.length) {
          pathCheck = [startPoint, foundPath].flat()
          return true
        }
        return false
      })
      return pathCheck
    }

    let path = findPath(lineData)
    if (path === false || path.length === 0) {
      return []
    }

    path = [path, path[0]].flat()

    return path.filter(p => p !== null)
  }

  const renderAreas = paths => {
    if (paths.length === 0) {
      return
    }

    let lineFunction = line()
      .x(function (d) {
        return d.x
      })
      .y(function (d) {
        return d.y
      })

    let scrollOffsetX = 0
    let scrollOffsetY = 0
    if (mainIcicleRef) {
      scrollOffsetX = mainIcicleRef.scrollLeft

      scrollOffsetY = mainIcicleRef.scrollTop
    }

    let tooltip = select('#innerWrapper')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('z-index', '11')
      .style('color', 'rgba(255, 255, 255,1)')
      .style('background-color', 'rgba(46, 47, 48, 0.7)')
      .style('padding-top', '8px')
      .style('padding-bottom', '8px')
      .style('padding-left', '16px')
      .style('padding-right', '16px')
      .style('border-radius', '10px')
      .style('white-space', 'nowrap')
      .style('font-family', 'Montserrat')
      .style('font-size', '12px')
      .style('height', '16px')
      .style('letter-spacing', '0.4px')
      .text('Hide Highlight')

    paths.forEach(path => {
      let minX = Math.min(...path.path.map(p => p.x))
      let minY = Math.min(...path.path.map(p => p.y))
      let width = Math.max(...path.path.map(p => p.x)) - minX
      let height = Math.max(...path.path.map(p => p.y)) - minY

      let svg = select('#innerWrapper')
        .append('svg')
        .attr('class', 'svgWrapper')
        .attr('width', width + 10 + 'px')
        .attr('height', height + 10 + 'px')
        .style('position', 'absolute')
        .style('z-index', '9')
        .style('top', minY - 5 + scrollOffsetY - 47 + 'px')
        .style('left', minX - 5 + scrollOffsetX + 'px')

      svg
        .append('rect')
        .attr('width', 40)
        .attr('height', 16)
        .attr('transform', 'translate(413,' + (height - 12) + ')')
        .style('position', 'absolute')
        .style('top', minY + 'px')
        .style('left', minX + 'px')
        .style('z-index', '10')
        .style('fill', 'rgba(255,255,255,0.45)')

      let lineGraph = svg
        .append('path')
        .attr('class', 'newArea')
        .attr('data-test', 'newArea')
        .attr(
          'd',
          lineFunction(
            path.path.map(p => {
              return { x: p.x - minX + 5, y: p.y - minY + 5 }
            })
          )
        )
        .attr('stroke', 'rgb(91,21,223)')
        .attr('stroke-width', 2)
        .attr('fill', 'rgba(255, 255, 255, 0.15)')
        .style('opacity', '0.75')
        .style('z-index', '10')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          lineGraph
            .transition()
            .duration(200)
            .attr('fill', 'rgba(255, 255, 255, 0.25)')
          return tooltip.style('visibility', 'visible')
        })
        .on('mousemove', event => {
          tooltip
            .style('top', mainIcicleRef.scrollTop + (event.clientY - 45) + 'px')
            .style(
              'left',
              mainIcicleRef.scrollLeft + (event.clientX - 62) + 'px'
            )
        })

        .on('mouseout', () => {
          lineGraph
            .transition()
            .duration(200)
            .attr('fill', 'rgba(255, 255, 255, 0.15)')
          return tooltip.style('visibility', 'hidden')
        })
        .on('click', () => {
          tooltip.style('visibility', 'hidden')
          dismissNewTasks(path.neighbourhood)
        })

      svg
        .selectAll('g')
        .data([newText])
        .enter()
        .append('g')
        .attr('transform', 'translate(418,' + height + ')')
        .attr('class', 'newArea')
        .append('text')
        .text(function (d) {
          return d
        })
        .style('fill', 'rgb(91,21,223)')
        .style('font-family', 'Montserrat')
        .style('font-size', '12px')
        .style('height', '16px')
        .style('letter-spacing', '0.4px')
        .style('cursor', 'pointer')
        .on('mouseover', function () {
          lineGraph
            .transition()
            .duration(200)
            .attr('fill', 'rgba(255, 255, 255, 0.15)')
          return tooltip.style('visibility', 'visible')
        })

        .on('mousemove', event => {
          tooltip
            .style('top', mainIcicleRef.scrollTop + (event.clientY - 45) + 'px')
            .style(
              'left',
              mainIcicleRef.scrollLeft + (event.clientX - 62) + 'px'
            )
        })
        .on('mouseout', () => {
          lineGraph.transition().duration(200).attr('fill', 'transparent')
          return tooltip.style('visibility', 'hidden')
        })
        .on('click', () => {
          selectAll('.tooltip').remove()
          dismissNewTasks(path.neighbourhood)
        })
    })
  }

  let foundPaths = []

  newTasks.forEach(task => {
    foundPaths.push({
      path: generateSvgPoints([task.toString()]),
      neighbourhood: [task.toString()],
    })
  })

  renderAreas(foundPaths)
}
