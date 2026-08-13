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

import classNames from 'classnames'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../constants'
import TaskDescription from '../task-card-content/TaskDescription/TaskDescription'
import TaskName from '../task-card-content/TaskName/TaskName'
import TaskTeamMembersContainer from '../task-card-content/TaskTeamMembers/TaskTeamMembersContainer'
import TaskLabelContainer from '../task-label/TaskLabelContainer'
import FollowButtonContainer from './components/FollowButtonContainer'
import TaskDatesPanel from './components/TaskDatesPanel'
import TaskOptions from './components/TaskOptions'
import TaskPathContainer from './components/TaskPathContainer'
import TaskReference from './components/TaskReference'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    paddingBottom: theme.spacing(11),
  },
  overview: {
    height: '100%',
    width: '100%',
    marginTop: theme.spacing(),
  },
  row: { display: 'flex', flexDirection: 'row' },
}))

const TaskDetailsColumn = props => {
  const { classes } = useStyles()
  const {
    task,
    dateLinkingDetails,
    isOverview,
    isReadOnly,
    matterId,
    projectId,
    templateId,
    showSnackbarHandler,
    updateHandler,
    viewOnly,
    isEditor,
  } = props
  const isProjectTask = templateId === undefined
  return (
    <div
      className={classNames(classes.root, { [classes.overview]: isOverview })}
      data-test="task-details-column"
    >
      <div className={classes.row}>
        {isOverview ? null : (
          <TaskPathContainer
            task={task}
            matterId={matterId}
            templateId={templateId}
            showSnackbarHandler={showSnackbarHandler}
          />
        )}
        {isOverview ? null : (
          <TaskOptions
            task={task}
            matterId={matterId}
            templateId={templateId}
            projectId={projectId}
            updateHandler={updateHandler}
            isReadOnly={isReadOnly}
            viewOnly={viewOnly}
          />
        )}
      </div>
      <TaskName
        task={task}
        isReadOnly={isReadOnly}
        templateId={templateId}
        data-test="task-name-on-card"
        updateHandler={updateHandler}
        isOverview={isOverview}
        isEditor={isEditor}
      />
      {isOverview ? null : (
        <TaskReference
          task={task}
          matterId={matterId}
          templateId={templateId}
          showSnackbarHandler={showSnackbarHandler}
        />
      )}
      <TaskDescription
        data-test="task-description-on-card"
        description={matterId ? task.description : task.noticeboardText}
        matterId={matterId}
        templateId={templateId}
        projectId={projectId}
        taskId={task.id}
        updateHandler={updateHandler}
        isReadOnly={isReadOnly || viewOnly}
      />
      {isProjectTask && task.status !== TASK_STATUS.NOT_REQUIRED && (
        <TaskTeamMembersContainer
          isReadOnly={isReadOnly}
          isOverview={isOverview}
          matterId={matterId}
          projectId={projectId}
          taskId={task.id}
          viewOnly={props.viewOnly}
        />
      )}
      {isProjectTask &&
        !isReadOnly &&
        task.status !== TASK_STATUS.NOT_REQUIRED && (
          <FollowButtonContainer
            task={task}
            matterId={matterId}
            projectId={projectId}
            viewOnly={props.viewOnly}
          />
        )}
      {isProjectTask && (
        <TaskDatesPanel
          task={task}
          matterId={matterId}
          projectId={projectId}
          updateHandler={updateHandler}
          siblingTaskCount={dateLinkingDetails.siblingTaskCount}
          siblings={dateLinkingDetails.siblings}
          siblingsLoading={dateLinkingDetails.siblingsLoading}
          linkTasks={dateLinkingDetails.linkTasksHandler}
          viewOnly={viewOnly}
        />
      )}
      {isProjectTask && (
        <TaskLabelContainer task={task} viewOnly={props.viewOnly} />
      )}
    </div>
  )
}

export default TaskDetailsColumn
