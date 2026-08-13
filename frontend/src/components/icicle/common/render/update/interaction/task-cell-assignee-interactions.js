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
import {
  hideTaskmapTaskAssigneeContainer,
  showTaskmapTaskAssigneeContainer,
  showTaskPreview,
} from '../../../../../../app/task-details/task-actions'
import TaskMapAssigneeToolTip from '../../../../../../app/task-map/task-assignees/TaskMapAssigneeToolTip'
import store from '../../../../../../store/configure-store'
import { ICICLE_CSS_NAME } from '../../../selection/selector'

export const setUpTaskCellAssigneeInteractions = (
  cells,
  mainIcicleRef,
  viewOnly
) => {
  if (!viewOnly) {
    selectAll('[data-test=task-cell-zero-assignee-chip]').on('click', e => {
      e.stopPropagation()

      const closetIcicle = e.target.closest(`.${ICICLE_CSS_NAME}`)
      let id = parseInt(closetIcicle.id.substring(1))
      let cell = cells.data().filter(d => {
        return d.data.id === id
      })[0]
      if (!cell) {
        return
      }
      select(mainIcicleRef).on('scroll', () => {
        store.dispatch(hideTaskmapTaskAssigneeContainer())
        select(mainIcicleRef).on('scroll', () => {}) //reset the scroll handler
      })

      const leftPos =
        parseInt(closetIcicle.style.left.slice(0, -2)) -
        mainIcicleRef.scrollLeft

      const assigneeChip = e.target.closest('.assignee-chip')
      const topPos = assigneeChip.getBoundingClientRect().y - 120
      let tooltip = select('.generic-tooltip')
      tooltip
        .style('visibility', 'hidden')
        .style('top', '0px')
        .style('left', '0px')
      select('#teamMemberContent').remove()

      store.dispatch(
        showTaskmapTaskAssigneeContainer({
          task: cell.data,
          position: { left: leftPos, top: topPos },
        })
      )
    })
  }

  const generateTeamMembersTooltip = (teamMembers, viewOnly) => {
    return ReactDOMServer.renderToString(
      <TaskMapAssigneeToolTip teamMembers={teamMembers} viewOnly={viewOnly} />
    )
  }

  selectAll('[data-test^=task-cell-assignee-chip').on('click', e => {
    const closetIcicle = e.target.closest(`.${ICICLE_CSS_NAME}`)

    let id = parseInt(closetIcicle.id.substring(1))
    let cell = cells.data().filter(d => {
      return d.data.id === id
    })[0]
    if (!cell) {
      return
    }

    let d = cells
      .data()
      .find(node => node.data.id === parseInt(closetIcicle.id.substring(1)))
    const leftPos =
      parseInt(closetIcicle.style.left.slice(0, -2)) - mainIcicleRef.scrollLeft

    let topPos = e.target.getBoundingClientRect().y - 150
    topPos = Math.min(topPos, window.innerHeight)

    store.dispatch(
      showTaskPreview(d.data, { left: leftPos, top: topPos }, viewOnly)
    )
  })

  selectAll('[data-test^=task-cell-assignee-chip').on('mouseover', e => {
    if (store.getState().taskmap.showAssigneePopover) {
      return
    }
    const closetIcicle = e.target.closest(`.${ICICLE_CSS_NAME}`)

    let id = parseInt(closetIcicle.id.substring(1))
    let cell = cells.data().filter(d => {
      return d.data.id === id
    })[0]
    if (!cell) {
      return
    }

    let data = cells
      .data()
      .find(node => node.data.id === parseInt(closetIcicle.id.substring(1)))
    let teamMembers = []
    if (data) {
      teamMembers = data.data.teamMembers.filter(t => t.enabled)
    }

    e.stopPropagation()
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'visible')
      .style('top', mainIcicleRef.scrollTop + (e.clientY - 85) + 'px')
      .style('left', mainIcicleRef.scrollLeft + (e.clientX - 62) + 'px')
      .style('width', 'auto')
    if (select('#teamMemberContent').empty()) {
      tooltip
        .style('height', 'auto')
        .append('div')
        .attr('id', 'teamMemberContent')
        .html(generateTeamMembersTooltip(teamMembers, viewOnly))
    }
  })

  selectAll('[data-test=task-cell-assignee-chip]').on('mouseout', e => {
    e.stopPropagation()
    select(e.target.closest('.assignee-chip')).style(
      'background-color',
      'unset'
    )
    let tooltip = select('.generic-tooltip')
    tooltip
      .style('visibility', 'hidden')
      .style('top', '0px')
      .style('left', '0px')
    select('#teamMemberContent').remove()
  })
}
