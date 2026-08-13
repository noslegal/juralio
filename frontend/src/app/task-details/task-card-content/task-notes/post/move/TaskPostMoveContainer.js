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
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import postService from '../../../../../../services/post/post-service'
import { getTaskDetailsRedirectSnackbarAction } from '../../../../../../services/redirect/TaskDetailsRedirectSnackbarAction'
import { getTemplateTaskDetailsRedirectSnackbarAction } from '../../../../../../services/redirect/TemplateTaskDetailsRedirectSnackbarAction'
import { flatTaskListFromTree } from '../../../../../../services/task/data-provider/task-list-data-provider'
import templateService from '../../../../../../services/template/template-service'
import { showSnackbar } from '../../../../../global-snackbar/global-snackbar-actions'
import { fetchProjects } from '../../../../../matter-list/matter-list-actions'
import { fetchTemplates } from '../../../../../template-list/template-list-actions'
import {
  clearItemSelection,
  fetchTaskPosts,
  setInitialContentItemSelection,
} from '../../task-posts-actions'
import {
  clearItemSelection as clearTemplateItemSelection,
  fetchTemplateTaskPosts,
  selectItem as templateSelectItem,
} from '../../template-task-post-actions'
import TaskPostMove from './TaskPostMove'

const TaskPostMoveContainer = props => {
  const history = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { project, isTemplate, post } = props
  // In this container it deals with projects & templates
  // by the data structure allows templates and projects to be functionally identical in the move post usecase
  // as such, the container references projects, but can reference both projects or templates depending on the context

  const [selectedTask, setSelectedTask] = useState('')
  const [selectedProjectTasks, setSelectedProjectTasks] = useState([])
  const projects = useSelector(state => state.projects)
  const template = useSelector(state => state.template)
  const templates = useSelector(state => state.templates)
  const selectedTemplateTask = useSelector(state => state.selectedTemplateTask)
  const task = useSelector(state => state.selectedTask)

  const [selectedProject, setSelectedProject] = useState(
    isTemplate ? template.template.id : project.id
  )

  useEffect(
    () => {
      if (isTemplate) {
        dispatch(fetchTemplates())
        const tasks = templateService.getTemplateTasks(template.template.id)
        tasks.then(response => {
          let templateTasks = { tasks: response.body }
          templateTasks = flatTaskListFromTree(templateTasks)
          setSelectedProjectTasks(templateTasks)
        })
        setSelectedTask(selectedTemplateTask.id)
      } else {
        dispatch(fetchProjects(project.matter))
        setSelectedProjectTasks(flatTaskListFromTree({ tasks: project.tasks }))
        //setSelectedTask(task.id)
      }
    },
    //eslint-disable-next-line
    [
      isTemplate,
      project.id,
      project.matter,
      project.matterId,
      selectedTemplateTask.id,
      task.id,
      template.template.id,
    ]
  )

  const handleProjectChange = e => {
    setSelectedProject(e.target.value)
    if (isTemplate) {
      const tasks = templateService.getTemplateTasks(e.target.value)
      tasks.then(response => {
        let templateTasks = { tasks: response.body }
        templateTasks = flatTaskListFromTree(templateTasks)
        setSelectedProjectTasks(templateTasks)
        if (response.body.length === 1) {
          setSelectedTask(response.body[0].id)
        } else {
          setSelectedTask('')
        }
      })
    } else {
      const newProjectTasks = projects.items.filter(
        p => p.id === e.target.value
      )[0].tasks
      setSelectedProjectTasks(newProjectTasks)
      if (newProjectTasks === 1) {
        setSelectedTask(newProjectTasks[0].id)
      } else {
        setSelectedTask('')
      }
    }
  }

  const handleTaskChange = e => setSelectedTask(e.target.value)

  const onSubmit = () => {
    if (isTemplate) {
      templateService
        .moveTemplatePost(
          template.template.id,
          selectedTemplateTask.id,
          post.id,
          selectedTask
        )
        .then(res => {
          if (res.status === 200) {
            dispatch(
              fetchTemplateTaskPosts(
                template.template.id,
                selectedTemplateTask.id
              )
            ).then(() => {
              dispatch(
                clearTemplateItemSelection(
                  history,
                  template.template.id,
                  selectedTemplateTask.id,
                  location
                )
              )
              props.handleClose()
              dispatch(
                showSnackbar(
                  t('postMove.moveSuccess', {
                    post: post.name,
                    task: selectedProjectTasks.find(t => t.id === selectedTask)
                      .name,
                  }),
                  getTemplateTaskDetailsRedirectSnackbarAction(
                    selectedProject,
                    selectedTask,
                    () => {
                      dispatch(
                        templateSelectItem(
                          { navigate: history, location: location },
                          template.template.id,
                          selectedTemplateTask.id,
                          post.id
                        )
                      )
                    }
                  )
                )
              )
            })
          }
        })
    } else {
      postService
        .movePost(project.matterId, project.id, task.id, post.id, selectedTask)
        .then(res => {
          if (res.status === 200) {
            dispatch(fetchTaskPosts(project.matterId, project.id, task.id))
            dispatch(clearItemSelection())
            props.handleClose()
            dispatch(
              showSnackbar(
                t('postMove.moveSuccess', {
                  post: post.name,
                  task: selectedProjectTasks.find(t => t.id === selectedTask)
                    .name,
                }),
                getTaskDetailsRedirectSnackbarAction(
                  project.matterId,
                  selectedProject,
                  selectedTask,
                  () => {
                    dispatch(setInitialContentItemSelection(post.id))
                  }
                )
              )
            )
          }
        })
    }
  }

  const canSubmit =
    selectedTask !== '' &&
    selectedTask !== (isTemplate ? selectedTemplateTask.id : task.id)
  const isLoaded = isTemplate ? templates.isLoaded : projects?.meta.isLoaded

  return (
    <TaskPostMove
      project={isTemplate ? template : project}
      handleProjectChange={handleProjectChange}
      handleTaskChange={handleTaskChange}
      post={post}
      closeHandler={props.handleClose}
      projects={
        isTemplate ? templates.templates : projects.items.filter(p => p.active)
      }
      selectedProject={selectedProject}
      selectedTask={selectedTask}
      tasks={selectedProjectTasks.filter(t => t.id !== task.id)}
      onSubmit={onSubmit}
      canSubmit={canSubmit}
      isLoaded={isLoaded}
      isTemplate={isTemplate}
    />
  )
}

export default TaskPostMoveContainer
