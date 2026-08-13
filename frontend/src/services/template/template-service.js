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

import makeCancellable from '../helpers/cancellable-promise-helper'
import api, { downloadXlsx } from '../helpers/fetch/fetch-helper'

export default {
  getTemplates(limit, random) {
    return api(
      'projecttemplates' +
        (limit ? `/?limit=${limit}` : '') +
        (random ? `${limit ? '&' : '/?'}random=${random}` : '')
    )
  },

  getTemplatesBasic() {
    return api('projecttemplates/?basic=1')
  },

  createTemplateMilestone(templateId, parentId, name) {
    let payload = {
      name: name,
      isMilestone: true,
    }
    if (parentId !== null) payload.parentTaskId = parentId
    return api(`projecttemplates/${templateId}/tasks`, 'POST', payload)
  },

  createTemplateTask(templateId, parentId, name, isDeliverable) {
    let payload = {
      name: name,
      isDeliverable: isDeliverable,
    }
    if (parentId !== null) payload.parentTaskId = parentId
    return api(`projecttemplates/${templateId}/tasks`, 'POST', payload)
  },

  createTemplate(projectId, name) {
    const payload = {
      projectId: projectId,
      name: name,
    }

    return api('projecttemplates', 'POST', payload)
  },

  updateTemplate(templateId, properties) {
    return api(`admin/projecttemplates/${templateId}`, 'PATCH', properties)
  },

  favouriteTemplate(templateId, favourited) {
    return favourited
      ? api(`projecttemplates/${templateId}/favourite`, 'POST')
      : api(`projecttemplates/${templateId}/favourite`, 'DELETE')
  },

  isTemplateFavourited(templateId) {
    return api(`projecttemplates/${templateId}/favourite`)
  },

  getTemplateOverview: templateId =>
    api(`projecttemplates/${templateId}?overview=true`),

  getTemplateOverviewWithPosts: templateId =>
    api(`projecttemplates/${templateId}?overviewWithPosts=true`),

  getStructure: templateId => api(`projecttemplates/${templateId}/structure`),
  getFlatTasksList: (templateId, reduceData = false) =>
    api(
      `projecttemplates/${templateId}/tasks?taskmapFlatTasks=true&reduceData=${reduceData}`
    ),

  getTemplate: templateId => api(`projecttemplates/${templateId}`),

  deleteTemplate(templateId) {
    return api(`projecttemplates/${templateId}`, 'DELETE')
  },

  getTemplateTasks: templateId => api(`projecttemplates/${templateId}/tasks`),

  getTemplateTask: (templateId, taskId) =>
    api(`projecttemplates/${templateId}/tasks/${taskId}`),

  getFilteredTemplateTasks(templateId, searchTerm) {
    let url = `projecttemplates/${templateId}/tasks/search`

    if (searchTerm) {
      url = `${url}?name=${searchTerm}`
    }

    return makeCancellable(api(url))
  },

  updateTemplateTask(templateId, taskId, properties) {
    const payload = {
      templateId,
      taskId,
      ...properties,
    }
    return api(
      `projecttemplates/${templateId}/tasks/${taskId}`,
      'PATCH',
      payload
    )
  },

  updateTemplateTasks(templateId, properties) {
    return api(`projecttemplates/${templateId}/tasks`, 'PATCH', properties)
  },

  deleteTemplateTask(templateId, taskId) {
    const payload = {
      templateId,
      taskId,
    }
    return api(
      `projecttemplates/${templateId}/tasks/${taskId}`,
      'DELETE',
      payload
    )
  },

  copyTemplateTask(templateId, taskId, name, targetTemplateId, copyType) {
    let payload = {
      name: name,
      copyType: copyType,
    }
    if (targetTemplateId) payload.targetTemplateId = targetTemplateId
    return api(
      `projecttemplates/${templateId}/tasks/${taskId}/copy`,
      'POST',
      payload
    )
  },

  copyTemplate(templateId, name, includePosts) {
    const payload = {
      name: name,
      includePosts: includePosts,
    }
    return api(`projecttemplates/${templateId}/copy`, 'POST', payload)
  },

  moveTemplateTask(
    templateId,
    taskId,
    destinationParentType,
    destinationParentId
  ) {
    const payload = {
      destinationParentType,
      destinationParentId,
    }

    return api(
      `projecttemplates/${templateId}/tasks/${taskId}/move`,
      'POST',
      payload
    )
  },

  moveTemplatePost(templateId, taskId, postId, newTaskId) {
    const payload = {
      newTaskId: newTaskId,
    }
    return api(
      `projecttemplates/${templateId}/tasks/${taskId}/posts/${postId}/move`,
      'POST',
      payload
    )
  },
  getPreview(templateId) {
    let url = `projecttemplates/${templateId}/preview`
    return api(url)
  },

  downloadTemplateAsJson(templateId, templateName) {
    //eslint-disable-next-line
    const safeName = templateName.replace(/[^\w\-]/g, '_')
    return downloadXlsx(
      `projecttemplates/${templateId}/export/json`,
      'GET',
      null,
      `${safeName}.json`
    )
  },

  importTemplateFromJson(jsonPayload) {
    return api('projecttemplates/import/json', 'POST', jsonPayload)
  },
}
