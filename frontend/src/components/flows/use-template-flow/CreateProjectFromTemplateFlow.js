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

import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import IsWidthDown from '../../../hooks/width-helper'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { canInteractWithPrivateWorkstream } from '../../../services/helpers/user/user-helper'
import { TemplatesIcon } from '../../../theme/navigation/CommonIcons'
import CreateProjectFromTemplateDialog from '../../dialog/create-project-from-template-dialog/CreateProjectFromTemplateDialog'
import UseTemplateDialog from '../../dialog/use-template-dialog/UseTemplateDialog'
import {
  getMatterAdminUrl,
  getMatterOverviewUrl,
  getOverviewUrl,
  getTaskMapUrl,
  getTemplateTaskMapUrl,
} from '../../navigation/common/location-context-helper'

const CreateProjectFromTemplateFlow = props => {
  const { t } = useTranslation()
  const history = useNavigate()
  const currentUser = useSelector(state => state.auth.data.details)
  const [progress, setProgress] = useState(null)
  const [loadingTitle, setLoadingTitle] = useState('')

  const cancelCreateProjectHandler = skipForFlow => {
    props.actions.clearErrorMessage()
    props.cancelHandler(skipForFlow)
  }

  const getFullScreenMode = () => IsWidthDown('sm', props.width)

  const handleNewMatter = async (
    clientName,
    matterName,
    matterRef,
    position
  ) => {
    setLoadingTitle(t('Creating your ', { name: matterName }))
    setProgress(25)
    props.actions
      .createMatter(clientName, matterName, matterRef, position)
      .then(matter => {
        setProgress(50)
        if (props.selectedList[0] !== undefined) {
          props.actions
            .createProjectFromTemplateTask(
              matter.matter.id,
              props.selectedList[0].id,
              { name: 'Workstream' },
              props.includePosts,
              props.includeDescriptions,
              true
            )
            .then(p => {
              setProgress(100)
              props.actions.resetTemplateToProjectState()
              history(getMatterOverviewUrl(p.project.matter.id))
            })
        } else {
          props.actions
            .createProjectFromTemplate(
              matter.matter.id,
              getLocationParams('template'),
              { name: 'Workstream' },
              props.includePosts,
              props.includeDescriptions,
              true,
              props.includeResources
            )
            .then(p => {
              setProgress(100)
              props.actions.resetTemplateToProjectState()
              history(getMatterOverviewUrl(p.project.matter.id))
            })
        }
      })
  }

  const handleRenameWorkstream = (matterId, workstreamId, name) => {
    return new Promise(resolve => {
      props.actions
        .updateProject(matterId, workstreamId, { name })
        .then(res => {
          resolve(res)
        })
    })
  }

  const handleCreateTutorial = (templateId, templateName = 'Workstream') => {
    return props.actions.createProjectFromTutorial(templateId, {
      name: templateName,
    })
  }

  const handleCreate = async (
    matterId,
    projectId,
    parentTaskId,
    newProjectName,
    createAsNewProject,
    isPrivate,
    privateWorkstreamUsers
  ) => {
    if (props.taskSelectionConfirmed) {
      if (createAsNewProject) {
        setLoadingTitle(t('Creating your ', { name: newProjectName }))
        setProgress(50)
        props.actions
          .createProjectFromTemplateTask(
            matterId,
            props.selectedList[0].id,
            { name: newProjectName, isPrivate: isPrivate },
            props.includePosts,
            props.includeDescriptions,
            true
          )
          .then(response => {
            if (privateWorkstreamUsers.length > 0)
              props.actions.addMember(
                matterId,
                response.project.id,
                privateWorkstreamUsers
              )
            setProgress(100)
            handleFinishedCreating(
              response,
              matterId,
              projectId,
              privateWorkstreamUsers
            )
          })
      } else {
        setLoadingTitle(t('Creating your ', { name: 'tasks' }))
        setProgress(50)
        props.actions
          .createTaskFromTemplateTask(
            matterId,
            projectId,
            props.selectedList[0].id,
            parentTaskId,
            props.includePosts,
            props.includeDescriptions
          )
          .then(response => {
            setProgress(100)
            //handleFinishedCreating(response, matterId, projectId)
            history(getTaskMapUrl(null, matterId, projectId))
          })
      }
    } else {
      if (createAsNewProject) {
        setLoadingTitle(t('Creating your ', { name: newProjectName }))
        setProgress(25)
        props.actions
          .createProjectFromTemplate(
            matterId,
            getLocationParams('template'),
            { name: newProjectName, isPrivate: isPrivate },
            props.includePosts,
            props.includeDescriptions,
            true,
            props.includeResources
          )
          .then(response => {
            setProgress(50)
            if (privateWorkstreamUsers.length > 0)
              props.actions.addMember(
                matterId,
                response.project?.id,
                privateWorkstreamUsers
              )
            handleFinishedCreating(
              response,
              matterId,
              projectId,
              privateWorkstreamUsers
            )
          })
      } else {
        setLoadingTitle(t('Creating your ', { name: 'tasks' }))
        setProgress(50)
        props.actions
          .createTasksFromTemplateProject(
            matterId,
            projectId,
            parentTaskId,
            getLocationParams('template'),
            props.includePosts,
            props.includeDescriptions,
            true
          )
          .then(() => {
            setProgress(100)
            cancelCreateProjectHandler()
            history(getTaskMapUrl(null, matterId, projectId))
          })
      }
    }
  }

  const handleFinishedCreating = (
    response,
    matterId,
    projectId,
    privateWorkstreamUsers = []
  ) => {
    if (response.errorMessage) {
      return
    }
    if (response.project) {
      setProgress(100)
      if (
        response.project.isPrivate &&
        !canInteractWithPrivateWorkstream(currentUser, {
          isPrivate: true,
          privateWorkstreamTeam: privateWorkstreamUsers.map(id => {
            return {
              user: {
                id: id,
              },
            }
          }),
        })
      ) {
        history(getMatterAdminUrl(response.project.matter.id))
      } else {
        history(getOverviewUrl(response.project.matter.id, response.project.id))
      }
    } else {
      setProgress(100)
      history(getOverviewUrl(matterId, projectId))
    }
    cancelCreateProjectHandler()
  }

  useEffect(() => {
    if (props.useTemplateOptionConfirmed && !props.useFullTemplate) {
      props.actions.enterSelectionMode()
      history(getTemplateTaskMapUrl(getLocationParams('template')))
    }
  }, [
    props.useTemplateOptionConfirmed,
    props.useFullTemplate,
    props.actions,
    history,
  ])

  if (!props.useTemplateOptionConfirmed) {
    return (
      <UseTemplateDialog
        titleText={t('templates.wholeOrPart')}
        titleIcon={TemplatesIcon}
        cancelHandler={cancelCreateProjectHandler}
        fullScreen={getFullScreenMode()}
        handleCreateTutorial={handleCreateTutorial}
      />
    )
  }

  if (props.useFullTemplate || props.taskSelectionConfirmed) {
    return (
      <CreateProjectFromTemplateDialog
        titleText={t('templates.chooseADestination')}
        titleIcon={TemplatesIcon}
        cancelHandler={cancelCreateProjectHandler}
        createHandler={handleCreate}
        createMatter={handleNewMatter}
        handleRenameWorkstream={handleRenameWorkstream}
        fullScreen={getFullScreenMode()}
        errorMessage={props.errorMessage}
        clearErrorMessage={props.actions.clearErrorMessage}
        useFullTemplate={props.useFullTemplate}
        selectedTemplateTasks={props.selectedList}
        progress={progress}
        loadingTitle={loadingTitle}
      />
    )
  }

  return null
}

CreateProjectFromTemplateFlow.propTypes = {
  /** cancelHandler */
  cancelHandler: PropTypes.func.isRequired,
  /** errorMessage */
  errorMessage: PropTypes.string,
}

export default CreateProjectFromTemplateFlow
