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

package com.juralio.common

import grails.gorm.transactions.Transactional

@Transactional
class ArrayHelperService {

    /**
     * Determines which elements in <code>arrayToDetermineMissingElementsIn</code> are not in
     * <code>originalArray</code>.
     *
     * Returns null if no differences found.
     *
     * @param originalArray
     * @param arrayToDetermineMissingElementsIn
     */
    def determineMissingElementsInArray(def originalArray, def arrayToDetermineMissingElementsIn) {

        if (!arrayToDetermineMissingElementsIn) {
            return null
        }

        if (!originalArray) {
            return arrayToDetermineMissingElementsIn
        }

        def result = arrayToDetermineMissingElementsIn - originalArray

        if (result.size() == 0) {
            return null
        }

        return result
    }

    def extractIdsFromObjects(def objects) {
        if (!objects) {
            return []
        }

        return objects.id
    }
}
