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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProjectionCardStandalone from './ProjectionCardStandalone'
import {
  Divider,
  FormControlLabel,
  FormGroup,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Typography,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import dayjs from 'dayjs'
import {
  CATEGORY_COLOURS,
  CATEGORY_COLOURS_GREYSCALE,
  TASK_STATUS,
} from '../../constants'
import LineChart from '../../../components/charts/LazyLineChart'
import PieChart from '../../../components/charts/LazyPieChart'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/AddCircleOutlined'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { getProjectionIdFromLocation } from '../../../components/navigation/common/location-context-helper'
import { Navigate, useLocation } from 'react-router'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import { getGrossProfitMargin, getRevenueTableData } from './revenueHelper'
import colorModifiers from '../../../theme/color-modifiers'
import MatterCostsHeaderButtons from '../MatterCostsHeaderButtons'
import cloneDeep from 'lodash/cloneDeep'
import taskService from '../../../services/task/task-service'
import { useDispatch, useSelector } from 'react-redux'
import { setMatterProjections } from '../../../redux/ducks/matter-costs'
import { useUserPosition } from '../../../hooks/user-hooks'
import { getCostRatios } from '../resource/MatterCostsTableHelper'

const useStyles = makeStyles()(theme => ({
  dataVisContainer: {
    display: 'grid',
    gridTemplateColumns: '65% 35%',
  },
  newPeriodButton: {
    marginTop: theme.spacing(2),
    marginLeft: 'auto',
    display: 'flex',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    border: 'solid 1px',
    borderColor: juralioColours.darkText.primary,
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[100],
    },
  },
  graphPip: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(1),
  },
  graphSwitchButton: {
    background: colorModifiers.secondaryText(rawColours.primary.white.primary),
    color: colorModifiers.filterIn(rawColours.primary.black.black),
    width: theme.spacing(17.5),
    height: theme.spacing(5),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    textTransform: 'none',
    fontSize: theme.spacing(1.5),
    marginRight: theme.spacing(),
    marginLeft: theme.spacing(),
    borderColor: 'lightgrey',
    marginTop: theme.spacing(1.5),
    marginBottom: '-20px',
    zIndex: 2,
  },
  marginWrapper: {
    display: 'grid',
    gridTemplateColumns: '70% 30%',
    padding: '8px',
  },
  fullWidth: {
    width: '100%',
  },
  collapsed: {
    visibility: 'collapse',
    height: '0px',
  },
  sectionMargin: {
    margin: theme.spacing(1),
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
  paperPadding: {
    padding: theme.spacing(0.5),
  },
  rightPanel: {
    marginLeft: theme.spacing(2),
  },
  headerRow: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  autoRightText: {
    marginRight: 'auto',
    width: 'fit-content',
  },
  autoLeftText: {
    marginLeft: 'auto',
    width: 'fit-content',
  },
  marginBottom: {
    marginBottom: theme.spacing(2),
  },
  padding8: {
    padding: theme.spacing(1),
  },
  pieContainer: {
    height: 168,
    width: '100%',
    minWidth: '305px',
  },
  sectionDivider: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
  },
  flexRow: {
    display: 'flex',
  },
  headerButtonsContainer: {
    marginLeft: 'auto',
    marginRight: theme.spacing(2),
    marginTop: '-20px',
  },
  cardMarginBottom: {
    marginBottom: theme.spacing(3),
  },
  formGroupEnd: {
    alignItems: 'end',
    marginRight: theme.spacing(3),
  },
  formLabelNoMargin: {
    marginRight: 0,
  },
  feesColour: {
    backgroundColor: '#004EEB',
  },
  hoursColour: {
    backgroundColor: '#66DABF',
  },
}))

