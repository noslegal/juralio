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

import {
  getMatterAdminUrl,
  getTaskMapUrl,
} from '../../../components/navigation/common/location-context-helper'
import { addMember } from '../../../redux/ducks/private-workstream-team'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import { createProject } from '../../matter-details/projects/projects-actions'
import { exitSelectionMode, updateProject } from '../../project/project-actions'
import { moveTask } from '../../task-map/selected-task/selected-task-menu-actions'

export const confirmTaskSelection = (
  matterId,
  project,
  currentUser,
  history,
  dispatch,

  t
) => {
  let projectId = project.id
  let taskId = project.highlightList[0].id
  let dontShowSnackbar = false
  if (project.originalWorkstreamName !== undefined) {
    dispatch(
      updateProject(matterId, projectId, {
        name: project.originalWorkstreamName,
      })
    ).then(() => {
      dispatch(
        createProject(
          matterId,
          {
            name: project.newWorkstreamName,
          },
          dontShowSnackbar
        )
      ).then(response => {
        if (project.privateWorkstreamUsers.length > 0) {
          let newProject = response.project
          dispatch(
            addMember(
              matterId,
              response.project.id,
              project.privateWorkstreamUsers
            )
          ).then(response => {
            dispatch(
              moveTask(
                matterId,
                projectId,
                taskId,
                'CROSS_PROJECT_DIFFERENT_PARENT',
                newProject.id,
                0,
                null,
                true,
                false,
                dontShowSnackbar
              )
            )
              .then(() => {
                dispatch(
                  updateProject(matterId, newProject.id, {
                    isPrivate: project.isWorkstreamPrivate,
                  })
                )
              })
              .then(() => {
                dispatch(exitSelectionMode())
                if (project.isWorkstreamPrivate) {
                  if (project.privateWorkstreamUsers.includes(currentUser.id)) {
                    setTimeout(() => {
                      history(getTaskMapUrl(taskId, matterId, newProject.id))
                    }, 1000)
                  } else {
                    history(getMatterAdminUrl(matterId))
                  }
                } else {
                  history(getTaskMapUrl(taskId, matterId, newProject.id))
                }
                dispatch(
                  showSnackbar(
                    `${t('workstreamCreation.splitFromExistingConfirmation')}`
                  )
                )
              })
          })
        } else {
          dispatch(
            moveTask(
              matterId,
              projectId,
              taskId,
              'CROSS_PROJECT_DIFFERENT_PARENT',
              response.project.id,
              0,
              null,
              true,
              false,
              dontShowSnackbar
            )
          ).then(() => {
            dispatch(exitSelectionMode())

            if (project.isWorkstreamPrivate) {
              history(getMatterAdminUrl(matterId))
            } else {
              history(getTaskMapUrl(taskId, matterId, response.project.id))
            }
            dispatch(
              showSnackbar(
                `${t('workstreamCreation.splitFromExistingConfirmation')}`
              )
            )
          })
        }
      })
    })
  } else {
    dispatch(
      createProject(
        matterId,
        {
          name: project.newWorkstreamName,
        },
        dontShowSnackbar
      )
    ).then(response => {
      if (project.privateWorkstreamUsers.length > 0) {
        let newProject = response.project
        dispatch(
          addMember(
            matterId,
            response.project.id,
            project.privateWorkstreamUsers
          )
        ).then(response => {
          dispatch(
            moveTask(
              matterId,
              projectId,
              taskId,
              'CROSS_PROJECT_DIFFERENT_PARENT',
              newProject.id,
              0,
              null,
              true,
              false,
              dontShowSnackbar
            )
          )
            .then(() => {
              dispatch(
                updateProject(matterId, newProject.id, {
                  isPrivate: project.isWorkstreamPrivate,
                })
              )
            })
            .then(() => {
              dispatch(exitSelectionMode())
              if (project.isWorkstreamPrivate) {
                if (project.privateWorkstreamUsers.includes(currentUser.id)) {
                  setTimeout(() => {
                    history(getTaskMapUrl(taskId, matterId, newProject.id))
                  }, 1000)
                } else {
                  history(getMatterAdminUrl(matterId))
                }
              } else {
                history(getTaskMapUrl(taskId, matterId, newProject.id))
              }

              dispatch(
                showSnackbar(
                  `${t('workstreamCreation.splitFromExistingConfirmation')}`
                )
              )
            })
        })
      } else {
        dispatch(
          moveTask(
            matterId,
            projectId,
            taskId,
            'CROSS_PROJECT_DIFFERENT_PARENT',
            response.project.id,
            0,
            null,
            true,
            false,
            dontShowSnackbar
          )
        ).then(() => {
          dispatch(exitSelectionMode())
          if (project.isWorkstreamPrivate) {
            history(getMatterAdminUrl(matterId))
          } else {
            history(getTaskMapUrl(taskId, matterId, response.project.id))
          }
          dispatch(
            showSnackbar(
              `${t('workstreamCreation.splitFromExistingConfirmation')}`
            )
          )
        })
      }
    })
  }
}
