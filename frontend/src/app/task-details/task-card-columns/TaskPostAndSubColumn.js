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

import { useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import TaskPostsContainer from '../task-card-content/task-notes/TaskPostsContainer'
import TemplateTaskPostsContainer from '../task-card-content/task-notes/TemplateTaskPostsContainer'
import PostListColumn from './PostListColumn'
import SubtasksColumn from './SubtasksColumn'

const columnStyle = {
  height: `calc(50% - 74px)`,
}

const TaskPostAndSubColumn = props => {
  const [bUpperLower, setBUpperLower] = useState(false)
  const [bUpperLowerEven, setBUpperLowerEven] = useState(true)
  const theme = useTheme()
  const PostListOpenWidth = 22
  const postEditorTransitioned =
    props.isPostSelected && props.isProjectTask
      ? {
          width: `${100 - PostListOpenWidth}%`,
          height: '100%',
          left: `${PostListOpenWidth}%`,
          top: '117px !important',
          transform: 'translate(0,-12px)',
        }
      : {}

  const determineMajority = () => {
    //if more posts then post list 66%
    if (
      props.posts?.length > props.task?.tasks?.length ||
      props.task.posts?.length > props.task?.tasks?.length
    ) {
      setBUpperLower(true)
      setBUpperLowerEven(false)
    } else if (
      props.posts?.length < props.task?.tasks?.length ||
      props.task.posts?.length < props.task?.tasks?.length
    ) {
      //else if more subtasks then
      setBUpperLower(false)
      setBUpperLowerEven(false)
    } else {
      setBUpperLowerEven(true)
      setBUpperLower(false)
    }
  }
  useEffect(() => {
    determineMajority()
  }, [props.task, props.posts]) //eslint-disable-line

  return (
    <>
      <div
        style={{
          width: `${props.MidColumnWidth * 2}%`,
          height:
            props.showPostContainer || props.showTemplatePostContainer
              ? '100%'
              : props.isMilestone
                ? '100%'
                : bUpperLowerEven
                  ? 'calc(50% - 74px)'
                  : bUpperLower
                    ? 'calc(66% - 74px)'
                    : 'calc(33% - 74px)',
          left: `${props.LHColumnWidth}%`,
          position: 'absolute',
          ...props.postListTransitioned,
          transition: props.TRANSITION_TIME,
          marginRight: theme.spacing(3),
          top: props.isPostSelected ? '105px' : '136px',
        }}
      >
        <PostListColumn
          task={props.task}
          matterId={props.matterId}
          projectId={props.projectId}
          templateId={props.templateId}
          isEditor={props.isEditor}
          isReadOnly={props.isTaskReadOnly}
          posts={props.posts}
          showTaskName={props.isPostSelected}
          showSnackbarHandler={props.showSnackbarHandler}
          viewOnly={props.viewOnly}
          inEditView={props.showPostContainer}
          isSmallScreen={props.isSmallScreen}
          isSmallPanel={bUpperLowerEven}
        />
      </div>

      {props.showPostContainer && (
        <div
          style={{
            width: '0px',
            left: `${props.LHColumnWidth + props.MidColumnWidth}%`,
            height: '0px',
            position: 'absolute',
            background: 'white',
            ...postEditorTransitioned,
            transition: props.TRANSITION_TIME,
            zIndex: '1000',
            top: 129,
          }}
        >
          <TaskPostsContainer
            task={props.task}
            matterId={props.matterId}
            postId={props.postId}
            isReadOnly={props.isTaskReadOnly}
            viewOnly={props.viewOnly}
            openInEditMode={props.openInEditMode}
          />
        </div>
      )}

      {props.showTemplatePostContainer && (
        <div
          style={{
            height: '100%',
            width: '0px',
            left: `${props.LHColumnWidth + props.MidColumnWidth}%`,
            position: 'absolute',
            background: 'white',
            ...props.postEditorTemplateTransitioned,
            transition: props.TRANSITION_TIME,
            zIndex: '1000',
            marginRight: theme.spacing(3),
            top: 129,
          }}
        >
          <TemplateTaskPostsContainer
            task={props.task}
            templateId={props.templateId}
            viewOnly={props.viewOnly}
          />
        </div>
      )}
      {!props.task.isMilestone && (
        <div
          style={{
            width: props.isMilestone ? '66%' : `${props.MidColumnWidth * 2}%`,
            left: `${props.LHColumnWidth}%`,
            height: bUpperLowerEven
              ? 'calc(50% - 74px)'
              : bUpperLower
                ? 'calc(33% - 74px)'
                : 'calc(66% - 74px)',
            ...props.subtasksTransitioned,
            position: 'absolute',
            transition: props.TRANSITION_TIME,
            marginTop: '12px',
            top: bUpperLowerEven
              ? 'calc(50% + 74px)'
              : bUpperLower
                ? 'calc(66% + 74px)'
                : 'calc(33% + 74px)',
          }}
        >
          <SubtasksColumn
            task={props.task}
            matterId={props.matterId}
            projectId={props.projectId}
            templateId={props.templateId}
            isReadOnly={props.isTaskReadOnly}
            viewOnly={props.viewOnly}
            isTemplate={!(props.templateId === null)}
          />
        </div>
      )}
    </>
  )
}
export default TaskPostAndSubColumn
