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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import TaskOptionMenu from '../../task-card-header/task-option-menu/TaskOptionMenu'
import TemplateTaskOptionMenu from '../../task-card-header/template-option-menu/TemplateTaskOptions'

const useStyles = makeStyles()(() => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 'auto',
  },
}))

const TaskOptions = props => {
  const { task, matterId, templateId, isReadOnly } = props
  const { classes } = useStyles()
  const isProjectTask = templateId === undefined

  return (
    <div className={classes.root}>
      <div>&nbsp;</div>
      {isProjectTask ? (
        <TaskOptionMenu
          task={task}
          matterId={matterId}
          viewOnly={props.viewOnly}
        />
      ) : isReadOnly ? null : (
        <TemplateTaskOptionMenu task={task} />
      )}
    </div>
  )
}

export default TaskOptions
