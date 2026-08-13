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
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../../constants'
import TaskDates from '../../task-card-content/TaskDates/TaskDates'
import TaskLinksContainer from '../../task-card-content/TaskLinks/TaskLinksContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

const TaskDatesPanel = props => {
  const { task, matterId } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const showDatesLinkingControl =
    !window.location.href.includes('/home') &&
    task.status !== TASK_STATUS.NOT_REQUIRED

  return (
    <div className={classes.root}>
      <TaskDates
        matterId={props.matterId}
        task={props.task}
        updateHandler={props.updateHandler}
        t={t}
        viewOnly={props.viewOnly}
      />
      {showDatesLinkingControl && (
        <TaskLinksContainer
          matterId={matterId}
          projectId={props.projectId}
          task={task}
          siblingTaskCount={props.siblingTaskCount}
          siblings={props.siblings}
          siblingsLoading={props.siblingsLoading}
          linkTasks={props.linkTasks}
          viewOnly={props.viewOnly}
        />
      )}
    </div>
  )
}

export default TaskDatesPanel
