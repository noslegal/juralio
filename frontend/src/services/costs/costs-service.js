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
  getCostStageData(position) {
    return api(`costs/stageData`, 'POST', { position: position })
  },
  generateDefaultGradeData(orgId, position) {
    return api(`grade/${orgId}/generateDefaults`, 'POST', {
      position: position,
    })
  },
  generateDefaultRateTypeData(orgId, position) {
    return api(`rate_type/${orgId}/generateDefaults`, 'POST', {
      position: position,
    })
  },
  generateDefaultOtherCostsData(orgId, position) {
    return api(`otherCosts/${orgId}/generateDefaults`, 'POST', {
      position: position,
    })
  },
  getMatterRateTableGrades(matter_id) {
    return api(`matter/${matter_id}/grades`, 'GET')
  },
  getGroupPositions() {
    return api(`groupPositions`, 'GET')
  },
  getGrades(position) {
    return api(`grades`, 'POST', { position: position })
  },
  getGradeCategories(position) {
    return api(`gradecategory`, 'POST', { position: position })
  },
  getRateTypes(position) {
    return api(`rate_type`, 'POST', { position: position })
  },
  getOtherCosts(position) {
    return api(`otherCost`, 'POST', { position: position })
  },
  createRateTableDetail(payload) {
    return api(`rate_table_detail`, 'POST', payload)
  },
  getRateTableDetail(position) {
    return api(`rate_table_details`, 'POST', { position: position })
  },
  deleteRateTableDetails(rtd_id) {
    return api(`/rate_table_details/${rtd_id}`, 'DELETE')
  },
  updateRateTableDetail(rateTableDetailId, payload) {
    return api(`rate_table_details/${rateTableDetailId}`, 'PATCH', payload)
  },
  bulkCreateRates(payload) {
    return api(`rates/bulk`, 'POST', payload)
  },
  createRate(payload) {
    return api(`rates`, 'POST', payload)
  },
  updateRate(rateId, payload) {
    return api(`rate/${rateId}`, 'PATCH', payload)
  },
  bulkUpdateRates(payload) {
    return api(`rates/bulk`, 'PATCH', payload)
  },
  createPeriod(payload) {
    return api(`periods`, 'POST', payload)
  },
  updatePeriod(periodId, payload) {
    return api(`period/${periodId}/update`, 'PATCH', payload)
  },
  deletePeriod(periodId) {
    return api(`period/${periodId}/delete`, 'POST')
  },
  getRateTable(rateTableDetailsId) {
    return api(`rates/${rateTableDetailsId}`)
  },
  getMatterRateTableDetails(matterId) {
    return api(`/rate_table_details/matter/${matterId}`, 'GET')
  },
  deleteMatterRateTableDetails(matterId) {
    return api(`/rate_table_details/matter/${matterId}`, 'DELETE')
  },
  getMatterRateTable(rateTableDetailsId, matterId, setup) {
    return api(`rates/${rateTableDetailsId}/matter/${matterId}/${setup}`)
  },
  getFilteredRateTableDetails(payload) {
    return api(`rate_table_details/filter`, 'POST', payload)
  },
  createProjectionPeriod(matter_id, payload) {
    return api(`costs/projectionPeriod/${matter_id}`, 'POST', payload)
  },
  editProjectionPeriod(periodId, payload) {
    return api(
      `costs/projectionPeriod/${payload.matterId}/${periodId}`,
      'PATCH',
      payload
    )
  },
}
