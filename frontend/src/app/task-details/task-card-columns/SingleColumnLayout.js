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

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/rabbit.svg'
import NoContent from '../../../components/data-display/no-content/NoContent'
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants'
import InboxZeroState from '../../home/zero-state/InboxZeroState'
import PostDetailContainer from '../../task-details/task-card-content/task-notes/post/detail/PostDetailContainer'
import TemplatePostDetailContainer from '../../task-details/task-card-content/task-notes/post/detail/TemplatePostDetailContainer'
import PostListContainer from '../../task-details/task-card-content/task-notes/post/list/PostListContainer'
import TemplatePostListContainer from '../../task-details/task-card-content/task-notes/post/list/TemplatePostListContainer'
import MobilePostDisplay from '../../task-details/task-card-content/task-notes/post/mobile/MobilePostDisplay'
import { mobilePostDetailsDrawerTheme } from '../../task-details/TaskCardCommon'
import { getTaskColourLight } from '../TaskCardCommon'
import MobilePostContainer from './../task-card-content/task-notes/post/mobile/MobilePostContainer'
import SubtasksColumn from './SubtasksColumn'
import TaskDetailsColumn from './TaskDetailsColumn'

const noOpFunction = () => {}

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(6),
    paddingTop: theme.spacing(),
    paddingLeft: 0,
    paddingRight: theme.spacing(),
    height: '100%',
  },
}))

const renderMobilePostDetails = (
  task,
  matterId,
  selectedItemId,
  clickBackHandler,
  posts
) => {
  const isPostSelected = selectedItemId !== -1
  const post = posts.find(p => p.id === parseInt(selectedItemId))
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={mobilePostDetailsDrawerTheme}>
        <SwipeableDrawer
          anchor="right"
          open={isPostSelected}
          onClose={noOpFunction}
          onOpen={noOpFunction}
        >
          <MobilePostDisplay
            post={post}
            task={task}
            clickBackHandler={clickBackHandler}
          >
            <PostDetailContainer
              post={post}
              task={task}
              matterId={matterId}
              mobileView={true}
            />
          </MobilePostDisplay>
        </SwipeableDrawer>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

const renderMobileTemplatePostDetails = (
  task,
  templateId,
  selectedItemId,
  clickBackHandler,
  posts,
  viewOnly
) => {
  const isPostSelected = selectedItemId !== -1
  const post = posts.find(p => p.id === selectedItemId)
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={mobilePostDetailsDrawerTheme}>
        <SwipeableDrawer
          anchor="right"
          open={isPostSelected}
          onClose={noOpFunction}
          onOpen={noOpFunction}
        >
          <MobilePostDisplay
            post={post}
            task={task}
            isTemplatePost={true}
            clickBackHandler={clickBackHandler}
            viewOnly={viewOnly}
          >
            <TemplatePostDetailContainer
              post={post}
              task={task}
              templateId={templateId}
              mobileView={true}
              viewOnly={viewOnly}
            />
          </MobilePostDisplay>
        </SwipeableDrawer>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

const SingleColumnLayout = props => {
  const { classes } = useStyles()
  const {
    task,
    matterId,
    projectId,
    templateId,
    postId,
    posts,
    dateLinkingDetails,
    showSnackbarHandler,
    updateHandler,
    clickBackHandler,
    isReadOnly,
    viewOnly,
  } = props

  const { t } = useTranslation()
  const taskReadOnly =
    task.status === TASK_STATUS.NOT_REQUIRED || isReadOnly || viewOnly

  if (task.isForbidden) {
    return (
      <div className={classes.root}>
        <NoContent data-test="overview-deleted-task">
          <InboxZeroState
            image={zeroStateImage}
            title={t('taskDetails.archivedTask')}
            imageDimensions={{ width: '90%', height: '90%' }}
          />
        </NoContent>
      </div>
    )
  }

  return (
    <div
      data-test="task-details-layout"
      className={classes.root}
      style={{ backgroundColor: getTaskColourLight(task) }}
    >
      {/* <-- Hidden div for status testing--> */}
      <div
        data-test="task-header-status-text"
        style={{ position: 'absolute', marginLeft: -100 }}
      >
        {TASK_STATUS_LABELS[task.status]}
      </div>
      {/* <!----> */}
      <TaskDetailsColumn
        task={task}
        matterId={matterId}
        projectId={projectId}
        templateId={templateId}
        dateLinkingDetails={dateLinkingDetails}
        isReadOnly={taskReadOnly}
        isPostSelected={false}
        showSnackbarHandler={showSnackbarHandler}
        updateHandler={updateHandler}
      />
      {!task.isMilestone && (
        <SubtasksColumn
          task={task}
          matterId={matterId}
          projectId={projectId}
          templateId={templateId}
          isReadOnly={taskReadOnly}
          viewOnly={viewOnly}
          isMobile={true}
        />
      )}
      <MobilePostContainer>
        {templateId ? (
          <TemplatePostListContainer
            isMobileView={true}
            templateId={templateId}
            templateTask={task}
            isReadOnly={taskReadOnly}
            viewOnly={viewOnly}
          />
        ) : (
          <PostListContainer
            isMobileView={true}
            matterId={matterId}
            projectId={projectId}
            taskId={task.id}
            templateId={templateId}
            templateTask={task}
            isReadOnly={taskReadOnly}
            isMilestone={task.isMilestone}
            isDeliverable={task.isDeliverable}
          />
        )}
      </MobilePostContainer>
      {templateId
        ? renderMobileTemplatePostDetails(
            task,
            templateId,
            postId,
            clickBackHandler,
            posts,
            viewOnly
          )
        : renderMobilePostDetails(
            task,
            matterId,
            postId,
            clickBackHandler,
            posts
          )}
    </div>
  )
}

export default SingleColumnLayout
