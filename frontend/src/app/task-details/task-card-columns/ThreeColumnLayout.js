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

import { useTheme, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants'
import TaskPostsContainer from '../task-card-content/task-notes/TaskPostsContainer'
import TemplateTaskPostsContainer from '../task-card-content/task-notes/TemplateTaskPostsContainer'
import { getTaskColourLight } from '../TaskCardCommon'
import PostListColumn from './PostListColumn'
import SubtasksColumn from './SubtasksColumn'
import TaskDetailsColumn from './TaskDetailsColumn'
import TaskPostAndSubColumn from './TaskPostAndSubColumn'
import juralioTheme from '../../../theme/juralio-theme'

const useStyles = makeStyles()(theme => ({
  root: {
    height: '100%',
    display: 'flex',
  },
}))

const columnStyle = {
  height: `calc(100% - ${
    navigator.userAgent.includes('Cypress!') ? 140 : 119
  }px)`,
}

const TRANSITION_TIME = '0.5s'

const ThreeColumnLayout = props => {
  const { classes } = useStyles()
  const {
    task,
    posts,
    matterId,
    projectId,
    templateId,
    postId,
    dateLinkingDetails,
    showSnackbarHandler,
    updateHandler,
    isReadOnly,
    viewOnly,
    isEditor,
  } = props

  const isTaskReadOnly =
    task.status === TASK_STATUS.NOT_REQUIRED || isReadOnly || viewOnly
  const isPostSelected = postId > -1
  const isProjectTask = matterId ? true : false
  const theme = useTheme()

  const LHColumnWidth =
    (Math.max(window.innerWidth * 0.33, 400) / window.innerWidth) * 100
  const MidColumnWidth = (99 - LHColumnWidth) / 2
  const PostListOpenWidth = 22
  const RHColumnWidth = (99 - LHColumnWidth) / 2

  const taskDetailsTransitioned = isPostSelected
    ? { opacity: 0 }
    : { opacity: 1 }
  const subtasksTransitioned = isPostSelected
    ? { opacity: 0, transform: 'translate(0,100px)' }
    : { opacity: 1 }

  //-0% for css magic reasons
  const postListTransitioned = isPostSelected
    ? {
        left: '-0%',
        width: `${PostListOpenWidth}%`,
        top: '105px',
      }
    : {}

  const postEditorTransitioned =
    isPostSelected && isProjectTask
      ? {
          width: `${100 - PostListOpenWidth}%`,
          left: `${PostListOpenWidth}%`,
          top: '117px !important',
          transform: 'translate(0,-12px)',
        }
      : {}

  const postEditorTemplateTransitioned =
    isPostSelected && !isProjectTask
      ? {
          width: `${100 - PostListOpenWidth}%`,
          left: `${PostListOpenWidth}%`,
          top: '117px !important',
          transform: 'translate(0,-12px)',
        }
      : {}

  const [showPostContainer, setShowPostContainer] = useState(false)
  const [showTemplatePostContainer, setShowTemplatePostContainer] =
    useState(false)
  useEffect(() => {
    isProjectTask && setShowPostContainer(isPostSelected)
    isPostSelected && !isProjectTask && setShowTemplatePostContainer(true)
    !isPostSelected && !isProjectTask && setShowTemplatePostContainer(false)
  }, [isPostSelected, isProjectTask])

  const isSmallScreen = useMediaQuery(juralioTheme.breakpoints.down('ss'))

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
      <div
        style={{
          width: `${LHColumnWidth}%`,
          ...columnStyle,
          ...taskDetailsTransitioned,
          position: 'absolute',
          transition: TRANSITION_TIME,
          marginTop: '24px',
          overflow: 'auto',
        }}
      >
        <TaskDetailsColumn
          task={task}
          matterId={matterId}
          projectId={projectId}
          templateId={templateId}
          dateLinkingDetails={dateLinkingDetails}
          isReadOnly={isTaskReadOnly}
          isPostSelected={isPostSelected}
          showSnackbarHandler={showSnackbarHandler}
          updateHandler={updateHandler}
          viewOnly={viewOnly}
          isEditor={isEditor}
        />
      </div>
      {!isSmallScreen && (
        <>
          <div
            style={{
              width: task.isMilestone ? '66%' : `${MidColumnWidth}%`,
              left: `${LHColumnWidth}%`,
              ...columnStyle,
              position: 'absolute',
              ...postListTransitioned,
              transition: TRANSITION_TIME,
              marginRight: theme.spacing(3),
              top: isPostSelected ? '130px' : '148px',
            }}
          >
            <PostListColumn
              task={task}
              matterId={matterId}
              projectId={projectId}
              templateId={templateId}
              posts={posts}
              isEditor={isEditor}
              isReadOnly={isTaskReadOnly}
              showTaskName={isPostSelected}
              showSnackbarHandler={showSnackbarHandler}
              viewOnly={props.viewOnly}
            />
          </div>
          <div
            style={{
              width: '0px',
              left: `${LHColumnWidth + MidColumnWidth}%`,
              ...columnStyle,
              position: 'absolute',
              background: 'white',
              ...postEditorTransitioned,
              transition: TRANSITION_TIME,
              zIndex: '1000',
              top: 129,
            }}
          >
            {showPostContainer && (
              <TaskPostsContainer
                task={task}
                matterId={matterId}
                postId={postId}
                isReadOnly={isTaskReadOnly}
                viewOnly={props.viewOnly}
                openInEditMode={props.openInEditMode}
              />
            )}
          </div>
          {showTemplatePostContainer && (
            <div
              style={{
                width: '0px',
                left: `${LHColumnWidth + MidColumnWidth}%`,
                ...columnStyle,
                position: 'absolute',
                background: 'white',
                ...postEditorTemplateTransitioned,
                transition: TRANSITION_TIME,
                zIndex: '1000',
                marginRight: theme.spacing(3),
                top: 129,
              }}
            >
              <TemplateTaskPostsContainer
                task={task}
                templateId={templateId}
                viewOnly={props.viewOnly}
              />
            </div>
          )}
          {!task.isMilestone && (
            <div
              style={{
                width: `calc(${RHColumnWidth}% - 24px)`,
                left: `calc(${LHColumnWidth + MidColumnWidth}% + 24px)`,
                ...columnStyle,
                ...subtasksTransitioned,
                position: 'absolute',
                transition: TRANSITION_TIME,
                marginTop: '24px',
                top: isPostSelected ? '105px' : '136px',
              }}
            >
              <SubtasksColumn
                task={task}
                matterId={matterId}
                projectId={projectId}
                templateId={templateId}
                isReadOnly={isTaskReadOnly}
                viewOnly={props.viewOnly}
              />
            </div>
          )}
        </>
      )}
      {isSmallScreen && (
        <TaskPostAndSubColumn
          MidColumnWidth={MidColumnWidth}
          LHColumnWidth={LHColumnWidth}
          RHColumnWidth={RHColumnWidth}
          postListTransitioned={postListTransitioned}
          postEditorTransitioned={postEditorTransitioned}
          subtasksTransitioned={subtasksTransitioned}
          TRANSITION_TIME={TRANSITION_TIME}
          task={task}
          posts={posts}
          matterId={matterId}
          projectId={projectId}
          templateId={templateId}
          isTaskReadOnly={isTaskReadOnly}
          isMilestone={task.isMilestone}
          isEditor={isEditor}
          showSnackbarHandler={showSnackbarHandler}
          showPostContainer={showPostContainer}
          showTemplatePostContainer={showTemplatePostContainer}
          postEditorTemplateTransitioned={postEditorTemplateTransitioned}
          postId={postId}
          isPostSelected={isPostSelected}
          isProjectTask={isProjectTask}
          isSmallScreen={true}
        />
      )}
    </div>
  )
}

export default ThreeColumnLayout
