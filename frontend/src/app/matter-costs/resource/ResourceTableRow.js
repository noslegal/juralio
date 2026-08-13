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

import React, { useState } from 'react'
import { Typography, Paper, Select, MenuItem, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { makeStyles } from 'tss-react/mui'
import '@glideapps/glide-data-grid/dist/index.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ResourceTaskChip from './ResourceTaskChip'
import {
  EditIcon,
  MattersIcon,
  WorkstreamIcon,
} from '../../../theme/navigation/CommonIcons'
import PieChart from '../../../components/charts/LazyPieChart'
import { CATEGORY_COLOURS, gradeDialogConsts } from '../../constants'
import { getPricingIcon, getPricingType } from '../outcomes/pricingCardHelper'
import EditGradeRatioDialog from './EditGradeRatioDialog'
import juralioColours from '../../../theme/juralio-colours'
import FakeTaskChip from './FakeTaskChip'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { getCostRatios, getTaskCounts } from './MatterCostsTableHelper'
import { useDispatch } from 'react-redux'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'

const useStyles = makeStyles()(theme => ({
  row: {
    display: 'grid',
    gridTemplateColumns: '5% 75% 20% ',
    minHeight: theme.spacing(10),
    borderRight: 'solid',
    borderWidth: '1px',
    borderColor: 'white',
    borderRadius: '0',
  },
  expandButton: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#717BBC',
    '&:hover': {
      backgroundColor: '#484f7a',
    },
    height: 80,
  },
  expandButtonPricing: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: 'rgba(132, 150, 122, 1)',
    '&:hover': {
      backgroundColor: 'rgba(100, 118, 90, 1)',
    },
    height: 80,
  },
  workstreamDetailsContainer: {
    display: 'flex',
    paddingLeft: 8,
    paddingTop: 8,
    height: 72,
  },
  matterRowDetailsBg: {
    backgroundColor: '#B3B8DB',
  },
  workstreamRowDetailsBg: {
    backgroundColor: '#D5D9EB',
  },
  pricingRowDetailsBg: {
    backgroundColor: 'lightgrey',
  },
  disabledInteractions: {
    pointerEvents: 'none',
  },
  diagramContainer: {
    display: 'grid',
    gridTemplateColumns: ' 80% 20%',
    width: '100%',
  },
  pieChartWrapper: {
    width: 60,
    height: 80,
    overflow: 'hidden',
    marginLeft: 16,
  },
  matterBgColour: {
    backgroundColor: 'rgb(179, 184, 219)',
  },
  workstreamBgColour: {
    backgroundColor: 'rgb(213, 217, 235)',
  },
  selectIcon: {
    paddingTop: '2px',
    scale: '0.75',
  },
  selectInputReset: {
    '& .MuiSelect-select': {
      paddingRight: 0,
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  editMenuItem: {
    padding: '4px',
    paddingTop: '0px',
    minWidth: '65px',
    justifyContent: 'center',
  },
  resetMenuItem: {
    minWidth: '65px',
    justifyContent: 'center',
  },
  hidden: {
    display: 'none',
  },
  leftColumn: {
    borderRight: 'solid',
    borderRightColor: '#717BBC',
    borderRightWidth: 6,
  },
  editButton: {
    marginTop: theme.spacing(4),
    cursor: 'pointer',
    height: 'fit-content',
    padding: '2px',
    paddingLeft: '1px',
    borderRadius: '2px',
  },
  editIcon: {
    fill: juralioColours.darkText.primary,
    '&:hover': {
      fill: juralioColours.darkText.secondary,
    },
  },
  selectDropdownArrow: {
    paddingRight: theme.spacing(),
  },
  selectDropdownArrowDark: {
    paddingRight: theme.spacing(),

    fill: 'white',
  },
  selectDropdownArrowOpen: {
    marginRight: theme.spacing(),
  },
  selectDropdownArrowOpenDark: {
    marginRight: theme.spacing(),
    fill: 'white',
  },
  selectedOption: {
    borderRadius: theme.spacing(0.5),
    fontSize: theme.spacing(1.5),
    letterSpacing: '0.4px',
    lineHeight: theme.spacing(2), // Only works as string.
    marginRight: 5,
    textAlign: 'center',
    width: theme.spacing(7),
    padding: '0px',
    height: '24px',
    backgroundColor: '#CECDC8',
    justifySelf: 'center',
    marginTop: theme.spacing(4),
    marginLeft: '16px',
  },
  optionText: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '0.4px',
    maxHeight: theme.spacing(3),
    color: juralioColours.darkText.primary,
    paddingLeft: '12px',
    paddingTop: '0px',
    paddingBottom: '0px',
  },
}))

