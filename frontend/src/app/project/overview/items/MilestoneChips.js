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

import { Divider, Popover, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import MilestoneIcon from '../../../../assets/images/JurMilestone'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskDetailsUrl,
} from '../../../../components/navigation/common/location-context-helper'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import colorModifiers from '../../../../theme/color-modifiers'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import { DATE_FORMAT_FULL, TASK_STATUS } from '../../../constants'
import { isPlannedEndDateOverdue } from '../../../roadmap/helpers/task-dates-helper'
import { useWindowDimensions } from '../../../roadmap/helpers/window-dimensions-hook'
import { calcPositionX, getTimeScale } from './roadmap-helpers'

const style = makeStyles()(theme => ({
  milestoneCount: {
    backgroundColor: 'black',
    borderRadius: theme.spacing(0.5),
    color: 'white',
    height: 'fit-content',
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    marginTop: theme.spacing(0.625),
    width: 'fit-content',
    position: 'absolute',
    top: -25,
  },
  icon: {
    width: theme.spacing(3.125),
    height: theme.spacing(3.125),
    position: 'absolute',
    cursor: 'pointer',
  },
  popoverColumn: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
  },
  popoverContent: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    cursor: 'pointer',
  },
  wrapper: {
    position: 'relative',
    top: -30,
  },
}))

const MilestoneChips = props => {
  const { height, width } = useWindowDimensions()
  let milestones = {}
  const { classes } = style()
  const { t } = useTranslation()
  const history = useNavigate()
  const location = useLocation()
  const [milestoneHoverId, setMilestoneHoverId] = useState(null)
  const [anchor, setAnchor] = useState(null)
  const [showPopover, setShowPopover] = useState(true)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const matterId = getMatterIdFromLocation(location)
  const workstreamId = props.workstream
    ? parseInt(props.workstream.id)
    : props.workstreamId || getProjectIdFromLocation(location)

  useEffect(() => {
    const width = document.getElementById('roadmap-wrapper')?.offsetWidth
    if (width) {
      setWrapperWidth(width)
    } else {
      setTimeout(() => {
        const width = document.getElementById('roadmap-wrapper')?.offsetWidth
        if (width) {
          setWrapperWidth(width)
        }
      }, 1000)
    }
  }, [height, width])

  if (!props.earliestDate && !props.latestDate) {
    return null
  }

  const timeScale = getTimeScale(
    props.earliestDate,
    props.latestDate,
    wrapperWidth - 450,
    props.shouldIncludeTodaysDate
  )

  const getDate = milestone => {
    if (milestone.date) {
      return new Date(
        new Date(milestone.date).setHours(0, 0, 0, 0)
      ).toISOString()
    }
    if (milestone.actualEndDate) {
      return new Date(
        new Date(milestone.actualEndDate).setHours(0, 0, 0, 0)
      ).toISOString()
    }
    if (milestone.plannedEndDate) {
      return new Date(
        new Date(milestone.plannedEndDate).setHours(0, 0, 0, 0)
      ).toISOString()
    }
    return new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  }

  if (props.workstream) {
    milestones = props.workstream.milestones
      ? props.workstream.milestones.reduce(
          (groups, item) => ({
            ...groups,
            [getDate(item)]: [...(groups[getDate(item)] || []), item],
          }),
          {}
        )
      : []
  } else if (props.task) {
    milestones = props.task.milestones
      ? props.task.milestones.reduce(
          (groups, item) => ({
            ...groups,
            [getDate(item)]: [...(groups[getDate(item)] || []), item],
          }),
          {}
        )
      : []
  }

  return (
    <div className={classes.wrapper}>
      {Object.keys(milestones)?.map((date, i) => {
        const actualMilestones = milestones[date] || []
        const count = actualMilestones.length
        return (
          <>
            {count > 1 && (
              <div
                className={classes.milestoneCount}
                style={{
                  left: 143 + calcPositionX(timeScale, date),
                }}
              >
                <Typography
                  variant="caption"
                  data-test="milestone-overlap-count"
                >
                  {count}
                </Typography>
              </div>
            )}
            <MilestoneIcon
              onClick={() => {
                history(
                  getTaskDetailsUrl(
                    matterId,
                    workstreamId,
                    actualMilestones[0].id
                  )
                )
              }}
              onMouseOver={e => {
                setShowPopover(false)
                setAnchor(e.currentTarget)
                setMilestoneHoverId(date)
              }}
              onMouseLeave={e => {
                setShowPopover(true)
              }}
              data-test="milestone-icon"
              style={{
                top: props.task?.isMilestone ? '40px' : '',
                left: 140 + calcPositionX(timeScale, date),
                color:
                  actualMilestones[0].status === TASK_STATUS.NOT_STARTED &&
                  isPlannedEndDateOverdue(actualMilestones[0])
                    ? rawColours.error.primary
                    : actualMilestones[0].status === TASK_STATUS.NOT_STARTED
                      ? juralioColours.taskStatus.notStarted
                      : juralioColours.taskStatus.done,
              }}
              className={classes.icon}
            />
          </>
        )
      })}
      <Popover
        data-test="milestone-popover"
        style={{ pointerEvents: 'auto' }}
        open={milestoneHoverId != null}
        hidden={showPopover}
        anchorEl={anchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableRestoreFocus
      >
        <div
          onMouseEnter={() => {
            setShowPopover(false)
          }}
          onMouseLeave={() => {
            setShowPopover(true)
          }}
        >
          {milestones[milestoneHoverId]
            ?.sort((a, b) => (a.status === TASK_STATUS.NOT_STARTED ? -1 : 1))
            .map((milestone, i) => {
              return (
                <div className={classes.popoverColumn}>
                  <div
                    onClick={() => {
                      history(
                        getTaskDetailsUrl(matterId, workstreamId, milestone.id)
                      )
                    }}
                    className={classes.popoverContent}
                  >
                    <MilestoneIcon
                      style={{
                        marginRight: '8px',
                        color:
                          milestone.status === TASK_STATUS.NOT_STARTED &&
                          isPlannedEndDateOverdue(milestone)
                            ? rawColours.error.primary
                            : milestone.status === TASK_STATUS.NOT_STARTED
                              ? juralioColours.taskStatus.notStarted
                              : juralioColours.taskStatus.done,
                      }}
                    />
                    <Typography
                      style={{
                        color: colorModifiers.primaryText(
                          rawColours.primary.black.black
                        ),
                      }}
                      data-test="milestone-name"
                    >
                      {milestone.name}
                    </Typography>
                  </div>
                  <Typography
                    variant="caption"
                    data-test="milestone-date"
                    style={{
                      color: colorModifiers.secondaryText(
                        rawColours.primary.black.black
                      ),
                    }}
                  >
                    {`${t(
                      `milestoneDetails.${
                        milestone.status === TASK_STATUS.DONE
                          ? 'milestoneReachedOn'
                          : 'milestoneEstimatedFor'
                      }`
                    )}: ${getDateDisplayString(
                      milestoneHoverId,
                      DATE_FORMAT_FULL,
                      true
                    )}`}
                  </Typography>
                  {i < milestones[milestoneHoverId].length - 1 && (
                    <Divider style={{ marginTop: '4px' }} />
                  )}
                </div>
              )
            })}
        </div>
      </Popover>
    </div>
  )
}
export default MilestoneChips
