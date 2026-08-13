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
import {
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  styled,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import '@glideapps/glide-data-grid/dist/index.css'
import rawColours from '../../../theme/raw-colours'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import ResourceTableRow from './ResourceTableRow'
import cloneDeep from 'lodash/cloneDeep'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { useTranslation } from 'react-i18next'
import {
  filterValidTasks,
  getTaskEnd,
  getTaskStart,
} from '../outcomes/revenueHelper'
import UnassignedTableRow from './UnassignedTableRow'
import {
  getCostRatios,
  tableTheme,
  updatePricingRowValues,
  sortByStatus,
  sortByWorkstream,
  sortTasksByIndex,
} from './MatterCostsTableHelper'

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '40% 60% ',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: '50% 50% ',
    },
  },
  glideContainer: {
    borderRadius: '0 5px 5px 0',
  },
  toggleButtonContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'baseline',
  },
}))

const StyledToggleButton = styled(ToggleButton)({
  textTransform: 'none',
  padding: '2px 4px 2px 4px',
  marginLeft: '8px',
  '&.Mui-selected, &.Mui-selected:hover': {
    color: 'white',
    backgroundColor: rawColours.primary.black[200],
  },
})

const ResourceTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const {
    durationStart,
    durationEnd,
    matterId,
    setTableLoaded,
    isSnapshot,
    setTotalHours,
    diffArray,
    setPageInfo,
    updateData,
    matterTasks,
    data,
    pricingDTOList,
  } = props

  const decimalPlaces = 1
  const [tableData, setTableData] = useState([
    [600, 100, 100, 100, 100, 100, 100, '', '', '', '', '', ''],
  ])

  const setupColumns = () => {
    let months = dayjs(durationEnd).diff(durationStart, 'months') + 1
    let monthsObj = [
      {
        title: 'Hours',
        id: 'Hours',
        width: 80,
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

  const columns = setupColumns()
  const [numRows, setNumRows] = useState(0)
  const [showSpinner, setShowSpinner] = useState(false)
  const [workstreams, setWorkstreams] = useState()
  const [taskData, setTaskData] = useState()
  const [isSingleWorkstream, setIsSingleWorkstream] = useState(false)
  const matter = useSelector(state => state.matterDetails.matter)
  const [costTimeEstimateList, setCostTimeEstimateList] = useState([])
  const [costRatioList, setCostRatioList] = useState([])
  const [sortType, setSortType] = useState(0)
  const [unassignedTasks, setUnassignedTasks] = useState([])

  useEffect(() => {
    if (unassignedTasks.length > 0) {
      setSortType(1)
    }
  }, [unassignedTasks])

  useEffect(() => {
    setShowSpinner(true)
    setTableLoaded(false)
    setCostRatioList(data.costRatioList)
    setCostTimeEstimateList(
      data.costTimeEstimateList
        .sort(sortTasksByIndex)
        .sort(sortByStatus)
        .sort(sortByWorkstream)
    )
    const validlist = filterValidTasks(matterTasks, durationStart, durationEnd)
    setUnassignedTasks(
      validlist.filter(task => {
        if (
          !data.pricingDTOList
            .map(pp => pp.taskList)
            .flatMap(x => x)
            .map(x => x.id)
            .includes(task.id)
        ) {
          return task
        }
      })
    )
    dispatch(fetchProjects(matterId, false, false, true)).then(res => {
      if (res.projects.length === 1) {
        setIsSingleWorkstream(true)
      }
      setWorkstreams(res.projects.sort((a, b) => a.id - b.id))
    })
  }, [data, matterTasks]) //eslint-disable-line

  const getInitialRows = () => {
    let dArray = []
    let taskDataMap = new Map()
    switch (sortType) {
      case 0: // table sorted by workstream
        workstreams.forEach((ws, index) => {
          dArray.push([{ id: ws.id, isWorkstream: true, workstream: ws }, 0])
          //we will need to do something here  to get the data for each workstream
          //probably a total on a task foreach
          let currentCTEList = []
          if (workstreams.length > 1) {
            currentCTEList = costTimeEstimateList.filter(
              cte => cte.task.projectId === ws.id
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
                wsId: ws.id,
                task: cte.task,
                duration: 0,
                startPos: 0,
                endPos: 0,
                inactive: false,
              },
              cte.hourValue,
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
            //we set this here becasue we have handled any edge cases for where the months have values and the duration
            taskDataRow[0].duration = months
            taskDataRow[0].startPos = startMonthPos
            taskDataRow[0].endPos = endMonthPos
            total += cte.hourValue
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
        })
        if (!isSingleWorkstream) {
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
        }
        break
      case 1: // table  sorted by pricing  plans
        pricingDTOList.forEach((pricing, index) => {
          dArray.push([
            {
              id: pricing.id,
              isWorkstream: true,
              pricing: pricing,
              isPricing: true,
            },
            0,
          ])
          //we will need to do something here  to get the data for each workstream
          //probably a total on a task foreach
          let currentCTEList = []
          currentCTEList = costTimeEstimateList.filter(
            cte => cte.pricingId === pricing.id
          )
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
                duration: 0,
                startPos: 0,
                endPos: 0,
                inactive: false,
              },
              cte.hourValue,
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
            //we set this here becasue we have handled any edge cases for where the months have values and the duration
            taskDataRow[0].duration = months
            taskDataRow[0].startPos = startMonthPos
            taskDataRow[0].endPos = endMonthPos
            total += cte.hourValue
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

        if (unassignedTasks.length > 0 && !isSnapshot) {
          let unassignedRow = [{ unassigned: true, value: 0 }, 0]
          columns.forEach((col, j) => {
            if (j !== 0) {
              matterRow.push(0)
            }
          })

          dArray.push(unassignedRow)
          unassignedTasks.forEach(() => {
            let unassignedTaskRow = [{ unassigned: true, value: 0 }, 0]
            columns.forEach((col, j) => {
              if (j !== 0) {
                matterRow.push(0)
              }
            })
            dArray.push(unassignedTaskRow)
          })
        }
        break
      default:
        break
    }

    setTaskData(taskDataMap)
    setNumRows(dArray.length)
    return dArray
  }

  useEffect(() => {
    if (workstreams && costTimeEstimateList) {
      setTableData(getInitialRows())
      setShowSpinner(false)
      setTableLoaded(true)
    }
    //eslint-disable-next-line
  }, [workstreams, sortType, costTimeEstimateList])

  useEffect(() => {
    if (workstreams && tableData && showSpinner === false && pricingDTOList) {
      if (sortType === 0) {
        workstreams.forEach(ws => {
          updateWorkstreamDataRows(ws, true)
        })
      } else {
        pricingDTOList.forEach(pricing => {
          updatePricingDataRows(pricing, true)
        })
      }
    }
    //eslint-disable-next-line
  }, [tableData])

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      let d = null
      let dataRow = tableData[row]
      if (dataRow === undefined || dataRow === null) {
        if (col === 0) {
          d = [{ isWorkstream: false, isEmpty: true }]
        } else {
          d = 0
        }
        dataRow = d
      } else {
        d = dataRow[col + 1]
      }
      if (col === 0) {
        if (dataRow[0].unassigned === true) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: '',
            data: '',
            span: [1, columns.length - 1],
            themeOverride: {
              bgCell: '#E1DED833',
            },
          }
        } else if (!dataRow[col]?.task && dataRow[col]?.isWorkstream) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
          }
        } else if (!dataRow[col]?.task) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: d?.isEmpty
              ? ''
              : decimalPlaces === 0
                ? Math.floor(d)
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : parseFloat(d)
                    ?.toFixed(decimalPlaces)
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d?.toString(),
            themeOverride: {
              bgCell: '#E1DED833',
            },
          }
        } else if (isSnapshot) {
          return {
            kind: GridCellKind.Text,
            cursor: 'pointer',
            allowOverlay: true,
            readonly: true,
            displayData: d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
            themeOverride: {
              bgCell: '#E1DED833',
            },
          }
        } else {
          return {
            kind: GridCellKind.Text,
            cursor: 'pointer',
            allowOverlay: true,
            readonly: false,
            displayData: d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            data: d.toString(),
          }
        }
      } else {
        //covers the case of spliting data rows and state not being fast enough
        if (dataRow[0] === undefined)
          return {
            kind: GridCellKind.Text,
            cursor: 'pointer',
            allowOverlay: true,
            readonly: false,
            displayData: '',
            data: '',
          }
        if (dataRow[0].unassigned === true) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            readonly: true,
            displayData: 'Unassigned',
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
                      .toFixed(decimalPlaces)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : d === undefined
                  ? ''
                  : d.toString(),
          data: d ? d.toString() : '',
          themeOverride:
            dataRow[0].isWorkstream === false && d !== '' && dataRow[0].task
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
    [tableData, decimalPlaces]
  )

  const updateWorkstreamDataRows = React.useCallback(
    (workstream, toggle) => {
      //push the rows into the data array for this WS
      //but we needdto know the current position of each workstreams 'header row' in order to add/remove its expanded rows
      //because if multiple are expanded they will be moved in the data array
      if (toggle === true) {
        let d = tableData
        const startPos = tableData.indexOf(
          tableData.find(x => x[0].id === workstream.id)
        )
        costTimeEstimateList
          .filter(cte => cte.task.projectId === workstream.id)
          .forEach((cte, index) => {
            let taskDataRow = taskData.get(cte.task.id)
            d.splice(startPos + 1 + index, 0, taskDataRow)
          })

        setTableData(d)
        setNumRows(d.length)
      } else {
        let d = tableData
        const startPos = tableData.indexOf(
          tableData.find(x => x[0].id === workstream.id)
        )
        let endPos = 0
        let nextWS = workstreams.indexOf(workstream) + 1
        if (nextWS === workstreams.length) {
          endPos = tableData.length
        } else {
          endPos = tableData.indexOf(
            tableData.find(
              x =>
                x[0].id === workstreams[workstreams.indexOf(workstream) + 1].id
            )
          )
        }
        let amount = endPos - startPos - 1
        d.splice(startPos + 1, amount)
        setTableData(d)
        setNumRows(d.length)
      }
    }, //eslint-disable-next-line
    [getContent, tableData, numRows]
  )

  const updatePricingDataRows = React.useCallback(
    (pricing, toggle) => {
      //push the rows into the data array for this WS
      //but we needdto know the current position of each workstreams 'header row' in order to add/remove its expanded rows
      //because if multiple are expanded they will be moved in the data array
      if (toggle === true) {
        let d = tableData
        const startPos = tableData.indexOf(
          tableData.find(x => x[0]?.id === pricing.id)
        ) //workstreams.indexOf(workstream)
        const cteListClone = cloneDeep(costTimeEstimateList)
        cteListClone
          .filter(cte => cte.pricingId === pricing.id)
          .forEach((cte, index) => {
            let taskDataRow = taskData.get(cte.task.id)
            d.splice(startPos + 1 + index, 0, taskDataRow)
          })

        if (pricing?.taskList?.length === 0) {
          d.splice(startPos + 1, 0, [{ unassigned: true, id: 'unassigned' }, 0])
        }
        setTableData(d)
        setNumRows(d.length)
      } else {
        let d = tableData
        let startPos
        if (pricing.unassgined !== true) {
          startPos = tableData.indexOf(
            tableData.find(x => x[0].id === pricing.id)
          )
        } else {
          startPos = tableData.length - unassignedTasks.length
        }

        let endPos = 0
        let nextWS = pricingDTOList.indexOf(pricing) + 1
        if (nextWS === pricingDTOList.length && unassignedTasks.length === 0) {
          endPos = tableData.length
        } else if (
          nextWS === pricingDTOList.length &&
          unassignedTasks.length > 0
        ) {
          endPos = tableData.length - unassignedTasks.length - 1
        } else {
          endPos = tableData.indexOf(
            tableData.find(
              x =>
                x[0].id ===
                pricingDTOList[pricingDTOList.indexOf(pricing) + 1].id
            )
          )
        }
        let amount = endPos - startPos - 1
        d.splice(startPos + 1, amount)
        setTableData(d)
        setNumRows(d.length)
      }
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
        getCostRatios(costRatioList, cte).forEach(crl => {
          let gradeData = []
          let gPercent = crl.ratioValue

          gradeData.push({
            id: crl.grade ? crl.grade.id : 1,
            isWorkstream: false,
          })
          for (let i = 1; i < taskData.length; i++) {
            if (taskData[i] === '') {
              gradeData.push('')
            } else {
              gradeData.push((taskData[i] / 100) * gPercent)
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
        } else {
          if (dataRow[0].isWorkstream) {
            if (sortType) {
              return { bgCell: '#C8D4B4', borderColor: '#FFFFFF' }
            } else {
              return { bgCell: '#D5D9EB', borderColor: '#FFFFFF' }
            }
          } else {
            return undefined
          }
        }
      } else {
        return undefined
      }
    }, //eslint-disable-next-line
    [tableData]
  )

  const updateWSValues = (workstreamId, newValue, oldValue) => {
    let diffToAdd = newValue.data - oldValue
    const wsIndex = tableData.indexOf(
      tableData.find(x => x[0].id === workstreamId)
    )
    let oldWSRowValues = cloneDeep(tableData[wsIndex])
    tableData[wsIndex][1] += parseInt(diffToAdd)

    if (!isSingleWorkstream) {
      tableData[0][1] += parseInt(diffToAdd)
    }

    for (let i = 2; i < columns.length + 1; i++) {
      let colTotal = 0
      costTimeEstimateList
        .filter(cte => cte.task.projectId === workstreamId)
        .forEach(cte => {
          let taskRow = taskData.get(cte.task.id)
          if (taskRow[i] !== '' && taskRow[i] !== null) {
            colTotal += taskRow[i]
            if (!isSingleWorkstream) {
              let colDiff = taskRow[i] - oldWSRowValues[i]
              tableData[0][i] += colDiff
            }
          }
        })
      tableData[wsIndex][i] = colTotal
    }
  }

  const updateGradeValues = (newValue, row) => {
    const firstRow = row + 1
    getCostRatios(costRatioList, tableData[2][0]).forEach((crl, index) => {
      let gPercent = crl.ratioValue / 100
      let currRow = firstRow + index
      for (let i = 1; i < newValue.length; i++) {
        if (newValue[i] === '') {
          tableData[currRow][i] = ''
        } else {
          tableData[currRow][i] = parseInt(newValue[i]) * gPercent
        }
      }
    })
  }

  const onCellEdited = React.useCallback(
    (cell, newValue) => {
      //data validation for number of valid hours
      if (parseInt(newValue.data) <= 9999) {
        const [col, row] = cell
        let x = props.data
        x.costTimeEstimateList.find(
          cte => cte.id === tableData[row][0].cteId
        ).hourValue = parseInt(newValue.data)
        updateData(x)
        setTotalHours(
          x.costTimeEstimateList
            .map(cte => cte.hourValue)
            .reduce((partialSum, a) => partialSum + a, 0)
        )
        if (newValue.kind === GridCellKind.Text) {
          if (newValue.data === '' || isNaN(newValue.data)) {
            return
          } else {
            if (tableData[row] !== undefined) {
              let oldValue = parseInt(tableData[row][col + 1])
              const remainder = newValue.data % tableData[row][0].duration
              tableData[row][col + 1] = newValue.data
              for (let i = 2; i < columns.length + 1; i++) {
                if (
                  i < tableData[row][0].startPos ||
                  i > tableData[row][0].endPos
                ) {
                  //do nothing
                } else {
                  const valueNoRemainder = Math.floor(
                    parseInt(newValue.data) / tableData[row][0].duration
                  )
                  const monthRemainderValue = Math.ceil(
                    remainder / tableData[row][0].duration
                  )
                  if (
                    i >= tableData[row][0].duration + 2 - remainder &&
                    remainder > 0
                  ) {
                    tableData[row][i] = valueNoRemainder + monthRemainderValue
                  } else {
                    tableData[row][i] = valueNoRemainder
                  }
                }
              }
              taskData.set(tableData[row][0].task.id, tableData[row])

              if (row !== tableData.length - 1) {
                if (
                  !tableData[row + 1][0]?.task &&
                  tableData[row + 1][0]?.isWorkstream === false
                ) {
                  //The grade rows are opened so we need to update them
                  updateGradeValues(tableData[row], row)
                }
              }
              if (sortType === 0) {
                updateWSValues(tableData[row][0].wsId, newValue, oldValue)
              } else {
                updatePricingRowValues(
                  tableData,
                  tableData[row][0].pricingId,
                  newValue,
                  oldValue,
                  isSingleWorkstream,
                  columns,
                  costTimeEstimateList,
                  taskData
                )
              }

              matterCostsService
                .updateCostTimeEstimate(
                  tableData[row][0].task.id,
                  tableData[row][0].cteId,
                  {
                    hour_value: parseInt(newValue.data),
                    projectId: tableData[row][0].wsId,
                  }
                )
                .then(() => {
                  let x = props.data
                  x.costTimeEstimateList.find(
                    cte => cte.id === tableData[row][0].cteId
                  ).hourValue = parseInt(newValue.data)
                  updateData(x)
                  setTotalHours(
                    x.costTimeEstimateList
                      .map(cte => cte.hourValue)
                      .reduce((partialSum, a) => partialSum + a, 0)
                  )
                })
            } else {
              return
            }
          }
        } else {
          return
        }
      }
    },
    //eslint-disable-next-line
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
          <div>
            <Typography>{t('matterResource.resourceTableSubtitle')}</Typography>
          </div>
          <div className={classes.toggleButtonContainer}>
            <Typography>{t('Order by: ')}</Typography>
            <ToggleButtonGroup
              value={sortType}
              exclusive
              onChange={e => {
                setSortType(parseInt(e.target.value))
              }}
            >
              <StyledToggleButton value={parseInt(0)}>
                Workstream & status
              </StyledToggleButton>
              <StyledToggleButton value={parseInt(1)}>
                Pricing segment
              </StyledToggleButton>
            </ToggleButtonGroup>
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
              {(workstreams.length > 1 || sortType === 1) && (
                <ResourceTableRow
                  matter={matter}
                  isMatterRow={true}
                  disableInteractions={true}
                  sortType={0}
                  tasks={costTimeEstimateList}
                  costRatios={costRatioList}
                  fullPeriod={props.fullPeriod}
                  projectionData={data}
                  isSnapshot={isSnapshot}
                  assumptions={props.assumptions}
                  matterTasks={matterTasks}
                  setPageInfo={setPageInfo}
                  diffArray={diffArray}
                  getTaskStart={getTaskStart}
                  getTaskEnd={getTaskEnd}
                />
              )}
              {sortType === 0 &&
                workstreams.map(w => {
                  return (
                    <ResourceTableRow
                      matter={matter}
                      isMatterRow={isSingleWorkstream}
                      tasks={costTimeEstimateList.filter(
                        cte => cte.task.projectId === w.id
                      )}
                      costRatios={costRatioList}
                      workstream={w}
                      updateWorkstreamDataRows={updateWorkstreamDataRows}
                      sortType={sortType}
                      updateTaskDataRows={updateTaskDataRows}
                      fullPeriod={data.period}
                      projectionData={data}
                      isSnapshot={isSnapshot}
                      assumptions={props.assumptions}
                      matterTasks={matterTasks}
                      setPageInfo={setPageInfo}
                      diffArray={diffArray}
                      getTaskStart={getTaskStart}
                      getTaskEnd={getTaskEnd}
                    />
                  )
                })}
              {sortType === 1 &&
                pricingDTOList.map(p => {
                  return (
                    <ResourceTableRow
                      matter={matter}
                      isMatterRow={false}
                      tasks={costTimeEstimateList.filter(
                        cte => cte.pricingId === p.id
                      )}
                      costRatios={costRatioList}
                      pricing={p}
                      updatePricingDataRows={updatePricingDataRows}
                      sortType={sortType}
                      updateTaskDataRows={updateTaskDataRows}
                      fullPeriod={data.period}
                      projectionData={data}
                      isSnapshot={isSnapshot}
                      assumptions={props.assumptions}
                      matterTasks={matterTasks}
                      diffArray={diffArray}
                      getTaskStart={getTaskStart}
                      getTaskEnd={getTaskEnd}
                    />
                  )
                })}
              {unassignedTasks.length > 0 && !isSnapshot && sortType === 1 && (
                <UnassignedTableRow
                  matter={matter}
                  isMatterRow={false}
                  tasks={unassignedTasks}
                  costRatios={costRatioList}
                  pricing={{ unassgined: true, id: 'unassigned' }}
                  updatePricingDataRows={updatePricingDataRows}
                  sortType={sortType}
                  fullPeriod={data.period}
                  projectionData={data}
                  isSnapshot={isSnapshot}
                  assumptions={props.assumptions}
                  matterTasks={matterTasks}
                />
              )}
            </Paper>
            <div className={classes.glideContainer}>
              <DataEditor
                getCellContent={getContent}
                columns={columns}
                rows={numRows}
                smoothScrollX={true}
                rowHeight={r => {
                  if (
                    tableData[r] &&
                    (tableData[r][0]?.isWorkstream ||
                      tableData[r][0]?.task ||
                      tableData[r][0]?.unassigned)
                  ) {
                    return 80
                  } else {
                    return 42
                  }
                }}
                onCellEdited={onCellEdited}
                height={'100%'}
                freezeColumns={1}
                theme={tableTheme}
                getRowThemeOverride={getRowThemeOverride}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
export default ResourceTable
