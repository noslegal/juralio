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

import MoreVertIcon from '@mui/icons-material/MoreVert'
import Visibility from '@mui/icons-material/Visibility'
import { Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { TASK_MAP_VIEW_MODE_ENUM, TASK_STATUS } from '../../../app/constants'
import { isPlannedEndDateOverdue } from '../../../app/roadmap/helpers/task-dates-helper'
import {
  getHighestRisk,
  sortLabels,
} from '../../../app/task-details/task-label/task-label-helpers'
import JurBlocked from '../../../assets/images/JurBlocked'
import JurBlocker from '../../../assets/images/JurBlocker'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import LabelChip from '../../../components/data-display/label-chip/LabelChip'
import TaskReferenceNumber from '../../../components/data-display/task-reference-number/TaskReferenceNumber'
import { split_text_two_lines } from '../../../services/helpers/text/text-split-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { MultiplePostsIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import CompactTaskCellContent from './CompactTaskCellContent'
import TaskCellAssigneeChip from './TaskCellAssigneeChip'
import TaskCellDates from './TaskCellDates'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import ReduceIcon from '../../../assets/images/ReduceIcon'
import ExpandIcon from '../../../assets/images/ExpandIcon'
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from '../../../app/task-map/task-filter/task-filter-actions'
import TaskStatusBars from '../../navigation/global-header/matter-switcher/TaskStatusBars'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import { isInTaskmapContext } from '../../../services/helpers/route/route-context-helper'
import { isPhaseGhost } from '../../../app/improved-taskmap/taskmap-helpers/taskmap-helpers'

const useStyles = makeStyles()(theme => ({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  taskCell: {
    height: 'calc(100% - 8px)',
    width: 'calc(100% - 4px)',
    transition: 'box-shadow .2s',
    zIndex: 1,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
    [theme.breakpoints.down('md')]: {
      height: '100%',
      marginRight: 0,
      marginBottom: 0,
      borderBottom: '0 !important',
    },
  },
  selectionTaskCell: {
    opacity: '0.5',
  },
  normalTaskCell: {
    opacity: 1.0,
  },
  highlightTaskCell: {
    opacity: 0.9,
  },
  notHighlightTaskCell: {
    opacity: 0.5,
  },
  hover: {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: `0 10px 20px ${juralioColours.taskCell.shadow.bottom}, 0 4px 4px ${juralioColours.taskCell.shadow.top}`,
      zIndex: 1,
    },
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(0.5),
  },
  sticky: {
    top: '40px',
    position: 'sticky',
  },
  labelContainer: {
    flex: '1',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    color: juralioColours.taskStatus.contrast,
    display: 'flex',
  },
  labelIV: {
    color: juralioColours.darkText.primary,
    lineHeight: theme.spacing(2.5),
  },
  nameWrapper: {
    marginBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(1.5),
    marginTop: theme.spacing(1),
    width: '85%',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  optionsDropdown: {
    right: 0,
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(0.5),
    verticalAlign: 'sub',
    display: 'inline',
    marginLeft: 'auto',
    color: juralioColours.darkText.primary,
    [theme.breakpoints.down('md')]: { display: 'none' },
  },
  notRequiredText: {
    color: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    fontSize: theme.spacing(1.5),
  },
  notRequiredChip: {
    backgroundColor: juralioColours.taskCell.notRequired.chip,
    borderRadius: theme.spacing(0.5),
    width: theme.spacing(11),
    marginLeft: theme.spacing(1),
  },
  notRequiredLabel: {
    color: juralioColours.taskCell.notRequired.label,
  },
  refNumber: {
    marginTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.4),
    paddingRight: theme.spacing(0.4),
    borderRadius: theme.spacing(0.5),
    height: theme.spacing(2),
    width: 'auto',
    color: juralioColours.darkText.secondary,
    display: 'flex',
    [theme.breakpoints.down('md')]: { display: 'none' },
  },
  postCountWrapper: {
    display: 'flex',
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    bottom: theme.spacing(1.5),
    marginLeft: 'auto',
  },
  optionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
  },
  flexrow: {
    display: 'flex',
  },
  hoverEye: {
    marginTop: theme.spacing(0.25),
    marginBottom: 'auto',
    color: juralioColours.darkText.secondary,
    opacity: 0,
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
  },
  hoverEyeHover: {
    marginTop: theme.spacing(0.25),
    marginBottom: 'auto',
    color: juralioColours.darkText.secondary,
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    opacity: 1,
  },
  postCountText: {
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  postCountIcon: {
    fill: juralioColours.darkText.secondary,
    height: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  nameAndNumber: {
    display: 'flex',
  },
  labelRiskIndicator: {
    marginTop: theme.spacing(),
    borderRadius: theme.spacing(0.5),
    width: theme.spacing(2),
    height: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: theme.spacing(1.75),
    marginLeft: 'auto',
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
  },
  circle: {
    height: theme.spacing(1.25),
    width: theme.spacing(1.25),
    borderRadius: theme.spacing(1),
  },
  labelsWrapper: {
    marginTop: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    lineHeight: theme.spacing(2),
    overflow: 'hidden',
  },
  labelWrapper: {
    marginRight: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  overflowCount: {
    marginLeft: theme.spacing(),
    color: colorModifiers.primaryText(rawColours.primary.black.black),
  },
  icon: {
    marginLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.5),
  },
  taskLinkIcon: {
    scale: '0.67',
    color: juralioColours.darkText.secondary,
    marginLeft: 'auto',
    marginRight: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
  },
  blockerChip: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(0.5),
    width: 'fit-content',
    marginRight: theme.spacing(),
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    paddingTop: theme.spacing(0.25),
    maxHeight: theme.spacing(2),
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
    color: rawColours.primary.black.black,
  },
  blockerChipIcon: {
    scale: '0.67',
    display: 'flex',
  },
  collapseSummary: {
    height: '40px',
    backgroundColor: juralioColours.whiteText.secondary,
    alignItems: 'anchor-center',
    display: 'flex',
    width: '90%',
    justifySelf: 'center',
    borderRadius: '8px',
    marginTop: '12px',
  },
  collapseSummaryCount: {
    marginRight: '24px',
  },
}))

