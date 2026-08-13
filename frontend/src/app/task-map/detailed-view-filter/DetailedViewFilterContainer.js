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
import { useDispatch, useSelector } from 'react-redux'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import { LABEL_TYPES } from '../../constants'
import { taskFilterActions } from '../task-filter/task-filter-actions'
import DetailedViewFilter from './DetailedViewFilter'
import { cancelMove } from '../../../redux/ducks/improved-taskmap-interactions'
const DetailedViewFilterContainer = props => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dispatch = useDispatch()
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const project = useSelector(state => state.project)
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const [labels, setLabels] = useState([])
  const noLabels = labels.length === 0

  useEffect(() => {
    const tasks = flatTaskListFromTree(project)
    const l = [...new Set(tasks.map(task => task.labels).flat())]
      .filter(l => l !== undefined)
      .filter((v, i, a) => a.findIndex(t => t.labelId === v.labelId) === i)
    setLabels(l)
  }, [project])

  const handleViewChange = (showDetailed, showRisk) => {
    if (props.isTemplate) {
      dispatch(taskFilterActions.setDetailedTemplateView(showDetailed))
    } else {
      dispatch(taskFilterActions.setDetailedView(showDetailed, showRisk))
    }
    if (taskmapInteractions.move) {
      dispatch(cancelMove())
      window.localStorage.setItem('dropZoneId', '-1')
      window.dispatchEvent(new Event('completeMove'))
    }
  }
  return (
    <DetailedViewFilter
      handleWrapperClick={() => {
        setShowDropdown(!showDropdown)
      }}
      showDropdown={showDropdown}
      detailedView={
        props.isTemplate
          ? { viewMode: detailedView.templateViewMode, showRisk: false }
          : detailedView
      }
      noLabels={noLabels}
      noRisks={labels.filter(l => l.type === LABEL_TYPES.RISK).length === 0}
      changeView={handleViewChange}
      isTemplate={props.isTemplate}
    />
  )
}

export default DetailedViewFilterContainer
