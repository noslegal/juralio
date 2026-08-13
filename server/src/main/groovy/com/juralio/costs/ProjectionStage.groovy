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

package com.juralio.costs

import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing

class ProjectionStage {
    long stage
    RateTableDetailsWithPeriod rtd
    ProjectionPeriodDTO period
    Boolean finishedPricing = false
    List<PricingDTO> pricingDTOList = []
    Boolean finishedMatterResources = false
    List<CostTimeEstimateDTO> costTimeEstimateList =[]
    List<CostRatioDTO> costRatioList =[]
    Boolean isFinalised = false
    String snapshot =' '
    long snapshotId
    Date snapshot_date
    Boolean isRetired = false
    Boolean editMode = false
}
