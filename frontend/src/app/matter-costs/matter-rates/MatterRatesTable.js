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
import { useDispatch, useSelector } from 'react-redux'
import { useUserPosition } from '../../../hooks/user-hooks'
import {
  Menu,
  MenuItem,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import { allCells } from '@glideapps/glide-data-grid-cells'
import '@glideapps/glide-data-grid/dist/index.css'
import dayjs from 'dayjs'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import NewPeriodDialog from '../../organisation/users/costs/NewPeriodDialog'
import costsService from '../../../services/costs/costs-service'
import { useTranslation } from 'react-i18next'
import OrganisationIcon from '../../../assets/images/OrganisationIcon'
import { CATEGORY_COLOURS } from '../../constants'
import {
  EditIcon,
  MattersIcon,
  PeopleIcon,
} from '../../../theme/navigation/CommonIcons'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import matterCostsService from '../../../services/costs/matter-costs-service'
import RateTableDetailsEditDialog from '../../organisation/users/costs/RateTableDetailsEditDialog'
import {
  formatPayload,
  getPeriodCurrValue,
  getPeriodMax,
  getPeriodMin,
  rateTableCalculateDiscountPercentage,
  rateTableSavePeriod,
  rateTableTheme,
} from '../resource/MatterCostsTableHelper'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'

const useStyles = makeStyles()(theme => ({
  sortButton: {
    width: '100%',
    padding: 0,
    color: rawColours.primary.black[200],
    backgroundColor: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomRowDisabled: {
    height: '30px',
    width: '100%',
    borderTop: 'groove',
    borderRadius: '0 0 20px 20px',
    color: '#5E9EF8',
    display: 'grid',
    gridTemplateColumns: '2% 48% 50%',
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 20% 10%',
    borderTopLeftRadius: theme.spacing(2.5),
    borderTopRightRadius: theme.spacing(2.5),
    borderBottom: '4px solid',
    borderColor: rawColours.primary.black[100],
  },
  cardIcon: {
    marginTop: '9%',
    marginLeft: '45%',
    scale: '1.5',
  },
  cardIconDiv: {
    color: juralioColours.whiteText.primary,
    borderTopLeftRadius: theme.spacing(2.5),
  },
  cardIconText: {
    textAlignLast: 'center',
  },
  endIconDiv: {
    paddingTop: theme.spacing(2),
    color: juralioColours.whiteText.primary,
    borderTopRightRadius: theme.spacing(2.5),
  },
  textDiv: {
    paddingLeft: theme.spacing(1.5),
  },
  divider: {
    width: '60%',
  },
  currencyText: {
    paddingLeft: theme.spacing(2),
  },
  templateIconDiv: {
    borderRadius: '50%',
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  confirmBox: {
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
    marginRight: theme.spacing(1.5),
    marginLeft: 'auto',
    width: 'fit-content',
  },
  confirmButton: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.black[200],
    borderColor: rawColours.primary.black[200],
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: rawColours.primary.grey.main,
      borderColor: rawColours.primary.black[200],
    },
  },
  replaceButton: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.blue.dark,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
      color: rawColours.primary.darkBlue.main,
    },
  },
  retiredChip: {
    backgroundColor: juralioColours.rateTableCards.retiredChip,
    marginTop: theme.spacing(-0.5),
    marginLeft: theme.spacing(0.5),
    color: juralioColours.whiteText.primary,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  snapshotDateChip: {
    backgroundColor: juralioColours.taskStatus.done,
    color: juralioColours.whiteText.primary,
    fontWeight: 600,
  },
}))

