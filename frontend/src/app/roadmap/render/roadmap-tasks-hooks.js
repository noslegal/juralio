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
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import store from '../../../store/configure-store'
import {
  hideTaskmapTaskAssigneeContainer,
  showTaskmapTaskAssigneeContainer,
} from '../../task-details/task-actions'
import TaskMapAssigneeToolTip from '../../task-map/task-assignees/TaskMapAssigneeToolTip'

const generateTeamMembersTooltip = (teamMembers, task) => {
  return ReactDOMServer.renderToString(
    <TaskMapAssigneeToolTip teamMembers={teamMembers} task={task} />
  )
}

const getTaskDataFromTaskCell = (tasks, id) => {
  if (!tasks) return []
  return tasks.filter(t => t.id.toString() === id)[0]
}

export const setupRenderAssigneeInteraction = (tasks, roadmapRef) => {
  if (!roadmapRef) {
    return null
  }

  selectAll('[data-test=task-cell-zero-assignee-chip]').on('click', e => {
    e.stopPropagation()

    const closestTask = e.target.closest('.roadmap-tasks')

    select('#roadmapScrollFrame').on('scroll', () => {
      store.dispatch(hideTaskmapTaskAssigneeContainer())
      select('#roadmapScrollFrame').on('scroll', () => {}) //reset the scroll handler
    })

    const leftPos =
      parseInt(closestTask.style.left.slice(0, -2)) -
      document.getElementById('roadmapScrollFrame').scrollLeft

    const assigneeChip = e.target.closest('.assignee-chip')
    const topPos = assigneeChip.getBoundingClientRect().y - 120
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#teamMemberContent').remove()

    store.dispatch(
      showTaskmapTaskAssigneeContainer({
        task: getTaskDataFromTaskCell(
          tasks,
          closestTask.attributes['taskid'].value
        ),
        position: { left: leftPos, top: topPos },
      })
    )
  })
  selectAll('[data-test^=task-cell-assignee-chip').on('mouseover', e => {
    if (store.getState().taskmap.showAssigneePopover) {
      return
    }
    const closestTask = e.target.closest('.roadmap-tasks')

    const data = getTaskDataFromTaskCell(
      tasks,
      closestTask.attributes['taskid'].value
    )

    if (!data || !tasks || tasks.find(i => i.id === data.id) === undefined) {
      return
    }

    const teamMembers = data ? data.teamMembers : []

    e.stopPropagation()
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style(
        'top',
        document.getElementById('roadmapScrollFrame').scrollTop +
          (e.clientY - 85) +
          'px'
      )
      .style(
        'left',
        document.getElementById('roadmapScrollFrame').scrollLeft +
          (e.clientX - 62) +
          'px'
      )
    if (select('#teamMemberContent').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'teamMemberContent')
        .html(generateTeamMembersTooltip(teamMembers, data))
    }
  })

  selectAll('[data-test=task-cell-assignee-chip]').on('mouseout', e => {
    e.stopPropagation()
    select(e.target.closest('.assignee-chip')).style(
      'background-color',
      'unset'
    )
    const tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#teamMemberContent').remove()
  })
}
