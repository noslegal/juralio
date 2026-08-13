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
import { easeCubic } from 'd3-ease'
import { scaleTime } from 'd3-scale'
import { select, selectAll } from 'd3-selection'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  showTaskmapDatePickerForTask,
  showTaskPreview,
} from '../../../app/task-details/task-actions'
import { sendTextToClipboard } from '../../../services/clipboard/clipboard-service'

import rawColours from '../../../theme/raw-colours'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import RoadmapConstants from '../helpers/roadmap-constants'

import {
  generateDataPoints,
  getTimescaleDivider,
  zoomToTimePeriod,
} from '../roadmap-zoom'

import { setupRenderAssigneeInteraction } from './roadmap-tasks-hooks'
import RoadmapDividers from './RoadmapDividers'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

import RoadmapRow from './RoadmapRow'
import colorModifiers from '../../../theme/color-modifiers'

const useStyles = makeStyles()(theme => ({
  expandableArea: {
    '&:hover': {
      cursor: 'pointer',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0.25))',
    },
  },
  expandableText: {
    width: '100%',
    opacity: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      opacity: 1,
    },
  },
  noSubtasks: {
    cursor: 'unset !important',
    '&:hover': {
      cursor: 'unset !important',
      backgroundImage: 'linear-gradient(rgba(0,0,0,0),rgba(0,0,0,0.25))',
    },
  },
  milestonePin: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginTop: '-8px',
  },
  titleLevelChip: {
    paddingLeft: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    width: theme.spacing(6),
    height: theme.spacing(2),
    borderRadius: theme.spacing(0.5),
    backgroundColor: rawColours.primary.black.black,
    color: rawColours.primary.white.primary,
    display: 'flex',
    marginRight: theme.spacing(),
    marginLeft: theme.spacing(0.25),
    marginBottom: theme.spacing(1.5),
  },
  dateRailSkel: {
    backgroundColor: '#504C4B',
    position: 'absolute',
    height: RoadmapConstants.DIVIDER_HEIGHT,
  },
  pinHoverNoDates: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    fontWeight: 700,
    fontSize: theme.spacing(1.5),
    whiteSpace: 'nowrap',
    color: colorModifiers.primaryBackground('#000000'),
  },
  pinHoverDetailsWrapper: {
    display: 'flex',
    flexdirection: 'row',
  },
  pinHoverColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  pinHoverWarningWrapper: {
    width: 'fit-content',

    backgroundColor: '#FFB547',
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    boxShadow: ' 0px 5px 5px -3px rgba(0,0,0,0.2)',
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  pinHoverWarningWrapperOnConfirm: {
    width: 'fit-content',
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  pinHoverErrorWrapper: {
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F58970',
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    whiteSpace: 'nowrap',

    boxShadow: ' 0px 5px 5px -3px rgba(0,0,0,0.2)',
  },
  pinHoverWarningBold: {
    fontWeight: 700,
    fontSize: theme.spacing(1.5),
    color: 'black',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(),
    whiteSpace: 'nowrap',
  },
  pinHoverOverdueText: {
    marginLeft: theme.spacing(),
    fontSize: theme.spacing(1.5),
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  pinHoverOverdueTextAdditional: {
    fontSize: theme.spacing(1.5),
    marginRight: theme.spacing(),
  },
  pinHoverDateInfoWrapper: {
    width: 'fit-content',
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    whiteSpace: 'nowrap',
  },
  pinHoverShorteningText: {
    fontSize: theme.spacing(1.5),
    marginLeft: theme.spacing(),
    whiteSpace: 'nowrap',
  },
  pinHoverDateType: {
    marginRight: theme.spacing(),
    fontWeight: 700,
    fontSize: theme.spacing(1.5),
    whiteSpace: 'nowrap',
    color: colorModifiers.primaryBackground('#000000'),
  },
  pinHoverDate: {
    marginRight: theme.spacing(),
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontSize: theme.spacing(1.5),
  },
  pinHoverDuration: {
    marginRight: theme.spacing(),
    fontWeight: 700,
    fontSize: theme.spacing(1.5),
    backgroundColor: colorModifiers.textBackground(
      rawColours.primary.white.primary
    ),
    whiteSpace: 'nowrap',
    textTransform: 'lowercase',

    marginLeft: theme.spacing(),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    boxShadow: ' 0px 5px 5px -3px rgba(0,0,0,0.2)',
  },
  pinHoverDateWrapper: {
    backgroundColor: colorModifiers.textBackground(
      rawColours.primary.white.primary
    ),
    borderRadius: theme.spacing(0.5),
    whiteSpace: 'nowrap',

    display: 'flex',
    paddingLeft: theme.spacing(0.5),
    boxShadow: ' 0px 5px 5px -3px rgba(0,0,0,0.2)',
  },
  dragConfirmationDiv: {
    minHeight: '40px',
    backgroundColor: rawColours.primary.purple[100],
    padding: '8px',
    borderStyle: 'Solid',
    borderWidth: '2px',
    borderRadius: '5px',
    borderColor: rawColours.primary.purple.secondary,
  },
  dragConfirmButton: {
    color: rawColours.primary.white.primary,
    backgroundColor: rawColours.primary.purple.secondary,
    '&:hover': {
      backgroundColor: rawColours.primary.purple.dark,
    },
  },
}))

