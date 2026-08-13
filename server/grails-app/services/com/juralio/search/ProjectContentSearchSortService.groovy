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

package com.juralio.search

import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import grails.gorm.transactions.Transactional

@Transactional
class ProjectContentSearchSortService {

    MatterContentReferenceNumberService matterContentReferenceNumberService

    List<ProjectContentSearchResultDTO> sort(List<ProjectContentSearchResultDTO> items,
                                             ProjectContentSearchSortOption sortOption,
                                             String searchTerm) {
        if (!sortOption) {
            throw new IllegalArgumentException("Sort option must be provided")
        }

        if (items) {
            switch (sortOption) {
                case ProjectContentSearchSortOption.END_DATE:
                    items = sortByEndDate(items)
                    break
                case ProjectContentSearchSortOption.DESCRIPTION:
                    items = sortByDescription(items)
                    break
            }

            if (searchTerm && searchTerm.size() > 1 && matterContentReferenceNumberService.isReferenceNumber(searchTerm)) {
                for (int index = 0; index < items.size(); index++) {
                    ProjectContentSearchResultDTO item = items.get(index)

                    if (item.referenceNumber == searchTerm.toUpperCase()) {
                        items = items.minus(item)
                        items.add(0, item)
                        break
                    }
                }
            }
        }

        return items
    }

    private List<ProjectContentSearchResultDTO> sortByEndDate(List<ProjectContentSearchResultDTO> unsortedItems) {
        return unsortedItems.sort { a, b ->
            def orderingFieldA = a.actualEndDatetime ? "actualEndDatetime" : "plannedEndDatetime"
            def orderingFieldB = b.actualEndDatetime ? "actualEndDatetime" : "plannedEndDatetime"

            if (a."$orderingFieldA"?.getTime() == b."$orderingFieldB"?.getTime()) {
                if (a.description == b.description) {
                    a.id <=> b.id
                } else {
                    a.description <=> b.description
                }
            } else {
                a."$orderingFieldA"?.getTime() <=> b."$orderingFieldB"?.getTime()
            }
        }
    }

    private List<ProjectContentSearchResultDTO> sortByDescription(List<ProjectContentSearchResultDTO> unsortedItems) {
        return unsortedItems.sort { it.description.toLowerCase() }
    }
}
