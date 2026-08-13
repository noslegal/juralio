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
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTemplateIdFromLocation } from '../../../../components/navigation/common/location-context-helper'
import templateService from '../../../../services/template/template-service'
import TemplateCopyDialog from './TemplateCopyDialog'

const TemplateCopyDialogContainer = props => {
  const history = useNavigate()
  const [includePosts, setIncludePosts] = useState(true)

  const copyTemplateHandler = name => {
    templateService
      .copyTemplate(
        getTemplateIdFromLocation(window.location),
        name,
        includePosts
      )
      .then(result => {
        props.cancelHandler()
        history(`/template/${result.body.id}/overview`)
      })
  }

  return (
    <TemplateCopyDialog
      includePosts={includePosts}
      setIncludePosts={setIncludePosts}
      copyTemplateHandler={copyTemplateHandler}
      cancelHandler={props.cancelHandler}
    />
  )
}

TemplateCopyDialogContainer.propTypes = {
  /** handler for cancelling the operation */
  cancelHandler: PropTypes.func.isRequired,
}

export default TemplateCopyDialogContainer
