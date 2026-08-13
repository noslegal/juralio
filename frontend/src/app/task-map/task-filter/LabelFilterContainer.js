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
import LabelFilter from './LabelFilter'
import { taskFilterActions } from './task-filter-actions'

const LabelFilterContainer = () => {
  const project = useSelector(state => state.project)
  const selectedTask = useSelector(state => state.selectedTask)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchString, setSearchString] = useState('')
  const currentLabels = useSelector(state => state.taskMapFilter.filterLabels)

  const dispatch = useDispatch()

  const [labels, setLabels] = useState([])
  const noLabels = labels.length === 0

  useEffect(() => {
    const tasks = flatTaskListFromTree(project)
    const l = [...new Set(tasks.map(task => task.labels).flat())]
      .filter(l => l !== undefined)
      .filter((v, i, a) => a.findIndex(t => t.labelId === v.labelId) === i)
    setLabels(l)
  }, [project, selectedTask.labels])

  const toggleLabel = labelId => {
    if (currentLabels.includes(labelId)) {
      dispatch(
        taskFilterActions.setCurrentLabels(
          currentLabels.filter(id => id !== labelId)
        )
      )
    } else {
      dispatch(taskFilterActions.setCurrentLabels([...currentLabels, labelId]))
    }
    if (currentLabels !== []) {
      dispatch(taskFilterActions.setDetailedView(true, true))
    }
  }

  return (
    <LabelFilter
      handleWrapperClick={() => {
        setSearchString('')
        if (!noLabels) {
          setShowDropdown(!showDropdown)
        }
      }}
      showDropdown={showDropdown}
      labels={labels.filter(label =>
        label.name.toLowerCase().includes(searchString.toLowerCase())
      )}
      selectedLabelIds={currentLabels}
      toggleLabel={toggleLabel}
      searchString={searchString}
      setSearchString={setSearchString}
      labelCount={labels.length}
    />
  )
}

export default LabelFilterContainer
