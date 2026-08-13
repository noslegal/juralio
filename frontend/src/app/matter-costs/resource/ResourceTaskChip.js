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
import { makeStyles } from 'tss-react/mui'
import CloseIcon from '@mui/icons-material/Close'
import '@glideapps/glide-data-grid/dist/index.css'
import GradeChip from '../GradeChip'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import { MenuItem, Select, Tooltip } from '@mui/material'
import juralioColours from '../../../theme/juralio-colours'
import {
  MattersIcon,
  PeopleIcon,
  TaskIcon,
  WorkstreamIcon,
} from '../../../theme/navigation/CommonIcons'
import { getCostRatios } from './MatterCostsTableHelper'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { useTranslation } from 'react-i18next'
import { gradeDialogConsts } from '../../constants'
import { useDispatch } from 'react-redux'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'

const useStyles = makeStyles()(theme => ({
  showGradesButton: {
    marginLeft: '35%',
    marginRight: 'auto',
    marginTop: theme.spacing(0.5),
    cursor: 'pointer',
  },
  taskChipContainer: {},
  row: {
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '75% 25% ',
    height: 80,
    padding: 8,
    width: '132%',
    borderTop: 'solid',
    borderWidth: 1,
    borderTopColor: 'white',
  },
  gradeChipContainer: {
    boxSizing: 'border-box',
    display: 'flex',
    height: 42,
    width: '132%',
    padding: 4,
    borderTop: 'solid',
    borderWidth: 1,
    borderTopColor: 'white',
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

const ResourceTaskChip = props => {
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { task, updateTaskDataRows, diff, cte } = props
  const [isExpanded, setIsExpanded] = useState(false)
  const costRatios = getCostRatios(props.costRatios, cte)
  const currentRatioType =
    costRatios[0]?.cteId !== 0
      ? gradeDialogConsts.phase
      : costRatios[0].projectId !== 0
        ? gradeDialogConsts.workstream
        : gradeDialogConsts.matter

  const handleClick = () => {
    if (!props.isRevenue) {
      if (isExpanded === true) {
        setIsExpanded(false)
        updateTaskDataRows(task, false, cte)
      } else {
        setIsExpanded(true)
        updateTaskDataRows(task, true, cte)
      }
    }
  }

  const dropdownMenuProps = {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    getContentAnchorEl: null,
  }

  const dropdownSelectInputProps = {
    classes: {
      icon: props.darkChevron
        ? classes.selectDropdownArrowDark
        : classes.selectDropdownArrow,

      iconOpen: props.darkChevron
        ? classes.selectDropdownArrowOpenDark
        : classes.selectDropdownArrowOpen,
    },
  }

  return (
    <>
      <div className={classes.row}>
        <Tooltip
          disableFocusListener={!diff || (diff && !diff.removed)}
          disableHoverListener={!diff || (diff && !diff.removed)}
          title={t('matterCosts.projectionSummary.changedOrMoved')}
          placement="bottom-start"
        >
          <div
            className={classes.taskChipContainer}
            style={
              diff && diff.removed
                ? {
                    boxShadow: ' 0px 0px 5px 3px  grey',
                    backgroundColor: 'rgba(209, 206, 208, 0.80)',
                    paddingRight: '8px',
                  }
                : diff && diff.new
                  ? {
                      boxShadow: ' 0px 0px 5px 3px  #5B15DF',
                      backgroundColor: 'rgba(91, 21, 223, 0.20)',
                      paddingRight: '8px',
                    }
                  : {}
            }
          >
            <NewTaskChip
              showDates={false}
              showInteractions={false}
              task={task}
              projectId={task.projectId}
              matterId={props.matterId}
              showOptions={false}
              showLevelLetter={false}
              noHover={false}
              onClick={handleClick}
              displayDates={true}
              unassigned={props.unassigned}
              diffDuration={props.durationDiff}
              diffPercent={props.durationPercent}
              durationShift={props.durationShift}
              deliverableCount={props.deliverableCount}
              assumptionCount={props.assumptionCount}
            />
          </div>
        </Tooltip>
        {!props.isRevenue && (
          <div
            style={
              props.showInheritence
                ? {
                    display: 'grid',
                    gridTemplateColumns: '25% 75%',
                    alignContent: 'center',
                    alignItems: 'anchor-center',
                    zIndex: '999',
                    marginTop: '-8px',
                  }
                : {
                    display: 'grid',
                    alignContent: 'center',
                    zIndex: '999',
                  }
            }
          >
            {!props.unassigned && (
              <>
                <div
                  className={classes.showGradesButton}
                  onClick={() => {
                    handleClick()
                  }}
                >
                  {isExpanded ? (
                    <CloseIcon className={classes.editIcon} fontSize="small" />
                  ) : (
                    <PeopleIcon className={classes.editIcon} fontSize="small" />
                  )}
                </div>
                {props.showInheritence && (
                  <Tooltip
                    placement="top"
                    title={
                      currentRatioType === gradeDialogConsts.matter
                        ? t('matterRates.gradeUsesMatter')
                        : currentRatioType === gradeDialogConsts.workstream
                          ? t('matterRates.gradeUsesOwnWorkstream')
                          : t('matterRates.gradeUsesPhase')
                    }
                  >
                    <Select
                      style={
                        currentRatioType === gradeDialogConsts.matter
                          ? { backgroundColor: 'rgb(179, 184, 219)' }
                          : currentRatioType === gradeDialogConsts.workstream
                            ? { backgroundColor: 'rgb(213, 217, 235)' }
                            : { backgroundColor: '#fcf8e8' }
                      }
                      value={1}
                      className={classes.selectedOption}
                      renderValue={() =>
                        currentRatioType === gradeDialogConsts.matter ? (
                          <MattersIcon
                            style={{ paddingTop: '2px', scale: '0.75' }}
                          />
                        ) : currentRatioType ===
                          gradeDialogConsts.workstream ? (
                          <WorkstreamIcon
                            style={{ paddingTop: '2px', scale: '0.75' }}
                          />
                        ) : (
                          <TaskIcon
                            style={{ paddingTop: '2px', scale: '0.75' }}
                          />
                        )
                      }
                      sx={{
                        '& .MuiSelect-select': {
                          paddingRight: 0,
                          paddingLeft: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                        },
                      }}
                      disableUnderline
                      onClick={event => event.stopPropagation()}
                      onChange={event => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      MenuProps={dropdownMenuProps}
                      inputProps={dropdownSelectInputProps}
                    >
                      <MenuItem
                        style={{ minWidth: '65px', justifyContent: 'center' }}
                        value={1}
                        className={classes.optionText}
                        onClick={() => {
                          props.setShowDialog(true)
                        }}
                      >
                        {props.isSnapshot
                          ? t('matterRates.seeGradeRatios')
                          : t('matterRates.editGradeRatios')}
                      </MenuItem>
                      <MenuItem
                        value={2}
                        style={
                          currentRatioType === gradeDialogConsts.phase &&
                          !props.isSnapshot
                            ? { minWidth: '65px', justifyContent: 'center' }
                            : {
                                display: 'none',
                                minWidth: '65px',
                                justifyContent: 'center',
                              }
                        }
                        className={classes.optionText}
                        onClick={() => {
                          dispatch(
                            displayConfirmationDialog(
                              {
                                actionText: 'Reset',
                                titleText: t('matterRates.resetDialogTitle'),
                                promptText: t('matterRates.resetDialogTextP'),
                                usageContext: 'reset',
                                dontTranslatePromptText: true,
                                cancel: () => {},
                              },
                              () => {
                                let x = { cteId: cte.id }
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
                )}
              </>
            )}

            <div></div>
          </div>
        )}
      </div>
      {isExpanded &&
        costRatios.map(cr => {
          return (
            <div key={cr.cteId} className={classes.gradeChipContainer}>
              <div
                style={{
                  marginLeft: 'auto',
                  marginRight: '6.5%',
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
              >
                <GradeChip
                  cr={cr}
                  grade={cr.grade}
                  ratioValue={cr.ratioValue}
                />
              </div>
            </div>
          )
        })}
    </>
  )
}
export default ResourceTaskChip
