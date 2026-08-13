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
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTemplateIdFromLocation,
} from '../../../components/navigation/common/location-context-helper'
import { fetchTemplate } from '../../template/template-actions'
import { fetchProjectWithPostsAndTaskTeam } from '../project-actions'
import ProjectOverviewTaskMap from './ProjectOverviewTaskMap'
const ProjectOverviewTaskMapContainer = props => {
  const dispatch = useDispatch()
  const project = useSelector(state => state.project)
  const template = useSelector(state => state.template)
  const isTemplateLoading = useSelector(state => state.template.isLoading)
  const location = useLocation()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const templateId = getTemplateIdFromLocation(window.location)
  const isTemplate = !!templateId
  const source = isTemplate
    ? {
        tasks: template?.template?.tasks?.filter(t => t.level === 1) || [],
        isLoaded: template?.isLoaded,
      }
    : project
  const isLoaded = source.isLoaded

  useEffect(() => {
    if (isTemplate && template?.isLoaded) {
      setHasLoadedOnce(true)
    } else if (project?.isLoaded) {
      setHasLoadedOnce(true)
    }
  }, [project, template, isTemplate])

  useEffect(() => {
    if (isTemplate) {
      const templateHasChanged =
        templateId.toString() !== template.id?.toString()

      if (!isTemplateLoading) {
        if (!isLoaded || templateHasChanged) {
          dispatch(fetchTemplate(templateId))
        }
      }
    }
  }, [
    dispatch,
    isLoaded,
    isTemplate,
    isTemplateLoading,
    template.id,
    templateId,
  ])

  useEffect(() => {
    if (!isTemplate && !project.isLoaded && !props.noLoad) {
      dispatch(
        fetchProjectWithPostsAndTaskTeam(
          getMatterIdFromLocation(location),
          props.projectId ? props.projectId : getProjectIdFromLocation(location)
        )
      )
    }
  }, []) //eslint-disable-line

  return (
    <ProjectOverviewTaskMap
      project={source}
      isLoaded={hasLoadedOnce}
      zeroStateText={props.zeroStateText}
      isForbidden={props.isForbidden}
      isReadOnly={props.isReadOnly}
      isViewOnly={props.isViewOnly}
    />
  )
}

export default ProjectOverviewTaskMapContainer

ProjectOverviewTaskMapContainer.propTypes = {
  zeroStateText: PropTypes.string.isRequired,
}
