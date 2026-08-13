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
import api from '../helpers/fetch/fetch-helper'

export default {
  getWorkstreamAdminListByMatterId(
    matterId,
    excludeClosed,
    limitToMTMs,
    levelATasksOnly = false,
    overviewOnly = undefined,
    allTasks = false,
    includePosts = false,
    adminList = false
  ) {
    const queryParams = {
      ...(excludeClosed !== undefined ? { excludeClosed } : {}),
      ...(limitToMTMs !== undefined ? { limitToMTMs } : {}),
      ...(levelATasksOnly !== undefined ? { levelATasksOnly } : {}),
      ...(overviewOnly !== undefined ? { overviewOnly } : {}),
      ...(allTasks !== undefined ? { allTasks } : {}),
      ...(includePosts !== undefined ? { includePosts } : {}),
      ...(adminList !== undefined ? { adminList } : {}),
    }
    const url = `matter/${matterId}/workstreams${
      Object.keys(queryParams).length > 0
        ? '?' + queryString.stringify(queryParams)
        : ''
    }`
    return api(url)
  },
  getProjectsByMatterId(
    matterId,
    excludeClosed,
    limitToMTMs,
    levelATasksOnly = false,
    overviewOnly = undefined,
    allTasks = false,
    includePosts = false
  ) {
    const queryParams = {
      ...(excludeClosed !== undefined ? { excludeClosed } : {}),
      ...(limitToMTMs !== undefined ? { limitToMTMs } : {}),
      ...(levelATasksOnly !== undefined ? { levelATasksOnly } : {}),
      ...(overviewOnly !== undefined ? { overviewOnly } : {}),
      ...(allTasks !== undefined ? { allTasks } : {}),
      ...(includePosts !== undefined ? { includePosts } : {}),
    }
    const url = `matter/${matterId}/workstreams${
      Object.keys(queryParams).length > 0
        ? '?' + queryString.stringify(queryParams)
        : ''
    }`
    return api(url)
  },

  getOrgProjectsByMatterId(matterId) {
    const queryParams = {
      orgList: true,
    }
    const url = `matter/${matterId}/workstreams?${queryString.stringify(
      queryParams
    )}`
    return api(url)
  },

  createProject(matterId, options) {
    return api(`matter/${matterId}/workstreams`, 'POST', {
      matterId: matterId,
      ...options,
    })
  },
  updateProject(matterId, projectId, properties) {
    return api(
      `admin/matter/${matterId}/workstreams/${projectId}`,
      'PATCH',
      properties
    )
  },
  getRecentProjects(count) {
    return api(`projects/recentprojects?count=${count}`)
  },
  getProject(matterId, projectId, queryParams) {
    let url = `matter/${matterId}/workstreams/${projectId}`
    url = `${url}?${queryString.stringify(queryParams)}`
    return api(url)
  },
  getProjectOverview(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}?overview=true`
    return api(url)
  },
  recordProjectVisit(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}/visit`
    return api(url, 'POST')
  },
  recordTaskSeen(matterId, projectId, taskId) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks/${taskId}/seen`
    return api(url, 'PATCH')
  },
  getNewTasks(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks/new`
    return api(url)
  },
  createProjectFromTemplate(
    matterId,
    options,
    templateId,
    includePosts,
    includeDescriptions = false,
    includeResources
  ) {
    return api(
      `matter/${matterId}/workstreams?templateid=${templateId}`,
      'POST',
      {
        matterId: matterId,
        ...options,
        includePosts: includePosts,
        includeDescriptions: includeDescriptions,
        includeResources: includeResources,
      }
    )
  },
  createProjectFromTutorial(templateId, options) {
    return api(`projects?templateid=${templateId}`, 'POST', {
      ...options,
    })
  },
  createProjectFromTemplateTask(
    matterId,
    options,
    templateTaskId,
    includePosts,
    includeDescriptions = false
  ) {
    return api(
      `matter/${matterId}/workstreams?templateTaskId=${templateTaskId}`,
      'POST',
      {
        matterId: matterId,
        ...options,
        includePosts: includePosts,
        includeDescriptions: includeDescriptions,
      }
    )
  },
  getProjectTasks(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks`
    return api(url)
  },

  getPreview(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}/preview`
    return api(url)
  },

  getStructure(matterId, projectId) {
    let url = `matter/${matterId}/workstreams/${projectId}/structure`
    return api(url)
  },

  getFlatTasksList(matterId, projectId, reduceData = false) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks?taskmapFlatTasks=true&includeNotRequired=true&includePosts=true&reduceData=${reduceData}`
    return api(url)
  },
  getWorkstreamResources(id, projectId) {
    return api(`matter/${id}/workstreams/${projectId}/resources`)
  },
  addWorkstreamResource(id, projectId, name, url, image = null) {
    return api(`matter/${id}/workstreams/${projectId}/resources`, 'POST', {
      name: name,
      url: url,
      image: image,
    })
  },
  visitWorkstreamResource(id, projectId, resourceId) {
    return api(
      `matter/${id}/workstreams/${projectId}resources/${resourceId}`,
      'POST',
      {}
    )
  },
  deleteWorkstreamResource(id, projectId, resourceId) {
    return api(
      `matter/${id}/workstreams/${projectId}/resources/${resourceId}`,
      'DELETE'
    )
  },
  getWorkstreamOverview(matterId, workstreamId) {
    return api(`matter/${matterId}/workstreams/${workstreamId}/overview`)
  },
}
