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
import { TASK_STATUS } from '../../constants'
import {
  calculateMonthHoursForPhase,
  getBreakevenForMonth,
  getCostRatios,
  distributeValueAcrossMonths,
} from '../resource/MatterCostsTableHelper'
import { FLAGGED_ASSUMPTION_STATUSES } from '../../../services/helpers/costs/assumption-status-helper'

export const getProjectionTotalRevenue = (projectionData, rates, rtd) => {
  const costTimeEstimateList = projectionData.costTimeEstimateList
  const costRatioList = projectionData.costRatioList
  const pricingDTOList = projectionData.pricingDTOList
  const projectionPeriod = projectionData.period
  const durationStart = projectionData.period.startDate
  const durationEnd = projectionData.period.endDate
  const isSnapshot = projectionData.isFinalised

  if (
    !projectionPeriod ||
    !pricingDTOList ||
    !costRatioList ||
    !costTimeEstimateList
  ) {
    return 0
  }
  const months =
    dayjs(projectionPeriod.endDate).diff(projectionPeriod.startDate, 'months') +
    1
  let columns = [{ title: 'dummyColumn' }]

  for (let i = 0; i < months; i++) {
    let month = dayjs(projectionPeriod.startDate).add(i, 'month')
    let name = month.format('MMM YY')
    columns.push({
      title: name,
      id: i,
      width: 75,
      fullMonth: month.format('MMMM YYYY'),
    })
  }
  let revenueTotal = 0
  pricingDTOList.forEach(pricing => {
    let pricingValue = 0
    let currentCTEList = []
    if (pricingDTOList.length > 1) {
      currentCTEList = costTimeEstimateList.filter(
        cte => cte.pricingId === pricing.id
      )
    } else {
      currentCTEList = costTimeEstimateList
    }
    currentCTEList.forEach(cte => {
      const taskStart = dayjs(
        getTaskStart(cte.task, durationStart, isSnapshot)
      ).startOf('month')
      const taskEnd = dayjs(
        getTaskEnd(cte.task, durationEnd, isSnapshot)
      ).endOf('month')
      let months = taskEnd.diff(taskStart, 'months') + 1
      let taskDataRow = [
        {
          cteId: cte.id,
          id: cte.task.id,
          isWorkstream: false,
          pricingId: pricing.id,
          wsId: cte.task.projectId,
          task: cte.task,
          specialType: false,
          duration: 0,
          startPos: 0,
          endPos: 0,
          inactive: false,
          gradeRows: getCostRatios(costRatioList, cte).map(cr => {
            return [{ crId: cr.id, crTotalRevenue: 0 }]
          }),
        },
        0,
      ]
      if (
        (taskEnd.isBefore(durationStart) &&
          taskStart.isBefore(durationStart)) ||
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
          months = dayjs(durationEnd).diff(durationStart, 'months') + 1
        } else {
          months = endMonthPos - 1
        }
      }
      if (endMonthPos === 0) {
        endMonthPos = columns.length
        if (startMonthPos === 0) {
          months = dayjs(durationEnd).diff(durationStart, 'months') + 1
        } else {
          months = endMonthPos - startMonthPos + 1
        }
      }
      if (pricing.type === 0) {
        if (rtd.periods.length > 1) {
          let monthHours = calculateMonthHoursForPhase(
            cte,
            months,
            columns,
            projectionPeriod.startMonth,
            projectionPeriod.endMonth,
            taskDataRow,
            false
          )
          // const remainder = cte.hourValue % months
          // for (let i = 2; i < columns.length + 1; i++) {
          //   if (
          //     i < projectionPeriod.startDate ||
          //     i > projectionPeriod.endDate
          //   ) {
          //     monthHours.push('')
          //   } else {
          //     const valueNoRemainder = Math.floor(cte.hourValue / months)
          //     const monthRemainderValue = Math.ceil(remainder / months)
          //     if (i >= months + 2 - remainder && remainder > 0) {
          //       monthHours.push(valueNoRemainder + monthRemainderValue)
          //     } else {
          //       monthHours.push(valueNoRemainder)
          //     }
          //   }
          // }
          let phaseTotal = 0
          for (let i = 1; i < columns.length; i++) {
            //figure out rate for each month

            let monthTotal = 0
            getCostRatios(costRatioList, cte).forEach(cr => {
              if (monthHours[i] === '') {
                monthTotal += 0
              } else {
                const ratio = cr.ratioValue
                const gradeMonthHourValue = (monthHours[i - 1] / 100) * ratio //we  need to multiply this by the grades rate
                rtd.periods.forEach((period, periodIndex) => {
                  let matchingRate = null
                  if (!period.endDate) {
                    if (
                      dayjs(columns[i].fullMonth) > dayjs(period.startDate) ||
                      dayjs(columns[i].fullMonth).isSame(
                        dayjs(period.startDate),
                        'month'
                      )
                    ) {
                      if (cr.grade) {
                        matchingRate = rates.filter(rate => {
                          return (
                            rate.periodId === period.periodId &&
                            rate.gradeId === cr.grade.id
                          )
                        })[0].rate
                      } else {
                        matchingRate = rates.filter(rate => {
                          return (
                            rate.periodId === period.periodId &&
                            rate.gradeId === cr.gradeId
                          )
                        })[0]?.rate
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
                      matchingRate = rates.filter(rate => {
                        return (
                          rate.periodId === period.periodId &&
                          rate.gradeId === cr.grade.id
                        )
                      })[0].rate
                    } else {
                      matchingRate = rates.filter(rate => {
                        return (
                          rate.periodId === period.periodId &&
                          rate.gradeId === cr.gradeId
                        )
                      })[0].rate
                    }
                  }
                  if (matchingRate === null) {
                    if (
                      periodIndex === 0 &&
                      dayjs(columns[i].fullMonth).isBefore(
                        dayjs(period.startDate)
                      )
                    ) {
                      if (cr.grade) {
                        matchingRate = rates.filter(rate => {
                          return (
                            rate.periodId === period.periodId &&
                            rate.gradeId === cr.grade.id
                          )
                        })[0].rate
                      } else {
                        matchingRate = rates.filter(rate => {
                          return (
                            rate.periodId === period.periodId &&
                            rate.gradeId === cr.gradeId
                          )
                        })[0].rate
                      }
                    }
                  }
                  if (matchingRate === undefined) {
                    matchingRate = 0
                  }
                  let gradeMonthRevenue =
                    gradeMonthHourValue * matchingRate * (cr.recoveryRate / 100)
                  monthTotal += gradeMonthRevenue
                })
              }
            })
            phaseTotal += monthTotal
          }
          pricingValue += phaseTotal
        } else {
          let phaseValue = 0
          getCostRatios(costRatioList, cte).forEach(cr => {
            const ratio = cr.ratioValue
            const gradeHourValue = (cte.hourValue / 100) * ratio
            let rate = rates.filter(
              r => r.gradeId === cr.grade?.id || r.gradeId === cr.gradeId
            )[0]
            //catch issue with naming of snapshots vs live data
            if (rate?.rateValue) {
              rate = rate.rateValue
            } else if (rate?.rate) {
              rate = rate.rate
            } else {
              rate = 0
            }
            const gradeTotalRevenue =
              gradeHourValue * rate * (cr.recoveryRate / 100)
            phaseValue += gradeTotalRevenue
            //phaseRow[0].gradeRows[index][0].crTotalRevenue = gradeTotalRevenue
          })
          pricingValue += phaseValue
        }
      } else if (pricing.type === 1) {
        // fixed fee so we split the fixedd fee into an even value for each phase
        // so it can be totalled back to its original amount for the pricing row
        let phaseValue = pricing.value / currentCTEList.length
        pricingValue += phaseValue
      } else {
        // no fee so we just return
        pricingValue += 0
      }
    })
    if (
      pricing.type === 0 &&
      pricing.cap === true &&
      pricingValue > pricing.value
    ) {
      revenueTotal += pricing.value
    } else {
      revenueTotal += pricingValue
    }
  })
  return revenueTotal
}
export const getProjectionTotalCost = (projectionData, rates, rtd) => {
  const costTimeEstimateList = projectionData.costTimeEstimateList
  const costRatioList = projectionData.costRatioList
  const pricingDTOList = projectionData.pricingDTOList
  const projectionPeriod = projectionData.period

  if (
    !projectionPeriod ||
    !pricingDTOList ||
    !costRatioList ||
    !costTimeEstimateList
  ) {
    return 0
  }
  const months =
    dayjs(projectionPeriod.endDate).diff(projectionPeriod.startDate, 'months') +
    1
  let columns = [{ title: 'dummyColumn' }]

  for (let i = 0; i < months; i++) {
    let month = dayjs(projectionPeriod.startDate).add(i, 'month')
    let name = month.format('MMM YY')
    columns.push({
      title: name,
      id: i,
      width: 75,
      fullMonth: month,
    })
  }
  let costTotal = 0
  pricingDTOList.forEach(pricing => {
    let pricingCost = 0
    let currentCTEList = []
    if (pricingDTOList.length > 1) {
      currentCTEList = costTimeEstimateList.filter(
        cte => cte.pricingId === pricing.id
      )
    } else {
      currentCTEList = costTimeEstimateList
    }
    currentCTEList.forEach(cte => {
      let phaseCost = 0
      columns.forEach(column => {
        if (column.fullMonth) {
          getCostRatios(costRatioList, cte).forEach(cr => {
            const ratio = cr.ratioValue
            const gradeHourValue = ((cte.hourValue / 100) * ratio) / months
            let rate
            let breakEvenRates = rates.filter(
              r => r.gradeId === cr.grade?.id || r.gradeId === cr.gradeId
            )[0]?.breakEvenRates
            if (breakEvenRates) {
              rate = getBreakevenForMonth(breakEvenRates, column.fullMonth)
            }
            if (rate === undefined) {
              if (breakEvenRates) {
                breakEvenRates.sort((a, b) => {
                  return new Date(a.startDate) - new Date(b.startDate)
                })
                rate = breakEvenRates[0] ? breakEvenRates[0].rate : 0 //this is not good temp fix
              } else {
                rate = 0
              }
            }
            const gradeTotalCost = gradeHourValue * rate
            phaseCost += gradeTotalCost
          })
        }
      })
      pricingCost += phaseCost
    })

    costTotal += pricingCost
  })
  return parseInt(costTotal.toFixed(0))
}

