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
import {
  calculateMonthHoursForPhase,
  getCostRatios,
  parseSnapshot,
  setupColumns,
  tableTheme,
  updatePricingDataRowsHelper,
  sortTasksByIndex,
  sortByStatus,
  sortByWorkstream,
  distributeValueAcrossMonths,
} from './MatterCostsTableHelper'
import { getTaskStart, getTaskEnd } from '../outcomes/revenueHelper'
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
  },
  glideContainer: {
    borderRadius: '0 5px 5px 0',
  },
}))

const RevenueTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const {
    durationStart,
    durationEnd,
    setTableLoaded,
    rtd,
    isSnapshot,
    rates,
    matterId,
    costsSnapshot,
  } = props
  const pricingDTOList = props.pricingDTOList
  const decimalPlaces = 1
  const [data, setData] = useState([
    [600, 100, 100, 100, 100, 100, 100, '', '', '', '', '', ''],
  ])

  const columns = setupColumns(
    isSnapshot,
    props.data,
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
      setCostRatioList(props.data.costRatioList)
      setCostTimeEstimateList(
        props.data.costTimeEstimateList
          .sort(sortTasksByIndex)
          .sort(sortByStatus)
          .sort(sortByWorkstream)
      )
      dispatch(fetchProjects(matterId, false, false, true)).then(res => {
        setWorkstreams(res.projects.sort((a, b) => a.id - b.id))
      })
    }
  }, []) //eslint-disable-line
  const getRevenueForPhase = (
    cte,
    phaseRow,
    duration,
    startMonth,
    endMonth,
    pricing,
    phaseCount
  ) => {
    if (!cte.hourDistribution) {
      if (pricing.type === 0) {
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
          getCostRatios(costRatioList, cte).forEach((cr, index) => {
            if (monthHours[i - 1] === '') {
              monthTotal += 0
              phaseRow[0].gradeRows[index][0].crTotalRevenue += 0
              phaseRow[0].gradeRows[index].push(0)
            } else {
              const ratio = cr.ratioValue
              const gradeMonthHourValue = (monthHours[i - 1] / 100) * ratio //we  need to multiply this by the grades rate
              props.data.rtd.periods.forEach((period, periodIndex) => {
                if (period.startDate === null) {
                  period.startDate = undefined
                }
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
                  let monthData = {
                    revenue: gradeMonthRevenue,
                    hours: gradeMonthHourValue,
                    rate: matchingRate,
                    recovery: cr.recoveryRate,
                  }
                  phaseRow[0].gradeRows[index].push(monthData)
                }
                monthTotal += gradeMonthRevenue
              })
            }
          })
          phaseRow[1] += monthTotal
          phaseRow.push(monthTotal === 0 ? '' : monthTotal)
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
  }

  const getInitialRows = () => {
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
        getRevenueForPhase(
          cte,
          taskDataRow,
          months,
          startMonthPos,
          endMonthPos,
          pricing,
          currentCTEList.length
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
    let matterRow = [{ id: 9999, isWorkstream: true }]
    for (let i = 0; i < dArray.length; i++) {
      columns.forEach((col, j) => {
        if (i === 0) {
          matterRow.push(dArray[i][j + 1])
        } else {
          matterRow[j + 1] += dArray[i][j + 1]
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
      setData(getInitialRows())
      setShowSpinner(false)
      setTableLoaded(true)
    }
    //eslint-disable-next-line
  }, [workstreams])

  useEffect(() => {
    if (workstreams && showSpinner === false && data && pricingDTOList)
      pricingDTOList.forEach(pricing => {
        updatePricingDataRows(pricing, true)
      })
    //eslint-disable-next-line
  }, [data, showSpinner])

  const generateTooltip = params => {
    if (params.kind === 'cell') {
      if (data[params.location[1]][0].isGradeRow && params.location[0] > 0) {
        let x = data[params.location[1]][params.location[0] + 1]
        let curr = rtd.rateTableDetails.currency.substr(0, 3)
        if (x !== '') {
          setTooltip({
            title:
              +x?.hours?.toFixed(1) +
              ' hours * ' +
              curr +
              ' ' +
              x?.rate +
              ' * recovery rate (' +
              x?.recovery +
              '%) = ' +
              curr +
              ' ' +
              x?.revenue?.toFixed(1),
            text: '',
            bounds: params.bounds,
          })
          setShowTooltip(true)
        } else {
          setShowTooltip(false)
        }
      } else {
        if (
          data[params.location[1]][params.location[0] + 1] !== '' &&
          data[params.location[1]][params.location[0] + 1] !== undefined &&
          data[params.location[1]][params.location[0] + 2] !== undefined
        ) {
          if (data[params.location[1]][0].isGradeRow) {
            setTooltip({
              title: t('common.total'),
              text: '',
              bounds: params.bounds,
            })
          } else {
            setTooltip({
              title: t('matterCosts.expandTableTooltip'),
              text: '',
              bounds: params.bounds,
            })
          }
          setShowTooltip(true)
        } else {
          setShowTooltip(false)
        }
      }
    } else {
      setTooltip({
        title: ``,
        text: '',
        bounds: null,
      })
      setShowTooltip(false)
    }
  }

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      let d = null
      let dataRow = data[row]
      if (dataRow === undefined || dataRow === null) {
        if (col === 0) {
          d = [{ isWorkstream: false, isEmpty: true, specialType: false }]
        } else {
          d = 0
        }
        dataRow = d
      } else {
        if (dataRow[col + 1]?.revenue || dataRow[col + 1]?.revenue === 0) {
          d = dataRow[col + 1].revenue
        } else {
          d = dataRow[col + 1]
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
          }
        }
        if (!dataRow[col]?.task && dataRow[col]?.isWorkstream) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: parseFloat(d)
              .toFixed(1)
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
            },
          }
        } else if (!dataRow[col]?.task) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: d?.isEmpty
              ? ''
              : parseFloat(d)
                  ?.toFixed(1)
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d?.toString(),
            themeOverride: {
              bgCell: '#E1DED833',
              baseFontStyle: '700 12px',
            },
          }
        } else {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: parseFloat(d)
              .toFixed(1)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
            themeOverride: {
              bgCell: '#FCF8E8',
              baseFontStyle: '700 12px',
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
            displayData: 'Inactive in period',
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
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  : d
                      .toFixed(1)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : d
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          data: d.toString(),
          themeOverride:
            dataRow[0].isWorkstream && row > 0
              ? { bgCell: '#C8D4B4', borderColor: '#FFFFFF' }
              : dataRow[0].isWorkstream === false && d !== '' && dataRow[0].task
                ? {
                    bgCell: '#FCF8E8',
                    borderColor: '#DBD9B5',
                    horizontalBorderColor: undefined,
                  }
                : dataRow[0].isWorkstream === false &&
                    d !== '' &&
                    !dataRow[0].task
                  ? {
                      bgCell: '#E1DED833',
                    }
                  : dataRow[0].isWorkstream === false
                    ? {
                        bgCell: '#E1DED8',
                      }
                    : undefined,
        }
      }
    },
    //eslint-disable-next-line
    [data, decimalPlaces]
  )

  const getBreakdownMessage = pricingType => {
    switch (pricingType) {
      case 1:
        return 'Fees are not broken down by phase for fixed price segments.'
      case 2:
        return 'As there is no fee, there is no breakdown'
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
        data,
        pricing,
        costTimeEstimateList,
        getBreakdownMessage,
        taskData,
        setData,
        setNumRows,
        pricingDTOList
      )
    }, //eslint-disable-next-line
    [getContent, data, numRows]
  )

  const updateTaskDataRows = React.useCallback(
    (task, toggle, cte) => {
      //push the rows into the data array for this WS
      //but we need to know the current position of each workstreams 'header row' in order to add/remove its expanded rows
      //because if multiple are expanded they will be moved in the data array
      if (toggle === true) {
        let d = data
        const startPos = data.indexOf(data.find(x => x[0].id === task.id))
        const taskData = data[startPos]
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
              gradeData.push(gradeDataRow[0].crTotalRevenue)
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
        setData(d)
        setNumRows(d.length)
      } else {
        let d = data
        const startPos = data.indexOf(data.find(x => x[0].id === task.id))
        d.splice(startPos + 1, getCostRatios(costRatioList, cte).length)
        setData(d)
        setNumRows(d.length)
      }
    }, //eslint-disable-next-line
    [getContent, data, numRows]
  )

  const getRowThemeOverride = React.useCallback(
    row => {
      let dataRow = data[row] ? data[row] : null

      if (dataRow) {
        if (row === 0) {
          return { bgCell: '#B3B8DB', borderColor: '#FFFFFF' }
        }
        return dataRow[0]?.isWorkstream === true && !dataRow[0].passedCap
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
    [data]
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
          <div style={{ marginBottom: '8px' }}>
            <Typography>{t('matterResource.revenueSubtitle1')}</Typography>
            <Typography>{t('matterResource.revenueSubtitle2')}</Typography>
          </div>
          <div className={classes.header}>
            <Paper>
              <div
                style={{
                  height: '37px',
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                  display: 'flex',
                }}
              >
                <Typography
                  style={{
                    marginLeft: 'auto',
                    marginRight: '32px',
                    marginTop: '8px',
                  }}
                >
                  Team %
                </Typography>
              </div>
              <RevenueTableRow
                matter={matter}
                isMatterRow={true}
                disableInteractions={true}
                fullPeriod={props.fullPeriod}
                diffArray={props.diffArray}
                assumptionList={props.assumptions || props.data?.assumptionList}
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
                    revenueData={data.find(
                      row => row[0].id === p.id && row[0].isPricing
                    )}
                    updatePricingDataRows={updatePricingDataRows}
                    updateTaskDataRows={updateTaskDataRows}
                    table={1}
                    fullPeriod={props.fullPeriod}
                    diffArray={props.diffArray}
                    assumptionList={
                      props.assumptions || props.data?.assumptionList
                    }
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
                  if (data[r] && data[r][0]?.specialType) {
                    return data[r][0].rowHeight
                  }
                  if (
                    data[r] &&
                    (data[r][0]?.isWorkstream || data[r][0]?.task)
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
                style={{
                  width: 'fit-content',
                  position: 'fixed',
                  top: tooltip?.bounds?.y + tooltip?.bounds?.height,
                  left: tooltip?.bounds?.x,
                }}
              >
                <Paper style={{ color: 'white', backgroundColor: 'black' }}>
                  <Typography
                    style={{
                      fontSize: '12px',
                      marginLeft: '6px',
                      marginRight: '6px',
                      marginTop: '6px',
                    }}
                  >
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
export default RevenueTable
