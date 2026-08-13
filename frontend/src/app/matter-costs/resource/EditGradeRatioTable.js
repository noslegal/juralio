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

import classNames from 'classnames'
import { useState, useEffect } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  Typography,
  Paper,
  Box,
  Switch,
  FormGroup,
  FormControlLabel,
  Tooltip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import RemoveIcon from '@mui/icons-material/Remove'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import costsService from '../../../services/costs/costs-service'
import GradeChip from '../GradeChip'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import { generateIconHeader } from '../../../services/helpers/table/juralio-table-helper'
import EditHourField from './EditHourField'
import PieChart from '../../../components/charts/LazyPieChart'
import { CATEGORY_COLOURS } from '../../constants'
import juralioColours from '../../../theme/juralio-colours'
import { useDispatch } from 'react-redux'
import { updateRatioPayload } from '../../../redux/ducks/matter-costs'
import GradeRatioCheckbox from './GradeRatioCheckbox'
import rawColours from '../../../theme/raw-colours'
import { getTotalProjectionHours } from '../outcomes/revenueHelper'
import {
  MattersIcon,
  TaskIcon,
  WorkstreamIcon,
} from '../../../theme/navigation/CommonIcons'
import isEqual from 'lodash/isEqual'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  tableContainer: {
    '& .MuiTableCell-root': {
      padding: 0,
      borderBottom: 'none',
    },
  },
  percentHoursHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.primary.main,
    color: juralioColours.whiteText.primary,
    paddingLeft: theme.spacing(1.5),
    alignItems: 'center',
    height: '31px',
  },
  hoursHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    paddingLeft: theme.spacing(1.5),
    alignItems: 'center',
    height: '31px',
  },
  recoveryHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.primary.main,
    color: juralioColours.whiteText.primary,
    alignItems: 'center',
    height: '31px',
    paddingLeft: theme.spacing(0.25),
  },
  gAndgHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    height: '31px',
    alignItems: 'center',
  },
  collapseAllHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    height: '31px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterRow: {
    display: 'grid',
    gridTemplateColumns: '45% 15% 20% 20%',
    minHeight: theme.spacing(7),
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '45% 15% 20% 20%',
    minHeight: theme.spacing(6),
    borderTop: 'solid 1px gainsboro',
  },
  workstreamDetailsContainer: {
    display: 'flex',
    paddingLeft: 8,
    paddingTop: 8,
  },
  diagramContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: theme.spacing(9),
  },
  totalHoursDiv: {
    alignContent: 'center',
    padding: '8px',
  },
  switchRow: {
    display: 'flex',
    marginBottom: '8px',
  },
  switchWrapper: {
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: '4px',
  },
  outerBorder: {
    border: 'solid',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  headerRow: {
    height: 64,
  },
  headerRowMatter: {
    backgroundColor: '#B3B8DB',
  },
  headerRowWorkstream: {
    backgroundColor: '#D5D9EB',
  },
  headerRowNotStarted: {
    backgroundColor: juralioColours.taskStatus.filteredIn.notStarted,
  },
  headerRowInProgress: {
    backgroundColor: juralioColours.taskStatus.filteredIn.inProgress,
  },
  headerRowDone: {
    backgroundColor: juralioColours.taskStatus.filteredIn.done,
  },
  gainsboroBg: {
    backgroundColor: 'gainsboro',
  },
  fixedTable: {
    tableLayout: 'fixed',
  },
  colWidthIcon: {
    width: '4%',
  },
  colWidthName: {
    width: '41%',
  },
  colWidthBar: {
    width: '15%',
  },
  colWidthValue: {
    width: '20%',
  },
  noVerticalPadding: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  gradeChipWrapper: {
    marginLeft: 'auto',
    width: '80%',
    marginRight: '16px',
  },
  errorMessageWrapper: {
    alignContent: 'center',
    marginLeft: 'auto',
    color: juralioColours.error,
  },
  totalBox: {
    fontFamily: 'Montserrat',
    fontWeight: 'bolder',
    fontSize: '20px',
    color: 'black',
    width: '100%',
    alignContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  errorIcon: {
    fill: juralioColours.error,
    marginLeft: '12px',
  },
  successIcon: {
    fill: 'green',
    marginLeft: '12px',
  },
  totalPercentText: {
    marginRight: '5%',
    width: 'fit-content',
  },
}))

