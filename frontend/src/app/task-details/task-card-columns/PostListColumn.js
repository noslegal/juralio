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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { Button, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import TaskReferenceNumber from '../../../components/data-display/task-reference-number/TaskReferenceNumber'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
  isInTemplateTaskDetails,
} from '../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../theme/color-modifiers'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import PostListContainer from '../task-card-content/task-notes/post/list/PostListContainer'
import PostListHeader from '../task-card-content/task-notes/post/list/PostListHeader'
import TemplatePostListContainer from '../task-card-content/task-notes/post/list/TemplatePostListContainer'
import { useSelector } from 'react-redux'
import { CONFIG } from '../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: JuralioNamedColours.beige[100],
    height: '100%',
    borderRadius: theme.spacing(0.5),
  },
  compactLayout: {
    boxShadow: theme.shadows[15],
    height: '100%',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(),
  },
  taskNameAndNumber: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    transition: '1s',
  },
  icon: {
    color: colorModifiers.secondaryBorder(rawColours.text.black),
  },
  taskNameTextMargin: {
    marginRight: theme.spacing(),
    color: colorModifiers.primaryText(rawColours.text.black),
  },
  backButton: {
    marginTop: theme.spacing(),
    paddingLeft: '0px !important',
  },
}))

const PostListColumn = props => {
  const { classes } = useStyles()
  const {
    task,
    matterId,
    projectId,
    templateId,
    isEditor,
    isReadOnly,
    showTaskName,
  } = props

  const history = useNavigate()
  const location = useLocation()
  const project = useSelector(state => state.project)
  const template = useSelector(state => state.template)
  const selectedTaskPostList = useSelector(state => state.selectedTaskPostList)
  const templateTaskPostList = useSelector(state => state.templateTaskPostList)
  const [posts, setPosts] = useState(
    isInTemplateTaskDetails(location.pathname)
      ? templateTaskPostList
      : selectedTaskPostList
  )
  const [postCount, setPostCount] = useState('')

  const selectedTask = useSelector(state => state.selectedTask)
  const selectedTemplateTask = useSelector(state => state.selectedTemplateTask)
  const [taskId, setTaskId] = useState(
    isInTemplateTaskDetails(location.pathname)
      ? selectedTemplateTask
      : selectedTask.id
  )
  useEffect(() => {
    if (selectedTaskPostList.taskId === taskId) {
      setPosts(selectedTaskPostList)
    } else if (isInTemplateTaskDetails(location.pathname)) {
      setPosts(templateTaskPostList)
    }
  }, [selectedTaskPostList, templateTaskPostList]) //eslint-disable-line

  const closeEditor = () => {
    const url =
      templateId !== undefined
        ? getTemplateTaskDetailsUrl(templateId, task.id)
        : getTaskDetailsUrl(matterId, projectId, task.id)
    history(url)
  }

  const taskNameAndNumberStyle = showTaskName
    ? {
        width: 'unset',
        height: 'unset',
        opacity: 1,
      }
    : { width: '0px', height: '0px', overflow: 'hidden', opacity: 0 }

  useEffect(() => {
    if (props.templateId) {
      if (
        template.template.postCount &&
        props.posts.length !== undefined &&
        (postCount === '' || postCount === 0)
      ) {
        setPostCount(template.template.postCount - props.posts.length)
      }
    } else {
      if (project.postCount && posts.isLoaded && postCount === '') {
        setPostCount(project.postCount - posts.postList.length)
      }
    }
  }, [posts, props.posts]) //eslint-disable-line

  return (
    <>
      <div
        className={classNames(classes.root, {
          [classes.compactLayout]: !showTaskName,
        })}
      >
        {posts.postList && posts.postList.length > 0 && (
          <PostListHeader
            taskId={task.id}
            isEditor={isEditor}
            isMilestone={task.isMilestone}
            isDeliverable={task.isDeliverable}
            templateId={templateId}
            viewOnly={props.viewOnly}
            isReadOnly={isReadOnly}
            postLimit={
              props.templateId
                ? postCount + props.posts.length >= CONFIG.POSTS_LIMIT
                : postCount + posts.postList.length >= CONFIG.POSTS_LIMIT
            }
          />
        )}

        <div
          className={classes.taskNameAndNumber}
          style={{
            ...taskNameAndNumberStyle,
          }}
        >
          <Button className={classes.backButton} onClick={closeEditor}>
            <ChevronLeftIcon className={classes.icon} />
            <Typography className={classes.taskNameTextMargin}>
              {task.name}
            </Typography>
            <TaskReferenceNumber
              compact
              task={task}
              index={0}
              colour={rawColours.primary.black[200]}
            />
          </Button>
        </div>
        {templateId ? (
          <TemplatePostListContainer
            templateId={templateId}
            templateTask={task}
            isEditor={isEditor}
            isReadOnly={isReadOnly}
            viewOnly={props.viewOnly}
            isSmallScreen={props.isSmallScreen}
            isSmallPanel={props.isSmallPanel}
          />
        ) : (
          <PostListContainer
            matterId={matterId}
            projectId={projectId}
            templateId={templateId}
            taskId={task.id}
            isEditor={isEditor}
            isReadOnly={isReadOnly}
            isMilestone={task.isMilestone}
            isDeliverable={task.isDeliverable}
            viewOnly={props.viewOnly}
            isInEditMode={props.inEditView}
            isSmallScreen={props.isSmallScreen}
            isSmallPanel={props.isSmallPanel}
          />
        )}
      </div>
    </>
  )
}

export default PostListColumn
