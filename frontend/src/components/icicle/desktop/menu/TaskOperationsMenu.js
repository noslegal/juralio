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

import PropTypes from 'prop-types'
import React from 'react'
import TaskMenuContainer from '../../../../app/task-details/task-card-header/task-option-menu/TaskMenuContainer'
import TemplateMenuContainer from '../../../../app/task-details/task-card-header/template-option-menu/TemplateMenuContainer'

const anchorOrigin = { vertical: 'bottom', horizontal: 'left' }

const TaskOperationsMenu = props => {
  const renderContent = () =>
    props.isTemplate ? (
      <TemplateMenuContainer
        handleRenameClick={props.handleRenameClick}
        taskMenuContext={props.taskMenuContext}
        task={props.task}
        anchor={props.anchor}
        anchorOrigin={anchorOrigin}
        closeHandler={props.onClose}
      />
    ) : (
      <TaskMenuContainer
        handleRenameClick={props.handleRenameClick}
        taskMenuContext={props.taskMenuContext}
        task={props.task}
        anchor={props.anchor}
        anchorOrigin={anchorOrigin}
        matterId={props.matterId}
        closeHandler={props.onClose}
        isMatterAdmin={props.isMatterAdmin}
        viewOnly={props.viewOnly}
        updateProject={() => {}}
      />
    )

  return props.anchor ? renderContent() : null
}

TaskOperationsMenu.propTypes = {
  /** isTemplate */
  isTemplate: PropTypes.bool,
  /** taskMenuContext */
  taskMenuContext: PropTypes.string.isRequired,
  /** handleRenameClick */
  handleRenameClick: PropTypes.func.isRequired,
  /** task */
  task: PropTypes.object,
  /** anchor */
  anchor: PropTypes.object,
  /** onClose */
  onClose: PropTypes.func.isRequired,
  /** matterId */
  matterId: PropTypes.string,
  /** isMatterAdmin */
  isMatterAdmin: PropTypes.bool,
}

export default TaskOperationsMenu
