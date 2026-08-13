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

import { scaleLinear, scaleTime } from 'd3-scale'
import { useEffect } from 'react'
import { getTaskCellColour } from '../../../services/helpers/task/task-status-colour-helper'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import RoadmapConstants from '../helpers/roadmap-constants'
import {
  getRoadmapTasksHeight,
  getRoadmapTasksWidth,
  getTaskLeftPosition,
  getTaskWidth,
} from './roadmap-tasks-helpers'
import './roadmap.css'

export const useRenderMinimap = (
  tasks,
  data,
  startDate,
  endDate,
  canvasOptions,
  getColourMode,
  viewMode = TASK_MAP_VIEW_MODE_ENUM.STANDARD
) => {
  useEffect(() => {
    const linearScale = scaleLinear()
      .domain([0, tasks.length])
      .range([0, canvasOptions.height])

    const timeScale = scaleTime()
      .domain([startDate, endDate])
      .range([0, canvasOptions.width])

    const d = document.getElementById(canvasOptions.id)
    if (!d) return
    const ctx = d.getContext('2d')
    ctx.clearRect(0, 0, canvasOptions.width, canvasOptions.height)
    const scaleX = canvasOptions.width / getRoadmapTasksWidth()
    const scaleY = canvasOptions.height / getRoadmapTasksHeight()
    if (tasks && data) {
      renderTasks(
        ctx,
        tasks,
        timeScale,
        linearScale,
        getColourMode,
        scaleX,
        scaleY,
        viewMode
      )
    }
  }, [canvasOptions, data, endDate, getColourMode, viewMode, startDate, tasks])
}

const renderTasks = (
  ctx,
  tasks,
  timeScale,
  linearScale,
  tasksToColour,
  getColourMode,
  scaleX,
  scaleY,
  viewMode
) => {
  for (let j = 0; j < tasks.length; j++) {
    renderNode(
      ctx,
      tasks[j],
      timeScale,
      linearScale,
      j,
      tasksToColour,
      getColourMode,
      scaleX,
      scaleY,
      viewMode
    )
  }
}

const renderNode = (
  ctx,
  task,
  timeScale,
  linearScale,
  i,
  getColourMode,
  scaleX,
  scaleY,
  viewMode
) => {
  const additionalHeight =
    viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED ? 20 : 0
  const isCompact = viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
  const isMinimap = true
  let x = getTaskLeftPosition(task, timeScale, isMinimap, true)
  let width = getTaskWidth(task, timeScale, isMinimap, scaleX)
  let y =
    scaleY *
    ((isCompact ? RoadmapConstants.COMPACT_MARGIN : RoadmapConstants.MARGIN) +
      additionalHeight) *
    (i + 1)

  ctx.beginPath()
  ctx.rect(
    x,
    y,
    width,
    (isCompact
      ? RoadmapConstants.COMPACT_TASK_HEIGHT
      : RoadmapConstants.TASK_HEIGHT) *
      scaleY +
      additionalHeight * scaleY
  )
  let taskCellColour = getColourMode(task)
  ctx.fillStyle = getTaskCellColour(task, taskCellColour)
  ctx.fill()
}
