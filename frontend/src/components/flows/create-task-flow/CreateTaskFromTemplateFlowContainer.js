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

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import CreateTaskFromTemplateFlow from './CreateTaskFromTemplateFlow'

const CreateTaskFromTemplateFlowContainer = props => {
  const matterId = useSelector(state => state.matterDetails.matter.id)
  const matter = useSelector(state => state.matterDetails.matter)
  const project = useSelector(state => state.project)
  const parentTask = useSelector(state => state.selectedTask)
  const auth = useSelector(state => state.auth)
  const [selectTemplate, setSelectTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(undefined)

  const showSelectTemplate = show => {
    setSelectTemplate(show)
  }

  return (
    <CreateTaskFromTemplateFlow
      matterId={matterId}
      parentTask={parentTask}
      auth={auth}
      dispatchSnackbar={displaySnackbar}
      cancelHandler={props.cancelHandler}
      selectedTemplate={selectedTemplate}
      setSelectedTemplate={setSelectedTemplate}
      showSelectTemplate={showSelectTemplate}
      selectTemplate={selectTemplate}
      matter={matter}
      project={project}
    />
  )
}
export default CreateTaskFromTemplateFlowContainer
