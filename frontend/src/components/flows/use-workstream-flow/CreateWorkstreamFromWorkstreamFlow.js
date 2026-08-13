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
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTaskMapUrl } from '../../navigation/common/location-context-helper'

const CreateWorkstreamFromWorkstreamFlow = props => {
  const history = useNavigate()

  useEffect(() => {
    props.actions.enterSelectionMode(
      props.originalWorkstreamName,
      props.newWorkstreamName,
      props.isWorkstreamPrivate,
      props.privateWorkstreamUsers
    )
    history(
      getTaskMapUrl(
        null,
        props.matterId,
        props.workstreamId ? props.workstreamId : props.projectId
      )
    )
  }, [
    props.matterId,
    props.newWorkstreamName,
    props.originalWorkstreamName,
    props.projectId,
    props.useTemplateOptionConfirmed,
    props.useFullTemplate,
    props.actions,
    history,
    props.workstreamId,
    props.isWorkstreamPrivate,
    props.privateWorkstreamUsers,
  ])

  return null
}

CreateWorkstreamFromWorkstreamFlow.propTypes = {
  /** cancelHandler */
  cancelHandler: PropTypes.func,
  /** errorMessage */
  errorMessage: PropTypes.string,
}

export default CreateWorkstreamFromWorkstreamFlow
