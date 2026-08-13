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

import { getLeafResolver } from './data-provider-utils'

export const decorateCellWidths = (
  hierarchyRoot,
  childrenPropertyName,
  shouldHaveEqualWidths
) => {
  if (shouldHaveEqualWidths) {
    decorateHeightEqually(hierarchyRoot)
  } else {
    decorateHeightByChildLength(hierarchyRoot, childrenPropertyName)
  }
}

const decorateHeightEqually = hierarchyRoot => {
  hierarchyRoot.value = 1
  hierarchyRoot.eachBefore(node => {
    if (node.parent) {
      node.value = node.parent.value / node.parent.children.length
    }
  })
}

const decorateHeightByChildLength = (hierarchyRoot, childrenPropertyName) => {
  hierarchyRoot.sum(getLeafResolver(childrenPropertyName))
  hierarchyRoot.count()
}
