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

//import getDownloadedByText from '../common/report-text-helpers'

import dayjs from 'dayjs'
import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'
import {
  calculateMonthHoursForPhase,
  getBreakevenForMonth,
  getCostRatios,
} from '../../../../app/matter-costs/resource/MatterCostsTableHelper'
import {
  getTaskEnd,
  getTaskStart,
} from '../../../../app/matter-costs/outcomes/revenueHelper'

export const buildCostsTable = (t, reportData, content) => {
  const durationStart = reportData.period?.startDate
    ? dayjs(reportData.period?.startDate)
    : dayjs().startOf('month').toDate()

  const durationEnd = reportData.period?.endDate
    ? dayjs(reportData.period?.endDate)
    : dayjs().endOf('month').toDate()
  const isSnapshot = reportData.snapshot ? false : true
  //const downloadedByText = getDownloadedByText(t)
  const matterReferenceNumber = getMatterReferenceNumber(t, reportData.matter)

  content.push(
    [t('entity.client'), reportData.matter.clientName],
    [t('entity.matter') + ':', reportData.matter_name],
    [t('exports.costs.matterNumber'), matterReferenceNumber],
    [t('exports.costs.jurId'), reportData.matter.id],
    [t('exports.costs.numPeriod'), '1'], //this is only relevant after multi period in same report
    [t('common.table'), t('exports.costs.costs')],
    [t('common.currency'), reportData.rtd.rateTableDetails.currency],
    [
      t('common.status'),
      reportData.snapshot ? t('common.live') : t('common.finalised'),
    ],
    [''],
    [''],
    ['']
  )

  let months = dayjs(durationEnd).diff(durationStart, 'months') + 1
  let monthsNames = ['', '']
  let monthsObj = [
    {
      title: '',
    },
  ]
  for (let i = 0; i < months; i++) {
    let month = dayjs(durationStart).add(i, 'month')
    let name = month.format('MMM YY')
    monthsNames.push(name)
    monthsObj.push({
      title: name,
      id: i,
      fullMonth: month.format('MMMM YYYY'),
    })
  }

  let tableHeader = ['', 'Cost total', 'Period start']
  monthsNames.forEach((month, index) => {
    if (index !== monthsNames.length - 4) {
      tableHeader.push('')
    } else {
      tableHeader.push('Period end')
    }
  })
  content.push(tableHeader)
  content.push(monthsNames)

  if (reportData.costTimeEstimateList.length > 0) {
    reportData.costTimeEstimateList.forEach((cte, index) => {
      buildCteRow(
        content,
        cte,
        monthsObj,
        reportData,
        durationStart,
        durationEnd,
        isSnapshot
      )
    })
  }
}

