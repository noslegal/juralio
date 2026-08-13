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

import { LABEL_TYPES } from '../../../../constants'

const getLabelCount = labels => {
  return (
    labels.risks.system.filter(label => label.inactive === false).length +
    labels.workflow.system.filter(label => label.inactive === false).length +
    labels.risks.organisation.length +
    labels.workflow.organisation.length
  )
}

export const addNewLabel = (labels, label) => {
  if (label.type === LABEL_TYPES.RISK) {
    labels.risks.organisation.unshift(label)
  } else if (label.type === LABEL_TYPES.WORKFLOW) {
    labels.workflow.organisation.unshift(label)
  }

  return { ...labels, totalCount: getLabelCount(labels) }
}

export const processLabels = allLabels => {
  const result = getDefaultLabelStructure()

  // Risks
  result.risks.system = allLabels.filter(
    label => label.system === true && label.type === LABEL_TYPES.RISK
  )
  result.risks.organisation = allLabels.filter(
    label =>
      label.organisation === true &&
      label.type === LABEL_TYPES.RISK &&
      label.inactive === false
  )

  // Workflow
  result.workflow.system = allLabels.filter(
    label => label.system === true && label.type === LABEL_TYPES.WORKFLOW
  )
  result.workflow.organisation = allLabels.filter(
    label =>
      label.organisation === true &&
      label.type === LABEL_TYPES.WORKFLOW &&
      label.inactive === false
  )

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
  labels.risks.organisation = labels.risks.organisation.map(updateNameById)
  labels.workflow.organisation =
    labels.workflow.organisation.map(updateNameById)
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
  labels.workflow.system = labels.workflow.system.map(updateInactiveById)
  labels.workflow.organisation =
    labels.workflow.organisation.map(updateInactiveById)

  labels.risks.organisation = labels.risks.organisation.filter(
    label => label.inactive === false
  )
  labels.workflow.organisation = labels.workflow.organisation.filter(
    label => label.inactive === false
  )

  return { ...labels, totalCount: getLabelCount(labels) }
}

export const getDefaultLabelStructure = () => {
  return {
    risks: {
      system: [],
      organisation: [],
    },
    workflow: {
      system: [],
      organisation: [],
    },
    totalCount: 0,
  }
}