const getOverflowCount = labels => {
  const maxChar = 26
  let currentCount = 0
  let labelCount = 0
  let end = false
  labels.sort(sortLabels).map(label => {
    if (!end) {
      if (label.name.length + currentCount < maxChar) {
        labelCount = labelCount + 1
        currentCount = currentCount + label.name.length
      } else {
        end = true
        // break
      }
    }
    return 1
  })

  return labels.length - Math.min(labelCount, 3)
}

const LabelDetails = props => {
  const { classes } = useStyles()

  let labels = props.task.labels || []
  const overflowCount = getOverflowCount(labels)

  if (overflowCount > 0) {
    labels = labels.slice(0, labels.length - overflowCount)
    labels.push({ isOverflow: true })
  }
  return (
    <div className={classes.labelsWrapper} data-test="labels-wrapper">
      {props.task.isBlocked || props.task.isBlocker ? (
        <div
          className={classes.blockerChip}
          data-test={`task-${
            props.task?.isBlocked ? 'blocked' : 'blocker'
          }-icon`}
        >
          <div className={classes.blockerChipIcon}>
            {props.task.isBlocked ? <JurBlocked /> : <JurBlocker />}
          </div>
          <Typography variant="caption">
            {props.task.isBlocked
              ? props.t('taskLinking.blocked')
              : props.t('taskLinking.blocker')}
          </Typography>
        </div>
      ) : null}
      {labels.map(label => {
        if (label.isOverflow) {
          return (
            <Typography
              className={classes.overflowCount}
              data-test="label-overflow-count"
            >
              +{overflowCount}
            </Typography>
          )
        } else {
          return (
            <div className={classes.labelWrapper} key={props.task.id}>
              <LabelChip
                text={label.name}
                modifier={label.modifier}
                labelType={label.type}
                labelId={label.id.toString()}
                showEditIcon={false}
                showLightBackground={true}
                editLabel={false}
                isReadOnly={props.isReadOnly}
                handleModifierUpdate={() => {}}
                addMode={false}
              />
            </div>
          )
        }
      })}
    </div>
  )
}

