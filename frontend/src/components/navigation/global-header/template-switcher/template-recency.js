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

const KEY = 'recentlyOpenedTemplates'

export const getRecentTemplateIds = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export const trackTemplateOpened = templateId => {
  const recent = getRecentTemplateIds().filter(id => id !== templateId)
  recent.unshift(templateId)
  localStorage.setItem(KEY, JSON.stringify(recent.slice(0, 50)))
}

export const sortTemplatesByRecency = templates => {
  const recentIds = getRecentTemplateIds()
  return [...templates].sort((a, b) => {
    if (a.isFavourited !== b.isFavourited) return a.isFavourited ? -1 : 1
    const aIdx = recentIds.indexOf(a.id)
    const bIdx = recentIds.indexOf(b.id)
    if (aIdx !== -1 || bIdx !== -1) {
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    }
    return 0
  })
}