export const getRevenueTableData = (
  projectionData,
  rates,
  rtd,
  isSnapshot,
  returnMatter
) => {
  const costTimeEstimateList = projectionData.costTimeEstimateList
  const costRatioList = projectionData.costRatioList
  const pricingDTOList = projectionData.pricingDTOList
  const projectionPeriod = projectionData.period
  const durationStart = projectionPeriod.startDate
  const durationEnd = projectionPeriod.endDate
  const months =
    dayjs(projectionPeriod.endDate).diff(projectionPeriod.startDate, 'months') +
    1
  let columns = [{ title: 'dummyColumn' }]

  for (let i = 0; i < months; i++) {
    let month = dayjs(projectionPeriod.startDate).add(i, 'month')
    let name = month.format('MMM YY')
    columns.push({
      title: name,
      id: i,
      width: 75,
      fullMonth: month.format('MMMM YYYY'),
    })
  }
  let dArray = []
  let taskDataMap = new Map()
  pricingDTOList.forEach((pricing, index) => {
    dArray.push([
      {
        id: pricing.id,
        isWorkstream: true,
        pricing: pricing,
        isPricing: true,
        uncappedTotal: 0,
        passedCap: false,
        specialType: false,
      },
      0,
    ])
    //we will need to do something here  to get the data for each workstream
    //probably a total on a task foreach
    let currentCTEList = []
    if (pricingDTOList.length > 1) {
      currentCTEList = costTimeEstimateList.filter(
        cte => cte.pricingId === pricing.id
      )
    } else {
      currentCTEList = costTimeEstimateList
    }
    let total = 0
    currentCTEList.forEach(cte => {
      //fake number, will be t.hourValue or something close
      const taskStart = dayjs(
        getTaskStart(cte.task, durationStart, isSnapshot)
      ).startOf('month')
      const taskEnd = dayjs(
        getTaskEnd(cte.task, durationEnd, isSnapshot)
      ).endOf('month')
      let months = taskEnd.diff(taskStart, 'months') + 1
      let taskDataRow = [
        {
          cteId: cte.id,
          id: cte.task.id,
          isWorkstream: false,
          pricingId: pricing.id,
          wsId: cte.task.projectId,
          task: cte.task,
          specialType: false,
          duration: 0,
          startPos: 0,
          endPos: 0,
          inactive: false,
          gradeRows: getCostRatios(costRatioList, cte).map(cr => {
            return [{ crId: cr.id, crTotalRevenue: 0 }]
          }),
        },
        0,
      ]
      if (
        (taskEnd.isBefore(durationStart) &&
          taskStart.isBefore(durationStart)) ||
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
          months = dayjs(durationEnd).diff(durationStart, 'months') + 1
        } else {
          months = endMonthPos - 1
        }
      }
      if (endMonthPos === 0) {
        endMonthPos = columns.length
        if (startMonthPos === 0) {
          months = dayjs(durationEnd).diff(durationStart, 'months') + 1
        } else {
          months = endMonthPos - startMonthPos + 1
        }
      }
      getRevenueForPhase(
        cte,
        taskDataRow,
        months,
        startMonthPos,
        endMonthPos,
        pricing,
        currentCTEList.length,
        getCostRatios(costRatioList, cte),
        columns,
        rtd,
        rates
      )
      if (taskDataRow.length === 2) {
        distributeValueAcrossMonths(
          taskDataRow,
          taskDataRow[1],
          startMonthPos,
          endMonthPos,
          columns
        )
      }

      //we set this here becasue we have handled any edge cases for where the months have values and the duration
      taskDataRow[0].duration = months
      taskDataRow[0].startPos = startMonthPos
      taskDataRow[0].endPos = endMonthPos
      total += taskDataRow[1]
      //calc the whole rows here at the start so all we have to do is splice
      taskDataMap.set(cte.task.id, taskDataRow)
    })
    for (let i = 2; i < columns.length + 1; i++) {
      let colTotal = 0
      currentCTEList.forEach(cte => {
        let taskRow = taskDataMap.get(cte.task.id)
        if (taskRow[i] !== '' && taskRow[i] !== null) {
          colTotal += taskRow[i]
        }
      })
      dArray[index].push(colTotal)
    }
    dArray[index][1] = total
    if (pricing.type === 0 && pricing.cap) {
      if (total > pricing.value) {
        dArray[index][0].uncappedTotal = total
        dArray[index][0].passedCap = true
        dArray[index][1] = pricing.value
      }
    }
  })

  if (returnMatter) {
    return dArray
  } else {
    return taskDataMap
  }
}

