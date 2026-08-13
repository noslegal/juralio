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

import dayjs from 'dayjs'
import rawColours from '../../../theme/raw-colours'
import cloneDeep from 'lodash/cloneDeep'
import juralioColours from '../../../theme/juralio-colours'
import costsService from '../../../services/costs/costs-service'
import { TASK_STATUS } from '../../constants'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'

export const tableTheme = {
  textHeader: rawColours.primary.grey.main,
  textHeaderSelected: rawColours.primary.grey.main,
  bgHeader: rawColours.primary.black[200],
  bgHeaderHasFocus: rawColours.primary.black.black,
  bgHeaderHovered: rawColours.primary.black.black,
  headerFontStyle: '12px',
}

export const rateTableTheme = {
  textGroupHeader: juralioColours.darkText.primary,
  textHeader: juralioColours.darkText.primary,
  textHeaderSelected: '#000000',
  bgHeader: rawColours.primary.grey.main,
  bgHeaderHasFocus: '#cfccc6',
  bgHeaderHovered: '#cfccc6',
  headerFontStyle: '12px',
  borderColor: '#B8B3B0',
}

export const setupColumns = (
  isSnapshot,
  data,
  rtd,
  durationStart,
  durationEnd,
  isMargin
) => {
  let currency = isSnapshot
    ? data?.rtd?.rateTableDetails?.currency
    : rtd.rateTableDetails.currency
  let months = dayjs(durationEnd).diff(durationStart, 'months') + 1
  if (currency === undefined) {
    currency = ''
  }
  let monthsObj = isMargin
    ? [
        {
          title: 'Margin',
          id: currency.substr(0, 3),
          width: 100,
        },
      ]
    : [
        {
          title: currency.substr(0, 3),
          id: currency.substr(0, 3),
          width: 100,
        },
      ]
  for (let i = 0; i < months; i++) {
    let month = dayjs(durationStart).add(i, 'month')
    let name = month.format('MMM YY')
    monthsObj.push({
      title: name,
      id: i,
      width:
        window.innerWidth / 2 / months < 75
          ? 75
          : window.innerWidth / 2 / months,
      fullMonth: month.format('MMMM YYYY'),
    })
  }
  return monthsObj
}

export const parseSnapshot = (
  setCostRatioList,
  costsSnapshot,
  setCostTimeEstimateList,
  setWorkstreams
) => {
  setCostRatioList(costsSnapshot.costRatioList)
  setCostTimeEstimateList(costsSnapshot.costTimeEstimateList)
  setWorkstreams(costsSnapshot.workstreamList)
}

export const calculateMonthHoursForPhase = (
  cte,
  duration,
  columns,
  startMonth,
  endMonth,
  phaseRow,
  excelDownload
) => {
  const monthHours = []
  const x = excelDownload ? 3 : 2
  const remainder = cte.hourValue % duration
  for (let i = 2; i < columns.length + 1; i++) {
    if (phaseRow[0].inactive) {
      monthHours.push('')
    } else if (i < startMonth || i > endMonth) {
      monthHours.push('')
    } else {
      const valueNoRemainder = Math.floor(cte.hourValue / duration)
      const monthRemainderValue = Math.ceil(remainder / duration)
      if (i >= duration + x - remainder && remainder > 0) {
        monthHours.push(valueNoRemainder + monthRemainderValue)
      } else {
        monthHours.push(valueNoRemainder)
      }
    }
  }
  return monthHours
}

/**
 * Distributes a (possibly fractional) value across the active months in
 * `columns` (the range [startMonthPos, endMonthPos]), pushing whole numbers
 * onto `taskDataRow` that sum EXACTLY to Math.round(value).
 *
 * Replaces the previous floor-then-boost logic, which only ever redistributed
 * an integer remainder and silently dropped any fractional part. A fixed fee
 * splits each phase's value as `pricing.value / phaseCount`, which is usually
 * fractional, so the old logic left the month cells summing to less than the
 * row total — most visibly when the value was divided across an odd number of
 * months. Keying the leftover units to `endMonthPos` (rather than the old
 * absolute `months + 2` boundary) also fixes tasks that don't start in the
 * first column, where the boost previously landed on the wrong months.
 *
 * For the original integer / start-in-first-column case this produces the
 * exact same distribution as before.
 */
export const distributeValueAcrossMonths = (
  taskDataRow,
  value,
  startMonthPos,
  endMonthPos,
  columns
) => {
  const activeCount = endMonthPos - startMonthPos + 1
  const target = Math.round(value)
  const base = activeCount > 0 ? Math.floor(target / activeCount) : 0
  const remainder = target - base * activeCount
  for (let i = 2; i < columns.length + 1; i++) {
    if (taskDataRow[0].inactive || i < startMonthPos || i > endMonthPos) {
      taskDataRow.push('')
    } else if (i > endMonthPos - remainder) {
      taskDataRow.push(base + 1)
    } else {
      taskDataRow.push(base)
    }
  }
}

