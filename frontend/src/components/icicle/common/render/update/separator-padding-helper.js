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

export const getSeparatorPadding = (data, separatorPadding) => {
  function getDepth1Items() {
    const ancestors = data.ancestors()
    const root = ancestors[ancestors.length - 1]
    return root.children
  }

  let calculatedSeparatorPadding = 0

  if (separatorPadding) {
    const depth1Ancestor = data.ancestors().filter(item => item.depth === 1)[0]

    if (depth1Ancestor) {
      const ancestorIndex = getDepth1Items().indexOf(depth1Ancestor)

      calculatedSeparatorPadding = separatorPadding * ancestorIndex
    }
  }

  return calculatedSeparatorPadding
}

export const calculateHeightPadding = (data, separatorPadding) => {
  if (data.depth === 0) {
    const childCount = (data.children && data.children.length) || 0
    return separatorPadding * Math.max(childCount - 1, 0)
  }

  return 0
}
