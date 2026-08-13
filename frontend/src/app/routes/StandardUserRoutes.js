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

import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, redirect, Route, Routes } from 'react-router-dom'
import Logout from '../../components/utils/logout/Logout'
import lazyWithRetry from '../../services/navigation/lazy-with-retry'
import withRouter from '../../services/navigation/WithRouter'
import NotFound from '../error-page/NotFound'
import { getCurrentOrganisation } from '../../admin/organisations/organisation-actions'

const Home = lazyWithRetry(() => import('../home/Home'))
const ImprovedTaskmapContainer = lazyWithRetry(
  () => import('../improved-taskmap/ImprovedTaskmapContainer')
)
const MatterDetailsContainer = lazyWithRetry(
  () => import('../matter-details/MatterDetailsContainer')
)
const MatterOverviewContainer = lazyWithRetry(
  () => import('../matter/MatterOverviewContainer')
)
const OrganisationContainer = lazyWithRetry(
  () => import('../organisation/users/OrganisationContainer')
)
const ProjectOverviewContainer = lazyWithRetry(
  () => import('../project/overview/ProjectOverviewContainer')
)
const RoadmapContainer = lazyWithRetry(
  () => import('../roadmap/RoadmapContainer')
)
const TaskDetailsContainer = lazyWithRetry(
  () => import('../task-details/TaskDetailsContainer')
)
const TemplateListContainer = lazyWithRetry(
  () => import('../template-list/TemplateListContainer')
)
const TemplateTaskDetailsContainer = lazyWithRetry(
  () => import('../template-task-details/TemplateTaskDetailsContainer')
)
const TemplateOverviewContainer = lazyWithRetry(
  () => import('../template/overview/TemplateOverviewContainer')
)
const HowToUseJuralio = lazyWithRetry(() => import('../users/HowToUseJuralio'))
const UserSettingsContainer = lazyWithRetry(
  () => import('../users/UserSettingsContainer')
)
const MatterCostsContainer = lazyWithRetry(
  () => import('../matter-costs/MatterCostsContainer')
)
const ListViewContainer = lazyWithRetry(
  () => import('../../components/layouts/list-view/ListViewContainer')
)

/**
 * We currently support both the old and new urls
 * project/workstream and matters/matteradmin
 * this is to allow existing bookmarks to continue to work
 * and should be depricated in the future
 * this deprication should be well signposted to user before it occurs
 * url change added 15/07/21
 * consider deprication 15/07/22
 */

async function matterAdmin({ request, params }) {
  return redirect(`/matteradmin/${params.matterId}`)
}

async function task({ request, params }) {
  return redirect(
    `/matter/${params.matterId}/workstream/${params.projectId}/task/${params.taskId}`
  )
}

async function projectOverview({ request, params }) {
  return redirect(
    `/matter/${params.matterId}/workstream/${params.projectId}/overview`
  )
}

