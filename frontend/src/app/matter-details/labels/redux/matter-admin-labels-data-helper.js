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

import {
  compareNumbersDescending,
  compareStrings,
} from '../../../../services/helpers/table/juralio-table-sorting-helper'
import { LABEL_TYPES } from '../../../constants'

const getLabelCount = labels => {
  return (
    labels.risks.system.filter(label => label.inactive === false).length +
    labels.workflow.system.filter(label => label.inactive === false).length +
    labels.risks.bespoke.length +
    labels.workflow.bespoke.length +
    labels.userDefined.length
  )
}

export const addNewLabel = (labels, label) => {
  if (label.type === LABEL_TYPES.RISK) {
    labels.risks.bespoke.unshift(label)
  } else if (label.type === LABEL_TYPES.WORKFLOW) {
    labels.workflow.bespoke.unshift(label)
  } else if (label.type === LABEL_TYPES.USER_DEFINED) {
    labels.userDefined.unshift(label)
  }

  return { ...labels, totalCount: getLabelCount(labels) }
}

export const processMatterLabels = allLabels => {
  const result = getDefaultLabelStructure()

  // Risks
  result.risks.system = allLabels.filter(
    label => label.system === true && label.type === LABEL_TYPES.RISK
  )
  result.risks.organisation = allLabels.filter(
    label => label.organisation === true && label.type === LABEL_TYPES.RISK
  )
  result.risks.bespoke = allLabels.filter(
    label =>
      label.system === false &&
      label.organisation === false &&
      label.type === LABEL_TYPES.RISK
  )

  // keep all deleted labels that are still in tasks
  result.risks.bespoke = result.risks.bespoke.filter(
    label => !label.inactive || (label.inactive && label.usageCount > 0)
  )

  // Sort by number of uses (largest number first) then alphabetically
  result.risks.organisation.sort((a, b) => compareStrings(a.name, b.name))
  result.risks.organisation.sort((a, b) =>
    compareNumbersDescending(a.usageCount, b.usageCount)
  )

  // sort matter labels by active/inactive, number of uses (largest number first) and alphabetically
  result.risks.bespoke.sort((a, b) => compareStrings(a.name, b.name))
  result.risks.bespoke.sort((a, b) =>
    compareNumbersDescending(a.usageCount, b.usageCount)
  )
  result.risks.bespoke.sort((a, b) => a.inactive - b.inactive)

  // Workflow
  result.workflow.system = allLabels.filter(
    label => label.system === true && label.type === LABEL_TYPES.WORKFLOW
  )
  result.workflow.organisation = allLabels.filter(
    label => label.organisation === true && label.type === LABEL_TYPES.WORKFLOW
  )
  result.workflow.bespoke = allLabels.filter(
    label =>
      label.system === false &&
      label.organisation === false &&
      label.type === LABEL_TYPES.WORKFLOW
  )

  // keep all deleted labels that are still in tasks
  result.workflow.bespoke = result.workflow.bespoke.filter(
    label => !label.inactive || (label.inactive && label.usageCount > 0)
  )

  // Sort by number of uses (largest number first) then alphabetically
  result.workflow.organisation.sort((a, b) => compareStrings(a.name, b.name))
  result.workflow.organisation.sort((a, b) =>
    compareNumbersDescending(a.usageCount, b.usageCount)
  )

  // sort matter labels by active/inactive, number of uses (largest number first) and alphabetically
  result.workflow.bespoke.sort((a, b) => compareStrings(a.name, b.name))
  result.workflow.bespoke.sort((a, b) =>
    compareNumbersDescending(a.usageCount, b.usageCount)
  )
  result.workflow.bespoke.sort((a, b) => a.inactive - b.inactive)

  result.userDefined = allLabels.filter(
    label =>
      (label.type === LABEL_TYPES.USER_DEFINED && !label.inactive) ||
      (label.type === LABEL_TYPES.USER_DEFINED &&
        label.inactive &&
        label.usageCount > 0)
  )

  // sort matter labels by active/inactive, number of uses (largest number first) and alphabetically
  result.userDefined.sort((a, b) => compareStrings(a.name, b.name))
  result.userDefined.sort((a, b) =>
    compareNumbersDescending(a.usageCount, b.usageCount)
  )
  result.userDefined.sort((a, b) => a.inactive - b.inactive)

  result.totalCount = getLabelCount(result)

  return result
}

export const updateLabelName = (labels, updatedLabel) => {
  const updateNameById = label => {
    if (label.id.toString() === updatedLabel.id.toString()) {
      label.name = updatedLabel.name
    }
    return label
  }
  labels.risks.bespoke = labels.risks.bespoke.map(updateNameById)
  labels.workflow.bespoke = labels.workflow.bespoke.map(updateNameById)
  labels.userDefined = labels.userDefined.map(updateNameById)
  return { ...labels }
}

export const updateLabelsInactive = (
  labels,
  labelId,
  inactive,
  inactiveSince
) => {
  const updateInactiveById = label => {
    if (label.id.toString() === labelId.toString()) {
      label.inactive = inactive
      label.inactiveSince = inactiveSince
    }
    return label
  }
  labels.risks.system = labels.risks.system.map(updateInactiveById)
  labels.risks.organisation = labels.risks.organisation.map(updateInactiveById)
  labels.risks.bespoke = labels.risks.bespoke.map(updateInactiveById)
  labels.workflow.system = labels.workflow.system.map(updateInactiveById)
  labels.workflow.organisation =
    labels.workflow.organisation.map(updateInactiveById)
  labels.workflow.bespoke = labels.workflow.bespoke.map(updateInactiveById)
  labels.userDefined = labels.userDefined.map(updateInactiveById)

  labels.risks.bespoke = labels.risks.bespoke.filter(
    label =>
      label.inactive === false || (label.inactive && label.usageCount > 0)
  )
  labels.workflow.bespoke = labels.workflow.bespoke.filter(
    label =>
      label.inactive === false || (label.inactive && label.usageCount > 0)
  )
  labels.userDefined = labels.userDefined.filter(
    label =>
      label.inactive === false || (label.inactive && label.usageCount > 0)
  )

  return { ...labels, totalCount: getLabelCount(labels) }
}

export const getDefaultLabelStructure = () => {
  return {
    risks: {
      system: [],
      organisation: [],
      bespoke: [],
    },
    workflow: {
      system: [],
      organisation: [],
      bespoke: [],
    },
    userDefined: [],
    totalCount: 0,
  }
}