export const getRevenueForPhase = (
  cte,
  phaseRow,
  duration,
  startMonth,
  endMonth,
  pricing,
  phaseCount,
  costRatioList,
  columns,
  rtd,
  rates
) => {
  //will need to wrap this in isEvenDistribution check
  if (pricing.type === 0) {
    if (rtd.periods.length > 1) {
      let monthHours = []
      const remainder = cte.hourValue % duration
      for (let i = 2; i < columns.length + 1; i++) {
        if (phaseRow[0].inactive) {
          monthHours.push('')
        } else if (i < startMonth || i > endMonth) {
          monthHours.push('')
        } else {
          const valueNoRemainder = Math.floor(cte.hourValue / duration)
          const monthRemainderValue = Math.ceil(remainder / duration)
          if (i >= duration + 2 - remainder && remainder > 0) {
            monthHours.push(valueNoRemainder + monthRemainderValue)
          } else {
            monthHours.push(valueNoRemainder)
          }
        }
      }
      for (let i = 1; i < columns.length; i++) {
        //figure out rate for each month
        let monthTotal = 0
        costRatioList.forEach((cr, index) => {
          if (monthHours[i] === '') {
            monthTotal += 0
            phaseRow[0].gradeRows[index][0].crTotalRevenue += 0
            phaseRow[0].gradeRows[index].push(0)
          } else {
            const ratio = cr.ratioValue
            const gradeMonthHourValue = (monthHours[i - 1] / 100) * ratio //we  need to multiply this by the grades rate
            rtd.periods.forEach((period, periodIndex) => {
              let matchingRate = null
              if (!period.endDate) {
                if (
                  dayjs(columns[i].fullMonth) > dayjs(period.startDate) ||
                  dayjs(columns[i].fullMonth).isSame(
                    dayjs(period.startDate),
                    'month'
                  )
                ) {
                  if (cr.grade) {
                    matchingRate = rates.filter(rate => {
                      return (
                        rate.periodId === period.periodId &&
                        rate.gradeId === cr.grade.id
                      )
                    })[0]
                    matchingRate.rate
                      ? (matchingRate = matchingRate.rate)
                      : (matchingRate = matchingRate.rateValue)
                  } else {
                    matchingRate = rates.filter(rate => {
                      return (
                        rate.periodId === period.periodId &&
                        rate.gradeId === cr.gradeId
                      )
                    })[0]
                    matchingRate?.rate
                      ? (matchingRate = matchingRate?.rate)
                      : (matchingRate = matchingRate?.rateValue)
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
                  matchingRate = rates.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.grade.id
                    )
                  })[0]
                  matchingRate.rate
                    ? (matchingRate = matchingRate.rate)
                    : (matchingRate = matchingRate.rateValue)
                } else {
                  matchingRate = rates.filter(rate => {
                    return (
                      rate.periodId === period.periodId &&
                      rate.gradeId === cr.gradeId
                    )
                  })[0]
                  matchingRate.rate
                    ? (matchingRate = matchingRate.rate)
                    : (matchingRate = matchingRate.rateValue)
                }
              }
              if (matchingRate === null) {
                if (
                  periodIndex === 0 &&
                  dayjs(columns[i].fullMonth).isBefore(dayjs(period.startDate))
                ) {
                  if (cr.grade) {
                    matchingRate = rates.filter(rate => {
                      return (
                        rate.periodId === period.periodId &&
                        rate.gradeId === cr.grade.id
                      )
                    })[0]
                    matchingRate.rate
                      ? (matchingRate = matchingRate.rate)
                      : (matchingRate = matchingRate.rateValue)
                  } else {
                    matchingRate = rates.filter(rate => {
                      return (
                        rate.periodId === period.periodId &&
                        rate.gradeId === cr.gradeId
                      )
                    })[0]
                    matchingRate.rate
                      ? (matchingRate = matchingRate.rate)
                      : (matchingRate = matchingRate.rateValue)
                  }
                }
              }
              if (matchingRate === undefined) {
                matchingRate = 0
              }
              let gradeMonthRevenue =
                gradeMonthHourValue * matchingRate * (cr.recoveryRate / 100)
              if (matchingRate !== null) {
                phaseRow[0].gradeRows[index][0].crTotalRevenue +=
                  gradeMonthRevenue
                phaseRow[0].gradeRows[index].push(gradeMonthRevenue)
              }
              monthTotal += gradeMonthRevenue
            })
          }
        })
        phaseRow[1] += monthTotal
        phaseRow.push(monthTotal === 0 ? '' : monthTotal)
      }
    } else {
      let phaseValue = 0
      costRatioList.forEach((cr, index) => {
        const ratio = cr.ratioValue
        const gradeHourValue = (cte.hourValue / 100) * ratio
        let rate = rates.filter(
          r => r.gradeId === cr.grade?.id || r.gradeId === cr.gradeId
        )[0]
        rate.rate ? (rate = rate.rate) : (rate = rate.rateValue)
        if (rate === undefined) {
          rate = 0
        }
        const gradeTotalRevenue =
          gradeHourValue * rate * (cr.recoveryRate / 100)
        phaseValue += gradeTotalRevenue
        phaseRow[0].gradeRows[index][0].crTotalRevenue = gradeTotalRevenue
      })
      phaseRow[1] = phaseValue
    }
  } else if (pricing.type === 1) {
    // fixed fee so we split the fixedd fee into an even value for each phase
    // so it can be totalled back to its original amount for the pricing row
    let phaseValue = pricing.value / phaseCount
    phaseRow[1] = phaseValue
  } else {
    // no fee so we just return
    return
  }
}