const StandardUserRoutes = props => {
  const dispatch = useDispatch()
  const [redirect, setRedirect] = useState(
    window.sessionStorage.getItem('logoutUrl')?.split('#')[1]
  )
  const [directUrl, setDirectUrl] = useState(
    window.sessionStorage.getItem('directUrl')?.split('#')[1]
  )
  const [logoutUser, setLogoutUser] = useState(
    parseInt(window.sessionStorage.getItem('logoutId'))
  )

  const organisation = useSelector(
    state => state.organisation?.selectedOrganisation
  )
  const instanceSettings = useSelector(state => state.instanceSettings)
  const user = useSelector(state => state.auth.data.details)
  const isCostsEnabled =
    instanceSettings.settings?.costsEnabled && organisation?.costsEnabled

  useEffect(() => {
    dispatch(getCurrentOrganisation())
    if (directUrl && window.location.href.includes(directUrl)) {
      window.sessionStorage.removeItem('directUrl')
      setDirectUrl(null)
    }
    if (logoutUser !== null && logoutUser !== user.id) {
      window.sessionStorage.removeItem('logoutUrl')
      window.sessionStorage.removeItem('logoutId')
      setRedirect(null)
      setLogoutUser(null)
    }
    if (redirect && redirect?.includes('/home')) {
      window.sessionStorage.removeItem('logoutUrl')
      window.sessionStorage.removeItem('logoutId')
      setRedirect(null)
      setLogoutUser(null)
    }
    if (
      redirect &&
      logoutUser &&
      !props.router?.location.pathname?.includes('logout') &&
      window.location.href.includes(redirect)
    ) {
      window.sessionStorage.removeItem('logoutUrl')
      window.sessionStorage.removeItem('logoutId')
      setRedirect(null)
      setLogoutUser(null)
    }

    //eslint-disable-next-line
  }, [window.location.href])

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <Navigate
              to={directUrl ? directUrl : redirect ? redirect : '/home'}
            />
          }
        />
        <Route
          exact
          path="/home"
          element={
            directUrl ? (
              <Navigate to={directUrl} />
            ) : redirect ? (
              <Navigate to={redirect} />
            ) : (
              <Home />
            )
          }
        />
        <Route exact path="/templates" element={<TemplateListContainer />} />
        <Route exact path="/matters/create" element={NotFound} />
        <Route
          exact
          path="/matters/:matterId"
          element={<div />}
          action={matterAdmin}
        />
        <Route
          exact
          path="/matteradmin/:matterId"
          element={<MatterDetailsContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/overview"
          element={<MatterOverviewContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/taskmap"
          element={<MatterOverviewContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/roadmap"
          element={<MatterOverviewContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/taskList"
          element={<ListViewContainer />}
        />
        {/* <Route
        exact
        path="/matter/:matterId/timeline"
        element={<MatterOverviewContainer />}
      /> */}
        <Route
          exact
          path="/matter/:matterId/project/:projectId/task/:taskId"
          action={task}
          element={<div />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/task/:taskId"
          element={<TaskDetailsContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/task/:taskId/post/:postId"
          element={<TaskDetailsContainer />}
        />
        {/* <Route
        exact
        path="/matter/:matterId/project/:projectId/task/:taskId/timeline"
        element={e => (
          <Navigate
            to={`/matter/${e.match.params.matterId}/workstream/${e.match.params.projectId}/task/${e.match.params.taskId}/timeline`}
          />
        )}
      /> */}
        {/* <Route
        exact
        path="/matter/:matterId/workstream/:projectId/task/:taskId/timeline"
        element={<TimelineContainer />}
      /> */}
        <Route
          exact
          path="/matter/:matterId/project/:projectId/overview"
          action={projectOverview}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/overview"
          element={<ProjectOverviewContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/overview/people"
          element={<ProjectOverviewContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/overview/tasks"
          element={<ProjectOverviewContainer />}
        />
        {/* <Route
        exact
        path="/matter/:matterId/project/:projectId/timeline"
        element={e => (
          <Navigate
            to={`/matter/${e.match.params.matterId}/workstream/${e.match.params.projectId}/timeline`}
          />
        )}
      /> */}
        {/* <Route
        exact
        path="/matter/:matterId/workstream/:projectId/timeline"
        element={<TimelineContainer />}
      /> */}
        {/* <Route
        exact
        path="/matter/:matterId/project/:projectId/roadmap"
        element={e => (
          <Navigate
            to={`/matter/${e.match.params.matterId}/workstream/${e.match.params.projectId}/roadmap`}
          />
        )}
      /> */}
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/roadmap"
          element={<RoadmapContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/tasklist"
          element={<ListViewContainer />}
        />
        {/* <Route
        exact
        path="/matter/:matterId/project/:projectId/taskmap"
        element={e => (
          <Navigate
            to={`/matter/${e.match.params.matterId}/workstream/${e.match.params.projectId}/taskmap`}
          />
        )}
      /> */}
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/taskmap"
          element={<ImprovedTaskmapContainer />}
        />
        <Route
          exact
          path="/matter/:matterId/workstream/:projectId/improvedTaskmap"
          element={<ImprovedTaskmapContainer />}
        />
        <Route
          exact
          path="/template/:templateId/taskmap"
          element={<ImprovedTaskmapContainer />}
        />
        {/* <Route
        exact
        path="/template/:templateId/taskList"
        element={<ListViewContainer />}
      /> */}
        <Route
          exact
          path="/template/:templateId/overview"
          element={<TemplateOverviewContainer />}
        />
        <Route
          exact
          path="/template/:templateId/overview/tasks"
          element={<TemplateOverviewContainer />}
        />
        <Route
          exact
          path="/template/:templateId/task/:taskId"
          element={<TemplateTaskDetailsContainer />}
        />
        <Route
          exact
          path="/template/:templateId/task/:taskId/post/:postId"
          element={<TemplateTaskDetailsContainer />}
        />
        <Route
          exact
          path="/personalSettings"
          element={<UserSettingsContainer />}
        />
        <Route exact path="/how-to-use" element={<HowToUseJuralio />} />
        <Route
          exact
          path="/organisation/accounts"
          element={<OrganisationContainer router={props.router} goTo={0} />}
        />
        <Route
          exact
          path="/organisation/matters"
          element={<OrganisationContainer router={props.router} goTo={1} />}
        />
        <Route
          exact
          path="/organisation/labels"
          element={<OrganisationContainer router={props.router} goTo={2} />}
        />
        <Route
          exact
          path="/organisation/settings"
          element={<OrganisationContainer router={props.router} goTo={3} />}
        />
        <Route
          exact
          path="/organisation/costs"
          element={
            isCostsEnabled ? (
              <OrganisationContainer
                router={props.router}
                organisationId={organisation?.id}
                goTo={4}
              />
            ) : (
              <OrganisationContainer
                router={props.router}
                organisationId={organisation?.id}
                goTo={0}
              />
            )
          }
        />
        <Route
          exact
          path="/organisation/reports"
          element={
            <OrganisationContainer
              router={props.router}
              goTo={isCostsEnabled ? 5 : 4}
            />
          }
        />
        <Route
          exact
          path="/matter/:matterId/costs"
          element={<MatterCostsContainer goTo={0} />}
        />
        <Route
          exact
          path="/matter/:matterId/costs/projection/:projectionId/pricing"
          element={<MatterCostsContainer goTo={1} />}
        />
        <Route
          exact
          path="/matter/:matterId/costs/projection/:projectionId/resource"
          element={<MatterCostsContainer goTo={2} />}
        />
        <Route exact path="/login" element={<Navigate to={'/home'} />} />
        <Route exact path="/logout" element={<Logout />} />
        <Route exact path="/404" element={<NotFound />} />
        <Route exact path="/*" element={<Navigate to={'/404'} />} />
      </Routes>
    </Suspense>
  )
}

export default withRouter(StandardUserRoutes)
