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

import queryString from 'querystring-browser'

export function getResourceIdFromUrl(resourceName, url) {
  const splitUrl = url.split('/')
  const resourceNameIndex = splitUrl.indexOf(resourceName)
  return resourceNameIndex >= 0 ? splitUrl[resourceNameIndex + 1] : undefined
}

export function getSelectedNavigationButtonIndex(
  url,
  query,
  isMobile,
  projectId
) {
  const isInbox = url.includes('/timeline') && query.includes('view=inbox')
  const isTaskMap = url.includes('/taskmap')
  const isTimeline = url.includes('/timeline')
  const isOverview = url.includes('/overview')
  const isTemplate = url.includes('/template')
  const isCorrectProject =
    url.includes(`/project/${projectId}/`) ||
    url.includes(`/workstream/${projectId}/`)
  const isTaskDetails = url.includes('/task/')
  if (!isCorrectProject) {
    return false
  }

  if (isTaskDetails) return false

  if (isMobile && isTemplate) {
    return isTaskMap ? 0 : false
  }
  if (isMobile) {
    return isInbox ? 0 : isTaskMap ? 1 : isTimeline ? 2 : false
  }

  if (isCorrectProject || projectId === undefined) {
    return isOverview ? 0 : isTaskMap ? 1 : isTimeline ? 2 : false
  }
  return false
}

export function getProjectIdFromLocation(location) {
  const projectIdFromProjectUrl = getResourceIdFromUrl(
    'project',
    location.pathname
  )
  const projectIdFromProjectsUrl = getResourceIdFromUrl(
    'projects',
    location.pathname
  )
  const workstreamIdFromProjectsUrl = getResourceIdFromUrl(
    'workstream',
    location.pathname
  )
  return (
    projectIdFromProjectUrl ||
    projectIdFromProjectsUrl ||
    workstreamIdFromProjectsUrl
  )
}

export function getProjectionIdFromLocation(location) {
  const projectionIdFromPricingUrl = getResourceIdFromUrl(
    'projection',
    location.pathname
  )
  return projectionIdFromPricingUrl
}

export function getMatterIdFromLocation(location) {
  const matterIdFromMatterUrl = getResourceIdFromUrl(
    'matter',
    location.pathname
  )
  const matterIdFromMattersUrl = getResourceIdFromUrl(
    'matters',
    location.pathname
  )

  const matteradminIdFromMattersUrl = getResourceIdFromUrl(
    'matteradmin',
    location.pathname
  )
  return (
    matterIdFromMatterUrl ||
    matterIdFromMattersUrl ||
    matteradminIdFromMattersUrl
  )
}

export function getPostIdFromLocation(location) {
  return location.pathname.split('post/')[1]
}

export function getTemplateIdFromLocation(location) {
  const templateIdFromTemplateUrl = getResourceIdFromUrl(
    'template',
    location.pathname
  )
  const templateIdFromTemplatesUrl = getResourceIdFromUrl(
    'templates',
    location.pathname
  )
  const templateIdFromTemplateHref = location.href
    ? getResourceIdFromUrl('template', location.href)
    : undefined
  return (
    templateIdFromTemplateUrl ||
    templateIdFromTemplatesUrl ||
    templateIdFromTemplateHref
  )
}

export function getTaskIdFromLocation(location) {
  const taskIdFromQueryString = queryString.parse(location.search).id
  const taskIdFromUrl = getResourceIdFromUrl('task', location.pathname)
  return taskIdFromUrl !== undefined ? taskIdFromUrl : taskIdFromQueryString
}

export function getCostsDashboard(matterId) {
  return `/matter/${matterId}/costs?`
}

export function getTaskMapUrl(selectedTaskId, matterId, projectId) {
  return selectedTaskId
    ? `/matter/${matterId}/workstream/${projectId}/taskmap?id=${selectedTaskId}`
    : `/matter/${matterId}/workstream/${projectId}/taskmap?`
}

export function getSingleWorkstreamTaskMapUrl(matterId) {
  return `/matter/${matterId}/taskmap?`
}

export function getMatterTaskMapLink(matterId, selectedTaskId) {
  if (selectedTaskId) {
    return `/matter/${matterId}/taskmap?id=${selectedTaskId}`
  }
  return `/matter/${matterId}/taskmap`
}

export function getMatterRoadMapLink(matterId, selectedTaskId) {
  if (selectedTaskId) {
    return `/matter/${matterId}/roadmap?id=${selectedTaskId}`
  }
  return `/matter/${matterId}/roadmap`
}

export function getMatterTaskListLink(
  matterId,
  workstreamId,
  isSingleWorkstreamMatter
) {
  if (!isSingleWorkstreamMatter) {
    return `matter/${matterId}/workstream/${workstreamId}/taskList`
  }
  return `matter/${matterId}/taskList`
}

export function getTemplateTaskListLink(templateId) {
  return `template/${templateId}/taskList`
}

export function getMatterInboxLink(matterId) {
  return `/matter/${matterId}/timeline`
}

export function getMatterCostsLink(matterId) {
  return `/matter/${matterId}/costs`
}

export function getTemplateTaskMapUrl(templateId, selectedTaskId) {
  return selectedTaskId
    ? `/template/${templateId}/taskmap?id=${selectedTaskId}`
    : `/template/${templateId}/taskmap?`
}

export function getInboxUrl(selectedTaskId, matterId, projectId) {
  return `${getTimelineUrl(selectedTaskId, matterId, projectId)}?view=inbox`
}

