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

import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import colorModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import { DATE_FORMAT_FULL, TASK_STATUS } from '../../../constants'
import {
  getEndDate,
  getStartDate,
} from '../../../roadmap/helpers/task-dates-helper'
import { useWindowDimensions } from '../../../roadmap/helpers/window-dimensions-hook'
import { calcPositionX, calcWidth, getTimeScale } from './roadmap-helpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const style = makeStyles()(theme => ({
  roadmap: {
    height: theme.spacing(7),
    display: 'flex',
  },
  buffer: {
    width: theme.spacing(21.25),
    display: 'flex',
  },
  leftBuffer: {
    overflow: 'hidden',
    width: '150px',
  },
  leftHandDate: {
    textAlign: 'right',
    whiteSpace: 'nowrap',
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '100%',
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1.25),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
  },
  rightHandDate: {
    textAlign: 'left',
    whiteSpace: 'nowrap',
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '100%',
    marginRight: theme.spacing(1.25),
    marginLeft: theme.spacing(2),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
  },
  taskBar: {
    height: theme.spacing(3),
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
    '&:hover': {
      boxShadow: `0 14px 28px ${colorModifiers.alternativeHoverAction(
        rawColours.primary.black.black
      )}, 0 10px 10px ${colorModifiers.secondarySelected(
        rawColours.primary.black.black
      )}`,
    },
  },
  noDatesSet: {
    margin: 'auto',
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
  },
  matterOverviewFauxBorder: {
    height: '4px',
    width: '100%',
    marginTop: 'auto',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
  },
}))

