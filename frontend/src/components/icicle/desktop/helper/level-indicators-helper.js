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
import styles from '../DesktopIcicle.module.css'
import { DEFAULT_TASK_WIDTH } from '../../../../app/improved-taskmap/taskmap-helpers/consts'

export const renderLevelIndicators = (maxLevel = 6) => {
  return (
    <>
      {maxLevel > 0 && (
        <div id="level-a" className={styles.levelIndicator}>
          <Typography variant="caption">A</Typography>
        </div>
      )}
      {maxLevel > 1 && (
        <div id="level-b" className={styles.levelIndicator}>
          <Typography variant="caption">B</Typography>
        </div>
      )}
      {maxLevel > 2 && (
        <div id="level-c" className={styles.levelIndicator}>
          <Typography variant="caption">C</Typography>
        </div>
      )}
      {maxLevel > 3 && (
        <div id="level-d" className={styles.levelIndicator}>
          <Typography variant="caption">D</Typography>
        </div>
      )}
      {maxLevel > 4 && (
        <div id="level-e" className={styles.levelIndicator}>
          <Typography variant="caption">E</Typography>
        </div>
      )}
      {maxLevel > 5 && (
        <div id="level-f" className={styles.levelIndicator}>
          <Typography variant="caption">F</Typography>
        </div>
      )}
    </>
  )
}

const levelLookup = {
  0: 'A - Phases',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
}

export const renderLevelIndicator = (level, classes) => {
  return (
    <div className={classes.indicatorWrapper}>
      {level === 0 ? (
        <>
          <svg
            width="96"
            height="24"
            viewBox="0 0 96 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M88 0L96 12L88 24H3C1.34315 24 0 22.6569 0 21V3C0 1.34315 1.34315 0 3 0H88Z"
              fill="#504C4B"
            />
          </svg>
          <Typography
            className={`${classes.indicatorText} ${classes.indicatorTextStart}`}
          >
            {levelLookup[level]}
          </Typography>
        </>
      ) : (
        <>
          <svg
            width="96"
            height="24"
            viewBox="0 0 96 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M88 0L96 12L88 24H0L8 12L0 0H88Z" fill="#504C4B" />
          </svg>
          <Typography
            className={`${classes.indicatorText} ${classes.indicatorTextMid}`}
          >
            {levelLookup[level]}
          </Typography>
        </>
      )}
    </div>
  )
}

export const renderEndLevelIndicator = (i, width, expandToLevel, classes) => {
  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        left:
          width === 1
            ? (width - 1) * DEFAULT_TASK_WIDTH + (112 + width * 10) + i * 40
            : (width - 1) * DEFAULT_TASK_WIDTH + (121 + width * 10) + i * 40,
      }}
    >
      <div
        className={classes.endIndicatorButton}
        onClick={() => {
          expandToLevel(i + width + 1)
        }}
      >
        <svg
          width="46"
          height="24"
          viewBox="0 0 46 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M38 0L46 12L38 24H0L8 12L0 0H38Z" fill="#504C4B" />
        </svg>
        <Typography
          data-test={'indicator-text' + (i + width)}
          className={`${classes.indicatorText} ${classes.indicatorTextEnd}`}
        >
          {levelLookup[i + width]}
        </Typography>
      </div>
    </div>
  )
}