export const MatterRatesTable = props => {
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const { t } = useTranslation()
  const {
    rateTypes,
    period,
    rtd,
    manualValues,
    selectedCalculationType,
    calculationValue,
    isViewOnly,
  } = props
  const [rateTableDetails, setRateTableDetails] = useState(rtd)
  const [ratesDTO, setRatesDTO] = useState(props.rates)
  const customProps = { customRenderers: allCells }
  const agreedMatter = props.isSnapshot
    ? props.rates[0]?.rateTypeName
    : rateTypes.find(rt => rt.isAgreedMatter)?.name
  const standardRateName = props.isSnapshot
    ? rtd.standardRateName
    : rateTypes.find(rt => rt.isStandard)?.name
  const [periods, setPeriods] = useState(period)
  const editUnlocked = props.editRates
  const matterDetails = useSelector(state => state.matterDetails)
  const userPosition = useUserPosition(matterDetails.matter)
  const isClientUser = userPosition.isClient && !userPosition.isInternalGroup
  const [updatePayload, setUpdatePayload] = useState([])

  const tags = [
    {
      tag: agreedMatter,
      color: '#D1E9FF',
      textColorDark: '#1849A9',
    },
  ]
  const getValues = rate => {
    let percentageMulitplier, newValue
    if (manualValues) {
      return ''
    } else {
      if (selectedCalculationType === 0) {
        //no discount
        return rate.rate ? rate.rate.toString() : '-'
      } else if (selectedCalculationType === 1) {
        //discount
        percentageMulitplier = (100 - calculationValue) / 100
        newValue = rate.rate
          ? parseFloat(
              Math.round((rate.rate * percentageMulitplier).toFixed(2))
            ).toString()
          : '-'
        return newValue
      } else if (selectedCalculationType === 2) {
        //premium
        percentageMulitplier = 100 + parseInt(calculationValue) // 100
        newValue = rate.rate
          ? parseFloat(
              Math.round(((rate.rate / 100) * percentageMulitplier).toFixed(2))
            ).toString()
          : '-'
        return newValue
      }
    }
  }

  const formatData = () => {
    var formattedData = []
    if (props.isFirstTimeFlow) {
      ratesDTO
        .filter(rate => rate.rate)
        .sort((a, b) => (a.gradeId < b.gradeId ? -1 : 1))
        .forEach(rate => {
          let newCol = formattedData.find(row => {
            if (row[0].id === rate.gradeId && row[1].id === rate.rateTypeId) {
              return row
            }
          })
          if (newCol) {
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
                name: agreedMatter,
                id: props.isSnapshot
                  ? 0
                  : rateTypes.find(rt => rt.isAgreedMatter).id,
                sysname: 'Agreed - Matter',
              },
              { name: getValues(rate), id: 'x' },
              {
                name: !isNaN(getValues(rate))
                  ? rateTableCalculateDiscountPercentage(
                      parseInt(getValues(rate)),
                      parseInt(rate.rate)
                    ) + '%'
                  : 'n/a',
                id: '',
              },
              { name: rate.rate ? rate.rate.toString() : '-', id: rate.rateId },
            ]
            formattedData.push(row)
          }
        })
    } else {
      ratesDTO.forEach(rate => {
        let newCol = formattedData.find(row => {
          if (row[0].id === rate.gradeId && row[1].id === rate.rateTypeId) {
            return row
          }
        })
        if (newCol) {
          newCol.push({
            name: rate.rate
              ? rate.rate.toString()
              : rate.rateValue
                ? rate.rateValue.toString()
                : '-',
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
            },
            {
              name: rate.rate
                ? rate.rate.toString()
                : rate.rateValue
                  ? rate.rateValue.toString()
                  : '-',
              id: rate.rateId,
            },
          ]
          formattedData.push(row)
        }
      })
      let i = 0
      formattedData.forEach(d => {
        d.push(
          {
            name: !isNaN(d[d.length - 1].name)
              ? rateTableCalculateDiscountPercentage(
                  parseInt(d[d.length - 1].name),
                  parseInt(ratesDTO[i].standardRate)
                ) + '%'
              : 'n/a',
            id: '',
          },
          {
            name: ratesDTO[i].standardRate
              ? ratesDTO[i].standardRate.toString()
              : '-',
            id: '',
          }
        )
        i = i + periods.length
      })
    }
    return formattedData
  }
  const [data, setData] = useState(formatData())

  useEffect(() => {
    setData(formatData())
    //eslint-disable-next-line
  }, [ratesDTO, manualValues, selectedCalculationType, calculationValue])

  useEffect(() => {
    if (props.isFirstTimeFlow) {
      formatPayload(periods, data, rateTableDetails, props.setRatePayload)
      sortDataArray(1)
    }
    //eslint-disable-next-line
  }, [data])

  useEffect(
    () => sortDataArray(1),
    //eslint-disable-next-line
    []
  )
  const [cellMenu, setCellMenu] = useState()
  const [headerMenu, setHeaderMenu] = useState(false)
  const [anchorEL, setAnchorEl] = useState()
  const [sortAnchorEL, setSortAnchorEL] = useState(null)
  const [sortingBy, setSortingBy] = useState('Grades')
  const [showDialog, setShowDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  // Base width the table lays its columns out against. In the modal the table is
  // constrained to the modal's width (90% / max 1000) rather than the full window,
  // so the rate columns shrink to fit instead of overflowing.
  const getTableBaseWidth = () => {
    if (props.isModal) {
      const modalWidth = Math.min(1000, (window.innerWidth - 48) * 0.9)
      return modalWidth / 0.9 - 20
    }
    return window.innerWidth - 80
  }
  const getPeriodColumnWidths = () => {
    const available = getTableBaseWidth() / 100
    let calcWidth =
      (available * 80) / periods.length - (available * 5 + 375) / periods.length

    if (isClientUser) {
      calcWidth += (available * 15) / periods.length
    }

    if (calcWidth < 125) {
      //minWidth
      return 125
    } else {
      return calcWidth
    }
  }

  const setupColumns = () => {
    var defaultColumns = [
      {
        title: t('organisationAdmin.costs.rateTable.grade'),
        id: 1,
        width: 250,
        group: '',
      },
      {
        title: t('organisationAdmin.costs.rateTable.rateType'),
        id: 2,
        width: 125,
        group: '',
      },
    ]
    periods.forEach((period, i) => {
      defaultColumns.push({
        title: period.endDate
          ? dayjs(period.endDate).format('MMM YYYY').toString()
          : t('organisationAdmin.costs.rateTable.lastPeriod'),
        id: defaultColumns.length + 1,
        width: getPeriodColumnWidths(),
        group:
          i === 0
            ? t('organisationAdmin.costs.rateTable.1stPeriod')
            : dayjs(period.startDate).format('MMM YYYY').toString(),
        contentAlign: 'right',
      })
    })
    if (!isClientUser) {
      defaultColumns.push({
        title: t('organisationAdmin.costs.rateTable.discount'),
        id: defaultColumns.length + 1,
        width: (getTableBaseWidth() / 100) * 7,
        group: t('organisationAdmin.costs.rateTable.reference'),
      })

      defaultColumns.push({
        title: props.rtd.client ? t('entity.client') : standardRateName,
        id: defaultColumns.length + 1,
        width: (getTableBaseWidth() / 100) * 8,
        group: t('organisationAdmin.costs.rateTable.reference'),
        icon: props.rtd.client ? 'client' : 'custom',
      })
    }

    return defaultColumns
  }

  const debounceFunction = (cb, delay) => {
    let timer
    return () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => cb(), delay)
    }
  }
  const debounce = debounceFunction(() => {
    setColumns(setupColumns())
  }, 300)
  useEffect(() => {
    window.addEventListener('resize', debounce)
    return () => window.removeEventListener('resize', debounce)
    //eslint-disable-next-line
  }, [])

  const [columns, setColumns] = useState(setupColumns())
  const [newColumn, setNewColumn] = useState(false)

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      const dataRow = data[row]
      let d
      let rateCol = isClientUser
        ? Infinity
        : props.isFirstTimeFlow
          ? columns.length - 1
          : columns.length - 2
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
      if (col >= rateCol) {
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
            baseFontStyle: 'italic 14px',
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
        return {
          kind: GridCellKind.Custom,
          allowOverlay: false,
          copyData: '',
          data: {
            kind: 'tags-cell',
            possibleTags: tags,
            readonly: true,
            tags: [tags[0].tag],
          },
          themeOverride: {
            bgCell: '#F1F1EE',
            textDark: tags[0].textColorDark,
          },
        }
      } else if (col > 1 && col < rateCol) {
        return {
          contentAlign: 'right',
          kind: GridCellKind.Text,
          allowOverlay: editUnlocked,
          readonly: !editUnlocked,
          displayData: d.name,
          data: d.name,
          themeOverride: {
            bgCell: editUnlocked ? '#FFFFFF' : '#F1F1EE',
            cellText: editUnlocked ? '#74574A' : '#74574A',
            baseFontStyle: col === rateCol - 1 ? '700 14px' : '',
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
    [data, editUnlocked]
  )

  const onCellEdited = React.useCallback(
    (cell, newValue) => {
      const [col, row] = cell
      if (newValue.kind === GridCellKind.Text) {
        if (newValue.data === '' && data[row][col] === '') {
          const d = data
          d.splice(d.length - 1, 1)
          setData(d)
          return
        } else {
          const oldValue = data[row][col]
          const percIndex = data[row].length - 2
          if (data[row][col] !== undefined) {
            data[row][col] = {
              name: newValue.data ? newValue.data : '',
              id: data[row][col].id,
            }
            data[row][percIndex] = {
              name: !isNaN(data[row][percIndex - 1].name)
                ? rateTableCalculateDiscountPercentage(
                    data[row][percIndex - 1].name,
                    data[row][data[row].length - 1].name
                  ) + '%'
                : 'n/a',
              id: '',
            }
          } else {
            const colDiff = 2
            let x = {
              gradeId: data[row][0].id,
              rateTypeId: data[row][1].id,
              periodId: periods[col - colDiff].periodId,
              rate: parseFloat(newValue.data),
              rate_table_detailsId: rateTableDetails.id,
            }
            costsService.createRate(props.orgId, x).then(res => {
              if (res.status === 200) {
                var rateObj = {
                  name: res.body.rate.toString(),
                  id: res.body.id,
                }
                data[row][col] = rateObj
              }
            })
          }
        }
        if (props.isFirstTimeFlow) {
          formatPayload(periods, data, rateTableDetails, props.setRatePayload)
        } else {
          let x = updatePayload
          if (x.find(item => item.id === data[row][col].id) === undefined) {
            x.push({
              id: data[row][col].id,
              rate: newValue.data ? parseFloat(newValue.data) : null,
              isError: data[row][col].isError,
            })
          } else {
            var itemIdx = x.indexOf(
              x.find(item => item.id === data[row][col].id)
            )
            x[itemIdx].rate = newValue.data ? parseFloat(newValue.data) : null
          }
          setUpdatePayload(x)
        }
      } else {
        return
      }
    },
    //eslint-disable-next-line
    [data]
  )

  const removeColumn = () => {
    let x = columns
    let index = 3
    x.splice(columns.length - index, 1)
    x.forEach((column, index) => {
      if (index > 1 && index < x.length - 2) {
        column.width =
          (((window.innerWidth - 80) / 100) * 80) / periods.length -
          (((window.innerWidth - 80) / 100) * 5 + 375) / periods.length
        if (column.width < 125) column.width = 125
      }
    })
    x[columns.length - index].title = t(
      'organisationAdmin.costs.rateTable.lastPeriod'
    )
    setColumns([...x])
  }

  const addColumn = newCol => {
    let x = columns
    x.splice(columns.length - 2, 0, {
      title: 'Until superseded',
      width: getPeriodColumnWidths(),
      id: columns.length + 1,
      group: dayjs(newCol.startDate).format('MMMM YYYY').toString(),
    })
    x[columns.length - 4].title = dayjs(newCol.startDate)
      .format('MMMM YYYY')
      .toString()
    x.forEach((column, index) => {
      if (index > 1 && index < x.length - 2) {
        column.width =
          (((window.innerWidth - 80) / 100) * 80) / (periods.length + 1) -
          (((window.innerWidth - 80) / 100) * 5 + 375) / (periods.length + 1)
        if (column.width < 125) column.width = 125
      }
    })

    setColumns([...x])
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

  const compareGrades = (a, b) => {
    if (a[0].id === b[0].id) {
      return 0
    } else {
      return a[0].id < b[0].id ? -1 : 1
    }
  }
  const compareRateTypes = (a, b) => {
    if (a[1].id === b[1].id) {
      return 0
    } else {
      return a[1].id < b[1].id ? -1 : 1
    }
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
      client: p =>
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)" opacity=".7"><rect width="24" height="24" rx="12" fill="#4E5BA6"/><path d="M14.7 12c.828 0 1.494-.672 1.494-1.5S15.528 9 14.7 9a1.5 1.5 0 0 0 0 3m-4.5-.6c.996 0 1.794-.804 1.794-1.8s-.798-1.8-1.794-1.8-1.8.804-1.8 1.8.804 1.8 1.8 1.8m4.5 1.8c-1.098 0-3.3.552-3.3 1.65v1.35H18v-1.35c0-1.098-2.202-1.65-3.3-1.65m-4.5-.6c-1.398 0-4.2.702-4.2 2.1v1.5h4.2v-1.35c0-.51.198-1.404 1.422-2.082A7.4 7.4 0 0 0 10.2 12.6" fill="#fff"/></g><defs><clipPath id="a"><rect width="24" height="24" rx="12" fill="#fff"/></clipPath></defs></svg>`,
    }
  }, [])

  //HEADER MENU

  const sortDataArray = sortBy => {
    const sortedData = data
    if (sortBy === 1) {
      sortedData.sort(compareGrades)
      setData(sortedData)
    } else if (sortBy === 2) {
      sortedData.sort(compareRateTypes)
      setData(sortedData)
    }
  }

  const isCellMenuOpen = cellMenu !== undefined

  const sortOpen = Boolean(sortAnchorEL)

  const onCellClick = React.useCallback(
    (...args) => {
      const colDiff = 2
      if (
        args[1].location[0] >= colDiff &&
        editUnlocked &&
        args[1].location[0] !== columns.length - 2
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
  return (
    <div data-test={'matter-rates-table'}>
      {props.isFirstTimeFlow && (
        <Typography>{t('matterCosts.rateTable.lostData')}</Typography>
      )}
      {!props.isFirstTimeFlow && props.isMatterAdmin && (
        <Paper
          style={
            props.isModal
              ? {
                  display: 'flex',
                  borderRadius: 20,
                  boxShadow: 'none',
                  background: 'transparent',
                  paddingRight: 48,
                }
              : {
                  display: 'flex',
                  borderRadius: 20,
                }
          }
        >
          <div style={{ padding: '8px', margin: '8px' }}>
            <div className={classes.headerTitleRow}>
              <Typography variant={'h5'}>
                {t('matterCosts.rateTable.hourlyRate', {
                  type: props.isSnapshot ? 'projection' : 'matter',
                })}
              </Typography>
              {props.isSnapshot && props.snapshotDate && (
                <Chip
                  size="small"
                  className={classes.snapshotDateChip}
                  label={t('matterRates.finalisedChip', {
                    date: dayjs(props.snapshotDate).format('D MMM YYYY'),
                  })}
                />
              )}
            </div>
            <Typography variant={'body1'}>
              {props.isSnapshot
                ? t('matterCosts.rateTable.projectionSubtitle')
                : t('matterCosts.rateTable.manageGradesInMatter')}
            </Typography>
          </div>
          {!props.isSnapshot && !isViewOnly && (
            <div className={classes.confirmBox}>
              {!props.editRates && (
                <Button
                  data-test={'replace-rates'}
                  className={classes.replaceButton}
                  onClick={() => {
                    props.setDoReplace(true)
                    props.setShowRatesModal(false)
                    props.setSelectedPage(1)
                  }}
                >
                  <u>{t('matterRates.replaceButton')}</u>
                </Button>
              )}
              <Button
                data-test={'edit-rates'}
                startIcon={props.editRates ? <SaveIcon /> : <EditIcon />}
                variant="outlined"
                className={classes.confirmButton}
                onClick={() => {
                  if (props.editRates) {
                    props.setEditRates(false)
                    if (updatePayload.length > 0) {
                      costsService.bulkUpdateRates(updatePayload).then(res => {
                        matterCostsService
                          .getCostStageData(props.matterId)
                          .then(res => {
                            if (res.status === 200) {
                              props.setPageInfo(res.body)
                              costsService
                                .getMatterRateTable(
                                  rateTableDetails.id,
                                  props.matterId,
                                  false
                                )
                                .then(res => {
                                  if (res.status === 200) {
                                    props.setRates(res.body)
                                  }
                                })
                            }
                          })
                      })
                    }
                    if (hasChanges) {
                      matterCostsService
                        .getCostStageData(props.matterId)
                        .then(res => {
                          if (res.status === 200) {
                            props.setPageInfo(res.body)
                            costsService
                              .getMatterRateTable(
                                rateTableDetails.id,
                                props.matterId,
                                false
                              )
                              .then(res => {
                                if (res.status === 200) {
                                  props.setRates(res.body)
                                }
                              })
                          }
                        })
                    }
                  } else {
                    props.setEditRates(true)
                  }
                  props.setShowRatesModal(false)
                }}
              >
                {props.editRates ? 'Finish Editing' : 'Edit Rates'}
              </Button>
            </div>
          )}
        </Paper>
      )}
      <div style={{ marginTop: '16px' }}>
        <Paper
          style={{
            position: 'relative',
            width: 'fit-content',
            maxWidth: getTableBaseWidth() - (getTableBaseWidth() / 100) * 10,
            marginLeft: props.isModal
              ? 0
              : ((window.innerWidth - 80) / 100) * 5,
            borderRadius: 20,
          }}
        >
          <div className={classes.gridWrapper}>
            <div
              className={classes.cardIconDiv}
              style={{
                backgroundColor: rawColours.primary.primary.main,
                opacity: '70%',
              }}
            >
              <div>
                <MattersIcon className={classes.cardIcon} />

                <Typography className={classes.cardIconText}>
                  {t('matterRates.cardTitle')}
                </Typography>
              </div>
            </div>
            <div>
              <div style={{ paddingTop: '8px' }}>
                <div style={{ display: 'flex' }}>
                  <Typography variant="subtitle1" className={classes.textDiv}>
                    {matterDetails.matter.name}
                  </Typography>

                  <Typography variant="subtitle1" className={classes.textDiv}>
                    {matterDetails.matter.matterId}
                  </Typography>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex' }}>
                    <Typography variant="body1" className={classes.textDiv}>
                      {t('matterCosts.rateTable.basedOn')}
                    </Typography>
                    <div
                      style={
                        props.rtd.client
                          ? { backgroundColor: 'rgb(78, 91, 166)' }
                          : {
                              backgroundColor:
                                juralioColours.rateTableCards.orgNotRetired,
                            }
                      }
                      className={classes.templateIconDiv}
                    >
                      {props.rtd.client ? (
                        <PeopleIcon style={{ scale: '0.7', color: 'white' }} />
                      ) : (
                        <OrganisationIcon style={{ scale: '0.7' }} />
                      )}
                    </div>
                    <Typography
                      style={{ paddingLeft: '8px' }}
                      variant="body1"
                      className={classes.textDiv}
                    >
                      {rateTableDetails.client
                        ? rateTableDetails.client_name
                        : ''}{' '}
                      {rateTableDetails.location +
                        ' | ' +
                        rateTableDetails.work_type}
                    </Typography>
                    {rateTableDetails.is_retired && (
                      <Tooltip title={t('matterCosts.rateTable.retiredChipTT')}>
                        <Chip
                          size="small"
                          className={classes.retiredChip}
                          label={t('common.retired')}
                        ></Chip>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: '-webkit-center' }}>
              <Typography className={classes.currencyText} variant="h4">
                {rateTableDetails.currency.substr(0, 3)}
              </Typography>
              <Divider className={classes.divider} />
              <Typography className={classes.currencyText} variant="body1">
                {rateTableDetails.currency.substr(5, 100)}
              </Typography>
            </div>
            <div
              className={classes.endIconDiv}
              style={{
                backgroundColor: rawColours.primary.primary.main,
                opacity: '70%',
              }}
            ></div>
          </div>
          <div style={{ display: 'flex', height: 'auto' }}>
            {!props.isFirstTimeFlow && (
              <div
                style={{
                  width: 375,
                  height: 'auto',
                }}
              >
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
                  {t('Sort by: ' + sortingBy)}
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
                      setSortingBy('Grades')
                      setSortAnchorEL(null)
                      sortDataArray(1)
                    }}
                  >
                    {t('organisationAdmin.costs.rateTable.grades')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSortingBy('Rate Types')
                      setSortAnchorEL(null)
                      sortDataArray(2)
                    }}
                  >
                    {t('organisationAdmin.costs.rateTable.rateTypes')}
                  </MenuItem>
                </Menu>
              </div>
            )}
            {!props.isFirstTimeFlow && (
              <div>
                <Button
                  className={classes.sortButton}
                  style={{
                    height: '27px',
                    borderRadius: '0px',
                    textTransform: 'none',
                    width:
                      getTableBaseWidth() -
                      ((getTableBaseWidth() / 100) * 10 + 375),
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
          <div id="glideTest">
            <DataEditor
              validateCell={(_cell, newValue) => {
                if (newValue.kind !== GridCellKind.Text) return true
                if (!isNaN(newValue.data)) return true
                return false
              }}
              height={window.innerHeight * 0.45}
              {...customProps}
              getCellContent={getContent}
              columns={columns}
              rows={data.length}
              smoothScrollX={true}
              onCellEdited={onCellEdited}
              getCellsForSelection={true}
              onPaste={true}
              onGroupHeaderClicked={onCellClick}
              headerIcons={headerIcons}
              freezeColumns={2}
              theme={rateTableTheme}
            />
          </div>
          <div
            id="targetCell"
            style={{
              width: '300px',
              position: 'fixed',
              top: cellMenu ? cellMenu.boundry.y + cellMenu.boundry.height : 0,
              left: cellMenu ? cellMenu.boundry.x : 0,
            }}
          >
            {isCellMenuOpen && (
              <div style={{ visibility: 'hidden' }}>
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
                    disableRipple
                    sx={{ '&:hover': { backgroundColor: 'white' } }}
                    style={{ height: 'fit-content', cursor: 'default' }}
                  >
                    <div>
                      <div>
                        <Typography style={{ marginLeft: '12px' }}>
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
                        format="yyyy-MM"
                        closeOnSelect={false}
                        onMonthChange={e => {
                          updateValue(e)
                        }}
                      />
                    </div>
                  </MenuItem>
                  {cellMenu.location[0] + 1 === columns.length - 2 &&
                    periods.length > 1 && (
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
                                costsService
                                  .getMatterRateTable(
                                    rateTableDetails.id,
                                    props.matterId,
                                    false
                                  )
                                  .then(res => {
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
                        style={{ height: 'fit-content' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Typography style={{ marginLeft: '12px' }}>
                            {t(
                              'organisationAdmin.costs.rateTable.deletePeriod'
                            )}
                          </Typography>
                          <DeleteIcon
                            style={{
                              color: juralioColours.darkText.primary,
                              marginLeft: '4px',
                            }}
                          />
                        </div>
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
                  getContentAnchorEl={null}
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
          <div className={classes.bottomRowDisabled}>
            <div />
            <div style={{ display: 'inline-flex', paddingTop: '16px' }}></div>
            <div />
          </div>
        </Paper>
      </div>

      {showDialog && (
        <RateTableDetailsEditDialog
          updateValues={setRateTableDetails}
          values={rateTableDetails}
          closeHandler={setShowDialog}
          display={showDialog}
        />
      )}
      {newColumn && (
        <NewPeriodDialog
          periods={periods}
          orgId={props.orgId}
          updateValues={setPeriods}
          updateRates={setRatesDTO}
          rtdId={rtd.id}
          data={data}
          closeHandler={setNewColumn}
          addColumn={addColumn}
          display={newColumn}
          rateTableDetails={rateTableDetails}
          matterId={props.matterId}
          setHasChanges={setHasChanges}
        />
      )}
    </div>
  )
}
export default MatterRatesTable