const ProjectOverviewRoadmapRender = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const { height, width } = useWindowDimensions()
  const isTaskOverview = props.task !== undefined
  const [startDate, endDate, noStartDate, noEndDate] = props.dates
  const endIsOverdue =
    (!noEndDate &&
      !noStartDate &&
      dayjs.utc(endDate).isBefore(dayjs.utc(startDate))) ||
    (!noEndDate && dayjs.utc(endDate).isBefore(dayjs.utc().startOf('day')))

  const startIsOverdue =
    !noStartDate &&
    dayjs.utc(startDate).isBefore(dayjs.utc().startOf('day')) &&
    props.task?.status === TASK_STATUS.NOT_STARTED

  const [leftMarginX, setleftMarginX] = useState(0)
  const [taskBarWidth, setTaskBarWidth] = useState(0)

  const getSizings = () => {
    let _leftMarginX = 0
    let _taskBarWidth = 0
    let wrapper = document.getElementById('roadmap-wrapper')
    if (wrapper != null) {
      const wrapperWidth =
        document.getElementById('roadmap-wrapper').offsetWidth

      const taskStartDate = props.workstream
        ? dayjs(new Date(startDate)).toDate()
        : getStartDate(props.task, false)
      const taskEndDate = props.workstream
        ? dayjs(new Date(endDate)).toDate()
        : getEndDate(props.task, false)

      const timeScale = getTimeScale(
        props.earliestDate ? props.earliestDate : startDate,
        props.latestDate ? props.latestDate : endDate,
        wrapperWidth - 450,
        props.shouldIncludeTodaysDate
      )

      if (noStartDate && !noEndDate) {
        _leftMarginX = calcPositionX(timeScale, taskEndDate) - 20
      } else {
        _leftMarginX = calcPositionX(timeScale, taskStartDate)
      }
      _taskBarWidth = calcWidth(timeScale, taskStartDate, taskEndDate)

      setleftMarginX(_leftMarginX)
      setTaskBarWidth(_taskBarWidth)
    }
  }

  // The two useEffects here are deliberate!
  useEffect(() => {
    getSizings()
  })

  useEffect(() => {
    getSizings()
  }, [width, height]) //eslint-disable-line
  // The two useEffects here are deliberate!

  const generateTaskBackground = (shade = 'light') => {
    if (isTaskOverview) {
      switch (props.task.status) {
        case TASK_STATUS.DONE:
          return rawColours.status.done[shade]
        case TASK_STATUS.IN_PROGRESS:
          return rawColours.status.inProgress[shade]
        case TASK_STATUS.NOT_STARTED:
          return rawColours.status.notStarted[shade]
        default:
          return rawColours.status.template[shade]
      }
    }
    const totalTaskCount =
      Object.values(props.workstream.taskCounts).reduce((a, b) => a + b) -
      props.workstream.taskCounts.notRequiredCount

    const notStartedPercent =
      (props.workstream.taskCounts.notStartedCount / totalTaskCount) * 100
    const inProgressPercent =
      (props.workstream.taskCounts.inProgressCount / totalTaskCount) * 100
    const donePercent =
      (props.workstream.taskCounts.doneCount / totalTaskCount) * 100
    if (notStartedPercent === 0) {
      return `linear-gradient(90deg, ${
        rawColours.status.inProgress[shade]
      } ${inProgressPercent}%, ${rawColours.status.inProgress[shade]} ${
        100 - donePercent
      }%,${rawColours.status.done[shade]} ${100 - donePercent}%) `
    }
    return `linear-gradient(90deg, ${
      rawColours.status.notStarted[shade]
    } ${notStartedPercent}%, ${
      rawColours.status.inProgress[shade]
    } ${notStartedPercent}%, ${rawColours.status.inProgress[shade]} ${
      100 - donePercent
    }%,${rawColours.status.done[shade]} ${100 - donePercent}%) `
  }

  const getDateText = date => {
    if (date === endDate && noEndDate)
      return t('project.overview.roadmap.noEndDateSet')
    if (date === startDate && noStartDate)
      return t('project.overview.roadmap.noStartDateSet')

    return getDateDisplayString(date, DATE_FORMAT_FULL, true)
  }

  return (
    <div className={classes.roadmap} id="roadmap-wrapper">
      {props.noDatesSet && (
        <Typography className={classes.noDatesSet} data-test="no-set-dates">
          {props.isMatterOverview
            ? Object.values(props.workstream.taskCounts).reduce(
                (p, a) => p + a,
                0
              ) === 0
              ? t('project.overview.roadmap.noTasksWorkstream')
              : t('project.overview.roadmap.noDatesSetWorkstream')
            : t('project.overview.roadmap.noDatesSet')}
        </Typography>
      )}
      {!props.noDatesSet && (
        <>
          <div
            className={`${classes.buffer} ${classes.leftBuffer}`}
            style={{ marginLeft: `${leftMarginX}px` }}
          >
            <Typography
              className={classes.leftHandDate}
              data-test="task-start-date"
              style={{
                color:
                  startIsOverdue &&
                  props?.task?.status === TASK_STATUS.NOT_STARTED
                    ? rawColours.primary.red.primary
                    : '',
              }}
            >
              {!props.task?.isMilestone && getDateText(startDate)}
            </Typography>
          </div>
          <div
            id="task-bar"
            data-test="task-bar"
            onClick={() => props.navigateToTask()}
            style={{
              opacity: !props.task?.isMilestone ? '100%' : '0%',
              width: `${taskBarWidth}px`,
              background: generateTaskBackground(),
              borderBottom: `4px solid ${generateTaskBackground('dark')}`,
            }}
            className={classes.taskBar}
          >
            {/* need to add this div for the matter overview as css borders don't support gradients */}
            {!isTaskOverview && (
              <div
                className={classes.matterOverviewFauxBorder}
                style={{
                  background: generateTaskBackground('dark'),
                }}
              />
            )}
          </div>
          <div className={classes.buffer}>
            <Typography
              className={classes.rightHandDate}
              data-test="task-end-date"
              style={{
                marginLeft:
                  props.task?.isMilestone &&
                  props.task.status === TASK_STATUS.NOT_STARTED
                    ? '36px'
                    : '',
                color:
                  endIsOverdue && props?.task?.status !== TASK_STATUS.DONE
                    ? rawColours.primary.red.primary
                    : '',
              }}
            >
              {getDateText(endDate)}
            </Typography>
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectOverviewRoadmapRender
