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

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import TaskCell from '../../../components/data-display/task-cell/TaskCell'
import { getTemplateIdFromLocation } from '../../../components/navigation/common/location-context-helper'

const TaskContent = props => {
  const task = props.task
  const history = useNavigate()
  useEffect(() => {
    if (task.id === -1 && !task.forLoading) {
      //its a placeholder
      props.handleNameClick()
    }
  }, [task]) //eslint-disable-line
  return (
    <TaskCell
      item={task}
      isAboveHeightThreshold={true}
      isHighlighted={props.isHighlighted}
      colourMode={props.getColourMode()}
      selectionMode={props.selectionMode}
      isReadOnly={props.isReadOnly}
      matterId={task.matterId}
      projectId={task.project?.id}
      templateId={getTemplateIdFromLocation(window.location)}
      showOptions={true}
      detailedView={props.detailedView}
      compactHeight={props.isCompact}
      viewOnly={false}
      handleNameClick={props.handleNameClick}
      handlePreviewClick={props.handlePreviewClick}
      noMargin={true}
      handleOptionsClick={props.handleOptionsClick}
      handleDateClick={props.handleDateClick}
      clickHandler={props.handleTaskCardClick}
      renderDates={true}
      selectedTask={null}
      hideHover={false}
      disableBackgroundColor={false}
      displayContent={true}
    />
  )
}
export default TaskContent
