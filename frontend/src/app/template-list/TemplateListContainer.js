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
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router'
import { getCurrentOrganisation } from '../../admin/organisations/organisation-actions'
import TemplateFtue from '../../components/data-display/ftue/template/TemplateFtue'
import IsWidthDown from '../../hooks/width-helper'
import {
  templateMapRedirect,
  templateOverviewRedirect,
} from '../../services/redirect/TemplateMapRedirect'
import { getDetailsAttribute } from '../../services/user/user-data-service'
import { fetchTemplates } from './template-list-actions'
import TemplateList from './TemplateList'

export const TemplateListContainer = props => {
  // state = { redirectToTemplateId: null }
  const [redirectToTemplateId, setRedirectToTemplateId] = useState(null)
  const templates = useSelector(state => state.templates)
  const organisation = useSelector(state => state.organisation)
  const user = useSelector(state => state.auth.data.details)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTemplates())
    dispatch(getCurrentOrganisation())
    //eslint-disable-next-line
  }, [])

  const templateClickHandler = id => setRedirectToTemplateId(id)

  const redirectToTemplate = () =>
    IsWidthDown('sm', props.width)
      ? templateMapRedirect(redirectToTemplateId)
      : templateOverviewRedirect(redirectToTemplateId)

  if (user.isExternal) {
    return <Navigate push to="/404" />
  }
  return redirectToTemplateId ? (
    redirectToTemplate()
  ) : (
    <>
      {!getDetailsAttribute([
        'firstTimeUserExperience',
        'hasSeenTemplates',
      ]) && (
        <TemplateFtue onClose={() => {}} ftueContext={'hasSeenTemplates'} />
      )}
      <TemplateList
        data-test="TemplateList"
        isLoaded={templates.isLoaded}
        templates={templates.templates}
        clickHandler={templateClickHandler}
        organisationName={organisation.selectedOrganisation?.name}
      />
    </>
  )
}
export default TemplateListContainer
