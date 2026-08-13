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
  getCostStageData(matterId) {
    return api(`costs/matterStageData/${matterId}`, 'GET')
  },
  getClientCostStageData(matterId) {
    return api(`costs/clientMatterStageData/${matterId}`, 'GET')
  },
  savePricing(matterId, payload) {
    return api(`costs/pricing/${matterId}`, 'POST', payload)
  },
  updatePricing(matterId, pricingId, payload) {
    return api(`costs/pricing/${matterId}/${pricingId}`, 'PATCH', payload)
  },
  deletePricing(pricingId, matterId) {
    return api(`costs/pricing/${matterId}/${pricingId}`, 'DELETE')
  },
  getCostProjectionStageData(periodId) {
    return api(`costs/resourceStageData/${periodId}`, 'GET')
  },
  saveCostRatioData(matterId, payload) {
    return api(`costs/costRatio/${matterId}`, 'POST', payload)
  },
  batchUpdateCostRatioData(matterId, payload) {
    return api(`costs/costRatio/${matterId}/batch`, 'PATCH', payload)
  },
  resetCostRatios(matterId, payload) {
    return api(`costs/costRatio/${matterId}/reset`, 'POST', payload)
  },
  saveCostTimeEstimateData(matterId, payload) {
    return api(`costs/costTimeEstimate/${matterId}`, 'POST', payload)
  },
  updateCostTimeEstimate(taskId, cteId, payload) {
    return api(`costs/costTimeEstimate/${taskId}/${cteId}`, 'PATCH', payload)
  },
  bulkUpdateCostTimeEstimate(periodId, payload) {
    return api(`costs/costTimeEstimate/${periodId}/bulk`, 'PATCH', payload)
  },
  syncCostTimeEstimates(matterId, payload) {
    return api(`costs/costTimeEstimate/${matterId}/sync`, 'POST', payload)
  },
  saveCostSnapshot(matterId, payload) {
    return api(`costs/snapshot/${matterId}`, 'POST', payload)
  },
  updateCostSnapshot(snapshotId, matterId, payload) {
    return api(`costs/snapshot/${matterId}/${snapshotId}`, 'PATCH', payload)
  },
  getAssumptions(matterId) {
    return api(`costs/assumption/${matterId}`, 'GET')
  },
  bulkSaveAssumption(matterId, payload) {
    return api(`costs/assumption/${matterId}/bulk`, 'POST', payload)
  },
  bulkUpdateAssumption(matterId, payload) {
    return api(`costs/assumption/${matterId}/bulk`, 'PATCH', payload)
  },
  deleteAssumption(matterId, assumptionId) {
    return api(`costs/assumption/${matterId}/${assumptionId}`, 'DELETE')
  },
  saveOutOfScopeDetails(matterId, payload) {
    return api(`costs/outOfScopeDetails/${matterId}`, 'POST', payload)
  },
  updateOutOfScopeDetails(matterId, id, payload) {
    return api(`costs/outOfScopeDetails/${matterId}/${id}`, 'PATCH', payload)
  },
}
