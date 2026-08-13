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

import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { connect, useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import NoContent from '../../../components/data-display/no-content/NoContent'
import NoPermission from '../../../components/data-display/no-permission/NoPermission'
import juralioColours from '../../../theme/juralio-colours'
import { ACTIVITIES, MATTER_STATUS } from '../../constants'
import MatterClosed from '../../../components/data-display/matter-closed/MatterClosed'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import { fetchMatterOverview } from '../../matter-details/matter-details-actions'
import {
  exitProjectEditing,
  fetchProjectWithPostsAndTaskTeam,
  fetchWorkstreamOverview,
  getNewTasks,
  resetProjectErrorMessage,
  updateProject,
} from '../project-actions'
import ProjectOverview from './ProjectOverview'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
} from '../../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'

const styles = theme => ({
  menuIconSvg: {
    display: 'inline-block',
    marginLeft: '-4px',
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    opacity: 0.9,
  },
  icon: {
    transform: 'translate(0px,8px)',
    color: juralioColours.darkText.secondary,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
})

const ProjectOverviewContainer = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const location = useLocation()
  const matterOverview = useSelector(state => state.matterDetails?.overview)
  const matter = useSelector(state => state.matterDetails?.matter)
  const isMatterClosed = matter?.matterStatus === MATTER_STATUS.CLOSED
  const workstreamOverview = useSelector(
    state => state.project?.workstreamOverview
  )

  const overview = props.isMatterOverview ? matterOverview : workstreamOverview
  const { matterId, projectId } = props.isMatterOverview
    ? props.identifiers
    : {
        matterId: props.identifiers
          ? props.identifiers.matterId
          : getMatterIdFromLocation(location),
        projectId: props.identifiers
          ? props.identifiers.projectId
          : getProjectIdFromLocation(location),
      }
  const project = props.isMatterOverview
    ? matterOverview.workstreams.find(t => t.id === projectId)
    : overview
  const projects = useSelector(state => state.projects)

  const isOverviewLoading = !overview
  const isOverviewForbidden = useSelector(
    state => state.project?.workstreamOverview?.isForbidden
  )

  const isMatterJustCreated = useSelector(
    state => state.matterCreate?.matter?.clientName?.length > 0
  )

  useEffect(() => {
    if (isMatterClosed) {
      return
    }
    if (props.isMatterOverview) {
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
    } else {
      dispatch(fetchMatterOverview(matterId))
      dispatch(fetchWorkstreamOverview(matterId, projectId))
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
    }
  }, [matterId, projectId, isMatterClosed]) //eslint-disable-line

  useEffect(() => {
    if (!props.isMatterOverview && !isMatterClosed) {
      dispatch(getNewTasks(matterId, projectId))
    }
  }, [dispatch, matterId, projectId, isMatterClosed]) //eslint-disable-line

  useEffect(() => {
    if (props.isEditingName)
      dispatch(fetchProjects(matterId, false, true, false))
  }, [dispatch, props.isEditingName, matterId])

  if (isMatterClosed) {
    return (
      <MatterClosed
        isAdmin={matter.activities?.includes(ACTIVITIES.MATTER_ADMIN)}
        matterId={matterId}
      />
    )
  }

  if (!project) {
    return null
  }

  const isUserMatterAdmin = () =>
    overview &&
    overview.activities &&
    overview.activities[0] === ACTIVITIES.MATTER_ADMIN

  const _updateProject = properties => {
    return dispatch(updateProject(matterId, projectId, properties))
  }

  const clearErrorMessage = () => {
    dispatch(resetProjectErrorMessage())
  }

  const itemCounts = {
    taskCount: project.taskCounts
      ? Object.values(project.taskCounts).reduce(
          (partialSum, a) => partialSum + a,
          0
        )
      : 0,
    postCount: props.isMatterOverview ? props.postCount : overview.postCount,
    resourceCount: props.isMatterOverview
      ? props.resourceCount
      : overview.resourceCount,
  }

  let viewableProject = cloneDeep(project)
  viewableProject.matterId = getMatterIdFromLocation(location)
  if (isOverviewForbidden) {
    return (
      <NoPermission
        text={t('projectOverviewZeroState.permissionToAccessProjectDenied')}
      />
    )
  }

  if (!props.isMatterOverview && !project.active) {
    return (
      <NoContent data-test="workstream-closed">
        {t('projectOverviewZeroState.workstreamClosed')}
      </NoContent>
    )
  }
  return (
    <ProjectOverview
      loading={isOverviewLoading}
      clearErrorMessages={clearErrorMessage}
      descriptionPlaceholder={t('projectOverview.descriptionPlaceholder')}
      errorMessage={project.errorMessage}
      isMatterAdmin={isUserMatterAdmin()}
      itemCounts={itemCounts}
      project={viewableProject}
      people={
        project.isPrivate
          ? [
              ...(overview?.privateWorkstreamTeam || []),
              ...overview.teamMembers,
            ].filter(
              (v, i, self) =>
                i ===
                self.findIndex(t => t.username === v.username || t.id === v.id)
            )
          : overview.teamMembers
      }
      projects={projects.items?.map(p => p.name)}
      updateProject={_updateProject}
      zeroStateText={t('projectOverview.projectZeroStateText')}
      editing={{
        isEditingName: props.isEditingName,
        saveName: name =>
          dispatch(updateProject(matterId, projectId, { name })),
        clearEditing: () => dispatch(exitProjectEditing()),
      }}
      isMatterOverview={props.isMatterOverview}
      isMatterJustCreated={isMatterJustCreated}
      matter={props.matter}
    />
  )
}
const mapStateToProps = state => ({
  isEditingName: state.project.editingState.isEditingName,
})

export default withStyles(
  connect(mapStateToProps)(ProjectOverviewContainer),
  styles
)