const ResourceTableRow = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { workstream, updateWorkstreamDataRows, updateTaskDataRows } = props
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [gradeDialogType, setGradeDialogType] = useState(0)
  //0 matter 1 workstream 2 phase
  const durationStart = dayjs(props.fullPeriod.startDate).valueOf()
  const durationEnd = dayjs(props.fullPeriod.endDate).valueOf()
  const currentRatioType =
    getCostRatios(props.costRatios, { task: { projectId: workstream?.id } })[0]
      .projectId !== 0
      ? gradeDialogConsts.workstream
      : gradeDialogConsts.matter

  let pieChartValuesM

  const compareGrades = (a, b) => {
    if (a.gradeId === b.gradeId) {
      return 0
    } else {
      return a.gradeId < b.gradeId ? -1 : 1
    }
  }

  const sortedGrades = props.costRatios.sort(compareGrades)
  if (props.isMatterRow) {
    if (sortedGrades) {
      let dataMap = new Map()
      sortedGrades
        .filter(x => x.cteId === 0 && x.projectId === 0)
        .forEach(x => {
          let value = dataMap.get(
            x.categoryId ? x.categoryId : x.grade.group.id
          )
          if (value === undefined) {
            dataMap.set(x.categoryId ? x.categoryId : x.grade.group.id, {
              label: x.categoryName ? x.categoryName : x.grade.group.name,
              value: parseInt(x.ratioValue),
              color:
                CATEGORY_COLOURS[
                  x.colour_idx ? x.colour_idx : x.grade.colour_idx
                ].primary,
            })
          } else {
            dataMap.set(x.categoryId ? x.categoryId : x.grade.group.id, {
              label: x.categoryName ? x.categoryName : x.grade.group.name,
              value: parseInt(value.value) + parseInt(x.ratioValue),
              color:
                CATEGORY_COLOURS[
                  x.colour_idx ? x.colour_idx : x.grade.colour_idx
                ].primary,
            })
          }
        })
      pieChartValuesM = Array.from(dataMap, x => x[1])
      pieChartValuesM = pieChartValuesM.filter(x => x.value !== 0)
    }
  }

  return (
    <>
      {showDialog && (
        <EditGradeRatioDialog
          projectionData={props.projectionData}
          fullPeriod={props.fullPeriod}
          matter={props.matter}
          costRatios={sortedGrades}
          cteList={props.tasks}
          closeHandler={() => setShowDialog(false)}
          display={showDialog}
          setPageInfo={props.setPageInfo}
          gradeDialogType={gradeDialogType}
          isSnapshot={props.isSnapshot}
        />
      )}
      <div>
        <Paper className={classes.row}>
          <div className={classes.leftColumn}>
            <div
              className={classNames(
                props.sortType === 0
                  ? classes.expandButton
                  : classes.expandButtonPricing,
                props.disableInteractions && classes.disabledInteractions
              )}
              onClick={() => {
                if (!props.disableInteractions) {
                  if (isExpanded === true) {
                    setIsExpanded(false)
                    if (props.sortType === 0) {
                      updateWorkstreamDataRows(workstream, false)
                    } else {
                      props.updatePricingDataRows(props.pricing, false)
                    }
                  } else {
                    setIsExpanded(true)
                    if (props.sortType === 0) {
                      updateWorkstreamDataRows(workstream, true)
                    } else {
                      props.updatePricingDataRows(props.pricing, true)
                    }
                  }
                }
              }}
            >
              {!props.disableInteractions ? (
                isExpanded ? (
                  <ArrowDropUpIcon />
                ) : (
                  <ArrowDropDownIcon />
                )
              ) : (
                <></>
              )}
            </div>
          </div>
          <div>
            {props.sortType === 0 ? (
              <div
                className={classNames(
                  classes.workstreamDetailsContainer,
                  props.isMatterRow
                    ? classes.matterRowDetailsBg
                    : classes.workstreamRowDetailsBg
                )}
              >
                {props.isMatterRow ? <MattersIcon /> : <WorkstreamIcon />}
                <Typography variant="h6">
                  {props.isMatterRow ? props.matter.name : workstream.name}
                </Typography>
              </div>
            ) : (
              <div
                className={classNames(
                  classes.workstreamDetailsContainer,
                  classes.pricingRowDetailsBg
                )}
              >
                {getPricingIcon(
                  props.pricing.type,
                  props.pricing.cap,
                  props.pricing.reason,
                  t
                )}
                <Typography variant="h6">
                  {getPricingType(
                    props.pricing.type,
                    props.pricing.cap,
                    props.pricing.value
                  )}
                </Typography>
              </div>
            )}

            <div>
              {isExpanded &&
                !props.disableInteractions &&
                props.tasks.map(t => {
                  let diff = null
                  let durationDiff = null
                  let durationShift = null
                  let durationPercent = null
                  if (props.diffArray) {
                    diff = props.diffArray.find(item => {
                      return item.cteId === t.id
                    })
                    if (
                      diff &&
                      diff.task &&
                      (diff.task.startDate || diff.task.endDate)
                    ) {
                      let originalStartDate = diff.task.startDate
                        ? diff.task.startDate.__old
                          ? diff.task.startDate.__old
                          : durationStart
                        : durationStart
                      let originalEndDate = diff.task.endDate
                        ? diff.task.endDate.__old
                          ? diff.task.endDate.__old
                          : durationEnd
                        : durationEnd

                      originalStartDate =
                        originalStartDate < durationStart
                          ? durationStart
                          : originalStartDate
                      originalEndDate =
                        originalEndDate > durationEnd
                          ? durationEnd
                          : originalEndDate

                      let originalDuration =
                        dayjs(originalEndDate).diff(
                          dayjs(originalStartDate),
                          'd'
                        ) + 1
                      let newDuration = 0
                      if (diff.task.startDate && diff.task.endDate) {
                        let s =
                          diff.task.startDate.__new < durationStart
                            ? durationStart
                            : diff.task.startDate.__new
                        let e =
                          diff.task.endDate.__new > durationEnd
                            ? durationEnd
                            : diff.task.endDate.__new
                        newDuration = dayjs(e).diff(dayjs(s), 'd') + 1
                      } else if (diff.task.startDate) {
                        if (
                          dayjs(diff.task.startDate.__new) <
                          dayjs(durationStart)
                        ) {
                          newDuration =
                            dayjs(originalEndDate).diff(
                              dayjs(durationStart),
                              'd'
                            ) + 1
                        } else {
                          newDuration =
                            dayjs(originalEndDate).diff(
                              dayjs(diff.task.startDate.__new),
                              'd'
                            ) + 1
                        }
                      } else if (diff.task.endDate) {
                        if (diff.task.endDate.__new > durationEnd) {
                          newDuration =
                            dayjs(durationEnd).diff(
                              dayjs(originalStartDate),
                              'd'
                            ) + 1
                        } else {
                          newDuration =
                            dayjs(diff.task.endDate.__new).diff(
                              dayjs(originalStartDate),
                              'd'
                            ) + 1
                        }
                      }
                      durationDiff = newDuration - originalDuration
                      durationPercent = (durationDiff / originalDuration) * 100

                      if (durationDiff === 0) {
                        if (diff.task.startDate) {
                          //there is a diff but duration hasnt changed so must be a shift
                          durationShift = dayjs(diff.task.startDate.__new).diff(
                            dayjs(originalStartDate),
                            'd'
                          )
                        }
                      }
                    }
                  }

                  const taskObj = t.taskId ? t : t.task
                  const { deliverableCount, assumptionCount } = getTaskCounts(
                    taskObj,
                    {
                      isSnapshot: props.isSnapshot,
                      matterTasks: props.matterTasks,
                      assumptionList: props.isSnapshot
                        ? props.projectionData?.assumptionList
                        : props.assumptions,
                    }
                  )
                  return (
                    <div>
                      <ResourceTaskChip
                        fullPeriod={props.fullPeriod}
                        setPageInfo={props.setPageInfo}
                        gradeDialogType={gradeDialogType}
                        matter={props.matter}
                        cte={t}
                        task={taskObj}
                        updateTaskDataRows={updateTaskDataRows}
                        costRatios={sortedGrades}
                        diff={diff}
                        durationDiff={durationDiff}
                        durationPercent={durationPercent}
                        durationShift={diff ? durationShift : null}
                        showInheritence={true}
                        isSnapshot={props.isSnapshot}
                        setShowDialog={showDialog => {
                          setShowDialog(showDialog)
                          setGradeDialogType({ cteId: t.id })
                        }}
                        deliverableCount={deliverableCount}
                        assumptionCount={assumptionCount}
                      />
                    </div>
                  )
                })}
              {isExpanded &&
                !props.disableInteractions &&
                props.tasks.length === 0 && <FakeTaskChip />}
            </div>
          </div>
          <div className={classes.diagramContainer}>
            {props.isMatterRow ? (
              <div className={classes.pieChartWrapper}>
                <PieChart
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  series={[
                    {
                      cx: 28,
                      cy: 35,
                      data:
                        sortedGrades && props.isMatterRow
                          ? pieChartValuesM
                          : [],
                      innerRadius: 5,
                      outerRadius: 24,
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
                  width={60}
                  height={80}
                />
              </div>
            ) : (
              !props.pricing && (
                <>
                  <Tooltip
                    placement="top"
                    title={
                      currentRatioType === gradeDialogConsts.matter
                        ? t('matterRates.gradeUsesMatter')
                        : currentRatioType === gradeDialogConsts.workstream
                          ? t('matterRates.gradeUsesOwnWorkstream')
                          : ''
                    }
                  >
                    <Select
                      value={1}
                      className={classNames(
                        classes.selectedOption,
                        classes.selectInputReset,
                        currentRatioType === gradeDialogConsts.matter &&
                          classes.matterBgColour,
                        currentRatioType === gradeDialogConsts.workstream &&
                          classes.workstreamBgColour
                      )}
                      renderValue={() =>
                        currentRatioType === gradeDialogConsts.matter ? (
                          <MattersIcon className={classes.selectIcon} />
                        ) : (
                          <WorkstreamIcon className={classes.selectIcon} />
                        )
                      }
                      disableUnderline
                      onClick={event => event.stopPropagation()}
                      onChange={event => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      MenuProps={{
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        getContentAnchorEl: null,
                      }}
                      inputProps={{
                        classes: {
                          icon: props.darkChevron
                            ? classes.selectDropdownArrowDark
                            : classes.selectDropdownArrow,

                          iconOpen: props.darkChevron
                            ? classes.selectDropdownArrowOpenDark
                            : classes.selectDropdownArrowOpen,
                        },
                      }}
                    >
                      <MenuItem
                        value={1}
                        className={classNames(
                          classes.optionText,
                          classes.editMenuItem
                        )}
                        onClick={() => {
                          setGradeDialogType({ workstreamId: workstream.id })
                          setShowDialog(true)
                        }}
                      >
                        {props.isSnapshot
                          ? t('matterRates.seeGradeRatios')
                          : t('matterRates.editGradeRatios')}
                      </MenuItem>
                      <MenuItem
                        value={2}
                        className={classNames(
                          classes.optionText,
                          classes.resetMenuItem,
                          !(
                            currentRatioType === gradeDialogConsts.workstream &&
                            !props.isSnapshot
                          ) && classes.hidden
                        )}
                        onClick={() => {
                          dispatch(
                            displayConfirmationDialog(
                              {
                                actionText: 'Reset',
                                titleText: t('matterRates.resetDialogTitle'),
                                promptText: t('matterRates.resetDialogTextW'),
                                usageContext: 'reset',
                                dontTranslatePromptText: true,
                                cancel: () => {},
                              },
                              () => {
                                let x = { workstreamId: workstream.id }
                                x.projectionPeriodId = props.fullPeriod.id
                                matterCostsService
                                  .resetCostRatios(props.matter.id, x)
                                  .then(res => {
                                    if (res.status === 200) {
                                      matterCostsService
                                        .getCostStageData(props.matter.id)
                                        .then(res => {
                                          if (res.status === 200) {
                                            props.setPageInfo(res.body)
                                          }
                                        })
                                    }
                                  })
                              }
                            )
                          )
                        }}
                      >
                        {t('matterRates.resetRatios')}
                      </MenuItem>
                    </Select>
                  </Tooltip>
                </>
              )
            )}

            {!props.pricing && props.isMatterRow && (
              <Tooltip title={t('matterRates.matterGradeEdit')}>
                <div
                  onClick={() => {
                    setShowDialog(true)
                    setGradeDialogType(
                      props.isMatterRow
                        ? { matter: props.matter.id }
                        : { workstreamId: workstream.id }
                    )
                  }}
                  className={classes.editButton}
                >
                  <EditIcon className={classes.editIcon} fontSize="small" />
                </div>
              </Tooltip>
            )}
          </div>
        </Paper>
      </div>
    </>
  )
}
export default ResourceTableRow