const TaskCellContent = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const taskmapStructure = useSelector(state => state.improvedTaskmap.structure)
  const tasks = flatTaskListFromTree({ tasks: taskmapStructure })
  const task = props.item
  const { isHovering } = props
  const ref = useRef()
  const dispatch = useDispatch()
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const subtaskCollapsed = taskMapFilter.expandCollapseTaskFilter.includes(
    task.id
  )
  const [taskNameLine1, taskNameLine2] = split_text_two_lines(task.name)
  const doneCount = flatTaskListFromTree(
    tasks?.filter(t => t.id === task.id)[0]
  ).filter(x => x.status === TASK_STATUS.DONE).length
  const inProgressCount = flatTaskListFromTree(
    tasks?.filter(t => t.id === task.id)[0]
  ).filter(x => x.status === TASK_STATUS.IN_PROGRESS).length
  const notRequiredCount = flatTaskListFromTree(
    tasks?.filter(t => t.id === task.id)[0]
  ).filter(x => x.status === TASK_STATUS.NOT_REQUIRED).length
  const notStartedCount = flatTaskListFromTree(
    tasks?.filter(t => t.id === task.id)[0]
  ).filter(x => x.status === TASK_STATUS.NOT_STARTED).length

  const isPhaseAGhost = isPhaseGhost(task, taskMapFilter)

  const NotRequiredChip = () => {
    return (
      <div className={classes.notRequiredChip} data-test="not-required-chip">
        <Typography className={classes.notRequiredText}>
          {t('taskStatus.task-not-required')}
        </Typography>
      </div>
    )
  }

  const taskLinkDisplay = task => {
    if (!task?.isBlocked && !task?.isBlocker) {
      return null
    }
    if ((isHovering && !props.isRoadmap) || subtaskCollapsed) {
      return null
    }
    return (
      <div
        className={classes.taskLinkIcon}
        data-test={`task-${task?.isBlocked ? 'blocked' : 'blocker'}-icon`}
      >
        {task?.isBlocked && (
          <Tooltip title={t('taskmapContent.blocked')}>
            <div>
              <JurBlocked />
            </div>
          </Tooltip>
        )}
        {!task?.isBlocked && (
          <Tooltip title={t('taskmapContent.blocker')}>
            <div>
              <JurBlocker />
            </div>
          </Tooltip>
        )}
      </div>
    )
  }

  const labelRiskDisplay = task => {
    if ((isHovering && !props.isRoadmap) || subtaskCollapsed) {
      return null
    }
    const risk = getHighestRisk(task.labels)
    if (risk == null) {
      return null
    }
    return (
      <div
        className={classes.labelRiskIndicator}
        data-test="label-chip-indicator"
      >
        <div
          className={classes.circle}
          data-test={`riskiest-label-${risk.modifier}`}
          style={{
            backgroundColor: risk.modifier
              ? rawColours.riskLabels[risk.modifier].primary
              : 'black',
          }}
        />
      </div>
    )
  }

  const postCountDisplay = () => {
    if ((isHovering && !props.isRoadmap) || subtaskCollapsed) {
      return null
    }
    if (props.item.posts.length < 1) {
      return null
    } else {
      return (
        <Tooltip
          title={
            props.item.posts.length === 1
              ? t('taskmapPosts.single')
              : t('taskmapPosts.multiple', { count: props.item.posts.length })
          }
        >
          <div
            className={classes.postCountWrapper}
            data-test="task-cell-post-count-wrapper"
            id="task-post-count"
          >
            <Typography
              className={classes.postCountText}
              data-test="task-cell-post-count-text"
            >
              {props.item.posts.length}
            </Typography>

            <MultiplePostsIcon className={classes.postCountIcon} />
          </div>
        </Tooltip>
      )
    }
  }
  const roadmapPostCountDisplay = () => {
    if (props.item.posts.length < 1) {
      return null
    } else {
      return postCountDisplay()
    }
  }

  if (props.detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT) {
    return (
      <CompactTaskCellContent
        task={props.item}
        {...props}
        ref={ref}
        isTemplate={props.isTemplate()}
        viewOnly={props.isReadOnly}
      />
    )
  }
  const getMilestoneColour = () => {
    if (
      props.item.status === TASK_STATUS.NOT_STARTED &&
      isPlannedEndDateOverdue(props.item)
    ) {
      return { color: rawColours.error.primary }
    }
    if (props.isTemplate()) {
      return { color: rawColours.primary.purple.secondary }
    }
    return props.item.status === TASK_STATUS.NOT_STARTED
      ? { color: juralioColours.taskStatus.notStarted }
      : { color: juralioColours.taskStatus.done }
  }

  const getDeliverableColour = () => {
    if (
      props.item.status === TASK_STATUS.NOT_STARTED &&
      isPlannedEndDateOverdue(props.item)
    ) {
      return rawColours.error.primary
    }
    if (props.isTemplate()) {
      return rawColours.primary.purple.secondary
    }
    if (props.item.status === TASK_STATUS.IN_PROGRESS) {
      return juralioColours.taskStatus.inProgress
    }
    return props.item.status === TASK_STATUS.NOT_STARTED
      ? juralioColours.taskStatus.notStarted
      : juralioColours.taskStatus.done
  }

  return (
    <div className={classes.sticky}>
      <div className={classes.labelContainer}>
        <div className={classes.nameWrapper}>
          <div className={classes.nameAndNumber}>
            {props.item.isMilestone && (
              <MilestoneIcon
                data-test="milestone-icon"
                style={getMilestoneColour()}
                className={classes.icon}
              />
            )}
            {props.item.isDeliverable && (
              <JurDeliverable
                stroke={getDeliverableColour()}
                data-test="deliverable-icon"
                className={classes.icon}
              />
            )}

            <Typography
              variant="subtitle2"
              data-test="name"
              className={`${classes.labelIV} ${
                props.isNotRequired && classes.notRequiredLabel
              }`}
              onClick={props.handleNameClick}
              noWrap
              data-task-name
              id={`task-cell-name-${task.id}`}
            >
              {/* non-breaking space for positioning if no name is given*/}
              {taskNameLine1 || '\u00A0'}
            </Typography>

            {props.isMobile ? (
              <TaskReferenceNumber compact task={task} />
            ) : (
              <div className={classes.refNumber}>
                <TaskReferenceNumber compact task={task} />
              </div>
            )}
          </div>
          <div className={classes.nameAndNumber}>
            <Typography
              variant="subtitle2"
              className={`${classes.labelIV} ${
                props.isNotRequired && classes.notRequiredLabel
              }`}
              noWrap
            >
              {taskNameLine2}
            </Typography>
          </div>
          <div className={classes.flexRow}>
            {!props.isPlaceHolderElement &&
              !props.isTemplate() &&
              !props.isNotRequired && (
                <TaskCellAssigneeChip
                  assignees={task.teamMembers}
                  isSelected={props.selectedTask && task.id === props.id}
                  taskStatus={task.status}
                  task={task}
                  viewOnly={props.isReadOnly}
                  isReadOnly={props.isReadOnly}
                  colourMode={props.colourMode}
                  taskId={task.id}
                />
              )}
            {props.isDisplayingDates && (
              <TaskCellDates
                task={task}
                plannedStartDate={task.plannedStartDate}
                plannedEndDate={task.plannedEndDate}
                actualEndDate={task.actualEndDate}
                isLinked={task.datesLinkedToSiblings}
                isRoadmap={props.isRoadmap}
                viewOnly={props.isReadOnly}
                handleDateClick={props.handleDateClick}
                isDetailedMode={
                  props.detailedView?.viewMode ===
                  TASK_MAP_VIEW_MODE_ENUM.DETAILED
                }
                compact={false}
              />
            )}
            {props.isNotRequired && <NotRequiredChip classes={classes} />}
          </div>
          {props.detailedView?.viewMode ===
            TASK_MAP_VIEW_MODE_ENUM.DETAILED && (
            <LabelDetails task={task} t={t} />
          )}
        </div>
        <div className={classes.optionsWrapper}>
          <div className={classes.flexRow}>
            {task.status !== TASK_STATUS.NOT_REQUIRED &&
              !props.isPlaceHolderElement &&
              !props.isReadOnly &&
              !props.isTemplate() && (
                <Visibility
                  className={
                    isHovering ? classes.hoverEyeHover : classes.hoverEye
                  }
                  data-test="task-preview-opener"
                  id={`visibility-${task.id}`}
                  onClick={props.handlePreviewClick}
                />
              )}
            {!props.isPlaceHolderElement &&
              // !props.isReadOnly &&
              props.showOptions &&
              !props.selectionMode && (
                <MoreVertIcon
                  ref={ref}
                  onClick={e => {
                    e.stopPropagation()

                    props.handleOptionsClick(e, task, ref.current)
                  }}
                  data-test="options-dropdown"
                  data-open-options-menu
                  className={classes.optionsDropdown}
                  id={`more-vert-icon-${task.id}`}
                />
              )}
          </div>
          <div className={classes.flexrow}>
            {props.detailedView?.viewMode !==
              TASK_MAP_VIEW_MODE_ENUM.DETAILED && taskLinkDisplay(task)}
            {props.detailedView?.showRisk && labelRiskDisplay(props.item)}
            {props.item.posts && props.isRoadmap
              ? !props.isReadOnly &&
                props.showOptions &&
                roadmapPostCountDisplay()
              : props.item.posts && postCountDisplay()}
          </div>
          {task?.tasks?.length > 0 && !props.isTemplate() && !isPhaseAGhost && (
            <>
              <Tooltip
                title={
                  task.level === 1
                    ? subtaskCollapsed
                      ? t('taskmapContent.expandPhase')
                      : t('taskmapContent.collapsePhase')
                    : subtaskCollapsed
                      ? t('taskmapContent.expandTask')
                      : t('taskmapContent.collapseTask')
                }
              >
                <div
                  onClick={e => {
                    if (subtaskCollapsed) {
                      dispatch(taskFilterActions.expandTask(task.id))
                    } else {
                      dispatch(taskFilterActions.collapseTask(task.id))
                    }

                    e.stopPropagation()
                  }}
                  style={{
                    position: 'absolute',
                    bottom: subtaskCollapsed ? '54px' : '0px',
                    right: '10px',
                  }}
                >
                  {(isHovering || subtaskCollapsed) && isInTaskmapContext() && (
                    <>
                      {subtaskCollapsed ? (
                        <>
                          <ExpandIcon data-test="task-expand" />
                        </>
                      ) : (
                        <ReduceIcon data-test="task-collapse" />
                      )}
                    </>
                  )}
                </div>
              </Tooltip>
            </>
          )}
        </div>
      </div>
      {subtaskCollapsed && isInTaskmapContext() && (
        <div
          data-test="collapse-task-content"
          className={classes.collapseSummary}
        >
          <TaskStatusBars
            taskCount={flatTaskListFromTree(task).length}
            workstream={{
              taskCounts: {
                doneCount: doneCount,
                inProgressCount: inProgressCount,
                notStartedCount: notStartedCount,
                notRequiredCount: notRequiredCount,
              },
            }}
            masonry={false}
          />
          <Typography className={classes.collapseSummaryCount}>
            {notStartedCount + '/' + inProgressCount + '/' + doneCount}
          </Typography>
        </div>
      )}
    </div>
  )
}

TaskCellContent.propTypes = {
  showOptions: PropTypes.bool,
}

export default TaskCellContent
