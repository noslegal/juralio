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

//Reference numbers are stored with JUR prefix.
export const formatReferenceNumber = (item, hash = true) =>
  item.referenceNumber
    ? (hash ? '#' : '') + item.referenceNumber.substring(3)
    : ''

export const formatTaskItemPlainText = item =>
  item ? `${formatNamePlainText(item)} - ${formatReferenceNumber(item)}` : ''

export const formatNamePlainText = item => (item ? item.name : '')

export const formatWorkstreamNamePlainText = item =>
  item ? item.projectName : ''

export const formatDescriptionPlainText = item =>
  item && item.description ? item.description : ''

export const formatTaskPageTitle = (t, task) =>
  `${t('entity.task')} ${
    task.referenceNumber ? formatReferenceNumber(task) : ''
  }`

export const formatMilestonePageTitle = (t, task) =>
  `${t('entity.milestone')} ${
    task.referenceNumber ? formatReferenceNumber(task) : ''
  }`