const CostsProjectionDashboard = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const matter = useSelector(state => state.matterDetails.matter)
  const userPosition = useUserPosition(matter)
  const isClientUser = userPosition.isClient && !userPosition.isInternalGroup
  const {
    pageInfo,
    matterId,
    setSelectedPage,
    setPageInfo,
    rates,
    goTo,
    showRatesModal,
    setShowRatesModal,
    showAssumptionsModal,
    setShowAssumptionsModal,
    isMatterAdmin,
    editRates,
    doReplace,
    setSelectedSnapshotRates,
    setSelectedSnapshotRtd,
    setSelectedSnapshotPeriods,
    setSelectedSnapshotAssumptions,
    setSelectedSnapshotDate,
    isViewOnly,
  } = props
  const [showGraphSwitchMenu, setShowGraphSwitchMenu] = useState(false)
  const [graphSwitchAnchor, setGraphSwitchAnhor] = useState(null)
  const [showGraphType, setShowGraphType] = useState(1)
  const [projectionIndex, setProjectionIndex] = useState([])
  const location = useLocation()
  const { classes } = useStyles()
  const [isCardOpen, setIsCardOpen] = useState(
    location.pathname.includes('/pricing') ||
      location.pathname.includes('/resource')
  )
  const [colourType, setColourType] = useState(false)
  const [collapsedData, setCollapseData] = useState(
    pageInfo.hasProjectionPeriods && !goTo ? false : true
  )
  const urlProjection = getProjectionIdFromLocation(location)

  const [hourDataArray, setHourDataArray] = useState([])
  const [revenueDataArray, setRevenueDataArray] = useState([])
  const [showRetired, setShowRetired] = useState(false)
  const [matterMargin, setMatterMargin] = useState(0)
  const [matterHours, setMatterHours] = useState(0)
  const [noActiveProjections, setNoActiveProjections] = useState(false)
  const [matterTasks, setMatterTasks] = useState([])
  const dashboardProjections = useSelector(
    state => state.matterCosts.projections
  )

  const sortByDate = (a, b) => {
    if (a.snapshot) {
      a = JSON.parse(a.snapshot)
    }
    if (b.snapshot) {
      b = JSON.parse(b.snapshot)
    }
    if (new Date(a.period.startDate) > new Date(b.period.startDate)) {
      return -1
    } else {
      return 1
    }
  }

  const [sortedProjections, setSortedProjection] = useState(
    cloneDeep(pageInfo.projectionStageList)
      .filter(x => !x.isRetired)
      .sort(sortByDate)
  )

  useEffect(() => {
    taskService.getAllMatterTasks(matterId).then(res => {
      setMatterTasks(res.body)
    })
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (window.location.href.includes('costs/*')) {
      setCollapseData(true)
    }
  }, [window.location.href]) //eslint-disable-line

  useEffect(() => {
    const projections = cloneDeep(pageInfo.projectionStageList)
      .filter(x => !x.isRetired)
      .sort(sortByDate)
    setSortedProjection(projections)
    const matterProjections = []
    projections
      .filter(x => x.isFinalised)
      .forEach(p => {
        const existingProjectionData = dashboardProjections.find(
          x => x.id === p.period.id
        )
        if (existingProjectionData !== undefined) {
          matterProjections.push({
            id: p.period?.id,
            live: existingProjectionData.live,
          })
        } else {
          matterProjections.push({ id: p.period?.id, live: false })
        }
      })
    dispatch(setMatterProjections(matterProjections))
    //eslint-disable-next-line
  }, [pageInfo.projectionStageList, dispatch])

  const noDraftProjectionOpen = !pageInfo.projectionStageList
    .map(x => x.isFinalised)
    .includes(false)
  const retiredProjectionExists = pageInfo.projectionStageList
    .map(x => x.isRetired)
    .includes(true)

  const snapshots = pageInfo.projectionStageList
    ? //eslint-disable-next-line
      pageInfo.projectionStageList.map(projection => {
        if (projection.snapshot) {
          let snapshot = JSON.parse(projection.snapshot)
          snapshot.isRetired = projection.isRetired ? true : false
          return snapshot
        }
      })
    : []

  const [snapshotList, setSnapshotList] = useState(
    snapshots.filter(snapshot => snapshot !== undefined)
  )
  useEffect(() => {
    if (pageInfo.projectionStageList) {
      //eslint-disable-next-line
      const snapshots = pageInfo.projectionStageList.map(projection => {
        if (projection.snapshot) {
          let snapshot = JSON.parse(projection.snapshot)
          snapshot.isRetired = projection.isRetired ? true : false
          return snapshot
        }
      })
      if (
        pageInfo.projectionStageList.filter(
          p => p.isRetired === false && p.snapshotId
        ).length === 0
      ) {
        setNoActiveProjections(true)
      } else {
        setNoActiveProjections(false)
      }

      setSnapshotList(snapshots.filter(snapshot => snapshot !== undefined))
      //eslint-disable-next-line
    }
  }, [pageInfo])

  useEffect(() => {
    if (snapshotList) {
      createDataArray()
      createRevenueDataArray()
    }
  }, [snapshotList]) //eslint-disable-line

  useEffect(() => {
    if (pageInfo.projectionStageList && rates) {
      let matterTotalRevenue = 0
      let matterTotalCost = 0
      let matterHours = 0
      pageInfo.projectionStageList
        .filter(p => !p.isRetired)
        .forEach(projection => {
          if (!projection.isRetired) {
            let snapshot = null
            let totalRevenue = 0
            let totalCost = 0
            let totalHours = 0
            if (projection.snapshot) {
              snapshot = JSON.parse(projection.snapshot)
              snapshot.costTimeEstimateList.forEach(cte => {
                totalHours += cte.hourValue
              })
              totalRevenue = snapshot.revenueValuesDTO.totalRevenue
              totalCost = snapshot.revenueValuesDTO.totalCost
            }
            matterHours += totalHours
            matterTotalCost += totalCost
            matterTotalRevenue += totalRevenue
          }
        })
      setMatterMargin(
        parseInt(getGrossProfitMargin(matterTotalRevenue, matterTotalCost))
      )
      setMatterHours(matterHours)
    }
  }, [pageInfo.projectionStageList, rates])

  const getTaskStart = (task, periodStart) => {
    let startDate =
      task.status === TASK_STATUS.NOT_STARTED
        ? task.plannedStartDate?.replace('Z', '')
        : task.actualStartDate?.replace('Z', '')
    if (startDate === null || startDate === undefined) {
      startDate = periodStart
    }
    return startDate
  }

  const getTaskEnd = (task, periodEnd) => {
    let endDate =
      task.status === TASK_STATUS.DONE
        ? task.actualEndDate?.replace('Z', '')
        : task.plannedEndDate?.replace('Z', '')
    if (endDate === null || endDate === undefined) {
      endDate = periodEnd
    }
    return endDate
  }

  const setupColumns = (periodStart, periodEnd, currentIndexValue) => {
    let months = dayjs(periodEnd).diff(periodStart, 'months') + 1
    let monthsObj = []
    for (let i = 0; i < months; i++) {
      let month = dayjs(periodStart).add(i, 'month')
      let name = month.format('MMM YY')
      monthsObj.push({
        title: '1 ' + name,
        id: i + currentIndexValue,
        fullMonth: month.format('MMMM YYYY'),
      })
    }
    return monthsObj
  }

  const moveValues = (endPeriod, dataList, totalValue) => {
    let month = dayjs(endPeriod).add(1, 'month')
    let name = month.format('MMM YY')
    dataList.push({
      id: dataList.length,
      value: totalValue,
      title: '1 ' + name,
      fullMonth: month.format('MMMM YYYY'),
    })
    let newValue = 0
    let currValue = 0
    dataList.forEach(x => {
      currValue = x.value
      x.value = newValue
      newValue = currValue
    })
    return dataList
  }

  const createRevenueDataArray = () => {
    let revenueArray = []
    let currentTotal = 0
    let id = 0
    snapshotList.forEach(snapshot => {
      if (!snapshot.isRetired) {
        let dArray = getRevenueTableData(
          snapshot,
          snapshot.matterRatesList,
          snapshot.rtd,
          true,
          true
        )
        dArray = dArray.reverse()
        const periodStart = new Date(
          snapshot?.period?.startDate ? snapshot.period.startDate : null
        )
        const periodEnd = new Date(
          snapshot?.period?.endDate ? snapshot.period.endDate : null
        )
        let months = dayjs(periodEnd).diff(periodStart, 'months') + 1
        const valueArray = []
        for (let x = 2; x < months + 2; x++) {
          let monthTotal = currentTotal
          dArray.forEach(pricingValues => {
            if (
              x === 2 &&
              pricingValues[0].pricing.cap &&
              pricingValues[0].passedCap
            ) {
              monthTotal = pricingValues[0].pricing.value + monthTotal
            } else if (
              !pricingValues[0].pricing.cap ||
              !pricingValues[0].passedCap
            ) {
              monthTotal = monthTotal + pricingValues[x]
            }
          })
          valueArray.push({ value: monthTotal, id: id })
          id = id + 1
          currentTotal = monthTotal
        }
        revenueArray.push(valueArray)
      }
    })

    revenueArray = revenueArray.flat()
    const filteredSnapshotList = snapshotList.filter(x => !x.isRetired)
    const lastMonth = new Date(
      filteredSnapshotList[filteredSnapshotList.length - 1]?.period?.endDate
        ? filteredSnapshotList[filteredSnapshotList.length - 1].period.endDate
        : null
    )
    revenueArray = moveValues(lastMonth, revenueArray, currentTotal)
    setRevenueDataArray(revenueArray)
  }

  const createDataArray = () => {
    let dArray = []
    let snapshotData = []
    let currTotal = 0
    let taskDataMap = new Map()
    let currentIndexValue = 0
    snapshotList.forEach(snapshot => {
      if (!snapshot.isRetired) {
        const periodStart = new Date(
          snapshot?.period?.startDate ? snapshot.period.startDate : null
        )
        const periodEnd = new Date(
          snapshot?.period?.endDate ? snapshot.period.endDate : null
        )
        const columns = setupColumns(periodStart, periodEnd, currentIndexValue)
        const costTimeEstimateList = snapshot.costTimeEstimateList
        const workstreamList = snapshot.workstreamList
        workstreamList.forEach((ws, index) => {
          dArray.push([{ id: ws.id, isWorkstream: true, workstream: ws }, 0])
          let currentCTEList = []
          if (workstreamList.length > 1) {
            currentCTEList = costTimeEstimateList.filter(
              cte => cte.task.projectId === ws.id
            )
          } else {
            currentCTEList = costTimeEstimateList
          }
          currentCTEList.forEach(cte => {
            const taskStart = dayjs(
              getTaskStart(cte.task, periodStart)
            ).startOf('month')
            const taskEnd = dayjs(getTaskEnd(cte.task, periodEnd)).endOf(
              'month'
            )
            let months = taskEnd.diff(taskStart, 'months') + 1
            let taskDataRow = []
            let startMonthPos =
              columns.indexOf(
                columns.find(
                  col => col.fullMonth === taskStart.format('MMMM YYYY')
                )
              ) + 1
            let endMonthPos =
              columns.indexOf(
                columns.find(
                  col => col.fullMonth === taskEnd.format('MMMM YYYY')
                )
              ) + 1
            if (startMonthPos === 0) {
              startMonthPos = 2
              if (endMonthPos === 0) {
                months = periodEnd.diff(periodStart, 'months') + 1
              } else {
                months = endMonthPos - 1
              }
            }
            if (endMonthPos === 0) {
              endMonthPos = columns.length
              if (startMonthPos === 0) {
                months = periodEnd.diff(periodStart, 'months') + 1
              } else {
                months = endMonthPos - startMonthPos + 1
              }
            }
            const remainder = cte.hourValue % months
            for (let i = 0; i < columns.length + 1; i++) {
              if (i < startMonthPos || i > endMonthPos) {
              } else {
                const valueNoRemainder = Math.floor(cte.hourValue / months)
                const monthRemainderValue = Math.ceil(remainder / months)
                if (i >= months + 1 - remainder && remainder > 0) {
                  taskDataRow.push(valueNoRemainder + monthRemainderValue)
                } else {
                  taskDataRow.push(valueNoRemainder)
                }
              }
            }
            taskDataMap.set(cte.task.id, taskDataRow)
          })
          for (let i = 1; i < columns.length + 1; i++) {
            let colTotal = 0
            currentCTEList.forEach(cte => {
              let taskRow = taskDataMap.get(cte.task.id)
              if (taskRow[i - 1] !== '' && taskRow[i - 1] !== null) {
                colTotal += taskRow[i - 1]
              }
            })
            dArray[index].push(colTotal)
          }
        })
        let values = dArray.flat().slice(2)
        let data = columns
        for (let index = 0; index < data.length; index++) {
          data[index].value = values[currentIndexValue + index] + currTotal
          currTotal = currTotal + values[index + currentIndexValue]
        }
        let i = projectionIndex
        i.push(currentIndexValue - 1)
        setProjectionIndex(i)
        currentIndexValue = currentIndexValue + data.length
        snapshotData.push(data)
      }
    })
    const filteredSnapshotList = snapshotList.filter(x => !x.isRetired)
    const lastMonth = new Date(
      filteredSnapshotList[filteredSnapshotList.length - 1]?.period?.endDate
        ? filteredSnapshotList[filteredSnapshotList.length - 1].period.endDate
        : null
    )

    snapshotData = moveValues(lastMonth, snapshotData.flat(), currTotal)
    setHourDataArray(snapshotData)
  }

  const renderGraphSwitchButton = () => {
    return (
      <>
        <Button
          disabled={noActiveProjections}
          disableElevation={true}
          variant="outlined"
          data-test="graph-switch-button"
          onClick={e => {
            setGraphSwitchAnhor(e.currentTarget)
            setShowGraphSwitchMenu(!showGraphSwitchMenu)
          }}
          className={classes.graphSwitchButton}
        >
          <div
            className={`${classes.graphPip} ${
              showGraphType === 1 ? classes.feesColour : classes.hoursColour
            }`}
          />

          {showGraphType === 1 ? t('common.fees') : t('common.hours')}
          <ArrowDropDownIcon />
        </Button>
        <Menu
          open={showGraphSwitchMenu}
          anchorEl={graphSwitchAnchor}
          onClose={() => setShowGraphSwitchMenu(false)}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {showGraphType === 1 && (
            <MenuItem
              data-test="graph-switch-dropdown-set-hours"
              className={classes.menuOption}
              onClick={() => {
                setShowGraphType(0)
                setShowGraphSwitchMenu(false)
              }}
            >
              {t('common.hours')}
            </MenuItem>
          )}
          {showGraphType !== 1 && (
            <MenuItem
              data-test="graph-switch-dropdown-set-revenue"
              className={classes.menuOption}
              onClick={() => {
                setShowGraphType(1)
                setShowGraphSwitchMenu(false)
              }}
            >
              {t('common.fees')}
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  const createPieData = () => {
    let pieChartValues = []
    let dataMap = null
    snapshotList
      .filter(x => !x.isRetired)
      .forEach(snapshot => {
        if (snapshot.costRatioList) {
          dataMap = new Map()
          let tHours = 0
          snapshot.costTimeEstimateList.forEach(cte => {
            tHours = tHours + cte.hourValue
            const costRatios = getCostRatios(snapshot.costRatioList, cte)
            costRatios.forEach((cr, index) => {
              const ratioCalculation = cte.hourValue * (cr.ratioValue / 100)
              let value = dataMap.get(
                cr.categoryId ? cr.categoryId : cr.grade.group.id
              )
              if (value === undefined) {
                dataMap.set(cr.categoryId ? cr.categoryId : cr.grade.group.id, {
                  label: cr.categoryName
                    ? cr.categoryName
                    : cr.grade.group.name,
                  value: ratioCalculation,
                  color: colourType
                    ? CATEGORY_COLOURS[
                        cr.colour_idx ? cr.colour_idx : cr.grade.colour_idx
                      ].primary
                    : CATEGORY_COLOURS_GREYSCALE[
                        cr.colour_idx ? cr.colour_idx : cr.grade.colour_idx
                      ].primary,
                })
              } else {
                dataMap.set(cr.categoryId ? cr.categoryId : cr.grade.group.id, {
                  label: cr.categoryName
                    ? cr.categoryName
                    : cr.grade.group.name,
                  value: value.value + ratioCalculation,
                  color: colourType
                    ? CATEGORY_COLOURS[
                        cr.colour_idx ? cr.colour_idx : cr.grade.colour_idx
                      ].primary
                    : CATEGORY_COLOURS_GREYSCALE[
                        cr.colour_idx ? cr.colour_idx : cr.grade.colour_idx
                      ].primary,
                })
              }
            })
          })

          let currSnapValues = Array.from(dataMap, x => x[1])

          currSnapValues = currSnapValues.filter(x => x.value !== 0)
          if (pieChartValues.length === 0) {
            currSnapValues.forEach(csv => pieChartValues.push(csv))
          } else {
            currSnapValues.forEach(csv => {
              let pcvToUpdate = pieChartValues.filter(
                pcv => pcv.label === csv.label
              )
              if (pcvToUpdate.length !== 0) {
                pcvToUpdate[0].value = pcvToUpdate[0].value + csv.value
              } else {
                pieChartValues.push(csv)
              }
            })
          }
        }
      })

    if (matterHours !== 0) {
      pieChartValues.forEach(p => {
        p.value = ((p.value / matterHours) * 100).toFixed(1)
      })
    }

    //stop issue with data not being there
    if (matterHours === 0) {
      return []
    }
    return pieChartValues
  }

  if (
    pageInfo.projectionPeriodList &&
    !pageInfo?.projectionPeriodList
      .map(x => x.id)
      .includes(parseInt(urlProjection)) &&
    urlProjection !== undefined
  ) {
    return <Navigate push to="/404" />
  }
  return (
    <div className={classes.fullWidth}>
      {snapshotList && snapshotList.length < 1 && (
        <div
          className={collapsedData ? classes.collapsed : classes.sectionMargin}
        >
          <MatterCostsHeaderButtons
            isMatterAdmin={isMatterAdmin}
            pageInfo={pageInfo}
            showRatesModal={showRatesModal}
            setShowRatesModal={setShowRatesModal}
            showAssumptionsModal={showAssumptionsModal}
            setShowAssumptionsModal={setShowAssumptionsModal}
            disableRatesModal={
              !pageInfo.finishedMatterRates || editRates || doReplace
            }
            setSelectedSnapshotRates={setSelectedSnapshotRates}
            setSelectedSnapshotRtd={setSelectedSnapshotRtd}
            setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
            setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
            setSelectedSnapshotDate={setSelectedSnapshotDate}
            isSnapshot={false}
          />
        </div>
      )}

      {snapshotList && snapshotList.length > 0 && !collapsedData && (
        <div className={classes.dataVisContainer} style={{ margin: '8px' }}>
          <div>
            <Paper
              data-test="line-chart"
              className={
                noActiveProjections ? classes.noPointerEvents : undefined
              }
            >
              {renderGraphSwitchButton()}
              <LineChart
                yAxis={[
                  {
                    valueFormatter: value => {
                      return Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(value)
                    },
                  },
                ]}
                xAxis={[
                  {
                    dataKey: 'id',
                    valueFormatter: value => {
                      if (value === hourDataArray.length && value % 2 === 0) {
                        return ''
                      }
                      return hourDataArray[value]?.title.toString()
                    },
                    tickMinStep: 1,
                  },
                ]}
                dataset={showGraphType === 1 ? revenueDataArray : hourDataArray}
                series={[
                  {
                    curve: 'linear',
                    color: showGraphType === 1 ? '#004EEB' : '#66DABF',
                    dataKey: 'value',
                    showMark: ({ index }) =>
                      projectionIndex.includes(index - 1) ||
                      index === hourDataArray.length - 1,
                  },
                ]}
                height={342}
              />
            </Paper>
          </div>
          <div className={classes.rightPanel}>
            <div className={classes.headerRow}>
              <Paper
                className={`${classes.paperPadding}${
                  noActiveProjections ? ` ${classes.noPointerEvents}` : ''
                }`}
              >
                <Typography variant="h6" className={classes.autoRightText}>
                  {t('matterProjection.keyFinancialInformation')}
                </Typography>
              </Paper>
              <MatterCostsHeaderButtons
                isMatterAdmin={isMatterAdmin}
                pageInfo={pageInfo}
                showRatesModal={showRatesModal}
                setShowRatesModal={setShowRatesModal}
                showAssumptionsModal={showAssumptionsModal}
                setShowAssumptionsModal={setShowAssumptionsModal}
                disableRatesModal={
                  !pageInfo.finishedMatterRates || editRates || doReplace
                }
                setSelectedSnapshotRates={setSelectedSnapshotRates}
                setSelectedSnapshotRtd={setSelectedSnapshotRtd}
                setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
                setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
                setSelectedSnapshotDate={setSelectedSnapshotDate}
                isSnapshot={false}
              />
            </div>
            {!isClientUser && (
              <div className={classes.marginBottom}>
                <Paper
                  className={
                    noActiveProjections ? classes.noPointerEvents : undefined
                  }
                >
                  <div className={classes.marginWrapper}>
                    <div>
                      <Typography
                        variant="h6"
                        className={classes.autoRightText}
                      >
                        {t('matterProjection.grossProfitMargin')}
                      </Typography>
                      <Divider />
                      <Typography
                        variant="subtitle1"
                        className={classes.autoRightText}
                      >
                        {t('matterCosts.projectionCard.projected')}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="h4" className={classes.autoLeftText}>
                        {noActiveProjections ? 'n/a' : matterMargin + '%'}
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </div>
            )}
            <div
              onMouseEnter={() => {
                setColourType(true)
              }}
              onMouseLeave={() => {
                setColourType(false)
              }}
            >
              <Paper
                className={
                  noActiveProjections ? classes.noPointerEvents : undefined
                }
              >
                <div className={classes.marginWrapper}>
                  <div>
                    <Typography variant="h6" className={classes.autoRightText}>
                      {t('common.hours')}
                    </Typography>
                    <Divider />
                    <Typography
                      variant="subtitle1"
                      className={classes.autoRightText}
                    >
                      {t('matterCosts.projectionCard.projected')}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="h4" className={classes.autoLeftText}>
                      {noActiveProjections ? 'n/a' : matterHours}
                    </Typography>
                  </div>
                </div>
                {noActiveProjections ? (
                  <div className={classes.padding8}>
                    <Typography>
                      {t('matterProjection.nullProjections')}
                    </Typography>
                  </div>
                ) : (
                  <div
                    onMouseEnter={() => {
                      setColourType(true)
                    }}
                    onMouseLeave={() => {
                      setColourType(false)
                    }}
                  >
                    <div className={classes.pieContainer}>
                      <PieChart
                        hideLegend={false}
                        margin={{ left: 24, right: 0, top: 0, bottom: 0 }}
                        series={[
                          {
                            cx: 70,
                            cy: 75,
                            data: snapshotList ? createPieData() : [],
                            innerRadius: 20,
                            outerRadius: 60,
                            paddingAngle: 3,
                            cornerRadius: 2,
                            highlightScope: {
                              faded: 'global',
                              highlighted: 'item',
                            },
                            faded: {
                              innerRadius: 20,
                              additionalRadius: -30,
                              color: 'gray',
                            },
                            valueFormatter: v => v.value + '%',
                          },
                        ]}
                        slotProps={{
                          legend: {
                            labelStyle: {
                              fontSize: 14,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </Paper>
            </div>
          </div>
        </div>
      )}

      {!isCardOpen && !collapsedData && (
        <>
          {!snapshotList && (
            <MatterCostsHeaderButtons
              isMatterAdmin={isMatterAdmin}
              pageInfo={pageInfo}
              showRatesModal={showRatesModal}
              setShowRatesModal={setShowRatesModal}
              showAssumptionsModal={showAssumptionsModal}
              setShowAssumptionsModal={setShowAssumptionsModal}
              disableRatesModal={
                !pageInfo.finishedMatterRates || editRates || doReplace
              }
              setSelectedSnapshotRates={setSelectedSnapshotRates}
              setSelectedSnapshotRtd={setSelectedSnapshotRtd}
              setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
              setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
              setSelectedSnapshotDate={setSelectedSnapshotDate}
              isSnapshot={false}
            />
          )}
          <Divider className={classes.sectionDivider} />
          <div className={classes.flexRow}>
            <div className={classes.rightPanel}>
              <Typography variant="h6">
                {t('matterProjection.projections')}
              </Typography>
              {noActiveProjections ? (
                <Typography variant="subtitle1">
                  {t('matterProjection.nullProjections')}
                </Typography>
              ) : (
                <br></br>
              )}
            </div>
            <div className={classes.headerButtonsContainer}>
              {!isViewOnly && !collapsedData && noDraftProjectionOpen && (
                <Button
                  startIcon={<AddIcon />}
                  className={classes.newPeriodButton}
                  onClick={() => {
                    setSelectedPage(3)
                  }}
                >
                  <Typography>
                    {t('matterProjection.newProjectionPeriod')}
                  </Typography>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
      {!pageInfo.hasProjectionPeriods && (
        <ProjectionCardStandalone
          currency={pageInfo.rtd.rateTableDetails.currency}
          setCollapseData={setCollapseData}
          matterId={matterId}
          fullPeriod={null}
          disabled={true}
          data={null}
          projectionData={[]}
          pricingTypes={null}
          isSnapshot={false}
          setSelectedPage={setSelectedPage}
          setPageInfo={setPageInfo}
          rates={rates}
          setIsCardOpen={setIsCardOpen}
          canEditStartDate={true}
          showRatesModal={showRatesModal}
          setShowRatesModal={setShowRatesModal}
          showAssumptionsModal={showAssumptionsModal}
          setShowAssumptionsModal={setShowAssumptionsModal}
          isMatterAdmin={isMatterAdmin}
          editRates={editRates}
          doReplace={doReplace}
          pageInfo={pageInfo}
          setSelectedSnapshotRates={setSelectedSnapshotRates}
          setSelectedSnapshotRtd={setSelectedSnapshotRtd}
          setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
          setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
          setSelectedSnapshotDate={setSelectedSnapshotDate}
          isViewOnly={isViewOnly}
        />
      )}
      {sortedProjections
        //eslint-disable-next-line
        .map((projection, index) => {
          let period
          let snapshot = null
          if (projection.snapshot) {
            snapshot = JSON.parse(projection.snapshot)
            period = snapshot.period
          } else {
            period = projection.period
          }
          return (
            <div
              key={index}
              className={isCardOpen ? undefined : classes.cardMarginBottom}
            >
              <ProjectionCardStandalone
                currency={pageInfo.rtd.rateTableDetails.currency}
                setCollapseData={setCollapseData}
                matterId={matterId}
                projectionPeriod={period}
                disabled={period ? false : true}
                snapshot={snapshot}
                projectionData={projection}
                canEditStartDate={index > 0 ? false : true}
                setSelectedPage={setSelectedPage}
                rtd={pageInfo.rtd}
                rates={rates}
                setPageInfo={setPageInfo}
                isCardOpen={isCardOpen}
                setIsCardOpen={setIsCardOpen}
                goTo={goTo}
                autoOpen={parseInt(urlProjection) === period.id && goTo > 0}
                canBeRetired={
                  index === 0 ||
                  (pageInfo.projectionStageList.filter(x => !x.isRetired)
                    .length -
                    1 ===
                    index &&
                    snapshot !== null)
                }
                snapshotId={projection.snapshotId}
                isRetired={projection.isRetired}
                noDraftProjectionOpen={noDraftProjectionOpen}
                matterTasks={matterTasks}
                setMatterTasks={setMatterTasks}
                showRatesModal={showRatesModal}
                setShowRatesModal={setShowRatesModal}
                showAssumptionsModal={showAssumptionsModal}
                setShowAssumptionsModal={setShowAssumptionsModal}
                isMatterAdmin={isMatterAdmin}
                editRates={editRates}
                doReplace={doReplace}
                pageInfo={pageInfo}
                setSelectedSnapshotRates={setSelectedSnapshotRates}
                setSelectedSnapshotRtd={setSelectedSnapshotRtd}
                setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
                setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
                setSelectedSnapshotDate={setSelectedSnapshotDate}
                isViewOnly={isViewOnly}
              />
            </div>
          )
        })}
      {!isCardOpen &&
        snapshotList &&
        !isViewOnly &&
        snapshotList.length > 0 &&
        retiredProjectionExists && (
          <FormGroup className={classes.formGroupEnd}>
            <FormControlLabel
              className={classes.formLabelNoMargin}
              label={t('matterProjection.showRetiredProjections')}
              control={
                <Switch
                  checked={showRetired}
                  onClick={() => {
                    setShowRetired(!showRetired)
                  }}
                />
              }
            />
          </FormGroup>
        )}
      {pageInfo.projectionStageList
        .sort((a, b) => a.isRetired - b.isRetired)
        //eslint-disable-next-line
        .map((projection, index) => {
          let period
          let snapshot = null
          if (projection.snapshot) {
            snapshot = JSON.parse(projection.snapshot)
            period = snapshot.period
          } else {
            period = projection.period
          }
          if (showRetired && projection.isRetired) {
            return (
              <div
                className={isCardOpen ? undefined : classes.cardMarginBottom}
              >
                <ProjectionCardStandalone
                  projectionPeriod={period}
                  currency={pageInfo.rtd.rateTableDetails.currency}
                  setCollapseData={setCollapseData}
                  matterId={matterId}
                  fullPeriod={period}
                  disabled={period ? false : true}
                  snapshot={snapshot}
                  projectionData={projection}
                  canEditStartDate={index > 0 ? false : true}
                  setSelectedPage={setSelectedPage}
                  rtd={pageInfo.rtd}
                  rates={rates}
                  setPageInfo={setPageInfo}
                  isCardOpen={isCardOpen}
                  setIsCardOpen={setIsCardOpen}
                  goTo={goTo}
                  autoOpen={parseInt(urlProjection) === period.id && goTo > 0}
                  canBeRetired={
                    index === 0 ||
                    (pageInfo.projectionStageList.filter(x => !x.isRetired)
                      .length -
                      1 ===
                      index &&
                      snapshot !== null)
                  }
                  snapshotId={projection.snapshotId}
                  isRetired={projection.isRetired}
                  noDraftProjectionOpen={noDraftProjectionOpen}
                  matterTasks={matterTasks}
                  setMatterTasks={setMatterTasks}
                  showRatesModal={showRatesModal}
                  setShowRatesModal={setShowRatesModal}
                  showAssumptionsModal={showAssumptionsModal}
                  setShowAssumptionsModal={setShowAssumptionsModal}
                  isMatterAdmin={isMatterAdmin}
                  editRates={editRates}
                  doReplace={doReplace}
                  pageInfo={pageInfo}
                  setSelectedSnapshotRates={setSelectedSnapshotRates}
                  setSelectedSnapshotRtd={setSelectedSnapshotRtd}
                  setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
                  setSelectedSnapshotAssumptions={
                    setSelectedSnapshotAssumptions
                  }
                  setSelectedSnapshotDate={setSelectedSnapshotDate}
                  isViewOnly={isViewOnly}
                />
              </div>
            )
          }
        })}
    </div>
  )
}
export default CostsProjectionDashboard
