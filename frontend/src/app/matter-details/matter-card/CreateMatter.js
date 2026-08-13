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
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import MatterDialog from '../../matter-create/MatterDialog'
import { POSITIONS } from '../../constants'

const CreateMatter = props => {
  const userData = useSelector(state => state.auth.data.details)
  const [clientName, setClientName] = useState('')
  const [department, setDepartment] = useState('')
  const [matterName, setMatterName] = useState('')
  const [matterReferenceNumber, setMatterReferenceNumber] = useState('')
  const [position, setPosition] = useState(0)

  const [projectName, setProjectName] = useState('Workstream')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [selectTemplate, setSelectTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(undefined)

  const [projectType, setProjectType] = useState('')
  const templateToProject = useSelector(state => state.templateToProject)
  const [progress, setProgress] = useState(0)
  const history = useNavigate()

  const navigateToMatterOverview = matter => {
    history({
      pathname: `/matter/${matter.matter.id}/overview`,
      state: { tabItem: 1, immediateAddTeamMembers: true },
    })

    props.closeHandler()
  }

  useEffect(() => {
    if (userData.organisationGroup?.position === POSITIONS.CLIENT.name) {
      setPosition(0)
      setClientName(userData.organisationGroup?.name)
    } else if (
      userData.organisationGroup?.position === POSITIONS.ADVISOR.name
    ) {
      setPosition(1)
    }
    //eslint-disable-next-line
  }, [])

  const createMatter = event => {
    setShowLoadingBar(true)
    if (event) {
      event.preventDefault()
    }
    setProgress(25)
    props
      .createHandler(
        clientName,
        matterName,
        matterReferenceNumber,
        false,
        position,
        department
      )
      .then(matter => {
        if (selectedTemplate) {
          setProgress(66)
          props
            .createProjectFromTemplate(
              matter.matter.id,
              selectedTemplate.id,
              { name: projectName },
              true,
              templateToProject.includeDescriptions,
              false
            )
            .then(() => {
              setProgress(100)
              navigateToMatterOverview(matter)
            })
        } else {
          setProgress(50)
          props
            .createProject(matter.matter.id, { name: projectName }, false)
            .then(() => {
              setProgress(100)
              navigateToMatterOverview(matter)
            })
        }
      })
  }
  const onPositionChange = value => {
    setPosition(value)
    if (value === 0) {
      setClientName(userData.organisationGroup?.name)
    } else if (value === 1) {
      setClientName('')
    }
  }
  const onClientNameChange = event => setClientName(event.target.value)
  const onMatterNameChange = event => setMatterName(event.target.value)
  const onDepartmentChange = event => setDepartment(event.target.value)
  const onMatterReferenceNumberChange = event =>
    setMatterReferenceNumber(event.target.value)
  const onProjectNameChange = event => setProjectName(event.target.value)

  const showProjectDialog = () => {
    setShowCreateProject(true)
  }

  const showSelectTemplate = show => {
    setSelectTemplate(show)
  }

  const shouldNextButtonBeEnabled = () =>
    checkTextHasNonWhitespaceContent(clientName) &&
    checkTextHasNonWhitespaceContent(matterName)

  const shouldCreateButtonBeEnabled = () =>
    checkTextHasNonWhitespaceContent(projectName) &&
    checkTextHasNonWhitespaceContent(projectType)

  const closeHandler = e => {
    if (showCreateProject) {
      setShowCreateProject(false)
    } else if (selectTemplate) {
      setSelectTemplate(false)
      showProjectDialog()
    } else {
      props.closeHandler(e)
    }
  }

  return (
    <form onSubmit={createMatter}>
      <MatterDialog
        readOnly={false}
        closeHandler={closeHandler}
        clientName={clientName}
        department={department}
        onDepartmentChange={onDepartmentChange}
        matterName={matterName}
        matterReferenceNumber={matterReferenceNumber}
        onClientChange={onClientNameChange}
        onMatterChange={onMatterNameChange}
        onMatterReferenceNumberChange={onMatterReferenceNumberChange}
        position={position}
        setPosition={onPositionChange}
        userData={userData}
        onProjectChange={onProjectNameChange}
        onSubmit={createMatter}
        disabledNext={!shouldNextButtonBeEnabled()}
        disabledCreate={!shouldCreateButtonBeEnabled()}
        showProjectDialog={showProjectDialog}
        projectDialog={showCreateProject}
        showSelectTemplate={showSelectTemplate}
        selectTemplate={selectTemplate}
        projectName={projectName}
        setProjectName={setProjectName}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        projectType={projectType}
        setProjectType={setProjectType}
        showLoadingBar={showLoadingBar}
        progress={progress}
      />
    </form>
  )
}

CreateMatter.propTypes = {}

export default CreateMatter
