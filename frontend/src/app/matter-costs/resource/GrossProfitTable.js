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

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Typography, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import '@glideapps/glide-data-grid/dist/index.css'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { useTranslation } from 'react-i18next'
import RevenueTableRow from './RevenueTableRow'
import { getTaskStart, getTaskEnd } from '../outcomes/revenueHelper'
import {
  calculateMonthHoursForPhase,
  parseSnapshot,
  setupColumns,
  tableTheme,
  updatePricingDataRowsHelper,
  getBreakevenForMonth,
  getCostRatios,
  sortTasksByIndex,
  sortByStatus,
  sortByWorkstream,
} from './MatterCostsTableHelper'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '40% 60% ',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    //backgroundColor: rawColours.primary.black[200],
  },
  glideContainer: {
    borderRadius: '0 5px 5px 0',
  },
  profitSubtitleRow: {
    marginBottom: theme.spacing(1),
  },
  teamPercentHeader: {
    height: '37px',
    backgroundColor: rawColours.primary.black[200],
    color: rawColours.primary.grey.main,
    display: 'flex',
  },
  teamPercentLabel: {
    marginLeft: 'auto',
    marginRight: theme.spacing(4),
    marginTop: theme.spacing(1),
  },
  tooltipContainer: {
    width: 'fit-content',
    position: 'fixed',
  },
  tooltipPaper: {
    color: 'white',
    backgroundColor: 'black',
  },
  tooltipText: {
    fontSize: '12px',
    marginLeft: theme.spacing(0.75),
    marginRight: theme.spacing(0.75),
    marginTop: theme.spacing(0.75),
  },
}))

const GrossProfitTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const {
    durationStart,
    durationEnd,
    setTableLoaded,
    isSnapshot,
    pricingDTOList,
    rates,
    rtd,
    matterId,
    costsSnapshot,
    data,
  } = props

  const decimalPlaces = 1
  const [tableData, setTableData] = useState([
    [600, 100, 100, 100, 100, 100, 100, '', '', '', '', '', ''],
  ])

  const columns = setupColumns(
    isSnapshot,
    data,
    rtd,
    durationStart,
    durationEnd
  )
  const [numRows, setNumRows] = useState(0)
  const [showSpinner, setShowSpinner] = useState(false)
  const [workstreams, setWorkstreams] = useState()
  const [taskData, setTaskData] = useState()
  const matter = useSelector(state => state.matterDetails.matter)
  const [costTimeEstimateList, setCostTimeEstimateList] = useState([])
  const [costRatioList, setCostRatioList] = useState([])
  const sortType = 1
  const [tooltip, setTooltip] = useState()
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setShowSpinner(true)
    setTableLoaded(false)
    if (costsSnapshot) {
      parseSnapshot(
        setCostRatioList,
        costsSnapshot,
        setCostTimeEstimateList,
        setWorkstreams
      )
    } else {
      setCostRatioList(data.costRatioList)
      setCostTimeEstimateList(
        data.costTimeEstimateList
          .sort(sortTasksByIndex)
          .sort(sortByStatus)
          .sort(sortByWorkstream)
      )
      dispatch(fetchProjects(matterId, false, false, true)).then(res => {
        if (res.projects.length === 1) {
        }
        setWorkstreams(res.projects.sort((a, b) => a.id - b.id))
      })
    }
  }, []) //eslint-disable-line
  const getProfitForPhase = (
    cte,
    phaseRow,
    duration,
    startMonth,
    endMonth,
    pricing,
    phaseCount
  ) => {
    //will need to wrap this in isEvenDistribution check
    if (!cte.hourDistribution) {
      let monthHours = calculateMonthHoursForPhase(
        cte,
        duration,
        columns,
        startMonth,
        endMonth,
        phaseRow
      )
      for (let i = 1; i < columns.length; i++) {
        //figure out rate for each month
        let monthTotal = 0
        let monthRevenue = 0
        let monthCost = 0
        getCostRatios(costRatioList, cte).forEach((cr, index) => {
          if (monthHours[i - 1] === '') {
            monthTotal += 0
            phaseRow[0].gradeRows[index][0].crTotalRevenue += 0
            phaseRow[0].gradeRows[index][0].crTotalCost += 0
            phaseRow[0].gradeRows[index][0].crTotalProfit += 0
            phaseRow[0].gradeRows[index].push({
              profit: ' ',
              revenue: 0,
              cost: 0,
            })
            phaseRow[0].revenue += 0
          } else {
            const ratio = cr.ratioValue
            const gradeMonthHourValue = (monthHours[i - 1] / 100) * ratio //we  need to multiply this by the grades rate
            rtd.periods.forEach((period, periodIndex) => {
              let matchingRate = null
              let breakEvenRate = null
              if (!period.startDate && !period.endDate) {
                if (cr.grade) {
                  matchingRate = rates.filter(rate => {
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
                  matchingRate = rates.filter(rate => {
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
                    matchingRate = rates.filter(rate => {
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
                    matchingRate = rates.filter(rate => {
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
              } else if (!period.endDate && period.startDate) {
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
                    breakEvenRate = getBreakevenForMonth(
                      matchingRate.breakEvenRates,
                      columns[i].fullMonth
                    )
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
                    breakEvenRate = getBreakevenForMonth(
                      matchingRate.breakEvenRates,
                      columns[i].fullMonth
                    )
                    matchingRate.rate
                      ? (matchingRate = matchingRate.rate)
                      : (matchingRate = matchingRate.rateValue)
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
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
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
                  breakEvenRate = getBreakevenForMonth(
                    matchingRate.breakEvenRates,
                    columns[i].fullMonth
                  )
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
                    breakEvenRate = getBreakevenForMonth(
                      matchingRate.breakEvenRates,
                      columns[i].fullMonth
                    )
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
                    breakEvenRate = getBreakevenForMonth(
                      matchingRate.breakEvenRates,
                      columns[i].fullMonth
                    )
                    matchingRate.rate
                      ? (matchingRate = matchingRate.rate)
                      : (matchingRate = matchingRate.rateValue)
                  }
                }
              }
              if (matchingRate === undefined) {
                matchingRate = 0
              }
              if (breakEvenRate === undefined) {
                breakEvenRate = 0
              }
              let gradeMonthRevenue, gradeMonthCost
              if (pricing.type === 0) {
                gradeMonthRevenue =
                  gradeMonthHourValue * matchingRate * (cr.recoveryRate / 100)
                gradeMonthCost = gradeMonthHourValue * breakEvenRate
              } else if (pricing.type === 1) {
                let gradeValue =
                  ((pricing.value / phaseCount) * (ratio / 100)) /
                    columns.length -
                  1
                gradeMonthRevenue = gradeValue
                gradeMonthCost = gradeMonthHourValue * breakEvenRate
              } else {
                gradeMonthRevenue = 0
                gradeMonthCost = gradeMonthHourValue * breakEvenRate
              }
              if (matchingRate !== null) {
                phaseRow[0].gradeRows[index][0].crTotalRevenue +=
                  gradeMonthRevenue
                phaseRow[0].gradeRows[index][0].crTotalCost += gradeMonthCost
                phaseRow[0].gradeRows[index][0].crTotalProfit +=
                  gradeMonthRevenue - gradeMonthCost
                let monthData = {
                  profit: gradeMonthRevenue - gradeMonthCost,
                  revenue: gradeMonthRevenue,
                  cost: gradeMonthCost,
                }
                phaseRow[0].gradeRows[index].push(monthData)
              }
              phaseRow[0].revenue += gradeMonthRevenue
              phaseRow[0].cost += gradeMonthCost
              monthRevenue += gradeMonthRevenue
              monthCost += gradeMonthCost
              monthTotal += gradeMonthRevenue - gradeMonthCost
            })
          }
        })
        if (pricing.type === 1) {
          phaseRow[1].profit +=
            pricing.value / phaseCount / (columns.length - 1) - monthCost
          phaseRow[1].cost += monthCost
          phaseRow[1].revenue +=
            pricing.value / phaseCount / (columns.length - 1)
          let phaseMonthData = {
            profit:
              pricing.value / phaseCount / (columns.length - 1) - monthCost,
            revenue: pricing.value / phaseCount / (columns.length - 1),
            cost: monthCost,
          }
          phaseRow.push(phaseMonthData)
        } else if (pricing.type === 2) {
          phaseRow[1].profit += 0 - monthCost
          phaseRow[1].cost += monthCost
          phaseRow[1].revenue = 0
          let phaseMonthData = {
            profit: 0 - monthCost,
            revenue: 0,
            cost: monthCost,
          }
          phaseRow.push(phaseMonthData)
        } else {
          phaseRow[1].revenue += monthRevenue
          phaseRow[1].cost += monthCost
          phaseRow[1].profit += monthTotal
          let monthProfit
          if (monthHours[i - 1] === '') {
            monthProfit = ' '
          } else {
            monthProfit = monthRevenue - monthCost
          }
          let phaseMonthData = {
            profit: monthProfit,
            revenue: monthRevenue,
            cost: monthCost,
          }
          phaseRow.push(phaseMonthData)
        }
      }
    }
  }

  const getInitialRows = () => {
    let dArray = []
    let taskDataMap = new Map()
    pricingDTOList.forEach((pricing, index) => {
      let pricingRevenue = 0
      let pricingCost = 0
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
        { profit: 0, revenue: 0, cost: 0 },
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
            revenue: 0,
            cost: 0,
            gradeRows: getCostRatios(costRatioList, cte).map(cr => {
              return [
                {
                  crId: cr.id,
                  crTotalRevenue: 0,
                  crTotalCost: 0,
                  crTotalProfit: 0,
                },
              ]
            }),
          },
          { profit: 0, revenue: 0, cost: 0 },
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
        getProfitForPhase(
          cte,
          taskDataRow,
          months,
          startMonthPos,
          endMonthPos,
          pricing,
          currentCTEList.length
        )
        if (taskDataRow.length === 2) {
          const remainder = taskDataRow[1] % months
          for (let i = 2; i < columns.length + 1; i++) {
            if (taskDataRow[0].inactive) {
              taskDataRow.push('')
            } else if (i < startMonthPos || i > endMonthPos) {
              taskDataRow.push('')
            } else {
              const valueNoRemainder = Math.floor(taskDataRow[1] / months)
              const monthRemainderValue = Math.ceil(remainder / months)
              if (i >= months + 2 - remainder && remainder > 0) {
                taskDataRow.push(valueNoRemainder + monthRemainderValue)
              } else {
                taskDataRow.push(valueNoRemainder)
              }
            }
          }
        }

        //we set this here becasue we have handled any edge cases for where the months have values and the duration
        taskDataRow[0].duration = months
        taskDataRow[0].startPos = startMonthPos
        taskDataRow[0].endPos = endMonthPos
        pricingRevenue += taskDataRow[0].revenue
        pricingCost += taskDataRow[0].cost
        total += taskDataRow[1].profit
        //calc the whole rows here at the start so all we have to do is splice
        taskDataMap.set(cte.task.id, taskDataRow)
      })
      for (let i = 2; i < columns.length + 1; i++) {
        let colTotal = {
          profit: 0,
          revenue: 0,
          cost: 0,
        }
        currentCTEList.forEach(cte => {
          let taskRow = taskDataMap.get(cte.task.id)
          if (taskRow[i] !== '' && taskRow[i] !== null) {
            let profit = taskRow[i].profit === ' ' ? 0 : taskRow[i].profit
            colTotal.profit += profit
            colTotal.revenue += taskRow[i].revenue
            colTotal.cost += taskRow[i].cost
          }
        })
        dArray[index].push(colTotal)
        dArray[index][1].cost += colTotal.cost
        dArray[index][1].revenue += colTotal.revenue
      }
      if (pricing.type === 0 && pricing.cap) {
        if (pricingRevenue > pricing.value) {
          dArray[index][0].uncappedTotal = total
          dArray[index][0].passedCap = true
          dArray[index][1].profit = pricing.value - pricingCost
        } else {
          dArray[index][1].profit = total
        }
      } else {
        dArray[index][1].profit = total
      }
    })
    let matterRow = [{ id: 9999, isWorkstream: true }]
    for (let i = 0; i < dArray.length; i++) {
      columns.forEach((col, j) => {
        if (i === 0) {
          matterRow.push({
            profit: parseFloat(dArray[i][j + 1].profit),
            revenue: dArray[i][j + 1].revenue,
            cost: dArray[i][j + 1].cost,
          })
        } else {
          matterRow[j + 1].profit += parseFloat(dArray[i][j + 1].profit)
          matterRow[j + 1].revenue += dArray[i][j + 1].revenue
          matterRow[j + 1].cost += dArray[i][j + 1].cost
        }
      })
    }
    dArray.splice(0, 0, matterRow)
    setTaskData(taskDataMap)
    setNumRows(dArray.length)
    return dArray
  }
  useEffect(() => {
    if (pricingDTOList && costTimeEstimateList) {
      setTableData(getInitialRows())
      setShowSpinner(false)
      setTableLoaded(true)
    }
    //eslint-disable-next-line
  }, [workstreams])

  useEffect(() => {
    if (workstreams && showSpinner === false && tableData && pricingDTOList)
      pricingDTOList.forEach(pricing => {
        updatePricingDataRows(pricing, true)
      })
    //eslint-disable-next-line
  }, [tableData, showSpinner])

  const generateTooltip = params => {
    if (params.kind === 'cell') {
      let x = tableData[params.location[1]][params.location[0] + 1]
      let curr = rtd.rateTableDetails.currency.substr(0, 3)
      let profit = x?.profit || x?.profit === 0 ? x?.profit : x?.crTotalProfit
      let cost = x?.cost || x?.cost === 0 ? x?.cost : x?.crTotalCost
      let revenue =
        x?.revenue || x?.revenue === 0 ? x?.revenue : x?.crTotalRevenue
      if (x !== undefined && profit !== undefined && profit !== ' ') {
        setTooltip({
          title: t('matterResource.profitTooltip', {
            fees: revenue?.toFixed(1),
            cost: cost?.toFixed(1),
            currency: curr,
            profit: parseFloat(profit)?.toFixed(1),
          }),
          text: '',
          bounds: params.bounds,
        })
        setShowTooltip(true)
      } else {
        setShowTooltip(false)
      }
    } else {
      setShowTooltip(false)
    }
  }

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      let d = null
      let dataRow = tableData[row]
      if (dataRow === undefined || dataRow === null) {
        if (col === 0) {
          d = [{ isWorkstream: false, isEmpty: true, specialType: false }]
        } else {
          d = 0
        }
        dataRow = d
      } else {
        if (dataRow[col + 1] !== undefined) {
          if (dataRow[col + 1].profit || dataRow[col + 1].profit === 0) {
            if (dataRow[col + 1].profit === ' ') {
              d = ''
            } else {
              d = parseFloat(dataRow[col + 1].profit)
            }
          } else if (dataRow[col + 1].crTotalProfit) {
            d = dataRow[col + 1].crTotalProfit
          } else {
            d = dataRow[col + 1]
          }
        } else {
          d = 0
        }
      }
      if (col === 0 && !dataRow.specialType) {
        if (dataRow[col].specialType) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: '',
            data: '',
            themeOverride: {
              textDark: d < 0 ? 'red' : 'black',
            },
          }
        }
        if (!dataRow[col]?.task && dataRow[col]?.isWorkstream) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: parseFloat(d)
              .toFixed(decimalPlaces)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
            themeOverride: {
              bgCell:
                row === 0
                  ? '#B3B8DB'
                  : dataRow[0].passedCap
                    ? 'lightpink'
                    : '#C8D4B4',
              borderColor: '#FFFFFF',
              baseFontStyle: '700 12px',
              textDark: d < 0 ? 'red' : 'black',
            },
          }
        } else if (!dataRow[col]?.task) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: d?.isEmpty
              ? ''
              : decimalPlaces === 0
                ? Math.floor(d)?.toString()
                : parseFloat(d)
                    ?.toFixed(decimalPlaces)
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d?.toString(),
            themeOverride: {
              bgCell: '#E1DED833',
              baseFontStyle: '700 12px',
              textDark: d < 0 ? 'red' : 'black',
            },
          }
        } else {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: parseFloat(d)
              .toFixed(decimalPlaces)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
            themeOverride: {
              bgCell: '#FCF8E8',
              baseFontStyle: '700 12px',
              textDark: d < 0 ? 'red' : 'black',
            },
          }
        }
      } else {
        //covers the case of spliting data rows and state not being fast enough
        if (dataRow[0] === undefined)
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: '',
            data: '',
          }
        if (dataRow[0].specialType) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: dataRow[1],
            data: dataRow[1],
            span: [1, columns.length - 1],
          }
        }
        if (dataRow[0].inactive === true) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: t('matterResource.inactivePeriod'),
            data: dataRow[1],
            span: [1, columns.length - 1],
          }
        }
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData:
            dataRow[0] !== undefined &&
            dataRow[0].isWorkstream === false &&
            (d === 0 || d === '')
              ? d.toString()
              : !dataRow[0].isWorkstream &&
                  !dataRow[0].task &&
                  (d !== null || d !== undefined)
                ? decimalPlaces === 0
                  ? Math.floor(d)
                      .toFixed(decimalPlaces)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : d
                      .toFixed(decimalPlaces)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : d
                    .toFixed(decimalPlaces)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          data: d.toString(),
          themeOverride:
            dataRow[0].isWorkstream && row > 0
              ? {
                  bgCell: '#C8D4B4',
                  borderColor: '#FFFFFF',
                  textDark: d < 0 ? 'red' : 'black',
                }
              : dataRow[0].isWorkstream === false && d !== '' && dataRow[0].task
                ? {
                    bgCell: '#FCF8E8',
                    borderColor: '#DBD9B5',
                    horizontalBorderColor: undefined,
                    textDark: d < 0 ? 'red' : 'black',
                  }
                : dataRow[0].isWorkstream === false &&
                    d !== '' &&
                    !dataRow[0].task
                  ? {
                      bgCell: '#E1DED833',
                      textDark: d < 0 ? 'red' : 'black',
                    }
                  : dataRow[0].isWorkstream === false
                    ? {
                        bgCell: '#E1DED8',
                        textDark: d < 0 ? 'red' : 'black',
                      }
                    : {
                        textDark: d < 0 ? 'red' : 'black',
                      },
        }
      }
    },
    //eslint-disable-next-line
    [tableData, decimalPlaces]
  )

  const getBreakdownMessage = pricingType => {
    switch (pricingType) {
      case 1:
        return t('matterResource.grossProfitBreakdownFixed')
      case 2:
        return t('matterResource.grossProfitBreakdownNoFee')
      default:
        break
    }
  }

  const updatePricingDataRows = React.useCallback(
    (pricing, toggle) => {
      //push the rows into the data array for this WS
      //but we needdto know the current position of each workstreams 'header row' in order to add/remove its expanded rows
      //because if multiple are expanded they will be moved in the data array
      updatePricingDataRowsHelper(
        toggle,
        tableData,
        pricing,
        costTimeEstimateList,
        getBreakdownMessage,
        taskData,
        setTableData,
        setNumRows,
        pricingDTOList
      )
    }, //eslint-disable-next-line
    [getContent, tableData, numRows]
  )

  const updateTaskDataRows = React.useCallback(
    (task, toggle, cte) => {
      //push the rows into the data array for this WS
      //but we need to know the current position of each workstreams 'header row' in order to add/remove its expanded rows
      //because if multiple are expanded they will be moved in the data array
      if (toggle === true) {
        let d = tableData
        const startPos = tableData.indexOf(
          tableData.find(x => x[0].id === task.id)
        )
        const taskData = tableData[startPos]
        let spliceStart = startPos + 1
        getCostRatios(costRatioList, cte).forEach((crl, index) => {
          let gradeDataRow = taskData[0].gradeRows[index]
          let gradeData = []

          gradeData.push({
            id: crl.grade ? crl.grade.id : 1,
            isWorkstream: false,
            isGradeRow: true,
          })
          for (let i = 1; i < taskData.length; i++) {
            if (i === 1) {
              gradeData.push(gradeDataRow[0])
            } else {
              if (taskData[i] === '' || taskData[i] === 0) {
                gradeData.push('')
              } else {
                gradeData.push(gradeDataRow[i - 1])
              }
            }
          }
          d.splice(spliceStart, 0, gradeData)
          spliceStart += 1
        })
        setTableData(d)
        setNumRows(d.length)
      } else {
        let d = tableData
        const startPos = tableData.indexOf(
          tableData.find(x => x[0].id === task.id)
        )
        d.splice(startPos + 1, getCostRatios(costRatioList, cte).length)
        setTableData(d)
        setNumRows(d.length)
      }
    }, //eslint-disable-next-line
    [getContent, tableData, numRows]
  )

  const getRowThemeOverride = React.useCallback(
    row => {
      let dataRow = tableData[row] ? tableData[row] : null
      if (dataRow) {
        if (row === 0) {
          return { bgCell: '#B3B8DB', borderColor: '#FFFFFF' }
        }
        return dataRow[0]?.isWorkstream === true
          ? {
              bgCell: '#C8D4B4',
              borderColor: '#FFFFFF',
            }
          : {
              borderColor: '#FFFFFF',
            }
      } else {
        return undefined
      }
    },
    [tableData]
  )

  /**
   * Sctructure of table
   * fake table head with the columns
   * for each workstream we render 1 div which will be the expandable row with workstream name, team distribution diagram and glide header
   * when its expanded we render some children div rows for each task and push data into the  gliide table in same order so it lines up
   * when a task is expanded we do the same but for grades and splice in grade data into the correct postiiong in the glide data array
   */
  return (
    <div>
      {showSpinner && <BigDataSpinner size={80} />}
      {!showSpinner && workstreams && (
        <>
          <div className={classes.profitSubtitleRow}>
            <Typography>{t('matterResource.profitSubtitle')}</Typography>
          </div>
          <div className={classes.header}>
            <Paper>
              <div className={classes.teamPercentHeader}>
                <Typography className={classes.teamPercentLabel}>
                  {t('matterResource.teamPercent')}
                </Typography>
              </div>
              <RevenueTableRow
                matter={matter}
                isMatterRow={true}
                disableInteractions={true}
                fullPeriod={props.fullPeriod}
                diffArray={props.diffArray}
                assumptionList={props.assumptions || data?.assumptionList}
                matterTasks={props.matterTasks}
                isSnapshot={isSnapshot}
              />
              {pricingDTOList.map(p => {
                return (
                  <RevenueTableRow
                    matter={matter}
                    isMatterRow={false}
                    tasks={costTimeEstimateList.filter(
                      cte => cte.pricingId === p.id
                    )}
                    costRatios={costRatioList}
                    pricing={p}
                    revenueData={tableData.find(
                      row => row[0].id === p.id && row[0].isPricing
                    )}
                    updatePricingDataRows={updatePricingDataRows}
                    sortType={sortType}
                    updateTaskDataRows={updateTaskDataRows}
                    table={2}
                    fullPeriod={props.fullPeriod}
                    diffArray={props.diffArray}
                    assumptionList={props.assumptions || data?.assumptionList}
                    matterTasks={props.matterTasks}
                    isSnapshot={isSnapshot}
                  />
                )
              })}
            </Paper>
            <div className={classes.glideContainer}>
              <DataEditor
                getCellContent={getContent}
                columns={columns}
                rows={numRows}
                smoothScrollX={true}
                rowHeight={r => {
                  if (tableData[r] && tableData[r][0]?.specialType) {
                    return tableData[r][0].rowHeight
                  }
                  if (
                    tableData[r] &&
                    (tableData[r][0]?.isWorkstream || tableData[r][0]?.task)
                  ) {
                    return 80
                  } else {
                    return 42
                  }
                }}
                height={'100%'}
                freezeColumns={1}
                theme={tableTheme}
                getRowThemeOverride={getRowThemeOverride}
                onItemHovered={generateTooltip}
              />
            </div>
            {showTooltip && (
              <div
                className={classes.tooltipContainer}
                style={{
                  top: tooltip?.bounds?.y + tooltip?.bounds?.height,
                  left: tooltip?.bounds?.x,
                }}
              >
                <Paper className={classes.tooltipPaper}>
                  <Typography className={classes.tooltipText}>
                    {tooltip.title}
                  </Typography>
                </Paper>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
export default GrossProfitTable
