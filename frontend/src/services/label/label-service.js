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

import api from '../helpers/fetch/fetch-helper'

export default {
  getSystemLabels() {
    return api('labels/system')
  },
  getOrganisationLabels(includeHierarchicalLabels = false) {
    return api(
      'organisation/labels' +
        (includeHierarchicalLabels ? '?includeHierarchicalLabels=true' : '')
    )
  },
  getMatterLabels(matterId, includeHierarchicalLabels = false, allNoCounts) {
    return api(
      `matter/${matterId}/labels` +
        (includeHierarchicalLabels ? '?includeHierarchicalLabels=true' : '') +
        (allNoCounts ? '?allNoCounts=true' : '')
    )
  },
  getTaskLabels(matterId, workstreamId, taskId) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/labels`
    )
  },
  addOrganisationLabel(name, type) {
    return api('organisation/labels', 'POST', {
      name: name,
      type: type,
    })
  },
  addMatterLabel(matterId, name, type) {
    return api(`matter/${matterId}/labels`, 'POST', {
      name: name,
      type: type,
    })
  },
  getUsageForLabel(matterId, labelId) {
    return api(`matter/${matterId}/labels/${labelId}`)
  },
  updateOrganisationLabel(labelId, body) {
    return api(`organisation/labels/${labelId}`, 'PATCH', body)
  },
  updateMatterLabel(matterId, labelId, body) {
    return api(`matter/${matterId}/labels/${labelId}`, 'PATCH', body)
  },
  addLabelToTask(matterId, workstreamId, taskId, labelId, modifier = null) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/labels`,
      'POST',
      {
        labelId: labelId,
        modifier: modifier,
      }
    )
  },
  updateTaskLabel(matterId, workstreamId, taskId, labelId, modifier = null) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/labels/${labelId}`,
      'PATCH',
      {
        modifier: modifier,
      }
    )
  },
  removeLabelFromTask(matterId, workstreamId, taskId, labelId) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/task/${taskId}/labels/${labelId}`,
      'DELETE'
    )
  },
  removeLabelUses(matterId, labelId, taskIds) {
    return api(`matter/${matterId}/labels/${labelId}`, 'POST', {
      taskIds: taskIds,
    })
  },
  mergeLabels(matterId, masterLabelId, minorLabelId) {
    return api(`matter/${matterId}/labels/merge`, 'POST', {
      masterLabelId: masterLabelId,
      minorLabelId: minorLabelId,
    })
  },
}
