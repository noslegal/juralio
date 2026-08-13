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
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { PHASE_LABEL_BACKGROUND_COLOR } from '../../../../components/icicle/common/render/update/core-applicators/phase-label-applicator'
import juralioColours from '../../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  phaseLabelBackground: {
    position: 'absolute',
    top: '50%',
    backgroundColor: PHASE_LABEL_BACKGROUND_COLOR,
    borderRadius: theme.shape.borderRadius,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateY(-50%)',
    padding: theme.spacing(0, 1.5),
    marginLeft: theme.spacing(2.5),
    minWidth: theme.spacing(20),
    overflow: 'hidden',
    cursor: 'pointer',
    width: '75%',
  },
  phaseLabel: {
    color: juralioColours.whiteText.primary,
    whiteSpace: 'nowrap',
    fontSize: '1rem',
    lineHeight: '28px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  taskCount: {
    color: juralioColours.whiteText.primary,
    fontWeight: theme.typography.fontWeightMedium,
  },
  taskCountLabel: {
    color: juralioColours.whiteText.primary,
    fontSize: '0.75rem',
    lineHeight: '15px',
  },
  statusCount: {
    color: juralioColours.whiteText.primary,
    fontSize: '0.625rem',
    paddingBottom: theme.spacing(1),
  },
  textRow: {
    display: 'flex',
    alignItems: 'baseline',
    paddingBottom: theme.spacing(1),
  },
  detail: {
    opacity: 0,
    maxHeight: 0,
    paddingBottom: theme.spacing(0),
  },
}))

const TaskCountBar = props => {
  const { classes } = useStyles()

  return props.count && props.count > 0 ? (
    <>
      <div
        style={{
          background: props.color,
          height: 6,
          width: `${(props.count * 100) / props.maxCount}%`,
        }}
      />

      <Typography
        variant="body1"
        className={classes.statusCount}
        style={{
          color: juralioColours.whiteText.primary,
          fontSize: '0.625rem',
          paddingBottom: '8px',
        }}
      >
        {props.count === props.totalCount ? ' ' : props.count}
      </Typography>
    </>
  ) : null
}

// this stuff gets static-rendered, so can't be stateful
const PhaseLabel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const getSummaryResult = key => props.summary[key] || 0
  const notStartedCount = getSummaryResult('not-started')
  const inProgressCount = getSummaryResult('in-progress')
  const doneCount = getSummaryResult('done')
  const totalCount = getSummaryResult('total')
  const maxCount = Math.max(notStartedCount, inProgressCount, doneCount)
  const alwaysShowLabel = props.isAboveHeightThreshold

  return (
    <div
      className={classes.phaseLabelBackground}
      id={`${alwaysShowLabel ? 'non-fading-' : ''}phase-label-${props.itemId}`}
      style={{
        opacity: alwaysShowLabel ? 1.0 : 0.0,
        fontFamily: 'Montserrat',
        position: 'absolute',
        top: '50%',
        backgroundColor: PHASE_LABEL_BACKGROUND_COLOR,
        borderRadius: '8px', //theme.shape.borderRadius,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        transform: 'translateY(-50%)',
        padding: '0, 12', //theme.spacing(0, 1.5),
        marginLeft: 20, //theme.spacing(2.5),
        minWidth: 160, //theme.spacing(20),
        overflow: 'hidden',
        cursor: 'pointer',
        width: '75%',
      }}
      data-test="phase-label"
    >
      <Typography
        className={classes.phaseLabel}
        variant="body1"
        data-test="phase-label-task-name"
        style={{
          color: juralioColours.whiteText.primary,
          whiteSpace: 'nowrap',
          fontSize: '1rem',
          lineHeight: '28px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'Montserrat',
        }}
      >
        {props.name}
      </Typography>
      <div
        className={classes.detail}
        id={`phase-label-${props.itemId}-detail`}
        data-test="phase-label-detail"
        style={{
          opacity: 0,
          maxHeight: 0,
          paddingBottom: '0px',
        }}
      >
        <div
          className={classes.textRow}
          data-test="phase-label-detail-task-count"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            paddingBottom: '8px',
          }}
        >
          <Typography
            variant="subtitle2"
            className={classes.taskCount}
            style={{
              color: juralioColours.whiteText.primary,
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            {totalCount}
          </Typography>
          <Typography
            variant="h2"
            className={classes.taskCountLabel}
            style={{
              color: juralioColours.whiteText.primary,
              fontSize: '0.75rem',
              lineHeight: '15px',
            }}
          >
            {t('projectOverview.taskMap.phaseLabel.taskCountLabel', {
              count: totalCount,
            })}
          </Typography>
        </div>

        <TaskCountBar
          color={juralioColours.taskStatus.done}
          count={doneCount}
          maxCount={maxCount}
          totalCount={totalCount}
        />
        <TaskCountBar
          color={juralioColours.taskStatus.inProgress}
          count={inProgressCount}
          maxCount={maxCount}
          totalCount={totalCount}
        />
        <TaskCountBar
          color={juralioColours.taskStatus.notStarted}
          count={notStartedCount}
          maxCount={maxCount}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}

export default PhaseLabel
