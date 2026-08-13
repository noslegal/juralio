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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import { getMatterIdFromLocation } from '../../components/navigation/common/location-context-helper'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import MatterClosed from '../../components/data-display/matter-closed/MatterClosed'
import { ACTIVITIES, MATTER_STATUS } from '../constants'
import ImprovedTaskmapContainer from '../improved-taskmap/ImprovedTaskmapContainer'
import {
  fetchMatterOverview,
  updateMatterDetails,
} from '../matter-details/matter-details-actions'
import ProjectOverviewContainer from '../project/overview/ProjectOverviewContainer'
import RoadmapContainer from '../roadmap/RoadmapContainer'
import MatterOverview from './MatterOverview'
import ListViewContainer from '../../components/layouts/list-view/ListViewContainer'

const getBoundaryDates = projects => {
  let startDates = projects.map(p => p.startDate)
  let endDates = projects.map(p => p.endDate)
  let dates = [...startDates, ...endDates]
    .filter(d => d != null)
    .sort((a, b) => new Date(a) - new Date(b))

  return [dates[0], dates[dates.length - 1]]
}

const MatterOverviewContainer = () => {
  const dispatch = useDispatch()
  const history = useNavigate()
  const location = useLocation()
  const matterDetails = useSelector(state => state.matterDetails)
  const { t } = useTranslation()
  const isMatterAdmin = matterDetails?.matter?.activities?.includes(
    ACTIVITIES.MATTER_ADMIN
  )
  const isMatterViewer = useIsViewOnly(matterDetails.matter)
  const isReadOnly = !isMatterAdmin || isMatterViewer
  const matterId = getMatterIdFromLocation(location)
  const isTaskMap = window.location.href.includes('/taskmap')
  const isOverview = window.location.href.includes('/overview')
  const isRoadmap = window.location.href.includes('/roadmap')
  const isTaskList = window.location.href.includes('/taskList')
  const currentUser = useSelector(state => state.auth.data.details)

  const workstreamFilter = workstream => {
    if (!workstream.active) {
      return false
    }
    if (workstream.isPrivate) {
      return workstream.privateWorkstreamTeam
        .map(pw => pw.username)
        .includes(currentUser.username)
    }
    return true
  }

  useEffect(() => {
    dispatch(fetchMatterOverview(matterId))
  }, [matterId]) //eslint-disable-line

  const noAccess =
    matterDetails.overview?.workstreams &&
    matterDetails.overview.workstreams.length === 0

  const updateMatter = changes => {
    return dispatch(updateMatterDetails(matterDetails.matter.id, changes))
  }

  if (matterDetails.matter?.matterStatus === MATTER_STATUS.CLOSED) {
    return (
      <MatterClosed
        isAdmin={isMatterAdmin}
        matterId={matterDetails.matter.id}
      />
    )
  }
  if (noAccess || matterDetails.isForbidden) {
    return (
      <NoPermission
        text={t('matterOverviewZeroState.permissionToAccessMatterDenied')}
      />
    )
  }
  if (matterDetails.matter?.activeWorkstreams === 0) {
    return <Navigate push to="/404" />
  }
  if (!matterDetails.overview) {
    return <BigDataSpinner size={64} />
  }

  if (
    matterDetails.overview &&
    matterDetails.overview.workstreams.filter(workstreamFilter).length === 1 &&
    matterDetails.overview.workstreams.filter(w => w.active).length === 1
  ) {
    if (isOverview) {
      return (
        <ProjectOverviewContainer
          isMatterOverview={true}
          identifiers={{
            matterId: getMatterIdFromLocation(location),
            projectId:
              matterDetails.overview.workstreams.filter(workstreamFilter)[0]
                ?.id,
          }}
          history={history}
          matter={matterDetails.matter}
          postCount={matterDetails.overview.postCount}
          resourceCount={matterDetails.overview.resourceCount}
        />
      )
    } else if (isTaskMap) {
      return (
        <ImprovedTaskmapContainer
          isMatterOverview={true}
          identifiers={{
            matterId: getMatterIdFromLocation(location),
            workstreamId:
              matterDetails.overview.workstreams.filter(workstreamFilter)[0].id,
          }}
          history={history}
          location={location}
        />
      )
    } else if (isRoadmap) {
      return (
        <RoadmapContainer
          isMatterOverview={true}
          identifiers={{
            matterId: getMatterIdFromLocation(location),
            projectId:
              matterDetails.overview.workstreams.filter(workstreamFilter)[0].id,
          }}
          history={history}
        />
      )
    } else if (isTaskList) {
      return (
        <ListViewContainer
          isMatterOverview={true}
          identifiers={{
            matterId: getMatterIdFromLocation(location),
            projectId:
              matterDetails.overview.workstreams.filter(workstreamFilter)[0].id,
          }}
          history={history}
        />
      )
    }
  }

  if (matterDetails?.overview === null) {
    return <BigDataSpinner size={64} />
  }

  const [earliestDate, latestDate] = getBoundaryDates(
    matterDetails.overview.workstreams
  )

  let totalTasksCount = matterDetails.overview.workstreams
    .filter(workstreamFilter)
    .reduce((partialSum, a) => {
      return (
        partialSum +
        Object.values(a.taskCounts).reduce((pc, b) => {
          return pc + b
        }, 0)
      )
    }, 0)

  return (
    <MatterOverview
      updateMatter={updateMatter}
      isMatterAdmin={isMatterAdmin}
      isReadOnly={isReadOnly}
      earliestDate={earliestDate}
      latestDate={latestDate}
      projects={matterDetails.overview.workstreams.filter(workstreamFilter)}
      matterId={matterId}
      postCount={matterDetails.overview.postCount}
      taskCount={totalTasksCount}
    />
  )
}

export default MatterOverviewContainer