export const updatePricingDataRowsHelper = (
  toggle,
  tableData,
  pricing,
  costTimeEstimateList,
  getBreakdownMessage,
  taskData,
  setTableData,
  setNumRows,
  pricingDTOList
) => {
  if (toggle === true) {
    let d = tableData
    const startPos = tableData.indexOf(
      tableData.find(x => x[0]?.id === pricing.id)
    )
    const cteListClone = cloneDeep(costTimeEstimateList)
    if (pricing.type > 0) {
      d.splice(startPos + 1, 0, [
        {
          specialType: true,
          isWorkstream: false,
          pricingId: pricing.id,
          duration: 0,
          startPos: 0,
          endPos: 0,
          rowHeight:
            cteListClone.filter(cte => cte.pricingId === pricing.id).length *
            80,
        },
        getBreakdownMessage(pricing.type),
      ])
    } else {
      cteListClone
        .filter(cte => cte.pricingId === pricing.id)
        .forEach((cte, index) => {
          let taskDataRow = taskData.get(cte.task.id)
          d.splice(startPos + 1 + index, 0, taskDataRow)
        })
    }

    setTableData(d)
    setNumRows(d.length)
  } else {
    let d = tableData
    const startPos = tableData.indexOf(
      tableData.find(x => x[0].id === pricing.id)
    )
    let amount = 0
    if (pricing.type > 0) {
      amount = 1
    } else {
      let endPos = 0
      let nextWS = pricingDTOList.indexOf(pricing) + 1
      if (nextWS === pricingDTOList.length) {
        endPos = tableData.length
      } else {
        endPos = tableData.indexOf(
          tableData.find(
            x =>
              x[0].id === pricingDTOList[pricingDTOList.indexOf(pricing) + 1].id
          )
        )
      }
      amount = endPos - startPos - 1
    }

    d.splice(startPos + 1, amount)
    setTableData(d)
    setNumRows(d.length)
  }
}

export const updatePricingRowValues = (
  tableData,
  pricingId,
  newValue,
  oldValue,
  isSingleWorkstream,
  columns,
  costTimeEstimateList,
  taskData
) => {
  let diffToAdd = newValue.data - oldValue
  const pricingIndex = tableData.indexOf(
    tableData.find(x => x[0].id === pricingId)
  )
  let oldPricingRowValues = cloneDeep(tableData[pricingIndex])
  tableData[pricingIndex][1] += parseInt(diffToAdd)
  if (!isSingleWorkstream) {
    tableData[0][1] += parseInt(diffToAdd)
  }

  for (let i = 2; i < columns.length + 1; i++) {
    let colTotal = 0
    costTimeEstimateList
      .filter(cte => cte.pricingId === pricingId)
      .forEach(cte => {
        let taskRow = taskData.get(cte.task.id)
        if (taskRow[i] !== '' && taskRow[i] !== null) {
          colTotal += taskRow[i]
          if (!isSingleWorkstream) {
            let colDiff = taskRow[i] - oldPricingRowValues[i]
            tableData[0][i] += colDiff
          }
        }
      })
    tableData[pricingIndex][i] = colTotal
  }
}

export const rateTableCalculateDiscountPercentage = (
  outputRate,
  standardRate
) => {
  const percentDiff = Math.floor(
    ((outputRate - standardRate) / standardRate) * 100
  )

  if (isNaN(percentDiff)) {
    return 'n/a'
  }
  if (percentDiff > 0) {
    return '+' + percentDiff
  } else {
    return percentDiff
  }
}

export const rateTableSavePeriod = (
  newDate,
  columns,
  cellMenu,
  periods,
  setPeriods,
  setColumns,
  setCellMenu
) => {
  let x = columns
  const columnDifference = 2
  if (newDate !== undefined) {
    let displayValue = dayjs(newDate).format('MMMM YYYY').toString()
    if (cellMenu.location[1] === -2) {
      if (cellMenu.location[0] > columnDifference) {
        x[cellMenu.location[0] - 1].title = displayValue
      }
      x[cellMenu.location[0]].group = displayValue
      costsService
        .updatePeriod(
          periods[cellMenu.location[0] - columnDifference].periodId,
          {
            startDate: newDate,
          }
        )
        .then(res => {
          if (res.status === 200) {
            if (res.body.length > 1) {
              setPeriods(res.body)
            }
          }
        })
    }
    setColumns([...x])
    setCellMenu(undefined)
  }
}

export const getPeriodMin = (cellMenu, periods) => {
  const columnDifference = 2
  let currPeriodIndex = cellMenu.location[0] - columnDifference
  if (currPeriodIndex === 0) {
    return null
  } else {
    return dayjs(periods[currPeriodIndex - 1].startDate)
      .add(1, 'month')
      .toDate()
  }
}
export const getPeriodMax = (cellMenu, periods) => {
  const columnDifference = 2
  let currPeriodIndex = cellMenu.location[0] - columnDifference
  if (currPeriodIndex === periods.length - 1) {
    return null
  } else {
    return dayjs(periods[currPeriodIndex + 1]?.startDate)
      .subtract(1, 'month')
      .toDate()
  }
}

