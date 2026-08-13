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

import rawColours from '../../../../theme/raw-colours'

export const compareGrades = (a, b) => {
  if (a[0].id === b[0].id) {
    return 0
  } else {
    return a[0].id < b[0].id ? -1 : 1
  }
}

export const compareRateTypes = (a, b) => {
  if (a[1].id === b[1].id) {
    return 0
  } else {
    return a[1].id < b[1].id ? -1 : 1
  }
}

export const getTagIndex = o => {
  if (o.sysname) {
    switch (o.sysname) {
      case 'Standard':
        return 0
      case 'Agreed - Client':
        return 1
      case 'Agreed - Matter':
        return 2
      default:
        return undefined
    }
  } else {
    if (o.isStandard) {
      return 0
    } else if (o.isAgreedClient) {
      return 1
    } else if (o.isAgreedMatter) {
      return 2
    }
  }
}

export const formatTags = (rateTypes, targetRate) => {
  let formattedTags = []
  rateTypes.forEach(rt => {
    if (rt.isStandard) {
      formattedTags.push({
        tag: targetRate.name,
        color: rawColours.primary.black[200],
        textColorDark: rawColours.primary.grey[100],
      })
    } else if (rt.isAgreedClient) {
      formattedTags.push({
        tag: rt.name,
        color: 'rgba(24, 73, 169, 1)',
        textColorDark: '#D1E9FF',
      })
    } else if (rt.isAgreedMatter) {
      formattedTags.push({
        tag: rt.name,
        color: '#D1E9FF',
        textColorDark: '#1849A9',
      })
    }
  })
  return formattedTags
}

export const getValues = (
  rate,
  manualValues,
  selectedCalculationType,
  calculationValue
) => {
  let percentageMultiplier, newValue
  if (manualValues) {
    return ''
  } else {
    if (selectedCalculationType === 0) {
      return rate.rate ? rate.rate.toString() : '-'
    } else if (selectedCalculationType === 1) {
      percentageMultiplier = (100 - calculationValue) / 100
      newValue = rate.rate
        ? parseFloat(
            Math.round((rate.rate * percentageMultiplier).toFixed(2))
          ).toString()
        : '-'
      return newValue
    } else if (selectedCalculationType === 2) {
      percentageMultiplier = 100 + parseInt(calculationValue)
      newValue = rate.rate
        ? parseFloat(
            Math.round(((rate.rate / 100) * percentageMultiplier).toFixed(2))
          ).toString()
        : '-'
      return newValue
    }
  }
}

export const validateUpdatePayload = data => {
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    for (let j = 2; j < row.length; j++) {
      const element = row[j]
      if (element.isError) {
        return false
      }
    }
  }
  return true
}

export const getPeriodColumnWidths = (isFirstTimeFlow, rtd, periods) => {
  let calcWidth
  if (isFirstTimeFlow) {
    if (rtd.client && (rtd.rateTableDetails || rtd.associated_id)) {
      calcWidth =
        ((window.innerWidth - 80) / 100) * 80 -
        64 / periods.length -
        (((window.innerWidth - 80) / 100) * 5 + 375) / periods.length
    } else {
      calcWidth =
        ((window.innerWidth - 80) / 100) * 100 -
        64 / periods.length -
        (((window.innerWidth - 80) / 100) * 10 + 375) / periods.length
    }
  } else {
    if (rtd.client && (rtd.rateTableDetails || rtd.associated_id)) {
      calcWidth =
        (((window.innerWidth - 80) / 100) * 80) / periods.length -
        (((window.innerWidth - 80) / 100) * 5 + 375) / periods.length
    } else {
      calcWidth =
        (((window.innerWidth - 80) / 100) * 100) / periods.length -
        (((window.innerWidth - 80) / 100) * 10 + 375) / periods.length
    }
  }
  return calcWidth < 125 ? 125 : calcWidth
}
