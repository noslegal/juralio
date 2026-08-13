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

import CheckIcon from '@mui/icons-material/Check'
import EventIcon from '@mui/icons-material/Event'
import PaymentsIcon from '@mui/icons-material/Payments'
import React from 'react'
import { Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import { FIXED_FEE_SETUP_STEP_KEYS } from '../../constants'

// Inline SVG icons for the later steps, mapped to STEP_KEYS order:
// reviewScope, finalReview. The first two steps (periodCurrency, feeType) use
// MUI icons instead — see StepIcon below.
const STEP_ICON_PATHS = [
  null,
  null,
  [
    'M15 15a4 4 0 1 0 0 .01',
    'M18.5 18.5l2.5 2.5',
    'M4 6h16',
    'M4 12h4',
    'M4 18h4',
  ],
  ['M7 12l5 5l10 -10', 'M2 12l5 5m5 -5l5 -5'],
]

const StepIcon = ({ index, className, muiClassName }) => {
  if (index === 0) return <EventIcon className={muiClassName} />
  if (index === 1) return <PaymentsIcon className={muiClassName} />
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {(STEP_ICON_PATHS[index] || []).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

const useStyles = makeStyles()(() => ({
  stepper: {
    marginTop: 36,
    marginBottom: 32,
  },
  stepperLive: {
    background: '#f5f3ef',
    borderRadius: 12,
    padding: '32px 24px 0',
    overflow: 'hidden',
  },
  stepperRow: {
    display: 'grid',
    gridTemplateColumns: `repeat(${FIXED_FEE_SETUP_STEP_KEYS.length}, 1fr)`,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    userSelect: 'none',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    display: 'grid',
    placeItems: 'center',
    fontWeight: 500,
    fontSize: 14,
    background: rawColours.primary.grey.main,
    color: rawColours.primary.black[100],
    transition: 'background 200ms, color 200ms, transform 200ms',
  },
  stepCircleActive: {
    background: rawColours.status.done.dark,
    color: rawColours.primary.white.primary,
    boxShadow: '0 0 0 4px rgba(99, 166, 169, 0.18)',
  },
  stepCircleComplete: {
    background: rawColours.status.done.dark,
    color: rawColours.primary.white.primary,
  },
  stepCircleAhead: {
    background: rawColours.status.inProgress.dark,
    color: rawColours.primary.white.primary,
    boxShadow: '0 0 0 4px rgba(223, 168, 55, 0.18)',
  },
  stepLabel: {
    fontSize: 13,
    color: rawColours.primary.black[100],
    fontWeight: 400,
  },
  stepLabelActive: { color: rawColours.primary.black.black, fontWeight: 500 },
  stepLabelComplete: { color: rawColours.primary.black[200] },
  stepLabelAhead: { color: '#8a6512', fontWeight: 500 },
  progressTrack: {
    marginTop: 14,
    height: 6,
    background: '#E1ECEF',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: rawColours.primary.primary.dark,
    borderRadius: 9999,
    transition: 'width 350ms cubic-bezier(0.4,0,0.2,1)',
  },
  checkIcon: { fontSize: 20 },
  // Live-mode gold theme (mirrors the stepper mockup palette)
  stepCircleLive: {
    width: 44,
    height: 44,
    background: '#f7e3b0',
    color: '#a36b1a',
  },
  liveIcon: {
    width: 20,
    height: 20,
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  liveMuiIcon: {
    fontSize: 20,
  },
  stepCircleLiveActive: {
    background: '#d4a13a',
    color: rawColours.primary.white.primary,
    boxShadow: '0 0 0 4px rgba(212, 161, 58, 0.18)',
  },
  stepCircleLiveComplete: {
    background: '#d4a13a',
    color: rawColours.primary.white.primary,
    boxShadow: 'none',
  },
  stepCircleLiveAhead: {
    background: '#f7e3b0',
    color: '#a36b1a',
    boxShadow: '0 0 0 4px rgba(212, 161, 58, 0.18)',
  },
  stepLabelLive: { color: '#a36b1a' },
  stepLabelLiveActive: { color: '#2c2c2a', fontWeight: 500 },
  stepLabelLiveComplete: { color: '#a36b1a' },
  stepLabelLiveAhead: { color: '#a36b1a', fontWeight: 500 },
  progressTrackLive: {
    background: '#f7e3b0',
    height: 5,
    marginTop: 28,
    marginLeft: -24,
    marginRight: -24,
    borderRadius: '0 0 12px 12px',
  },
  progressFillLive: { background: '#d4a13a' },
}))

const Stepper = ({ current, maxStep, onJump, liveMode = false }) => {
  const { classes, cx } = useStyles()
  const { t } = useTranslation()
  const reachedFraction =
    Math.max(current, maxStep || 0) / (FIXED_FEE_SETUP_STEP_KEYS.length - 1)
  const progress = reachedFraction * 100

  return (
    <div className={cx(classes.stepper, liveMode && classes.stepperLive)}>
      <div className={classes.stepperRow}>
        {FIXED_FEE_SETUP_STEP_KEYS.map((stepKey, i) => {
          const isAhead = i > current && i <= (maxStep || 0)
          const isComplete = i < current
          const isActive = i === current
          const clickable = liveMode || i <= current || isAhead

          return (
            <Tooltip
              key={stepKey}
              title={isAhead ? t('fixedFeeSetup.stepResumeTooltip') : ''}
            >
              <div
                className={classes.stepItem}
                onClick={() => clickable && onJump(i)}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
              >
                <div
                  className={cx(
                    classes.stepCircle,
                    liveMode && classes.stepCircleLive,
                    isActive && classes.stepCircleActive,
                    isActive && liveMode && classes.stepCircleLiveActive,
                    isComplete && classes.stepCircleComplete,
                    isComplete && liveMode && classes.stepCircleLiveComplete,
                    isAhead && classes.stepCircleAhead,
                    isAhead && liveMode && classes.stepCircleLiveAhead
                  )}
                >
                  {liveMode ? (
                    <StepIcon
                      index={i}
                      className={classes.liveIcon}
                      muiClassName={classes.liveMuiIcon}
                    />
                  ) : isComplete ? (
                    <CheckIcon className={classes.checkIcon} />
                  ) : (
                    i + 1
                  )}
                </div>
                <Typography
                  component="div"
                  className={cx(
                    classes.stepLabel,
                    liveMode && classes.stepLabelLive,
                    isActive && classes.stepLabelActive,
                    isActive && liveMode && classes.stepLabelLiveActive,
                    isComplete && classes.stepLabelComplete,
                    isComplete && liveMode && classes.stepLabelLiveComplete,
                    isAhead && classes.stepLabelAhead,
                    isAhead && liveMode && classes.stepLabelLiveAhead
                  )}
                >
                  {t(`fixedFeeSetup.steps.${stepKey}`)}
                </Typography>
              </div>
            </Tooltip>
          )
        })}
      </div>
      <div
        className={cx(
          classes.progressTrack,
          liveMode && classes.progressTrackLive
        )}
      >
        <div
          className={cx(
            classes.progressFill,
            liveMode && classes.progressFillLive
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default Stepper