export function getTimelineUrl(selectedTaskId, matterId, projectId) {
  return selectedTaskId
    ? `/matter/${matterId}/workstream/${projectId}/task/${selectedTaskId}/timeline`
    : `/matter/${matterId}/workstream/${projectId}/timeline`
}

export function getRoadmapUrl(matterId, projectId, selectedTaskId) {
  if (selectedTaskId) {
    return `/matter/${matterId}/workstream/${projectId}/roadmap?id=${selectedTaskId}`
  }
  return `/matter/${matterId}/workstream/${projectId}/roadmap`
}

export function getMatterAdminUrl(matterId) {
  return `/matteradmin/${matterId}`
}

export function getOverviewUrl(matterId, projectId) {
  return `/matter/${matterId}/workstream/${projectId}/overview`
}
export function getOverviewPeopleUrl(matterId, projectId) {
  return `/matter/${matterId}/workstream/${projectId}/overview/people`
}
export function getOverviewTasksUrl(matterId, projectId) {
  return `/matter/${matterId}/workstream/${projectId}/overview/tasks`
}

export function getMatterOverviewUrl(matterId) {
  return `/matter/${matterId}/overview`
}

export function getTemplateOverviewUrl(templateId) {
  return `/template/${templateId}/overview`
}

export function getTemplateOverviewTasksUrl(templateId) {
  return `/template/${templateId}/overview/tasks`
}

export function getTaskDetailsUrl(matterId, projectId, taskId) {
  return `/matter/${matterId}/workstream/${projectId}/task/${taskId}`
}

export function getTemplateTaskDetailsUrl(templateId, taskId) {
  return `/template/${templateId}/task/${taskId}`
}

export function getOrganisationAdminUrl() {
  // There is no bare `/organisation` route — the org admin area is tabbed
  // (/organisation/accounts, /organisation/matters, ...). Deleted matters are
  // surfaced in the matters tab, so that is the sensible landing for a
  // DeletedMatter notification.
  return `/organisation/matters`
}

export const getWorkstreamTaskPostUrl = (
  matterId,
  projectId,
  taskId,
  postId
) => {
  return `/matter/${matterId}/workstream/${projectId}/task/${taskId}/post/${postId}`
}

export const getTemplateTaskPostUrl = (templateId, taskId, postId) => {
  return `/template/${templateId}/task/${taskId}/post/${postId}`
}

export function isLocationInTaskmapScope(location) {
  return location.pathname.includes('/taskmap')
}

export function isLocationInTemplateTaskmapScope(location) {
  return (
    location.pathname.includes('/template') &&
    location.pathname.includes('/taskmap')
  )
}

export function isLocationInTimelineOrTaskmapScope(location) {
  return (
    location.pathname.includes('/timeline') ||
    isLocationInTaskmapScope(location)
  )
}

export function isHome(location) {
  return location.pathname.includes('/home')
}

export function isInAnyTemplateContext(location) {
  return (
    location.pathname.includes('/template') ||
    location.pathname.includes('/templates')
  )
}

export function isInTemplateListContext(location) {
  return location.pathname.includes('/templates')
}

export function isInOrganisationContext(location) {
  return location.pathname.includes('/organisation')
}

export function isInSysadminContext(location) {
  return location.pathname.includes('/organisations')
}

export function isInTemplate(pathname) {
  return pathname.includes('/template/')
}

export function isInTemplateGallery(pathname) {
  return pathname.includes('/templates')
}

export function isInMatter(pathname) {
  return pathname.includes('/matter/')
}

export function isInTaskDetails(pathname) {
  return (
    /project\/[\d]+\/task\/[\d]+\/?(\?.*)?$/.test(pathname) ||
    /workstream\/[\d]+\/task\/[\d]+\/?(\?.*)?$/.test(pathname)
  )
}

export function isInTemplateTaskDetails(pathname) {
  return /template\/[\d]+\/task\/[\d]+\/?(\?.*)?$/.test(pathname)
}

export function isInTemplateOverview(pathname) {
  return pathname.includes('/template/') && pathname.includes('/overview')
}

export function isInProjectOverview(pathname) {
  return (
    (pathname.includes('/project/') || pathname.includes('/workstream/')) &&
    pathname.includes('/overview')
  )
}

export function isInOrgAdmin(pathname) {
  return pathname.includes('/organisation/')
}
export function isInMatterAdmin(location) {
  return (
    location.pathname.includes('/matters') ||
    location.pathname.includes('/matteradmin')
  )
}
export function validLocationForTaskFromTemplate(location) {
  return (
    location.pathname.includes('/matter') ||
    location.pathname.includes('/matteradmin') ||
    location.pathname.includes('/workstream')
  )
}

export function getHomeUrl() {
  return '/home'
}

export const locationContextHelper = {
  getInboxUrl,
  getMatterIdFromLocation,
  getOverviewUrl,
  getProjectIdFromLocation,
  getRoadmapUrl,
  getMatterOverviewUrl,
  getTaskIdFromLocation,
  getTaskMapUrl,
  getMatterTaskMapLink,
  getMatterTaskListLink,
  getMatterInboxLink,
  getMatterRoadMapLink,
  getMatterCostsLink,
  getTemplateIdFromLocation,
  getTemplateOverviewUrl,
  getTemplateTaskMapUrl,
  getTimelineUrl,
  getHomeUrl,
  getOrganisationAdminUrl,
  getTemplateTaskListLink,
}
