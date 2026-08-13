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

import React, { useEffect, useRef, useState } from 'react'
import {
  Menu,
  MenuItem,
  Typography,
  Button,
  Paper,
  Divider,
  TextField,
  Tooltip,
  Radio,
  InputAdornment,
  Chip,
  SvgIcon,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import { allCells } from '@glideapps/glide-data-grid-cells'
import '@glideapps/glide-data-grid/dist/index.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import dayjs from 'dayjs'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DeleteIcon from '@mui/icons-material/Delete'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import { useStyles } from './ClientRateTable.styles'
import {
  compareGrades,
  compareRateTypes,
  formatTags,
  getPeriodColumnWidths,
  getTagIndex,
  getValues,
  validateUpdatePayload,
} from './ClientRateTableHelpers'
import RateTableDetailsEditDialog from './RateTableDetailsEditDialog'
import NewPeriodDialog from './NewPeriodDialog'
import costsService from '../../../../services/costs/costs-service'
import { useTranslation } from 'react-i18next'
import AddGradeDialog from './AddGradeDialog'
import GroupIcon from '@mui/icons-material/Group'
import OrganisationIcon from '../../../../assets/images/OrganisationIcon'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { CATEGORY_COLOURS } from '../../../constants'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import {
  formatPayload,
  getPeriodCurrValue,
  getPeriodMax,
  getPeriodMin,
  rateTableSavePeriod,
} from '../../../matter-costs/resource/MatterCostsTableHelper'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined'
import SaveIcon from '@mui/icons-material/Save'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { EditIcon } from '../../../../theme/navigation/CommonIcons'
import { useDispatch } from 'react-redux'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import ConfirmationDialog from '../../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import CalculationTypeSelector from '../../../matter-costs/matter-rates/CalculationTypeSelector'

export const ClientRateTable = props => {
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const { t } = useTranslation()
  const {
    grades,
    rateTypes,
    period,
    rtd,
    selectedRTD,
    isFirstTimeFlow,
    rates,
    orgId,
    setRatePayload,
    parentClasses,
    setStage,
    finaliseFailed,
    setFinaliseFailed,
  } = props
  const [rateTableDetails, setRateTableDetails] = useState(rtd)
  const [ratesDTO, setRatesDTO] = useState(rates)
  const targetRate = rateTypes.find(rt => rt.isStandard)
  const agreedAdvisor = rateTypes.find(rt => rt.isAgreedClient)
  const [periods, setPeriods] = useState(period)
  const [editUnlocked, setEditUnlocked] = useState(isFirstTimeFlow)
  const [editLocation, setEditLocation] = useState(false)
  const [editWorkType, setEditWorkType] = useState(false)
  const [editClient, setEditClient] = useState(false)
  const [client, setClient] = useState(rateTableDetails.client_name)
  const [location, setLocation] = useState(rtd.location)
  const [workType, setWorkType] = useState(rtd.work_type)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [cellMenu, setCellMenu] = useState()
  const [headerMenu, setHeaderMenu] = useState(false)
  const [anchorEL, setAnchorEl] = useState()
  const [sortAnchorEL, setSortAnchorEL] = useState(null)
  const [sortingBy, setSortingBy] = useState('grades')
  const [showDialog, setShowDialog] = useState(false)
  const [updatePayload, setUpdatePayload] = useState([])
  const [newColumn, setNewColumn] = useState(false)
  const [newGrade, setNewGrade] = useState(false)
  const [showUnusedGrades, setShowUnusedGrades] = useState(false)

  const [manualValues, setManualValues] = useState(0)
  const [selectedCalculationType, setSelectedCalculationType] = useState(
    rtd.rateTableDetails ? 0 : 1
  )
  const [calculationValue, setCalculationValue] = useState(0)
  const calculationTypeEnum = {
    0: t('no discount'),
    1: t('discount'),
    2: t('premium'),
  }
  const [calcValueError, setCalcValueError] = useState(false)
  const [errorText, setErrorText] = useState('')
  const rateTypeIdx = 1

  const tags = formatTags(rateTypes, targetRate)

  const validateTableData = tableData => {
    if (!rtd.client) {
      tableData.forEach(row => {
        let errorIfNull = false
        for (let i = 2; i < row.length; i++) {
          if (row[i].name !== '-') {
            errorIfNull = true
            break
          }
        }
        if (errorIfNull) {
          for (let i = 2; i < row.length; i++) {
            if (errorIfNull && row[i].name === '-') {
              row[i].isError = true
              setFinaliseFailed(true)
            }
          }
        }
      })
    }
    return tableData
  }

  const formatData = () => {
    var formattedData = []
    if (isFirstTimeFlow) {
      if (rtd.client && (rtd.rateTableDetails || rtd.associated_id)) {
        ratesDTO
          .filter(rate => rate.rate)
          .forEach(rate => {
            //eslint-disable-next-line
            let newCol = formattedData.find(row => {
              if (row[0].id === rate.gradeId && row[1].id === rate.rateTypeId) {
                return row
              }
            })
            if (newCol) {
              newCol.push({
                name: rate.rate ? rate.rate.toString() : '-',
                id: rate.rateId,
                isError: false,
              })
            } else {
              var row = [
                {
                  name: rate.gradeName,
                  id: rate.gradeId,
                  colour_idx: rate.colour_idx,
                },
                {
                  name: agreedAdvisor.name,
                  id: agreedAdvisor.id,
                  sysname: 'Agreed - Client',
                },
                {
                  name: getValues(
                    rate,
                    manualValues,
                    selectedCalculationType,
                    calculationValue
                  ),
                  id: 'x',
                  isError: false,
                },
                // removed: discount % column
              ]
              if (rtd.rateTableDetails) {
                row.push({
                  name: rate.rate ? rate.rate.toString() : '-',
                  id: rate.rateId,
                })
              }

              formattedData.push(row)
            }
          })
      } else {
        grades.forEach(grade => {
          rateTypes
            .sort((a, b) => a.id - b.id)
            .forEach(rt => {
              if (rt.isAgreedMatter) {
                return
              }
              if (
                (!rt.isAgreedClient && !rtd.client) ||
                (rtd.client && rt.isAgreedClient)
              ) {
                var row = [
                  {
                    name: grade.name,
                    id: grade.id,
                    colour_idx: grade.colour_idx,
                  },
                  {
                    name: rt.name,
                    id: rt.id,
                    isStandard: rt.isStandard,
                    isPremium: rt.isPremium,
                    isBreakeven: rt.isBreakeven,
                    isAgreedClient: rt.isAgreedClient,
                    isAgreedMatter: rt.isAgreedMatter,
                    isHidden: rt.isPremium ? true : false,
                  },
                ]

                periods?.forEach(() => {
                  row.push({ name: '', id: 'x', isError: false })
                })
                formattedData.push(row)
              }
            })
        })
      }
    } else {
      ratesDTO.forEach(rate => {
        //eslint-disable-next-line
        let newCol = formattedData.find(row => {
          if (row[0].id === rate.gradeId && row[1].id === rate.rateTypeId) {
            return row
          }
        })
        if (newCol) {
          if (rate.rate) {
            newCol[1].isHidden = false
          }
          newCol.push({
            name: rate.rate ? rate.rate.toString() : '-',
            id: rate.rateId,
          })
        } else {
          var row = [
            {
              name: rate.gradeName,
              id: rate.gradeId,
              colour_idx: rate.colour_idx,
            },
            {
              name: rate.rateTypeName,
              id: rate.rateTypeId,
              sysname: rate.rateTypeSysname,
              isHidden: showUnusedGrades ? false : rate.rate ? false : true,
            },
            { name: rate.rate ? rate.rate.toString() : '-', id: rate.rateId },
          ]
          formattedData.push(row)
        }
      })
      if (rtd.client && rtd.associated_id) {
        let i = 0
        formattedData.forEach(d => {
          d.push({
            name: ratesDTO[i].standardRate
              ? ratesDTO[i].standardRate.toString()
              : '',
            id: '',
          })
          i = i + periods.length
        })
      }
    }
    let validatedTableData = formattedData
    if (periods.length > 1) {
      validatedTableData = validateTableData(formattedData)
    }
    return validatedTableData.sort(compareRateTypes).sort(compareGrades)
  }
  const [data, setData] = useState(formatData())

  useEffect(() => {
    setData(formatData())
    if (isFirstTimeFlow) {
      formatPayload(
        periods,
        formatData(),
        rateTableDetails,
        setRatePayload,
        isFirstTimeFlow
      )
      if (
        rateTableDetails.client &&
        (rateTableDetails.rateTableDetails || rateTableDetails.associated_id)
      ) {
        if (!manualValues) {
          setEditUnlocked(false)
        } else {
          setEditUnlocked(true)
        }
      }
    }

    //eslint-disable-next-line
  }, [ratesDTO, manualValues, selectedCalculationType, calculationValue])

  const tableTheme = {
    textHeader: juralioColours.darkText.secondary,
    textHeaderSelected: '#000000',
    bgHeader: rawColours.primary.grey.main,
    bgHeaderHasFocus: '#cfccc6',
    bgHeaderHovered: '#cfccc6',
    headerFontStyle: '12px',
    borderColor: '#B8B3B0',
    textGroupHeader: editUnlocked
      ? juralioColours.darkText.primary
      : juralioColours.darkText.secondary,
  }

  const setupColumns = () => {
    var defaultColumns = [
      {
        title: t('organisationAdmin.costs.rateTable.grade'),
        id: 1,
        width: 250,
        group: '',
        icon: 'gradeChevron',
      },
      {
        title: t('organisationAdmin.costs.rateTable.rateType'),
        id: 2,
        width: 125,
        group: '',
        icon: 'rtChevron',
      },
    ]
    periods.forEach(period => {
      defaultColumns.push({
        title: period.endDate
          ? dayjs(period.endDate).format('MMM YYYY').toString()
          : t('organisationAdmin.costs.rateTable.lastPeriod'),
        id: defaultColumns.length + 1,
        width: getPeriodColumnWidths(isFirstTimeFlow, rtd, periods),
        group: period.startDate
          ? dayjs(period.startDate).format('MMM YYYY').toString()
          : t('organisationAdmin.costs.rateTable.1stPeriod'),
      })
    })
    if (rtd.client && (rtd.rateTableDetails || rtd.associated_id)) {
      defaultColumns.push({
        title: t('organisationAdmin.costs.rateTable.target'),
        id: defaultColumns.length + 1,
        width: ((window.innerWidth - 80) / 100) * 15,
        group: t('organisationAdmin.costs.rateTable.reference'),
        icon: 'custom',
      })
    }
    return defaultColumns
  }

  const [columns, setColumns] = useState(setupColumns())

  const resizeTimerRef = useRef(null)
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(() => setColumns(setupColumns()), 300)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    }
    //eslint-disable-next-line
  }, [])

  useEffect(
    () => sortDataArray(1),
    //eslint-disable-next-line
    []
  )

  const hideRow = rowNum => {
    let x = data
    x.filter(row => !row[1].isHidden)[rowNum][1].isHidden = true
    setData(null)
    setData([...x])
  }

  const unhideRows = () => {
    let x = data
    x.filter(row => row[1].isHidden).forEach(row => {
      if (!row[1].isPremium) {
        row[1].isHidden = false
      }
    })
    setData([...x])
  }

  useEffect(() => {
    let x = data
    if (!isFirstTimeFlow) {
      x.forEach(row => {
        const endIndex = rtd.client ? 2 : 0
        if (showUnusedGrades) {
          row[1].isHidden = false
        } else {
          for (let i = 2; i < row.length - endIndex; i++) {
            if (row[i].name !== '-') {
              row[1].isHidden = false
              break
            } else {
              row[1].isHidden = true
            }
          }
        }
      })
    }
    setData([...x])
    //eslint-disable-next-line
  }, [showUnusedGrades])

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      const dataRow = data.filter(row => !row[rateTypeIdx].isHidden)[row]
      let d
      let rateCol = 9999
      if (rtd.client && (rtd.rateTableDetails || rtd.associated_id)) {
        rateCol = columns.length - 1
      }
      if (dataRow === undefined) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData: '',
          data: 'd',
          themeOverride: {
            bgCell: '#FFFFFF',
            cellText: '#74574A',
          },
        }
      }
      if (dataRow[col] === undefined) {
        d = { name: '', id: 'x' }
      } else {
        d = dataRow[col]
      }
      if (dataRow[rateTypeIdx].isHidden) {
        return undefined
      }
      if (col === rateCol && rtd.client) {
        return {
          contentAlign: 'right',
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData: d.name,
          data: d.name,
          themeOverride: {
            bgCell: '#F1F1EE',
            cellText: '#74574A',
          },
        }
      } else if (col === 0) {
        return {
          kind: GridCellKind.Custom,
          cursor: 'pointer',
          allowOverlay: true,
          readonly: true,
          copyData: d.name,
          data: {
            kind: 'button-cell',
            backgroundColor: [
              CATEGORY_COLOURS[d.colour_idx]?.secondary,
              CATEGORY_COLOURS[d.colour_idx].primary,
            ],
            color: [
              CATEGORY_COLOURS[d.colour_idx].text,
              CATEGORY_COLOURS[d.colour_idx].text,
            ],
            borderColor: 'transparent',
            borderRadius: 9,
            title: d.name,
            onClick: () => {},
          },
          themeOverride: {
            baseFontStyle: '700 12px',
            cellHorizontalPadding: 50,
            bgCell: '#F1F1EE',
          },
        }
      } else if (col === 1) {
        let tagIndex = getTagIndex(d)
        const tag = tagIndex !== undefined ? tags[tagIndex] : undefined
        return {
          kind: GridCellKind.Custom,
          allowOverlay: false,
          copyData: '',
          data: {
            kind: 'tags-cell',
            possibleTags: tags,
            readonly: true,
            tags: tag ? [tag.tag] : [],
          },
          themeOverride: {
            bgCell: '#F1F1EE',
            textDark: tag ? tag.textColorDark : undefined,
          },
        }
      } else if (col > 1 && col < rateCol) {
        const latestPeriod = rateCol + periods.length === col
        return {
          contentAlign: 'right',
          kind: GridCellKind.Text,
          allowOverlay: editUnlocked,
          readonly: !editUnlocked,
          displayData: d.name,
          data: d.name,
          themeOverride: {
            bgCell: editUnlocked
              ? d.isError && finaliseFailed
                ? 'rgba(252, 164, 174, 0.4)'
                : '#FFFFFF'
              : '#F1F1EE',
            cellText: editUnlocked ? '#74574A' : '#74574A',
            baseFontStyle: latestPeriod ? '700 14px' : '',
          },
        }
      } else {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData: d.name,
          data: d.name,
          themeOverride: {
            bgCell: '#F1F1EE',
            cellText: '#74574A',
          },
        }
      }
    },
    //eslint-disable-next-line
    [data, editUnlocked, finaliseFailed]
  )
  const onCellEdited = React.useCallback(
    (cell, newValue) => {
      const [col, row] = cell
      if (newValue.kind !== GridCellKind.Text) return

      let cellId
      let nextData
      setData(prev => {
        const filteredData = prev.filter(r => !r[rateTypeIdx].isHidden)
        const targetRow = filteredData[row]
        if (!targetRow || targetRow[col] === undefined) {
          nextData = prev
          return prev
        }
        cellId = targetRow[col].id
        const newCellValue = {
          name: newValue.data || '',
          id: cellId,
          isError: false,
        }
        nextData = prev.map(r => {
          if (r !== targetRow) return r
          const newRow = [...r]
          newRow[col] = newCellValue
          return newRow
        })
        return nextData
      })

      if (cellId === undefined) return

      if (props.isFirstTimeFlow) {
        formatPayload(
          periods,
          nextData,
          rateTableDetails,
          setRatePayload,
          isFirstTimeFlow
        )
      } else {
        setUpdatePayload(prev => {
          const existing = prev.find(item => item.id === cellId)
          if (existing === undefined) {
            return [
              ...prev,
              {
                id: cellId,
                rate: newValue.data ? parseFloat(newValue.data) : null,
                isError: false,
              },
            ]
          }
          return prev.map(item =>
            item.id === cellId
              ? {
                  ...item,
                  rate: newValue.data ? parseFloat(newValue.data) : null,
                }
              : item
          )
        })
      }
    },
    //eslint-disable-next-line
    []
  )

  const removeColumn = () => {
    const index = rateTableDetails.client ? 3 : 1
    const spliceAt = columns.length - index
    const filtered = columns.filter((_, i) => i !== spliceAt)
    const newColumns = filtered.map((column, i) => {
      let width = column.width
      if (rateTableDetails.client) {
        if (i > 1 && i < filtered.length - 2) {
          width = Math.max(
            ((window.innerWidth / 100) * 80) / periods.length -
              ((window.innerWidth / 100) * 5 + 375) / periods.length,
            125
          )
        }
      } else {
        if (i > 1) {
          width = Math.max(
            ((window.innerWidth / 100) * 100) / periods.length -
              ((window.innerWidth / 100) * 10 + 375) / periods.length,
            125
          )
        }
      }
      const title =
        i === spliceAt - 1
          ? t('organisationAdmin.costs.rateTable.lastPeriod')
          : column.title
      return { ...column, width, title }
    })
    setColumns(newColumns)
  }

  const addColumn = newCol => {
    const startDateTitle = dayjs(newCol.startDate)
      .format('MMMM YYYY')
      .toString()
    const newItem = {
      title: t('organisationAdmin.costs.rateTable.lastPeriod'),
      width: getPeriodColumnWidths(isFirstTimeFlow, rtd, periods),
      id: columns.length + 1,
      group: startDateTitle,
    }

    let inserted
    if (rateTableDetails.client) {
      const insertAt = columns.length - 2
      inserted = [
        ...columns.slice(0, insertAt - 1),
        { ...columns[insertAt - 1], title: startDateTitle },
        newItem,
        ...columns.slice(insertAt),
      ]
    } else {
      inserted = [
        ...columns.slice(0, columns.length - 1),
        { ...columns[columns.length - 1], title: startDateTitle },
        newItem,
      ]
    }

    const newColumns = inserted.map((column, i) => {
      let width = column.width
      if (rateTableDetails.client) {
        if (i > 1 && i < inserted.length - 2) {
          width = Math.max(
            ((window.innerWidth / 100) * 80) / (periods.length + 1) -
              ((window.innerWidth / 100) * 5 + 375) / (periods.length + 1),
            125
          )
        }
      } else {
        if (i > 1) {
          width = Math.max(
            ((window.innerWidth / 100) * 100) / (periods.length + 1) -
              ((window.innerWidth / 100) * 10 + 375) / (periods.length + 1),
            125
          )
        }
      }
      return { ...column, width }
    })
    setColumns(newColumns)
  }

  const updateValue = e => {
    rateTableSavePeriod(
      e,
      columns,
      cellMenu,
      periods,
      setPeriods,
      setColumns,
      setCellMenu
    )
    setAnchorEl(null)
    setCellMenu(undefined)
  }

  const headerIcons = React.useMemo(() => {
    return {
      custom:
        p => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.7">
        <g clip-path="url(#clip0_226_162219)">
        <rect width="24" height="24" rx="12" fill="#0E9384"/>
        <path d="M12.6 11.4016H15.48C16.1521 11.4016 16.4881 11.4016 16.7448 11.5324C16.9706 11.6474 17.1542 11.831 17.2692 12.0568C17.4 12.3135 17.4 12.6495 17.4 13.3216V17.4016M12.6 17.4016V8.52156C12.6 7.8495 12.6 7.51347 12.4692 7.25677C12.3542 7.03098 12.1706 6.8474 11.9448 6.73235C11.6881 6.60156 11.3521 6.60156 10.68 6.60156H8.52C7.84794 6.60156 7.51191 6.60156 7.25521 6.73235C7.02942 6.8474 6.84584 7.03098 6.73079 7.25677C6.6 7.51347 6.6 7.8495 6.6 8.52156V17.4016M18 17.4016H6M8.7 9.00156H10.5M8.7 11.4016H10.5M8.7 13.8016H10.5" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        </g>
        <defs>
        <clipPath id="clip0_226_162219">
        <rect width="24" height="24" rx="12" fill="white"/>
        </clipPath>
        </defs>
        </svg>`,
      gradeChevron: p =>
        isFirstTimeFlow
          ? `<svg xmlns="http://www.w3.org/2000/svg" height="400" width="400" viewBox="0 0 200 200" xml:space="preserve">
          </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" height="400" width="400" viewBox="0 0 200 200" xml:space="preserve">
          <path d="m0 30 64 66 64-66z"/>
          </svg>`,
      rtChevron: p =>
        `<svg xmlns="http://www.w3.org/2000/svg" height="400" width="400" viewBox="0 0 200 200" xml:space="preserve">
          </svg>`,
      hideChevron: p =>
        data.filter(row => row[2].isHidden && !row[2].isPremium).length > 0
          ? `<svg xmlns="http://www.w3.org/2000/svg" height="400" width="400" viewBox="0 0 200 200" xml:space="preserve">
          <path d="m0 30 64 66 64-66z"/>
          </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" height="400" width="400" viewBox="0 0 200 200" xml:space="preserve">
          </svg>`,
    }
    //eslint-disable-next-line
  }, [data])

  //HEADER MENU

  const sortDataArray = sortBy => {
    if (sortBy === 2) {
      setData([...data].sort(compareRateTypes))
    } else if (sortBy === 1) {
      setData([...data].sort(compareGrades))
    }
  }

  const isCellMenuOpen = cellMenu !== undefined

  const sortOpen = Boolean(sortAnchorEL)

  const onHeaderClick = React.useCallback(
    (...args) => {
      var boundry
      var location
      if (isFirstTimeFlow) {
        if (
          args[1].location[0] === 0 &&
          data.filter(row => row[1].isHidden && !row[1].isPremium).length > 0
        ) {
          setAnchorEl(document.getElementById('targetCell'))
          boundry = args[1].bounds
          location = args[1].location
          setCellMenu({ location, boundry })
        } else if (args[1].location[0] === 1) {
          setAnchorEl(document.getElementById('targetCell'))
          boundry = args[1].bounds
          location = args[1].location
          setCellMenu({ location, boundry })
        }
      } else {
        if (args[1].location[0] === 0) {
          setAnchorEl(document.getElementById('targetCell'))
          boundry = args[1].bounds
          location = args[1].location
          setCellMenu({ location, boundry })
        }
      }
    },
    //eslint-disable-next-line
    [editUnlocked]
  )

  const onCellClick = React.useCallback(
    (...args) => {
      const colDiff = 2
      const extraCols = rateTableDetails.client ? 2 : 0
      if (
        args[1].location[0] >= colDiff &&
        editUnlocked &&
        args[1].location[0] < columns.length - extraCols
      ) {
        setAnchorEl(document.getElementById('targetCell'))
        var boundry = args[1].bounds
        var location = args[1].location
        setCellMenu({ location, boundry })
      }
    },
    //eslint-disable-next-line
    [editUnlocked]
  )

  const handleAction = () => {
    costsService.deleteRateTableDetails(rateTableDetails.id).then(res => {
      if (res.status === 200) {
        setShowDeleteConfirmation(false)
        setStage(7)
      }
    })
  }

  const handleCancel = () => {
    setShowDeleteConfirmation(false)
  }

  return (
    <>
      {isFirstTimeFlow && (
        <Typography>{t('matterCosts.rateTable.lostData')}</Typography>
      )}
      {(!isFirstTimeFlow || props.addBackButton) && (
        <>
          <div className={classes.backButtonWrapper}>
            <Button
              data-test="back-button"
              className={classes.backButton}
              onClick={() => {
                setStage(7)
                setFinaliseFailed(false)
              }}
              startIcon={<ArrowCircleLeftOutlinedIcon />}
            >
              <Typography>{t('common.back')}</Typography>
            </Button>
            <div className={classes.confirmBox}>
              {(rateTableDetails.isBeingUsed ||
                (rateTableDetails.client && rateTableDetails.is_retired)) && (
                <div>
                  <Tooltip
                    title={
                      !props.validRTDRetire
                        ? t('organisationAdmin.costs.cantRetire')
                        : rateTableDetails.is_retired &&
                            !props.associatedTableRetired
                          ? t('organisationAdmin.costs.canRestore')
                          : props.associatedTableRetired
                            ? t('organisationAdmin.costs.cantRestoreClient')
                            : t('organisationAdmin.costs.canRetire')
                    }
                  >
                    <span>
                      <Button
                        className={classes.replaceButton}
                        onClick={() => {
                          dispatch(
                            displayConfirmationDialog(
                              {
                                actionText: rateTableDetails.is_retired
                                  ? t('common.restore')
                                  : t('common.retire'),
                                //update
                                titleText: rateTableDetails.is_retired
                                  ? t('matterCosts.rateTable.restoreRateTable')
                                  : t('matterCosts.rateTable.retireRateTable'),
                                //update
                                promptText: rateTableDetails.is_retired
                                  ? t(
                                      'matterCosts.rateTable.restoreRateTablePrompt',
                                      {
                                        rateTables: rateTableDetails.client
                                          ? 'matter projections.'
                                          : ' client tables and matter projections.',
                                      }
                                    )
                                  : t(
                                      'matterCosts.rateTable.retireRateTablePrompt'
                                    ),
                                usageContext: rateTableDetails.is_retired
                                  ? 'restoreRTD'
                                  : 'retireRTD',
                                dontTranslatePromptText: true,
                                cancel: () => {},
                                extraComponent: (
                                  <div className={classes.retireExtraWrapper}>
                                    {!rateTableDetails.is_retired && (
                                      <>
                                        <Typography
                                          className={classes.retireDialogText1}
                                        >
                                          {t(
                                            'matterCosts.rateTable.retireRateTablePrompt2',
                                            {
                                              client: rateTableDetails.client
                                                ? ''
                                                : 'client or',
                                            }
                                          )}
                                        </Typography>
                                        <Typography
                                          className={classes.retireDialogText2}
                                        >
                                          {t(
                                            'matterCosts.rateTable.retireRateTablePrompt3'
                                          )}
                                        </Typography>
                                      </>
                                    )}

                                    {!rateTableDetails.is_retired &&
                                      !rateTableDetails.client && (
                                        <>
                                          <Typography
                                            className={
                                              classes.retireDialogText3
                                            }
                                            dangerouslySetInnerHTML={{
                                              __html:
                                                props.associatedClientTables
                                                  .length === 0
                                                  ? t(
                                                      'matterCosts.rateTable.retireRateTablePrompt4'
                                                    )
                                                  : props.associatedClientTables
                                                        .length === 1
                                                    ? t(
                                                        'matterCosts.rateTable.retireRateTablePrompt5'
                                                      )
                                                    : t(
                                                        'matterCosts.rateTable.retireRateTablePrompt6',
                                                        {
                                                          numOfRtd:
                                                            props
                                                              .associatedClientTables
                                                              .length,
                                                        }
                                                      ),
                                            }}
                                          ></Typography>
                                          <div
                                            className={classes.clientTableMore}
                                          >
                                            {props.associatedClientTables.map(
                                              (x, i) => {
                                                if (i < 4) {
                                                  return (
                                                    <div
                                                      className={
                                                        classes.clientTableRow
                                                      }
                                                    >
                                                      <SvgIcon>
                                                        <svg
                                                          width="24"
                                                          height="24"
                                                          viewBox="0 0 24 24"
                                                          fill="none"
                                                          xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                          <g
                                                            clipPath="url(#a)"
                                                            opacity=".7"
                                                          >
                                                            <rect
                                                              width="24"
                                                              height="24"
                                                              rx="12"
                                                              fill="#4E5BA6"
                                                            />
                                                            <path
                                                              d="M14.7 12c.828 0 1.494-.672 1.494-1.5S15.528 9 14.7 9a1.5 1.5 0 0 0 0 3m-4.5-.6c.996 0 1.794-.804 1.794-1.8s-.798-1.8-1.794-1.8-1.8.804-1.8 1.8.804 1.8 1.8 1.8m4.5 1.8c-1.098 0-3.3.552-3.3 1.65v1.35H18v-1.35c0-1.098-2.202-1.65-3.3-1.65m-4.5-.6c-1.398 0-4.2.702-4.2 2.1v1.5h4.2v-1.35c0-.51.198-1.404 1.422-2.082A7.4 7.4 0 0 0 10.2 12.6"
                                                              fill="#fff"
                                                            />
                                                          </g>
                                                          <defs>
                                                            <clipPath id="a">
                                                              <rect
                                                                width="24"
                                                                height="24"
                                                                rx="12"
                                                                fill="#fff"
                                                              />
                                                            </clipPath>
                                                          </defs>
                                                        </svg>
                                                      </SvgIcon>
                                                      <Typography
                                                        className={
                                                          classes.clientTableEntry
                                                        }
                                                      >
                                                        <Typography
                                                          className={
                                                            classes.clientTableEntryName
                                                          }
                                                        >
                                                          {x.rateTableDetails
                                                            .client_name +
                                                            ' | '}
                                                        </Typography>
                                                        {x.rateTableDetails
                                                          .location +
                                                          ' | ' +
                                                          x.rateTableDetails
                                                            .work_type +
                                                          '\n'}
                                                      </Typography>
                                                    </div>
                                                  )
                                                } else return ''
                                              }
                                            )}
                                            {props.associatedClientTables
                                              .length > 4 && (
                                              <Typography
                                                className={classes.andMoreText}
                                              >
                                                {t(
                                                  'organisationAdmin.costs.rateTable.andMore',
                                                  {
                                                    count:
                                                      props
                                                        .associatedClientTables
                                                        .length - 4,
                                                  }
                                                )}
                                              </Typography>
                                            )}
                                          </div>
                                        </>
                                      )}
                                  </div>
                                ),
                              },
                              () => {
                                costsService
                                  .updateRateTableDetail(rateTableDetails.id, {
                                    is_retired: !rateTableDetails.is_retired,
                                  })
                                  .then(res => {
                                    if (res.status === 200) {
                                      setStage(7)
                                    }
                                  })
                              }
                            )
                          )
                        }}
                        disabled={
                          rateTableDetails.is_retired &&
                          props.associatedTableRetired
                            ? true
                            : rateTableDetails.is_retired
                              ? false
                              : !props.validRTDRetire
                        }
                      >
                        <u>
                          {rateTableDetails.is_retired
                            ? t('common.restore')
                            : t('common.retire')}
                        </u>
                      </Button>
                    </span>
                  </Tooltip>
                </div>
              )}
              {!rateTableDetails.isBeingUsed && (
                <Tooltip
                  title={
                    rateTableDetails.isBeingUsed
                      ? t('organisationAdmin.costs.rateTable.deleteTT')
                      : t('organisationAdmin.costs.rateTable.canDeleteTT')
                  }
                >
                  <div>
                    <Button
                      className={classes.replaceButton}
                      onClick={() => {
                        setShowDeleteConfirmation(true)
                      }}
                      disabled={rateTableDetails.isBeingUsed}
                    >
                      <u>{t('common.delete')}</u>
                    </Button>
                  </div>
                </Tooltip>
              )}
              {!isFirstTimeFlow && (
                <Button
                  data-test="edit-rates-toggle"
                  className={classes.editButton}
                  variant="outlined"
                  onClick={() => {
                    if (editUnlocked) {
                      if (updatePayload.length > 0) {
                        if (validateUpdatePayload(data)) {
                          costsService
                            .bulkUpdateRates(updatePayload)
                            .then(res => {
                              setUpdatePayload([])
                              setEditUnlocked(false)
                              setFinaliseFailed(false)
                            })
                        } else {
                          setFinaliseFailed(true)
                        }
                      } else {
                        setEditUnlocked(false)
                      }
                    } else {
                      setEditUnlocked(true)
                    }
                  }}
                  startIcon={editUnlocked ? <SaveIcon /> : <EditIcon />}
                >
                  <Typography>
                    {editUnlocked
                      ? t('organisationAdmin.costs.rateTable.finishEditing')
                      : t('organisationAdmin.costs.rateTable.editRates')}
                  </Typography>
                </Button>
              )}
            </div>
          </div>
          <div className={classes.errorContainer}>
            {finaliseFailed && (
              <Typography color={'error'}>
                {t('organisationAdmin.costs.rateTable.missingRates')}
              </Typography>
            )}
          </div>
        </>
      )}
      {isFirstTimeFlow &&
        rateTableDetails.client &&
        rateTableDetails.rateTableDetails && (
          <div className={classes.rateOptionsContainer}>
            <div
              onClick={() => {
                if (manualValues !== 0) {
                  setManualValues(0)
                  setUpdatePayload(null)
                }
              }}
              className={classes.adoptRatesRow}
            >
              <Radio
                checked={manualValues === 0}
                value={0}
                name="radio-buttons"
                slotProps={{
                  input: { 'aria-label': '0' },
                }}
              />
              <Typography
                className={manualValues === 1 ? classes.unselectedRadio : ''}
              >
                {t('matterRates.adoptRates')}
              </Typography>
              <CalculationTypeSelector
                calculationTypeEnum={calculationTypeEnum}
                selectedCalculationType={selectedCalculationType}
                setSelectedCalculationType={setSelectedCalculationType}
                setManualValues={setManualValues}
                manualValues={manualValues}
              />
              {selectedCalculationType !== 0 && (
                <>
                  <Typography className={classes.ofText}>
                    {t(' of ')}
                  </Typography>
                  <TextField
                    value={calculationValue}
                    type="number"
                    variant="outlined"
                    slotProps={{
                      htmlInput: {
                        autoFocus: true,
                        min: 1,
                        max: 100,
                        style: {
                          width: 'fit-content',
                          borderRadius: '4px',
                        },
                      },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      },
                    }}
                    className={classes.numberInput}
                    helperText={errorText}
                    error={calcValueError}
                    onChange={e => {
                      var value = parseInt(e.target.value)
                      if (value <= 100 && value > 0) {
                        setCalcValueError(false)
                        setErrorText(
                          t('organisationAdmin.costs.rateTable.roundedOutcome')
                        )
                        setCalculationValue(value)
                      } else {
                        setCalcValueError(true)
                        setErrorText(
                          t('organisationAdmin.costs.rateTable.calcValueRange')
                        )
                        setCalculationValue(null)
                      }
                    }}
                  />
                </>
              )}
            </div>
            <div
              onClick={() => {
                setManualValues(1)
                setSelectedCalculationType(0)
              }}
              className={classes.manualRatesRow}
            >
              <Radio
                checked={manualValues === 1}
                value={1}
                name="radio-buttons"
                slotProps={{
                  input: { 'aria-label': '0' },
                }}
              />
              <Typography
                className={manualValues === 0 ? classes.unselectedRadio : ''}
              >
                {t('matterRates.manualRates')}
              </Typography>
            </div>
          </div>
        )}

      <div className={classes.tableWrapper}>
        <Paper
          style={{
            position: 'relative',
            width: 'fit-content',
            maxWidth:
              window.innerWidth - 80 - ((window.innerWidth - 80) / 100) * 10,
            borderRadius: isFirstTimeFlow ? '20px 20px 0px 0px' : 20,
          }}
        >
          <div className={classes.gridWrapper}>
            <div
              className={classes.cardIconDiv}
              style={
                rateTableDetails.client && !rateTableDetails.is_retired
                  ? {
                      backgroundColor:
                        juralioColours.rateTableCards.clientNotRetired,
                      opacity: '70%',
                    }
                  : rateTableDetails.client && rateTableDetails.is_retired
                    ? {
                        backgroundColor:
                          juralioColours.rateTableCards.clientRetired,
                        opacity: '70%',
                      }
                    : !rateTableDetails.client && !rateTableDetails.is_retired
                      ? {
                          backgroundColor:
                            juralioColours.rateTableCards.orgNotRetired,
                          opacity: '70%',
                        }
                      : {
                          backgroundColor:
                            juralioColours.rateTableCards.orgRetired,
                          opacity: '70%',
                        }
              }
            >
              <div>
                {rateTableDetails.client ? (
                  <GroupIcon className={classes.cardIcon} />
                ) : (
                  <OrganisationIcon className={classes.cardIcon} />
                )}
                <Typography className={classes.cardIconText}>
                  {rateTableDetails.client
                    ? t('organisationAdmin.costs.rateTable.advisorAgreedRates')
                    : t('organisationAdmin.costs.rateTable.orgRatePolicies')}
                </Typography>
                <div className={classes.chipContainer}>
                  {rateTableDetails.draft && (
                    <Chip
                      size="small"
                      className={classes.draftChip}
                      label={t('common.draft')}
                    ></Chip>
                  )}
                  {rateTableDetails.is_retired && (
                    <Chip
                      size="small"
                      className={classes.retiredChip}
                      label={t('common.retired')}
                    ></Chip>
                  )}
                </div>
              </div>
            </div>
            <div
              style={
                rateTableDetails.is_retired
                  ? {
                      paddingTop: '8px',
                      backgroundColor: rawColours.primary.grey.main,
                    }
                  : { paddingTop: '8px' }
              }
            >
              {editClient ? (
                <>
                  <TextField
                    className={classes.textField}
                    autoFocus={true}
                    value={client}
                    onChange={e => {
                      if (e.target.value.length <= 50) {
                        setClient(e.target.value)
                      }
                    }}
                  />
                  <Button
                    className={classes.editFieldButton}
                    onClick={() => {
                      if (client.length > 0 && client.length <= 50) {
                        costsService
                          .updateRateTableDetail(rateTableDetails.id, {
                            client_name: client,
                          })
                          .then(res => {
                            if (res.status === 200) {
                              setRateTableDetails(res.body)
                              setEditClient(false)
                            }
                          })
                      }
                    }}
                  >
                    <DoneIcon className={classes.icons} />
                  </Button>
                  <Button
                    className={classes.editFieldButton}
                    onClick={() => {
                      setEditClient(false)
                      setClient(rateTableDetails.client_name)
                    }}
                  >
                    <ClearIcon className={classes.icons} />
                  </Button>
                </>
              ) : (
                <Typography
                  onClick={() => {
                    setEditWorkType(false)
                    setEditLocation(false)
                    setEditClient(true)
                  }}
                  variant="h6"
                  className={classes.textDiv}
                >
                  {client}
                </Typography>
              )}

              <div className={classes.displayFlex}>
                {editLocation ? (
                  <>
                    <TextField
                      className={classes.textField}
                      autoFocus={true}
                      value={location}
                      onChange={e => {
                        if (e.target.value.length <= 50) {
                          setLocation(e.target.value)
                        }
                      }}
                    />
                    <Button
                      className={classes.editFieldButton}
                      onClick={() => {
                        if (location.length > 0 && location.length <= 50) {
                          costsService
                            .updateRateTableDetail(rateTableDetails.id, {
                              location: location,
                            })
                            .then(res => {
                              if (res.status === 200) {
                                setRateTableDetails(res.body)
                                setEditLocation(false)
                              }
                            })
                        }
                      }}
                    >
                      <DoneIcon className={classes.icons} />
                    </Button>
                    <Button
                      className={classes.editFieldButton}
                      onClick={() => {
                        setEditLocation(false)
                        setLocation(rateTableDetails.location)
                      }}
                    >
                      <ClearIcon className={classes.icons} />
                    </Button>
                  </>
                ) : (
                  <Typography
                    onClick={() => {
                      setEditWorkType(false)
                      setEditClient(false)
                      setEditLocation(true)
                    }}
                    variant="subtitle1"
                    className={classes.textDiv}
                  >
                    {rateTableDetails.location + ' |'}
                  </Typography>
                )}

                {editWorkType ? (
                  <>
                    <TextField
                      className={classes.textField}
                      autoFocus={true}
                      value={workType}
                      onChange={e => {
                        if (e.target.value.length <= 50) {
                          setWorkType(e.target.value)
                        }
                      }}
                    />
                    <Button
                      className={classes.editFieldButton}
                      onClick={() => {
                        if (workType.length > 0 && workType.length <= 50) {
                          costsService
                            .updateRateTableDetail(rateTableDetails.id, {
                              work_type: workType,
                            })
                            .then(res => {
                              if (res.status === 200) {
                                setRateTableDetails(res.body)
                                setEditWorkType(false)
                              }
                            })
                        }
                      }}
                    >
                      <DoneIcon className={classes.icons} />
                    </Button>
                    <Button
                      className={classes.editFieldButton}
                      onClick={() => {
                        setEditWorkType(false)
                        setWorkType(rateTableDetails.work_type)
                      }}
                    >
                      <ClearIcon className={classes.icons} />
                    </Button>
                  </>
                ) : (
                  <Typography
                    onClick={() => {
                      setEditLocation(false)
                      setEditClient(false)
                      setEditWorkType(true)
                    }}
                    variant="subtitle1"
                    className={classes.textDiv}
                  >
                    {rateTableDetails.work_type}
                  </Typography>
                )}
              </div>
              <div className={classes.displayFlex}>
                <Typography variant="body1" className={classes.textDiv}>
                  {getDateDisplayString(periods[0].startDate, 'MMM YYYY')}
                </Typography>
                {rateTableDetails.client &&
                  (rateTableDetails.rateTableDetails ||
                    rateTableDetails.associated_id) && (
                    <div className={classes.displayFlex}>
                      <Typography variant="body1" className={classes.textDiv}>
                        {t('matterCosts.rateTable.basedOn')}
                      </Typography>
                      <div className={classes.templateIconDiv}>
                        <OrganisationIcon className={classes.templateIcon} />
                      </div>
                      <Typography
                        className={`${classes.basedOnLocation} ${classes.textDiv}`}
                        variant="body1"
                      >
                        {rateTableDetails.templateLocation +
                          ' | ' +
                          rateTableDetails.templateWorkType}
                      </Typography>
                    </div>
                  )}
              </div>
            </div>

            <div
              style={
                rateTableDetails.is_retired
                  ? {
                      textAlign: '-webkit-center',
                      backgroundColor: rawColours.primary.grey.main,
                      paddingTop: '4px',
                    }
                  : { textAlign: '-webkit-center', paddingTop: '4px' }
              }
            >
              <Typography className={classes.currencyText} variant="h4">
                {selectedRTD.currency !== undefined
                  ? selectedRTD.currency.substr(0, 3)
                  : rateTableDetails.currency.substr(0, 3)}
              </Typography>
              <Divider className={classes.divider} />
              <Typography className={classes.currencyText} variant="body1">
                {selectedRTD.currency !== undefined
                  ? selectedRTD.currency.substr(5, 100)
                  : rateTableDetails.currency.substr(5, 100)}
              </Typography>
            </div>
            <div
              className={classes.endIconDiv}
              style={
                rateTableDetails.client && !rateTableDetails.is_retired
                  ? {
                      backgroundColor:
                        juralioColours.rateTableCards.clientNotRetired,
                      opacity: '70%',
                    }
                  : rateTableDetails.client && rateTableDetails.is_retired
                    ? {
                        backgroundColor:
                          juralioColours.rateTableCards.clientRetired,
                        opacity: '70%',
                      }
                    : !rateTableDetails.client && !rateTableDetails.is_retired
                      ? {
                          backgroundColor:
                            juralioColours.rateTableCards.orgNotRetired,
                          opacity: '70%',
                        }
                      : {
                          backgroundColor:
                            juralioColours.rateTableCards.orgRetired,
                          opacity: '70%',
                        }
              }
            ></div>
          </div>
          <div className={classes.gradeRowContainer}>
            <div className={classes.sortButtonWrapper}>
              {!rtd.client && (
                <>
                  <Button
                    style={{
                      justifyContent: 'flex-start',
                      paddingLeft: '16px',
                      textTransform: 'none',
                    }}
                    className={classes.sortButton}
                    variant="outlined"
                    disableElevation
                    onClick={e => {
                      setSortAnchorEL(e.currentTarget)
                    }}
                    endIcon={<KeyboardArrowDownIcon />}
                  >
                    {t('organisationAdmin.costs.rateTable.sortBy', {
                      type: t('organisationAdmin.costs.rateTable.' + sortingBy),
                    })}
                  </Button>
                  <Menu
                    anchorEl={sortAnchorEL}
                    open={sortOpen}
                    onClose={() => {
                      setSortAnchorEL(null)
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        setSortingBy('grades')
                        setSortAnchorEL(null)
                        sortDataArray(1)
                      }}
                    >
                      {t('organisationAdmin.costs.rateTable.grades')}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setSortingBy('rateTypes')
                        setSortAnchorEL(null)
                        sortDataArray(2)
                      }}
                    >
                      {t('organisationAdmin.costs.rateTable.rateTypes')}
                    </MenuItem>
                  </Menu>
                </>
              )}
            </div>
            {!isFirstTimeFlow && (
              <div>
                <Button
                  className={classes.sortButton}
                  style={{
                    height: '27px',
                    borderRadius: '0px',
                    textTransform: 'none',
                    width:
                      window.innerWidth -
                      ((window.innerWidth / 100) * 10 + 375),
                    justifyContent: 'flex-end',
                    paddingRight: '16px',
                    color: editUnlocked
                      ? '#FFFFFF'
                      : rawColours.primary.grey.main,
                    backgroundColor: editUnlocked
                      ? rawColours.primary.darkBlue.main
                      : rawColours.primary.black[200],
                  }}
                  variant="outlined"
                  disabled={!editUnlocked}
                  onClick={() => {
                    if (editUnlocked) {
                      setNewColumn(true)
                    }
                  }}
                >
                  {editUnlocked
                    ? t('organisationAdmin.costs.rateTable.addPeriod')
                    : ''}
                </Button>
              </div>
            )}
          </div>
          <>
            <div className={classes.displayFlex}>
              {isFirstTimeFlow && (
                <Paper elevation={0} className={classes.toggleGradesPaper}>
                  <div className={classes.gradeToggleHeader}>
                    {data.filter(row => row[1].isHidden && !row[1].isPremium)
                      .length > 0 && (
                      <Tooltip
                        title={t(
                          'organisationAdmin.costs.rateTable.showAllGrades'
                        )}
                      >
                        <Button
                          className={classes.showButton}
                          onClick={unhideRows}
                        >
                          <VisibilityOffIcon />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  {data
                    .filter(row => !row[rateTypeIdx].isHidden)
                    .map((row2, index) => (
                      <Tooltip
                        title={t('organisationAdmin.costs.rateTable.hideGrade')}
                      >
                        <Button
                          className={classes.hideButton}
                          onClick={() => hideRow(index)}
                          style={
                            index ===
                            data.filter(row => !row[rateTypeIdx].isHidden)
                              .length
                              ? { borderBottom: '0px' }
                              : {}
                          }
                        >
                          <Visibility />
                        </Button>
                      </Tooltip>
                    ))}
                </Paper>
              )}

              <div id="glideTest">
                <DataEditor
                  validateCell={(_cell, newValue) => {
                    if (newValue.kind !== GridCellKind.Text) return true
                    if (!isNaN(newValue.data)) return true
                    return false
                  }}
                  customRenderers={allCells}
                  getCellContent={getContent}
                  columns={columns}
                  rows={data.filter(row => !row[rateTypeIdx].isHidden).length}
                  smoothScrollX={true}
                  rowHeight={34}
                  onCellEdited={onCellEdited}
                  getCellsForSelection={true}
                  onPaste={true}
                  onHeaderClicked={onHeaderClick}
                  onGroupHeaderClicked={onCellClick}
                  headerIcons={headerIcons}
                  freezeColumns={2}
                  theme={tableTheme}
                />
              </div>
            </div>
          </>
          <div
            id="targetCell"
            style={{
              width: '300px',
              position: 'fixed',
              top: cellMenu ? cellMenu.boundry.y + cellMenu.boundry.height : 0,
              left: cellMenu ? cellMenu.boundry.x : 0,
            }}
          >
            {isCellMenuOpen && !isFirstTimeFlow && cellMenu.location[0] > 1 && (
              <div className={classes.visibilityHidden}>
                <Menu
                  anchorEl={anchorEL}
                  onClose={() => {
                    setAnchorEl(null)
                    setCellMenu(undefined)
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={isCellMenuOpen}
                >
                  <MenuItem
                    disableRipple
                    sx={{ '&:hover': { backgroundColor: 'white' } }}
                    className={classes.menuItemDefault}
                  >
                    <div>
                      <div>
                        <Typography className={classes.menuItemText}>
                          {t('organisationAdmin.costs.rateTable.updatePeriod')}
                        </Typography>
                      </div>
                      <DateCalendar
                        openTo="month"
                        name={'startDate'}
                        defaultValue={getPeriodCurrValue(cellMenu, periods)}
                        minDate={getPeriodMin(cellMenu, periods)}
                        maxDate={getPeriodMax(cellMenu, periods)}
                        views={['year', 'month']}
                        inputFormat="yyyy-MM"
                        closeOnSelect={false}
                        onMonthChange={e => {
                          updateValue(e)
                        }}
                      />
                    </div>
                  </MenuItem>
                  {((cellMenu.location[0] + 1 === columns.length &&
                    periods.length > 1) ||
                    (rateTableDetails.client &&
                      cellMenu.location[0] + 1 === columns.length - 2 &&
                      periods.length > 1)) && (
                    <MenuItem
                      onClick={() => {
                        //need this for dto name jank
                        let id = periods[cellMenu.location[0] - 2].periodId
                          ? periods[cellMenu.location[0] - 2].periodId
                          : periods[cellMenu.location[0] - 2].id

                        const options = {
                          actionText: t('common.delete'),
                          titleText: t(
                            'organisationAdmin.costs.rateTable.deletePeriod'
                          ),
                          promptText: t(
                            'organisationAdmin.costs.rateTable.confirmDelete'
                          ),
                          usageContext: 'deletePeriodConfirmation',
                          headerIcon: DeleteIcon,
                        }
                        dispatch(
                          displayConfirmationDialog(options, () =>
                            costsService.deletePeriod(id).then(() => {
                              let x = periods
                              x.splice(periods.length - 1, 1)
                              setPeriods(x)
                              removeColumn()
                              costsService.getRateTable(rtd.id).then(res => {
                                if (res.status === 200) {
                                  setRatesDTO(res.body)
                                  setAnchorEl(null)
                                  setCellMenu(undefined)
                                }
                              })
                            })
                          )
                        )
                      }}
                      className={classes.menuItem}
                    >
                      <div className={classes.deletePeriodItem}>
                        <Typography className={classes.menuItemText}>
                          {t('organisationAdmin.costs.rateTable.deletePeriod')}
                        </Typography>
                        <DeleteIcon className={classes.deleteIcon} />
                      </div>
                    </MenuItem>
                  )}
                </Menu>
              </div>
            )}
            {isCellMenuOpen &&
              !isFirstTimeFlow &&
              cellMenu.location[0] === 0 && (
                <div className={classes.visibilityHidden}>
                  <Menu
                    anchorEl={anchorEL}
                    onClose={() => {
                      setAnchorEl(null)
                      setCellMenu(undefined)
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    getContentAnchorEl={null}
                    open={isCellMenuOpen}
                  >
                    <MenuItem
                      data-test="unused-grades-toggle"
                      className={classes.menuItem}
                      onClick={() => {
                        setShowUnusedGrades(!showUnusedGrades)
                        setAnchorEl(null)
                        setCellMenu(undefined)
                      }}
                    >
                      <Typography>
                        {showUnusedGrades
                          ? t('organisationAdmin.costs.rateTable.hideUnused')
                          : t('organisationAdmin.costs.rateTable.showAll')}
                      </Typography>
                    </MenuItem>
                  </Menu>
                </div>
              )}
            {isCellMenuOpen && isFirstTimeFlow && (
              <div className={classes.visibilityHidden}>
                <Menu
                  anchorEl={anchorEL}
                  onClose={() => {
                    setAnchorEl(null)
                    setCellMenu(undefined)
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={isCellMenuOpen}
                >
                  {cellMenu.location[0] === 0 && (
                    <MenuItem
                      className={classes.menuItem}
                      onClick={() => {
                        unhideRows()
                        setAnchorEl(null)
                        setCellMenu(undefined)
                      }}
                    >
                      <Typography>
                        {t('organisationAdmin.costs.rateTable.showAll')}
                      </Typography>
                    </MenuItem>
                  )}
                </Menu>
              </div>
            )}
            {headerMenu && (
              <div>
                <Menu
                  anchorEl={anchorEL}
                  onClose={() => {
                    setAnchorEl(null)
                    setHeaderMenu(undefined)
                  }}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={headerMenu}
                >
                  <MenuItem
                    onClick={() => {
                      setShowDialog(true)
                    }}
                  >
                    {t('organisationAdmin.costs.rateTable.editTableDetails')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setNewColumn(true)
                    }}
                  >
                    {t('organisationAdmin.costs.rateTable.addPeriod')}
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
          {(!editUnlocked || rateTableDetails.client) && (
            <div className={classes.bottomRowDisabled}>
              <div />
              <div className={classes.inlineFlexPaddingTop}></div>
              <div />
            </div>
          )}

          {editUnlocked && !rateTableDetails.client && !isFirstTimeFlow && (
            <div
              className={classes.bottomRow}
              onClick={() => setNewGrade(true)}
            >
              <div />
              <div
                className={classes.inlineFlexPaddingTop}
                data-test={'add-grade-button'}
              >
                <AddBoxIcon />
                <Typography>{t('common.new')}</Typography>
              </div>
              <div />
            </div>
          )}
        </Paper>
      </div>
      {showDialog && (
        <RateTableDetailsEditDialog
          updateValues={setRateTableDetails}
          values={rateTableDetails}
          classes={parentClasses}
          closeHandler={setShowDialog}
          display={showDialog}
        />
      )}
      {newColumn && (
        <NewPeriodDialog
          periods={periods}
          orgId={orgId}
          updateValues={setPeriods}
          updateRates={setRatesDTO}
          rtdId={rtd.id}
          data={data}
          classes={parentClasses}
          closeHandler={setNewColumn}
          addColumn={addColumn}
          display={newColumn}
          rateTableDetails={rateTableDetails}
        />
      )}
      {newGrade && (
        <AddGradeDialog
          rtdId={rtd.id}
          orgId={orgId}
          classes={parentClasses}
          periods={periods}
          rates={ratesDTO}
          setRates={setRatesDTO}
          grades={grades}
          rateTypes={rateTypes}
          display={newGrade}
          closeHandler={setNewGrade}
        />
      )}
      {showDeleteConfirmation && (
        <ConfirmationDialog
          titleText={t('organisationAdmin.costs.rateTable.deleteConfirmTitle')}
          promptText={t('organisationAdmin.costs.rateTable.deleteConfirmBody')}
          actionText={t('common.delete')}
          cancelHandler={handleCancel}
          actionHandler={handleAction}
          usageContext="OrganisationActivity"
        />
      )}
    </>
  )
}
export default ClientRateTable
