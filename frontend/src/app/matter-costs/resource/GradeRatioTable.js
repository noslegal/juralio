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
  LinearProgress,
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
import RatioLineBar from './RatioLineBar'
import GradeRatioCheckbox from './GradeRatioCheckbox'
import rawColours from '../../../theme/raw-colours'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  tableContainer: {
    marginTop: '16px',
    border: 'solid',
    borderRadius: '8px',
    '& .MuiTableCell-root': {
      padding: 0,
      borderBottom: 'none',
    },
  },
  totalRow: {
    marginTop: theme.spacing(3),
  },
  pieChartAxis: {
    textAlign: 'center',
    width: '100%',
  },
  totalHourHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.primary.main,
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
    borderRadius: '0px 2px 0px 0px',
    height: '31px',
  },
  gAndgHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    height: '31px',
    alignItems: 'center',
  },
  barHeader: {
    backgroundColor: rawColours.primary.black[200],
    height: '31px',
  },
  collapseAllHeader: {
    display: 'flex',
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
    height: '31px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '75% 25%',
  },
  leftColumn: {
    marginRight: '12px',
  },
  fixedTable: {
    tableLayout: 'fixed',
  },
  colWidthIcon: {
    width: '40px',
  },
  colWidthName: {
    width: '40%',
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
    width: '90%',
  },
  progressBarTrack: {
    backgroundColor: 'lightgrey',
  },
  pieChartColumn: {
    placeSelf: 'center',
    width: '100%',
  },
  pieChartContainer: {
    width: '100%',
    height: '220px',
  },
  totalBox: {
    fontFamily: 'Montserrat',
    fontWeight: 'bolder',
    fontSize: '20px',
    color: 'black',
    opacity: '70%',
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '50%',
    padding: '24px',
    textAlign: 'center',
    border: '2px dashed',
    borderRadius: '4px',
  },
  totalBoxOver: {
    backgroundColor: '#FECDCA',
  },
  totalBoxEqual: {
    backgroundColor: '#ABEFC6',
  },
}))

const GradeRatioTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [showSpinner, setShowSpinner] = useState(true)
  const [grades, setGrades] = useState([])
  const [payload, setPayload] = useState([])
  const [currentTotal, setCurrentTotal] = useState()
  const [gradeCategoryList, setGradeCategoryList] = useState()
  const [expandedRows, setExpandedRows] = useState([])

  const columns = [
    generateIconHeader(
      t('matterRates.gradesAndCategoriesHeader'),
      1,
      classes.gAndgHeader
    ),
    generateIconHeader('             ', 2, classes.barHeader),
    generateIconHeader(
      t('matterRates.percentOfTotalHoursHeader'),
      3,
      classes.totalHourHeader
    ),
    generateIconHeader(
      t('matterRates.recoveryRateHeader'),
      4,
      classes.recoveryHeader
    ),
  ]

  const createPayload = gradeList => {
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
      const remainder = 100 % gradeCategoryLists.size

      if (remainder !== 0) {
        const valueNoRemainder = Math.floor(100 / gradeCategoryLists.size)
        const remainderValue = Math.ceil(remainder / gradeCategoryLists.size)
        gradeCategoryLists.forEach((category, index) => {
          let catValue = 0
          if (index >= gradeCategoryLists.size - remainder && remainder > 0) {
            catValue = valueNoRemainder + remainderValue
          } else {
            catValue = valueNoRemainder
          }
          let gradeCount = gradeList.filter(
            g => g.group.id === category.id
          ).length
          const gradeRemainder = catValue % gradeCount
          newPayload.push({
            categoryId: category.id,
            category: category,
            grades: gradeList
              .filter(g => g.group.id === category.id)
              .map((grade, index) => {
                let ratioValue = 0
                if (gradeRemainder !== 0) {
                  const gradeValueNoRemainder = Math.floor(
                    catValue / gradeCount
                  )
                  const gradeRemainderValue = Math.ceil(
                    gradeRemainder / gradeCount
                  )
                  if (
                    index >= gradeCount - gradeRemainder &&
                    gradeRemainder > 0
                  ) {
                    ratioValue = gradeValueNoRemainder + gradeRemainderValue
                  } else {
                    ratioValue = gradeValueNoRemainder
                  }
                } else {
                  ratioValue = catValue / gradeCount
                }
                return {
                  grade: grade,
                  gradeName: grade.name,
                  gradeId: grade.id,
                  ratioValue: ratioValue,
                  recoveryRate: 100,
                }
              }),
            totalRatio: catValue,
            totalRecovery: 100,
          })
        })
      } else {
        gradeCategoryLists.forEach(category => {
          let catValue = 100 / gradeCategoryLists.size
          let gradeCount = gradeList.filter(
            g => g.group.id === category.id
          ).length
          const gradeRemainder = catValue % gradeCount
          newPayload.push({
            categoryId: category.id,
            category: category,
            grades: gradeList
              .filter(g => g.group.id === category.id)
              .map((grade, index) => {
                let ratioValue = 0
                if (gradeRemainder !== 0) {
                  const gradeValueNoRemainder = Math.floor(
                    catValue / gradeCount
                  )
                  const gradeRemainderValue = Math.ceil(
                    gradeRemainder / gradeCount
                  )
                  if (
                    index >= gradeCount - gradeRemainder &&
                    gradeRemainder > 0
                  ) {
                    ratioValue = gradeValueNoRemainder + gradeRemainderValue
                  } else {
                    ratioValue = gradeValueNoRemainder
                  }
                } else {
                  ratioValue = catValue / gradeCount
                }
                return {
                  grade: grade,
                  gradeName: grade.name,
                  gradeId: grade.id,
                  ratioValue: ratioValue,
                  recoveryRate: 100,
                  projectionPeriod: props.fullPeriod.id,
                }
              }),
            totalRatio: 100 / gradeCategoryLists.size,
            totalRecovery: 100,
          })
        })
      }
    }
    dispatch(updateRatioPayload(newPayload))
    setPayload(newPayload)
    props.setGradeHourPayload(formatPayloadForRequest(newPayload))
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
        formattedPayload.push({
          ...grade,
          projectionPeriod: props.fullPeriod.id,
        })
      })
    })
    return formattedPayload
  }

  const updatePayload = (
    value,
    index,
    isHour,
    isCategory,
    categoryId,
    id,
    reEnableGradeId
  ) => {
    let payloadCopy = payload

    if (isCategory) {
      const categoryToUpdate = payloadCopy.find(
        category => category.categoryId === id
      )
      if (isHour) {
        categoryToUpdate.totalRatio = parseInt(value)
        let gradeCount = categoryToUpdate.grades.filter(
          grade => grade.ratioValue > 0 || grade.gradeId === reEnableGradeId
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
              .filter(
                grade =>
                  grade.ratioValue > 0 || grade.gradeId === reEnableGradeId
              )
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
              .filter(
                grade =>
                  grade.ratioValue > 0 || grade.gradeId === reEnableGradeId
              )
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
    props.setGradeHourPayload(formatPayloadForRequest(payloadCopy))
    getTotal(payloadCopy)
  }

  useEffect(() => {
    setShowSpinner(true)
    costsService.getMatterRateTableGrades(props.matterId).then(res => {
      if (res.status === 200) {
        setGrades(res.body)
        createPayload(res.body)
      }
    })
  }, []) //eslint-disable-line

  useEffect(() => {
    if (grades && gradeCategoryList && payload) {
      setShowSpinner(false)
    }
  }, [payload]) //eslint-disable-line

  const getTotal = payload => {
    let total = 0
    payload.forEach(row => {
      total += row.totalRatio
    })
    props.setTotalHours(total)
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

  return (
    <div>
      {showSpinner && <BigDataSpinner size={180} />}
      {!showSpinner && payload.length > 0 && (
        <div className={classes.mainGrid}>
          <div className={classes.leftColumn}>
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
                          <RatioLineBar
                            isHour={true}
                            isCategory={true}
                            id={category.categoryId}
                            colour_idx={category.category.colour}
                          />
                        </TableCell>
                        <TableCell>
                          <EditHourField
                            index={index}
                            updatePayload={updatePayload}
                            isHour={true}
                            isCategory={true}
                            id={category.categoryId}
                          />
                        </TableCell>
                        <TableCell>
                          <EditHourField
                            index={index}
                            value={category.totalRecovery}
                            updatePayload={updatePayload}
                            isHour={false}
                            id={category.categoryId}
                            isCategory={true}
                          />
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
                                        categoryValue={category.totalRatio}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <div className={classes.gradeChipWrapper}>
                                        <GradeChip grade={grade.grade} />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <LinearProgress
                                        className={classes.progressBarTrack}
                                        sx={{
                                          '& .MuiLinearProgress-bar': {
                                            backgroundColor:
                                              CATEGORY_COLOURS[
                                                grade.grade.colour_idx
                                              ].primary,
                                          },
                                        }}
                                        variant="determinate"
                                        value={normalise(
                                          grade.ratioValue,
                                          category.totalRatio
                                        )}
                                      />
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
                                      />
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
          </div>
          {payload && currentTotal && (
            <div className={classes.pieChartColumn}>
              <Typography className={classes.pieChartAxis}>
                {t('matterRates.gradeTablePieTitle')}
              </Typography>
              <div className={classes.pieChartContainer}>
                <PieChart
                  margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
                  series={[
                    {
                      data: pieChartValues,
                      innerRadius: 40,
                      outerRadius: 100,
                      paddingAngle: 1,
                      cornerRadius: 0,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: {
                        innerRadius: 30,
                        additionalRadius: -30,
                        color: 'gray',
                      },
                      valueFormatter: v => v.value + '%',
                    },
                  ]}
                  slotProps={{
                    legend: {
                      itemGap: 12,
                      direction: 'row',
                      position: { vertical: 'bottom', horizontal: 'middle' },
                      padding: -10,
                    },
                  }}
                />
              </div>
              <div>
                <div className={classes.totalRow}>
                  <div>
                    <div
                      className={classNames(classes.totalBox, {
                        [classes.totalBoxOver]: currentTotal > 100,
                        [classes.totalBoxEqual]: currentTotal === 100,
                      })}
                    >
                      {currentTotal + '%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default GradeRatioTable