export const getPeriodCurrValue = (cellMenu, periods) => {
  const columnDifference = 2
  let currPeriodIndex = cellMenu.location[0] - columnDifference
  return dayjs(periods[currPeriodIndex]?.startDate).toDate()
}

export const formatPayload = (
  periods,
  data,
  rateTableDetails,
  setRatePayload,
  isFirstTimeFlow
) => {
  const colDiff = 2
  const rtIndex = 1
  const gradeIdx = 0
  const payload = []
  periods.forEach((period, pIndex) => {
    data.forEach(row => {
      payload.push({
        gradeId: row[gradeIdx].id,
        rateTypeId: row[rtIndex].id,
        periodId: period.periodId ? period.periodId : period.id,
        rate:
          row[colDiff + pIndex].name === ''
            ? null
            : parseFloat(row[colDiff + pIndex].name),
        rate_table_detailsId: rateTableDetails.id,
        isError: row[colDiff + pIndex].isError,
      })
    })
  })
  setRatePayload(payload)
}

export const getBreakevenForMonth = (breakEvenRates, month) => {
  let fullMonth = dayjs(month)
  let matchingBreakeven = 0
  if (breakEvenRates.length === 1) {
    matchingBreakeven = breakEvenRates[0].rate
  } else {
    for (let i = 0; i < breakEvenRates.length; i++) {
      const rate = breakEvenRates[i]
      let rateStart = dayjs(rate.startDate)
      let rateEnd = dayjs(rate.endDate)
      if (rate.startDate && rate.endDate) {
        if (
          fullMonth.isBetween(rateStart, rateEnd) ||
          fullMonth.isSame(rateStart) ||
          fullMonth.isSame(rateEnd)
        ) {
          matchingBreakeven = rate.rate
        }
      } else if (!rate.startDate && rate.endDate) {
        if (fullMonth.isBefore(rateEnd) || fullMonth.isSame(rateEnd)) {
          matchingBreakeven = rate.rate
        }
      } else if (rate.startDate && !rate.endDate) {
        if (fullMonth.isAfter(rateStart) || fullMonth.isSame(rateStart)) {
          matchingBreakeven = rate.rate
        }
      }
    }
  }
  return matchingBreakeven
}

export const getCostRatios = (costRatios, cte) => {
  if (cte === undefined) {
    return costRatios.filter(x => x.cteId === 0 && x.projectId === 0)
  }
  const taskRatios = costRatios.filter(
    x => x.cteId === cte.id && x.ratioValue > 0
  )
  if (taskRatios.length > 0) {
    return taskRatios
  }
  const workstreamRatios = costRatios.filter(
    x => x.projectId === cte.task.projectId && x.ratioValue > 0
  )
  if (workstreamRatios.length > 0) {
    return workstreamRatios
  }
  return costRatios.filter(x => x.cteId === 0 && x.projectId === 0)
}

export const sortTasksByIndex = (a, b) => {
  if (parseInt(a.taskmapPosition) < parseInt(b.taskmapPosition)) {
    return -1
  } else {
    return 1
  }
}

//regular task
export const sortByTaskStatus = (a, b) => {
  if (a.status === b.status) {
    return 0
  }
  if (a.status === TASK_STATUS.DONE) {
    return -1
  }
  if (b.status === TASK_STATUS.DONE) {
    return 1
  }
  if (a.status === TASK_STATUS.IN_PROGRESS) {
    return -1
  }
  if (b.status === TASK_STATUS.IN_PROGRESS) {
    return 1
  }
  if (a.status === TASK_STATUS.NOT_STARTED) {
    return -1
  }
  if (b.status === TASK_STATUS.NOT_STARTED) {
    return 1
  }
  return 0
}

//cte task
export const sortByStatus = (a, b) => {
  if (a.task.status === b.task.status) {
    return 0
  }
  if (a.task.status === TASK_STATUS.DONE) {
    return -1
  }
  if (b.task.status === TASK_STATUS.DONE) {
    return 1
  }
  if (a.task.status === TASK_STATUS.IN_PROGRESS) {
    return -1
  }
  if (b.task.status === TASK_STATUS.IN_PROGRESS) {
    return 1
  }
  if (a.task.status === TASK_STATUS.NOT_STARTED) {
    return -1
  }
  if (b.task.status === TASK_STATUS.NOT_STARTED) {
    return 1
  }
  return 0
}
export const getTaskCounts = (
  taskObj,
  { isSnapshot, matterTasks, assumptionList }
) => {
  let deliverableCount = 0
  if (isSnapshot) {
    deliverableCount = taskObj?.deliverables?.length || 0
  } else {
    const matterTask = matterTasks?.find(mt => mt.id === taskObj.id)
    deliverableCount = matterTask
      ? flatTaskListFromTree(matterTask).filter(st => st.isDeliverable).length
      : 0
  }
  const assumptionCount =
    assumptionList?.filter(a => (a.taskId || a.task?.id) === taskObj.id)
      ?.length || 0
  return { deliverableCount, assumptionCount }
}

export const sortByWorkstream = (a, b) => {
  if (parseInt(a.task.projectId) < parseInt(b.task.projectId)) {
    return -1
  } else {
    return 1
  }
}
