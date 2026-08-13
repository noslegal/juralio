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

package com.juralio.costs.dao

import com.juralio.costs.CostSnapshot
import com.juralio.costs.ProjectionPeriod
import com.juralio.costs.SnapshotObject
import com.juralio.matter.Matter
import grails.gorm.transactions.Transactional

@Transactional
class SnapshotDAOService {

    CostSnapshot getSnapshot(Matter matter) {
        return CostSnapshot.findByMatter(matter)
    }

    CostSnapshot getSnapshotForPeriod(ProjectionPeriod projectionPeriod) {
       List <CostSnapshot> costSnapshotList =   CostSnapshot.findAllByProjectionPeriod(projectionPeriod)
        costSnapshotList.sort {a, b -> b.snapshot_date <=> a.snapshot_date}
        return costSnapshotList[0]
    }

    CostSnapshot getSnapshotById(long snapshotId){
        return CostSnapshot.findById(snapshotId as int)
    }

    CostSnapshot saveSnapshot(CostSnapshot costSnapshot) {
        costSnapshot.save(failOnError: true)

        return costSnapshot
    }

}