const FADE_DURATION = 255
let hasAlreadyScrolled = false

const RoadmapTasks = props => {
  const wrapperElement = document.getElementById('roadmap-tasks-wrapper')
  const previousClickedTask = props.lastLocation?.split('/')[6]

  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const {
    tasks,
    dimensions,
    roadmapData,
    roadmapRef,
    rangeEnd,
    timePeriod,
    matterId,
    projectId,
  } = props
  const startDate = new Date(roadmapData.rangeStart)
  const isCompact =
    props.detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
  const HEIGHT = isCompact
    ? RoadmapConstants.COMPACT_TASK_HEIGHT
    : RoadmapConstants.TASK_HEIGHT
  const MARGIN = isCompact
    ? RoadmapConstants.COMPACT_MARGIN
    : RoadmapConstants.MARGIN
  const endDate = new Date(rangeEnd)
  let interval,
    xPos = null,
    yPos = null

  const dividerHeight = 40

  const rowHeight = isCompact ? 80 : 140

  const filteredTasks = tasks.filter(t => !t.filteredOut)

  const additionalHeight =
    props.detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED ? 20 : 0

  const getTask = e => {
    const id = e.target.closest('.roadmap-tasks').attributes['taskid'].value
    return tasks.filter(t => t.id.toString() === id)[0]
  }
  const dateClickHandler = (e, type) => {
    e.stopPropagation()
    dispatch(
      showTaskmapDatePickerForTask({
        task: getTask(e),
        dateType: type,
      })
    )
  }

  useEffect(() => {
    return () => {
      hasAlreadyScrolled = false
    }
  }, [])

  useEffect(() => {
    selectAll('[id^=taskCellDatePicker-start]').on('click', e =>
      dateClickHandler(e, 'start')
    )
    selectAll('[id^=taskCellDatePicker-end]').on('click', e =>
      dateClickHandler(e, 'end')
    )
    selectAll('#reference-number').on('click', e => {
      e.stopPropagation()
      const taskId =
        e.srcElement.parentNode.parentNode.getAttribute('data-task-id')
      if (taskId == null) {
        return
      }
      const target = window.location.href
        .split('?')[0]
        .replace('roadmap', 'task/' + taskId)
      sendTextToClipboard(target)
      dispatch(showSnackbar(t('taskDetails.urlOfTaskCopiedToClipbard')))
    })

    selectAll('[data-test="task-cell-test"]')
      .on('mouseover', e => {
        const self = e.target.closest('[data-test="task-cell-test"')
        const taskId =
          self.parentNode.parentNode.parentNode.getAttribute('taskid')

        select(`#visibility-${taskId}`)
          .on('click', e => {
            e.stopPropagation()
            const leftPos =
              parseInt(
                self.parentNode.parentNode.parentNode.style.left.slice(0, -2)
              ) -
              document.getElementById('roadmap-tasks-wrapper').scrollLeft +
              parseInt(
                self.parentNode.parentNode.parentNode.style.width.slice(0, -2) -
                  449
              )

            let index = filteredTasks.map(t => t.id).indexOf(parseInt(taskId))
            let topPos =
              index * rowHeight -
              document.getElementById('roadmap-tasks-wrapper').scrollTop +
              32
            dispatch(
              showTaskPreview(
                tasks.find(t => t.id === parseInt(taskId)),
                { left: leftPos, top: topPos }
              )
            )
          })
          .transition()
          .ease(easeCubic)
          .duration(FADE_DURATION)
          .style('opacity', 1)
      })
      .on('mouseout', e => {
        const self = e.target.closest('[data-test="task-cell-test"')
        const taskId =
          self.parentNode.parentNode.parentNode.getAttribute('taskid')

        select(`#visibility-${taskId}`)
          .transition()
          .ease(easeCubic)
          .duration(FADE_DURATION)
          .style('opacity', 0)
      })
    if (!props.viewOnly) {
      setupRenderAssigneeInteraction(tasks, roadmapRef)
    }
  })

  const [leftScroll, setLeftScroll] = useState(0)
  const onScroll = () => {
    setLeftScroll(document.getElementById('roadmap-tasks-wrapper')?.scrollLeft)
  }

  useEffect(() => {
    window.addEventListener('roadmap-scroll', onScroll)
    return () => {
      window.removeEventListener('roadmap-scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => zoomToTimePeriod(timePeriod, roadmapData), 1000) //NOTE this is a bit jittery
  }, [timePeriod]) // eslint-disable-line

  if (!tasks) return null

  // have to generate the timescale twice to be able to calculate how far in the future the task_width will push the roadmap
  let unPaddedDataPoints = generateDataPoints(timePeriod, startDate, endDate)

  let unPaddedTimeScale = scaleTime()
    .domain([startDate, endDate])
    .range([
      RoadmapConstants.DIVIDER_LHS_MARGIN,
      (document.body.offsetWidth /
        getTimescaleDivider(timePeriod, unPaddedDataPoints)) *
        unPaddedDataPoints -
        RoadmapConstants.DIVIDER_RHS_MARGIN,
    ])

  let endDateWithPadding = unPaddedTimeScale.invert(
    unPaddedTimeScale(endDate) + RoadmapConstants.TASK_WIDTH
  )
  let dataPoints = generateDataPoints(timePeriod, startDate, endDateWithPadding)
  let rangeRHS =
    (document.body.offsetWidth / getTimescaleDivider(timePeriod, dataPoints)) *
      dataPoints -
    RoadmapConstants.DIVIDER_RHS_MARGIN
  let timeScale = scaleTime()
    .domain([startDate, endDateWithPadding])
    .range([RoadmapConstants.DIVIDER_LHS_MARGIN, rangeRHS])
  if (
    previousClickedTask !== undefined &&
    wrapperElement !== null &&
    hasAlreadyScrolled === false
  ) {
    var task = document.getElementById(parseInt(previousClickedTask))
    if (task) {
      let distance = parseInt(task.style.top)
      const time = 100
      const speed = distance / time
      interval = setInterval(() => {
        scrollToTargetedY(distance, speed)
      })
      hasAlreadyScrolled = true
    }
  }

  const scrollToTargetedY = (targetYPos, increment) => {
    if (
      yPos < targetYPos - increment / 2 ||
      yPos > targetYPos + increment / 2
    ) {
      document.getElementById('roadmap-tasks-wrapper').scrollTop =
        yPos + increment
      yPos = yPos + increment
    } else {
      clearInterval(interval)
    }
  }

  const renderToday = () => {
    let left = timeScale(new Date())

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          widht: '100%',
          height:
            filteredTasks.length * rowHeight + RoadmapConstants.DIVIDER_HEIGHT,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1004,
          }}
        >
          <Typography
            id="today"
            style={{
              position: 'absolute',
              backgroundColor: JuralioNamedColours.blue.main,
              borderRadius: '4px',
              left: `${left - 25}px`,
              width: '50px',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              zIndex: '1005',
              top: '2px',
            }}
            data-test="today-label"
          >
            {t('common.today')}
          </Typography>
        </div>
        <div
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            width: '100%',
            // zIndex: 1004,
          }}
        >
          <div
            style={{
              width: RoadmapConstants.TODAY_POLE_WIDTH,
              height: document.getElementById('roadmap-tasks-wrapper')
                ?.offsetHeight,
              backgroundColor: JuralioNamedColours.blue.main,
              borderRadius: '4px',
              left: `${left}px`,
              position: 'absolute',
            }}
          />
        </div>
      </div>
    )
  }

  const emptyRow = index => {
    return (
      <div
        className="roadmap-tasks"
        style={{
          position: 'absolute',
          top:
            index * MARGIN +
            RoadmapConstants.STRIPE_OFFSET +
            index * additionalHeight +
            dividerHeight +
            'px',
          left: 0,
          width: `${Math.max(dimensions.width, dimensions.roadMapWidth)}px`,
          height: `${rowHeight}px`,
          zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
        }}
      />
    )
  }

  const additionalStripeHeight = isCompact
    ? 60
    : additionalHeight > 0
      ? 132
      : 112

  const excessHeight =
    window.innerHeight - 117 - filteredTasks.length * rowHeight
  const extraRowCount = Math.max(Math.floor(excessHeight / rowHeight - 1), 0)
  return (
    <div
      data-test="roadmap-tasks"
      onScroll={props.onScroll}
      id="roadmap-tasks-wrapper"
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        overflowX: 'scroll',
        zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
      }}
    >
      <div
        className={classes.dateRailSkel}
        style={{ width: dimensions.roadMapWidth }}
      />
      <RoadmapDividers
        dimensions={dimensions}
        startDate={startDate}
        endDate={endDateWithPadding}
        timePeriod={timePeriod}
        rangeRHS={rangeRHS}
      />

      {filteredTasks.map((task, i) => (
        <RoadmapRow
          key={task.id}
          task={task}
          index={i}
          filteredTasks={filteredTasks}
          dimensions={dimensions}
          timeScale={timeScale}
          isCompact={isCompact}
          matterId={matterId}
          projectId={projectId}
          tasks={tasks}
          classes={classes}
          rowHeight={rowHeight}
          additionalHeight={additionalHeight}
          detailedView={props.detailedView}
          leftScroll={leftScroll}
          {...props}
        />
      ))}
      {renderToday()}
    </div>
  )
}

export default RoadmapTasks