export const getTaskStart = (task, durationStart, isSnapshot) => {
  let startDate
  if (isSnapshot) {
    if (task.startDate === null || task.startDate === undefined) {
      startDate = durationStart
    } else {
      startDate = new Date(task.startDate)
    }
  } else {
    startDate = task.startDate ? new Date(task.startDate) : null
  }
  if (startDate === null || startDate === undefined) {
    startDate = durationStart
  }
  return startDate
}

export const getTaskEnd = (task, durationEnd, isSnapshot) => {
  let endDate
  if (isSnapshot) {
    if (task.endDate === null || task.endDate === undefined) {
      endDate = durationEnd
    } else {
      endDate = dayjs(task.endDate).subtract(1, 'hour').toDate()
    }
  } else {
    endDate = task.endDate
      ? dayjs(task.endDate).subtract(1, 'hour').toDate()
      : null
  }
  if (endDate === null || endDate === undefined) {
    endDate = durationEnd
  }
  return endDate
}

export const getGrossProfitMargin = (totalRevenue, totalCost) => {
  let grossProfit = totalRevenue - totalCost
  if (totalRevenue === 0 || grossProfit === 0) {
    return 0
  } else {
    let profitMargin = (grossProfit / totalRevenue) * 100
    return profitMargin
  }
}

export const getTotalProjectionHours = taskList => {
  let totalHours = 0
  taskList.forEach(task => {
    totalHours += task.hourValue
  })
  return totalHours
}

export const filterValidTasks = (taskList, periodStart, periodEnd) => {
  let filteredList = []
  let initialList = []
  if (taskList[0] && taskList[0].status) {
    initialList = taskList.filter(
      task => task.status !== TASK_STATUS.NOT_REQUIRED
    )
  }
  if (taskList[0] && taskList[0].level) {
    initialList = initialList.filter(task => task.level === 1)
  }
  initialList.forEach(task => {
    let startDate =
      task.status === TASK_STATUS.NOT_STARTED
        ? task.plannedStartDate?.replace('Z', '')
        : task.actualStartDate?.replace('Z', '')
    let endDate =
      task.status === TASK_STATUS.DONE
        ? task.actualEndDate?.replace('Z', '')
        : task.plannedEndDate?.replace('Z', '')
    //if atleast one of the dates exist
    if (startDate !== undefined || endDate !== undefined) {
      startDate = startDate ? dayjs(startDate).startOf('d') : undefined
      endDate = endDate ? dayjs(endDate).startOf('d') : undefined

      let durationStart = dayjs(periodStart).startOf('d')
      let durationEnd = dayjs(periodEnd).endOf('d')
      if (
        (endDate >= durationEnd && startDate <= durationStart) ||
        (startDate === undefined && endDate === undefined)
      ) {
        filteredList.push(task)
      } else if (endDate < durationStart || startDate > durationEnd) {
        return
      }
      //this could be tidied up
      else if (
        (startDate >= durationStart && endDate === undefined) ||
        (endDate > durationEnd && startDate === undefined) ||
        (endDate <= durationEnd &&
          endDate >= durationStart &&
          startDate === undefined) ||
        (startDate < durationStart && endDate < durationEnd) ||
        (startDate >= durationStart && endDate <= durationEnd) ||
        (startDate < durationStart && endDate === undefined) ||
        (startDate < durationEnd && endDate > durationEnd)
      ) {
        filteredList.push(task)
      }
    } else if (startDate === undefined && endDate === undefined) {
      filteredList.push(task)
    }
  })
  return filteredList
}

export const formatLiveTasks = liveCteList => {
  let formattedList = []
  liveCteList.forEach(cte => {
    if (!cte.task.startDate) {
      cte.task.startDate = null
    } else {
      cte.task.startDate = dayjs(cte.task.startDate).valueOf()
    }
    if (!cte.task.endDate) {
      cte.task.endDate = null
    } else {
      cte.task.endDate = dayjs(cte.task.endDate).valueOf()
    }
    formattedList.push(cte)
  })
  return formattedList
}

export const convertCteDates = cteList => {
  let formattedCteList = []
  cteList.forEach(cte => {
    let x = cte
    if (x.task.startDate) {
      let d = new Date(x.task.startDate).setSeconds(0, 0)
      x.task.startDate = d
    }

    if (x.task.endDate) {
      let d = new Date(x.task.endDate).setSeconds(0, 0)
      x.task.endDate = d
    }
    formattedCteList.push(x)
  })
  return cteList
}

// Counts assumptions that have degraded (moved to at-risk or not-met) relative
// to the snapshot. Only transitions *into* a flagged status count, matching the
// projection change-notification AC. Matched by assumption id.
export const countDegradedAssumptions = (
  snapshotAssumptions,
  liveAssumptions
) => {
  if (!Array.isArray(snapshotAssumptions) || !Array.isArray(liveAssumptions)) {
    return 0
  }
  const snapshotStatusById = new Map(
    snapshotAssumptions.map(a => [a.id, a.status])
  )
  return liveAssumptions.reduce((count, live) => {
    if (!FLAGGED_ASSUMPTION_STATUSES.includes(live.status)) return count
    if (!snapshotStatusById.has(live.id)) return count
    // Only count transitions *into* a flagged status: if the snapshot was
    // already flagged, a flagged→flagged change (e.g. not-met→at-risk, an
    // improvement) is not a new degradation.
    const snapshotStatus = snapshotStatusById.get(live.id)
    if (FLAGGED_ASSUMPTION_STATUSES.includes(snapshotStatus)) return count
    return count + 1
  }, 0)
}

export const parseDiff = (diffArray, snapshotCteList) => {
  let formattedDiff = [
    { deletedCount: 0, alteredCount: 0, newCount: 0, total: 0 },
  ]
  if (diffArray !== undefined && snapshotCteList.length > 0) {
    diffArray.forEach((item, index) => {
      if (item[0] === '-') {
        //item deleted
        formattedDiff[0].deletedCount += 1
        formattedDiff[0].total += 1
        formattedDiff.push({
          cteId: item[1].id,
          taskId: item[1].task.id,
          removed: true,
        })
      } else if (item[0] === '~') {
        //subItem added
        if (item[1].task) {
          formattedDiff[0].alteredCount += 1
          formattedDiff[0].total += 1
          formattedDiff.push({
            cteId: snapshotCteList[index].id,
            taskId: snapshotCteList[index].task.id,
            task: item[1].task,
          })
        }
      } else if (item[0] === '+') {
        //itemAdded
        formattedDiff[0].newCount += 1
        formattedDiff[0].total += 1
        formattedDiff.push({
          newCte: item[1],
          cteId: item[1].id,
          taskId: item[1].task.id,
          new: true,
        })
      }
    })
  }

  return formattedDiff
}
