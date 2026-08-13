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
import withRouter from '../../../../../../services/navigation/WithRouter'
import {
  clearInitialContentItemSelection,
  fetchTaskPosts,
  reset,
  resetNewCreated,
  selectItem,
} from '../../task-posts-actions'
import PostList from './PostList'
import { useDispatch, useSelector } from 'react-redux'
import {
  getTaskIdFromLocation,
  isInTemplateTaskDetails,
} from '../../../../../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'

const PostListContainer = props => {
  const dispatch = useDispatch()
  const location = useLocation()
  const selectedTaskPostList = useSelector(state => state.selectedTaskPostList)
  const templateTaskPostList = useSelector(state => state.templateTaskPostList)
  const [posts, setPosts] = useState(
    isInTemplateTaskDetails(location.pathname)
      ? templateTaskPostList
      : selectedTaskPostList
  )
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
    }
  }, [selectedTaskPostList]) //eslint-disable-line

  useEffect(() => {
    if (selectedTask !== -1 && selectedTask !== taskId) {
      if (parseInt(getTaskIdFromLocation(location)) === selectedTask.id) {
        setTaskId(selectedTask.id)
        fetchPosts(selectedTask.id)
      }
    }
  }, [selectedTask, selectedTemplateTask]) //eslint-disable-line

  const fetchPosts = id => {
    dispatch(
      fetchTaskPosts(
        props.matterId,
        selectedTask.projectId,
        id ? id : taskId,
        true
      )
    )
  }

  const handleListItemClick = (event, index, item) => {
    dispatch(
      selectItem(
        props.router,
        props.matterId,
        selectedTask.projectId,
        taskId,
        item.id
      )
    )
  }

  useEffect(() => {
    fetchPosts()
    return () => {
      dispatch(reset)
      dispatch(clearInitialContentItemSelection)
    }
  }, []) //eslint-disable-line

  return (
    <PostList
      matterId={props.matterId}
      projectId={props.projectId}
      templateId={props.templateId}
      taskId={taskId}
      isMilestone={props.isMilestone}
      isDeliverable={props.isDeliverable}
      isMobileView={props.isMobileView}
      isLoaded={posts.isLoaded}
      newCreated={posts.newCreated}
      autoSelectNewCreated={posts.autoSelectNewCreated}
      posts={posts.postList}
      selectedItemId={posts.selectedItemId}
      clickHandler={handleListItemClick}
      actions={{
        resetNewCreated: () => dispatch(resetNewCreated()),
        selectItem: (history, matterId, projectId, taskId, postId) => {
          dispatch(selectItem(history, matterId, projectId, taskId, postId))
        },
      }}
      isReadOnly={props.isReadOnly}
      viewOnly={props.viewOnly}
      isEditor={props.isEditor}
      inEditView={props.inEditView}
      isSmallScreen={props.isSmallScreen}
      isSmallPanel={props.isSmallPanel}
    />
  )
}

export default withRouter(PostListContainer)