const EditGradeRatioTable = props => {
  const {
    isSnapshot,
    gradeDialogType,
    tasks,
    matterId,
    workstreamName,
    setCantSave,
    fullPeriod,
    setGradeHourPayload,
    matter,
  } = props
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [showSpinner, setShowSpinner] = useState(true)
  const [grades, setGrades] = useState([])
  const [payload, setPayload] = useState([])
  const [currentTotal, setCurrentTotal] = useState()
  const [gradeCategoryList, setGradeCategoryList] = useState()
  const [dataForComparison, setDataForComparison] = useState()
  const [showUnassigned, setShowUnassigned] = useState(true)
  const [expandedRows, setExpandedRows] = useState([])

  const totalHours = getTotalProjectionHours(
    gradeDialogType.cteId
      ? props.tasks.filter(x => x.id === props.gradeDialogType.cteId)
      : gradeDialogType.workstreamId
        ? props.tasks.filter(
            x => x.task.projectId === props.gradeDialogType.workstreamId
          )
        : props.tasks
  )
  const { t } = useTranslation()

  const columns = [
    generateIconHeader(
      t('matterRates.gradesHeader'),
      1,
      classes.gAndgHeader,
      { filter: false },
      '225px',
      '425px'
    ),
    generateIconHeader(
      t('matterRates.percentOfTimeHeader'),
      2,
      classes.percentHoursHeader,
      { filter: false },
      '95px',
      '100px'
    ),
    generateIconHeader(
      t('common.hours'),
      1,
      classes.hoursHeader,
      { filter: false },
      '95px',
      '100px'
    ),
    generateIconHeader(
      t('matterRates.recoveryRatePercentHeader'),
      1,
      classes.recoveryHeader,
      { filter: false },
      '95px',
      '100px'
    ),
  ]

  const createPayload = (ratioList, gradeList) => {
    var newPayload = []
    let gradeCategoryLists = new Map()
    gradeList.forEach(grade => {
      gradeCategoryLists.set(grade.group.id, {
        id: grade.group.id,
        name: grade.group.name,
        value: 0,
        colour: grade.colour_idx,
      })
    })
    if (gradeCategoryLists !== undefined || gradeCategoryLists.size !== 0) {
      setGradeCategoryList(gradeCategoryLists)
      gradeCategoryLists.forEach(category => {
        let catValue = 0
        let catRecovery = 0
        newPayload.push({
          categoryId: category.id,
          category: category,
          grades: gradeList
            .filter(grade => grade.group.id === category.id)
            .map(grade => {
              let existingRatio = ratioList.find(
                ratio => ratio.gradeId === grade.id
              )
              if (existingRatio) {
                catValue += existingRatio.ratioValue
                catRecovery += existingRatio.recoveryRate
                return {
                  grade: grade,
                  gradeName: existingRatio.gradeName,
                  gradeId: existingRatio.gradeId,
                  ratioId: existingRatio.ratioId,
                  ratioValue: existingRatio.ratioValue,
                  recoveryRate: existingRatio.recoveryRate,
                }
              } else {
                return {
                  grade: grade,
                  gradeName: grade.name,
                  gradeId: grade.id,
                  ratioValue: 0,
                  recoveryRate: 100,
                }
              }
            }),
          totalRatio: catValue,
          totalRecovery:
            catRecovery /
            gradeList.filter(grade => grade.group.id === category.id).length,
        })
      })
    }
    dispatch(updateRatioPayload(newPayload))
    setPayload(newPayload)
    let formattedPayload = formatPayloadForRequest(newPayload)
    setDataForComparison(formattedPayload)
    props.setGradeHourPayload(formattedPayload)
    getTotal(newPayload)
  }

  const redistributePercentages = (category, gradeToSplit) => {
    const gradesToUpdate = category.grades.filter(
      grade => grade.ratioValue !== 0 && grade.gradeId !== gradeToSplit.gradeId
    )
    const gradeCount = gradesToUpdate.length
    if (gradeCount !== 0) {
      const remainder = category.totalRatio % gradeCount
      if (remainder !== 0) {
        category.grades.forEach((grade, index) => {
          if (
            grade.ratioValue !== 0 &&
            grade.gradeId !== gradeToSplit.gradeId
          ) {
            const valueNoRemainder = Math.floor(
              category.totalRatio / gradeCount
            )
            const remainderValue = Math.ceil(remainder / gradeCount)
            if (index >= category.grades.length - remainder && remainder > 0) {
              grade.ratioValue = valueNoRemainder + remainderValue
            } else {
              grade.ratioValue = valueNoRemainder
            }
          } else if (grade.gradeId === gradeToSplit.gradeId) {
            grade.ratioValue = 0
          }
        })
      } else {
        category.grades.forEach(grade => {
          if (
            grade.ratioValue !== 0 &&
            grade.gradeId !== gradeToSplit.gradeId
          ) {
            grade.ratioValue = category.totalRatio / gradeCount
          } else if (grade.gradeId === gradeToSplit.gradeId) {
            grade.ratioValue = 0
          }
        })
      }
    } else {
      category.grades.forEach(grade => {
        grade.ratioValue = 0
      })
      category.totalRatio = 0
    }
    return category
  }

  const formatPayloadForRequest = payload => {
    let formattedPayload = []
    payload.forEach(category => {
      category.grades.forEach(grade => {
        if (!(grade.ratioId === undefined && grade.ratioValue === 0)) {
          formattedPayload.push({
            ratioValue: parseInt(grade.ratioValue),
            recoveryRate: parseInt(grade.recoveryRate),
            costRatioId: grade.ratioId,
            gradeId: grade.gradeId,
            projectionPeriod: fullPeriod.id,
            workstreamId: gradeDialogType.workstreamId
              ? gradeDialogType.workstreamId
              : null,
            cteId: gradeDialogType.cteId ? gradeDialogType.cteId : null,
          })
        }
      })
    })
    return formattedPayload
  }

  useEffect(() => {
    if (payload) {
      let payloadCopy = payload
      if (showUnassigned) {
        payloadCopy.forEach(category => {
          grades
            .filter(grade => grade.group.id === category.categoryId)
            .forEach(grade => {
              if (!category.grades.find(g => g.gradeId === grade.id)) {
                category.grades.push({
                  grade: grade,
                  gradeName: grade.name,
                  gradeId: grade.id,
                  ratioValue: 0,
                  recoveryRate: 100,
                })
              }
            })
          category.grades.sort((a, b) => a.gradeId - b.gradeId)
        })
      } else {
        payloadCopy.forEach(category => {
          category.grades = category.grades.filter(
            grade => grade.ratioValue !== 0
          )
        })
      }
      dispatch(updateRatioPayload(payloadCopy))
      setPayload(payloadCopy)
      setGradeHourPayload(formatPayloadForRequest(payloadCopy))
    }
  }, [showUnassigned]) //eslint-disable-line

  const updatePayload = (value, index, isHour, isCategory, categoryId, id) => {
    let payloadCopy = payload

    if (isCategory) {
      const categoryToUpdate = payloadCopy.find(
        category => category.categoryId === id
      )
      if (isHour) {
        categoryToUpdate.totalRatio = parseInt(value)
        let gradeCount = categoryToUpdate.grades.filter(
          grade => grade.ratioValue > 0
        ).length
        if (gradeCount === 0) {
          gradeCount = categoryToUpdate.grades.length
          const remainder = value % gradeCount
          if (remainder !== 0) {
            categoryToUpdate.grades.forEach((grade, index) => {
              const valueNoRemainder = Math.floor(value / gradeCount)
              const remainderValue = Math.ceil(remainder / gradeCount)
              if (index >= gradeCount - remainder && remainder > 0) {
                grade.ratioValue = valueNoRemainder + remainderValue
              } else {
                grade.ratioValue = valueNoRemainder
              }
            })
          } else {
            categoryToUpdate.grades.forEach(grade => {
              grade.ratioValue = value / gradeCount
            })
          }
        } else {
          const remainder = value % gradeCount
          if (remainder !== 0) {
            categoryToUpdate.grades
              .filter(grade => grade.ratioValue > 0)
              .forEach((grade, index) => {
                const valueNoRemainder = Math.floor(value / gradeCount)
                const remainderValue = Math.ceil(remainder / gradeCount)
                if (index >= gradeCount - remainder && remainder > 0) {
                  grade.ratioValue = valueNoRemainder + remainderValue
                } else {
                  grade.ratioValue = valueNoRemainder
                }
              })
          } else {
            categoryToUpdate.grades
              .filter(grade => grade.ratioValue > 0)
              .forEach(grade => {
                grade.ratioValue = value / gradeCount
              })
          }
        }
        if (categoryToUpdate.totalRecovery === 0) {
          categoryToUpdate.totalRecovery = 100
        }
      } else {
        categoryToUpdate.totalRecovery = parseInt(value)
        categoryToUpdate.grades.forEach(grade => {
          grade.recoveryRate = value
        })
      }
    } else {
      let categoryToUpdate = payloadCopy.find(
        category => category.categoryId === categoryId
      )
      const gradeToUpdate = categoryToUpdate.grades.find(
        grade => grade.gradeId === id
      )
      if (isHour) {
        if (parseInt(value) === 0) {
          categoryToUpdate = redistributePercentages(
            categoryToUpdate,
            gradeToUpdate
          )
          gradeToUpdate.recoveryRate = 100
        } else {
          const newValue = value - gradeToUpdate.ratioValue
          categoryToUpdate.totalRatio = categoryToUpdate.totalRatio + newValue
          gradeToUpdate.ratioValue = value
        }
      } else {
        gradeToUpdate.recoveryRate = parseInt(value)
      }
    }
    dispatch(updateRatioPayload(payloadCopy))
    setPayload(payloadCopy)
    setGradeHourPayload(formatPayloadForRequest(payloadCopy))
    getTotal(payloadCopy)
  }

  useEffect(() => {
    setShowSpinner(true)
    costsService.getMatterRateTableGrades(matterId).then(res => {
      if (res.status === 200) {
        setGrades(res.body)
        createPayload(props.grades, res.body)
      }
    })
  }, []) //eslint-disable-line

  useEffect(() => {
    if (grades && gradeCategoryList && payload) {
      if (
        isEqual(formatPayloadForRequest(payload), dataForComparison) ||
        currentTotal > 100 ||
        currentTotal < 100
      ) {
        setCantSave(true)
      } else {
        setCantSave(false)
      }
      setShowSpinner(false)
    }
  }, [JSON.stringify(payload), currentTotal]) //eslint-disable-line

  const getTotal = payload => {
    let total = 0
    payload.forEach(row => {
      total += row.totalRatio
    })
    setCurrentTotal(total)
    return total
  }

  const normalise = (value, MAX) =>
    MAX !== 0 ? ((value - 0) * 100) / (MAX - 0) : ((value - 0) * 100) / (1 - 0)

  const toggleRow = categoryId => {
    setExpandedRows(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const valueFormatter = item => `${item.value}%`

  let pieChartValues = payload
    .map(category => ({
      label: category.category.name,
      value: category.totalRatio,
      color: CATEGORY_COLOURS[category.category.colour].primary,
      valueFormatter,
    }))
    .filter(values => values.value > 0)

  const cteStatus = gradeDialogType.cteId
    ? tasks.filter(x => x.id === gradeDialogType.cteId)[0]?.task.status
    : null
  const headerBgClass = gradeDialogType.matter
    ? classes.headerRowMatter
    : gradeDialogType.workstreamId
      ? classes.headerRowWorkstream
      : cteStatus === 'not-started'
        ? classes.headerRowNotStarted
        : cteStatus === 'in-progress'
          ? classes.headerRowInProgress
          : classes.headerRowDone

  return (
    <div>
      {showSpinner && <BigDataSpinner size={180} />}
      {!showSpinner && payload.length > 0 && (
        <div>
          <div className={classes.switchRow}>
            <div className={classes.switchWrapper}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showUnassigned}
                      onChange={e => setShowUnassigned(e.target.checked)}
                      size="small"
                    />
                  }
                  label={t('matterRates.showAllGrades')}
                />
              </FormGroup>
            </div>
          </div>
          <div className={classes.outerBorder}>
            <div>
              <Paper className={classes.matterRow}>
                <div>
                  <div
                    className={classNames(
                      classes.workstreamDetailsContainer,
                      classes.headerRow,
                      headerBgClass
                    )}
                  >
                    {gradeDialogType.matter ? (
                      <MattersIcon />
                    ) : gradeDialogType.workstreamId ? (
                      <WorkstreamIcon />
                    ) : (
                      <TaskIcon />
                    )}
                    <Typography variant="h6">
                      {gradeDialogType.matter
                        ? matter.name
                        : gradeDialogType.workstreamId
                          ? workstreamName
                          : tasks.filter(x => x.id === gradeDialogType.cteId)[0]
                              .task.name}
                    </Typography>
                  </div>
                </div>
                <div className={classes.diagramContainer}>
                  <PieChart
                    margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    series={[
                      {
                        cx: 30,
                        cy: 30,
                        data: pieChartValues,
                        innerRadius: 10,
                        outerRadius: 30,
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
                    width={100}
                    height={70}
                  />
                </div>
                <div
                  className={classNames(
                    classes.totalHoursDiv,
                    classes.gainsboroBg
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ minWidth: 35, marginRight: '12px' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('matterRates.totalHoursLabel', {
                          hours: totalHours,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </div>
                <div className={classes.gainsboroBg} />
              </Paper>
            </div>
            <div className={classes.tableContainer} data-test="gradeRatio">
              <Table size="small" className={classes.fixedTable}>
                <colgroup>
                  <col className={classes.colWidthIcon} />
                  <col className={classes.colWidthName} />
                  <col className={classes.colWidthBar} />
                  <col className={classes.colWidthValue} />
                  <col className={classes.colWidthValue} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <div className={classes.collapseAllHeader}>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedRows([])}
                          sx={{ color: 'white' }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                    {columns.map(col => (
                      <TableCell key={col.field}>
                        {col.renderHeader()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payload.map((category, index) => (
                    <>
                      <TableRow key={category.categoryId}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(category.categoryId)}
                          >
                            {expandedRows.includes(category.categoryId) ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <GradeChip
                            grade={{
                              name: category.category.name,
                              colour_idx: category.category.colour,
                              id: category.categoryId,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={t('matterRates.editDisabledFinalisedTT')}
                            disableHoverListener={!isSnapshot}
                          >
                            <span>
                              <EditHourField
                                index={index}
                                updatePayload={updatePayload}
                                isHour={true}
                                isCategory={true}
                                id={category.categoryId}
                                disabled={isSnapshot}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ marginLeft: '20px' }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >{`${(
                              totalHours *
                              (category.totalRatio / 100)
                            ).toFixed(1)}h`}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={t('matterRates.editDisabledFinalisedTT')}
                            disableHoverListener={!isSnapshot}
                          >
                            <span>
                              <EditHourField
                                index={index}
                                value={category.totalRecovery}
                                updatePayload={updatePayload}
                                isHour={false}
                                id={category.categoryId}
                                isCategory={true}
                                disabled={isSnapshot}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow key={`${category.categoryId}-expand`}>
                        <TableCell
                          colSpan={columns.length + 1}
                          className={classes.noVerticalPadding}
                        >
                          <Collapse
                            in={expandedRows.includes(category.categoryId)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Table size="small" className={classes.fixedTable}>
                              <colgroup>
                                <col className={classes.colWidthIcon} />
                                <col className={classes.colWidthName} />
                                <col className={classes.colWidthBar} />
                                <col className={classes.colWidthValue} />
                                <col className={classes.colWidthValue} />
                              </colgroup>
                              <TableBody>
                                {category.grades.map(grade => (
                                  <TableRow key={grade.grade.id}>
                                    <TableCell>
                                      <GradeRatioCheckbox
                                        updatePayload={updatePayload}
                                        id={grade.grade.id}
                                        categoryId={category.categoryId}
                                        disabled={props.isSnapshot}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className={classes.gradeChipWrapper}>
                                        <GradeChip grade={grade.grade} />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <EditHourField
                                        height={42}
                                        index={1}
                                        updatePayload={updatePayload}
                                        isHour={true}
                                        isCategory={false}
                                        id={grade.grade.id}
                                        categoryId={category.categoryId}
                                        disabled={isSnapshot}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Box sx={{ minWidth: 35 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >{`${(
                                            totalHours *
                                            (grade.ratioValue / 100)
                                          ).toFixed(1)}h`}</Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <EditHourField
                                        height={42}
                                        index={1}
                                        value={grade.grade.recoveryRate}
                                        updatePayload={updatePayload}
                                        isHour={false}
                                        id={grade.grade.id}
                                        categoryId={category.categoryId}
                                        disabled={isSnapshot}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Paper className={classes.bottomRow}>
              <div className={classes.errorMessageWrapper}>
                {currentTotal !== 100 && (
                  <Typography>
                    {t('matterRates.editGradeRatioError')}
                  </Typography>
                )}
              </div>
              <div className={classes.totalBox}>
                {currentTotal !== 100 ? (
                  <CancelIcon className={classes.errorIcon} />
                ) : (
                  <CheckCircleIcon className={classes.successIcon} />
                )}
                <Typography
                  variant="body2"
                  className={classes.totalPercentText}
                >
                  {currentTotal + '%'}
                </Typography>
              </div>
              <div className={classes.totalHoursDiv}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 35, marginRight: '4px' }}>
                    <Typography variant="body2" color="text.secondary">{`${(
                      totalHours *
                      (currentTotal / 100)
                    ).toFixed(0)}h`}</Typography>
                  </Box>
                </Box>
              </div>
              <div />
            </Paper>
          </div>
        </div>
      )}
    </div>
  )
}
export default EditGradeRatioTable