const buildCteRow = (
  content,
  cte,
  columns,
  reportData,
  durationStart,
  durationEnd,
  isSnapshot
) => {
  const taskStart = dayjs(
    getTaskStart(cte.task, durationStart, isSnapshot)
  ).startOf('month')
  const taskEnd = dayjs(getTaskEnd(cte.task, durationEnd, isSnapshot)).endOf(
    'month'
  )
  const costRatios = getCostRatios(reportData.costRatioList, cte)
  let months = taskEnd.diff(taskStart, 'months') + 1
  let taskDataRow = [
    {
      cteId: cte.id,
      id: cte.task.id,
      isWorkstream: false,
      task: cte.task,
      duration: 0,
      startPos: 0,
      endPos: 0,
      inactive: false,
      gradeRows: costRatios.map(cr => {
        return [{ crId: cr.id, crTotalRevenue: 0 }]
      }),
    },
    0,
  ]
  if (
    (taskEnd.isBefore(durationStart) && taskStart.isBefore(durationStart)) ||
    (taskStart.isAfter(durationEnd) && taskEnd.isAfter(durationEnd))
  ) {
    taskDataRow[0].inactive = true
  }
  let startMonthPos =
    columns.indexOf(
      columns.find(col => col.fullMonth === taskStart.format('MMMM YYYY'))
    ) + 1
  let endMonthPos =
    columns.indexOf(
      columns.find(col => col.fullMonth === taskEnd.format('MMMM YYYY'))
    ) + 1
  if (startMonthPos === 0) {
    startMonthPos = 2
    if (endMonthPos === 0) {
      months = durationEnd.diff(durationStart, 'months') + 1
    } else {
      months = endMonthPos - 1
    }
  }
  if (endMonthPos === 0) {
    endMonthPos = columns.length
    if (startMonthPos === 0) {
      months = durationEnd.diff(durationStart, 'months') + 1
    } else {
      months = endMonthPos - startMonthPos + 1
    }
  }

  //will need to wrap this in isEvenDistribution check
  if (!cte.hourDistribution) {
    let monthHours = calculateMonthHoursForPhase(
      cte,
      months,
      columns,
      startMonthPos,
      endMonthPos,
      taskDataRow
    )
    for (let i = 1; i < columns.length; i++) {
      //figure out rate for each month
      let monthTotal = 0
      costRatios.forEach((cr, index) => {
        if (monthHours[i - 1] === '') {
          monthTotal += 0
          taskDataRow[0].gradeRows[index][0].crTotalRevenue += 0
          taskDataRow[0].gradeRows[index].push(0)
        } else {
          const ratio = cr.ratioValue
          const gradeMonthHourValue = (monthHours[i - 1] / 100) * ratio //we  need to multiply this by the grades rate
          reportData.rtd.periods.forEach((period, periodIndex) => {
            let matchingRate = null
            let breakEvenRate = null
            if (!period.startDate && !period.endDate) {
              if (cr.grade) {
                matchingRate = reportData.matterRatesList.filter(rate => {
                  return rate.gradeId === cr.grade.id
                })[0]
                breakEvenRate = getBreakevenForMonth(
                  matchingRate.breakEvenRates,
                  columns[i].fullMonth
                )
                matchingRate.rate
                  ? (matchingRate = matchingRate.rate)
                  : (matchingRate = matchingRate.rateValue)
              } else {
                matchingRate = reportData.matterRatesList.filter(rate => {
                  return rate.gradeId === cr.gradeId
                })[0]
                breakEvenRate = getBreakevenForMonth(
                  matchingRate.breakEvenRates,
                  columns[i].fullMonth
                )
                matchingRate.rate
                  ? (matchingRate = matchingRate.rate)
                  : (matchingRate = matchingRate.rateValue)
              }
            } else if (period.endDate && !period.startDate) {
              if (
                dayjs(columns[i].fullMonth).isBefore(dayjs(period.endDate)) ||
                dayjs(columns[i].fullMonth).isSame(dayjs(period.endDate))
              ) {
                if (cr.grade) {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.grade.id
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                  matchingRate.rate
                    ? (matchingRate = matchingRate.rate)
                    : (matchingRate = matchingRate.rateValue)
                } else {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.gradeId
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                  matchingRate.rate
                    ? (matchingRate = matchingRate.rate)
                    : (matchingRate = matchingRate.rateValue)
                }
              }
            } else if (!period.endDate) {
              if (
                dayjs(columns[i].fullMonth) > dayjs(period.startDate) ||
                dayjs(columns[i].fullMonth).isSame(
                  dayjs(period.startDate),
                  'month'
                )
              ) {
                if (cr.grade) {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.grade.id
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                } else {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.gradeId
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                }
              }
            } else if (
              dayjs(columns[i].fullMonth).isBetween(
                dayjs(period.startDate),
                dayjs(period.endDate)
              ) ||
              dayjs(columns[i].fullMonth).isSame(
                dayjs(period.startDate),
                'month'
              ) ||
              dayjs(columns[i].fullMonth).isSame(
                dayjs(period.endDate).subtract(1, 'day'),
                'month'
              )
            ) {
              if (cr.grade) {
                matchingRate = reportData.matterRatesList.filter(rate => {
                  return (
                    rate.periodId === period.periodId &&
                    rate.gradeId === cr.grade.id
                  )
                })[0]
                breakEvenRate = getBreakevenForMonth(
                  matchingRate.breakEvenRates,
                  columns[i].fullMonth
                )
              } else {
                matchingRate = reportData.matterRatesList.filter(rate => {
                  return (
                    rate.periodId === period.periodId &&
                    rate.gradeId === cr.gradeId
                  )
                })[0]
                breakEvenRate = getBreakevenForMonth(
                  matchingRate.breakEvenRates,
                  columns[i].fullMonth
                )
              }
            }
            if (matchingRate === null) {
              if (
                periodIndex === 0 &&
                dayjs(columns[i].fullMonth).isBefore(dayjs(period.startDate))
              ) {
                if (cr.grade) {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.grade.id
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                } else {
                  matchingRate = reportData.matterRatesList.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.gradeId
                    )
                  })[0]
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
                }
              }
            }
            if (matchingRate === undefined) {
              matchingRate = 0
            }
            let gradeMonthCost =
              gradeMonthHourValue * breakEvenRate * (cr.recoveryRate / 100)
            if (matchingRate !== null) {
              taskDataRow[0].gradeRows[index][0].crTotalRevenue +=
                gradeMonthCost
              taskDataRow[0].gradeRows[index].push(gradeMonthCost)
            }
            monthTotal += gradeMonthCost
          })
        }
      })
      taskDataRow[1] += monthTotal
      taskDataRow.push(monthTotal === 0 ? '' : monthTotal)
    }
  }
  taskDataRow.splice(0, 1)
  taskDataRow.forEach((data, i) => {
    if (data !== '') {
      taskDataRow[i] = parseFloat(data.toFixed(1))
    }
  })
  content.push([cte.task.name, ...taskDataRow])
}
