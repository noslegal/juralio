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

import { SvgIcon, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'
import { POSITIONS } from '../../../constants'

const useStyles = makeStyles()(theme => ({
  diagram: {
    scale: '20',
    marginLeft: '45%',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
}))

const CostsFlowDiagram = props => {
  const {
    stage,
    latestStage,
    noClick,
    setStage,
    showTitle,
    position = POSITIONS.ADVISOR.name,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const isNotAtLatestStage = stage < latestStage

  return (
    <div>
      {showTitle && (
        <Typography variant="h6">
          {stage === 5 || stage === 6
            ? t('Set up  your first rates table')
            : t('Set up your cost building blocks')}
        </Typography>
      )}
      {stage === 5 && position === POSITIONS.CLIENT.name ? (
        ''
      ) : (
        <SvgIcon
          hidden
          className={classes.diagram}
          viewBox="0 0 456 40"
          data-test="costs-flow-diagram"
        >
          <svg
            width="388"
            height="40"
            viewBox="0 0 388 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="20"
              cy="20"
              r="20"
              fill={
                latestStage === 1 || latestStage === 0
                  ? '#dfa737'
                  : latestStage > 1
                    ? '#63A6A9'
                    : rawColours.primary.black[200]
              }
            />
            <path
              d="M19.6188 27V13.8L20.4788 14.74H16.4588V13H21.5988V27H19.6188Z"
              fill="white"
            />
            <path
              d="M48.728 10.949A1 1 0 0 1 49.62 9.5H56v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2 2 0 0 0 0-1.796l-4.095-8.153ZM56 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.57 7.996A3 3 0 0 1 66.26 30.5H64v-21Z"
              opacity={latestStage === 1 ? '1' : latestStage < 1 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 1
                  ? rawColours.status.done.light
                  : latestStage === 1
                    ? '#dfa737'
                    : latestStage > 1
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
              onClick={() => {
                if (!noClick && latestStage >= 1) {
                  setStage(1)
                }
              }}
              cursor={!noClick && latestStage >= 1 ? 'pointer' : ''}
            />
            <circle
              opacity={
                latestStage > 1 && latestStage < 5
                  ? '1'
                  : latestStage < 2
                    ? '0.3'
                    : '1'
              }
              fill={
                latestStage >= 2 ? '#63A6A9' : rawColours.primary.black[200]
              }
              cx="102"
              cy="20"
              r="20"
            />
            <path
              opacity="0.6"
              d="M96.9978 27V25.64L102.698 20.14C103.204 19.66 103.578 19.24 103.818 18.88C104.071 18.5067 104.238 18.1667 104.318 17.86C104.411 17.54 104.458 17.2333 104.458 16.94C104.458 16.22 104.204 15.6533 103.698 15.24C103.191 14.8267 102.451 14.62 101.478 14.62C100.731 14.62 100.058 14.7467 99.4578 15C98.8578 15.24 98.3378 15.62 97.8978 16.14L96.5378 14.96C97.0711 14.28 97.7845 13.76 98.6778 13.4C99.5845 13.0267 100.578 12.84 101.658 12.84C102.631 12.84 103.478 13 104.198 13.32C104.918 13.6267 105.471 14.0733 105.858 14.66C106.258 15.2467 106.458 15.94 106.458 16.74C106.458 17.1933 106.398 17.64 106.278 18.08C106.158 18.52 105.931 18.9867 105.598 19.48C105.264 19.9733 104.784 20.5267 104.158 21.14L99.0778 26.04L98.5978 25.26H107.058V27H96.9978Z"
              fill="white"
            />
            <path
              d="M130.728 10.949a1 1 0 0 1 .893-1.449H138v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2.004 2.004 0 0 0 0-1.796l-4.095-8.153ZM138 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.569 7.996a3 3 0 0 1-2.605 1.512H146v-21Z"
              onClick={() => {
                if (!noClick && latestStage >= 2) {
                  setStage(2)
                }
              }}
              opacity={latestStage === 2 ? '1' : latestStage < 2 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 2
                  ? rawColours.status.done.light
                  : latestStage === 2
                    ? '#dfa737'
                    : latestStage > 2
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
              cursor={!noClick && latestStage >= 2 ? 'pointer' : ''}
            />
            <path
              d="M164.728 10.949a1 1 0 0 1 .893-1.449H172v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2.004 2.004 0 0 0 0-1.796l-4.095-8.153ZM172 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.569 7.996a3 3 0 0 1-2.605 1.512H180v-21Z"
              onClick={() => {
                if (!noClick && latestStage >= 3) {
                  setStage(3)
                }
              }}
              opacity={latestStage === 3 ? '1' : latestStage < 3 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 3
                  ? rawColours.status.done.light
                  : latestStage === 3
                    ? '#dfa737'
                    : latestStage > 3
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
              cursor={!noClick && latestStage >= 3 ? 'pointer' : ''}
            />
            <path
              d="M198.728 10.949a1 1 0 0 1 .893-1.449H206v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2.004 2.004 0 0 0 0-1.796l-4.095-8.153ZM206 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.569 7.996a3 3 0 0 1-2.605 1.512H214v-21Z"
              onClick={() => {
                if (!noClick && latestStage >= 4) {
                  setStage(4)
                }
              }}
              opacity={latestStage === 4 ? '1' : latestStage < 4 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 4
                  ? rawColours.status.done.light
                  : latestStage === 4
                    ? '#dfa737'
                    : latestStage > 4
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
              cursor={!noClick && latestStage >= 4 ? 'pointer' : ''}
            />
            <circle
              opacity={latestStage === 5 ? '1' : latestStage < 5 ? '0.3' : '1'}
              fill={
                latestStage === 5
                  ? '#dfa737'
                  : latestStage > 5
                    ? '#63A6A9'
                    : rawColours.primary.black[200]
              }
              cx="252"
              cy="20"
              r="20"
            />
            <path
              opacity="0.6"
              d="M251.517 27.16C250.531 27.16 249.571 27.0067 248.637 26.7C247.717 26.3933 246.964 25.98 246.377 25.46L247.297 23.88C247.764 24.32 248.371 24.68 249.117 24.96C249.864 25.24 250.664 25.38 251.517 25.38C252.557 25.38 253.364 25.16 253.937 24.72C254.524 24.2667 254.817 23.66 254.817 22.9C254.817 22.1667 254.537 21.58 253.977 21.14C253.431 20.6867 252.557 20.46 251.357 20.46H250.237V19.06L254.397 13.94L254.677 14.74H247.017V13H256.257V14.36L252.117 19.46L251.077 18.84H251.737C253.431 18.84 254.697 19.22 255.537 19.98C256.391 20.74 256.817 21.7067 256.817 22.88C256.817 23.6667 256.624 24.3867 256.237 25.04C255.851 25.6933 255.264 26.2133 254.477 26.6C253.704 26.9733 252.717 27.16 251.517 27.16Z"
              fill="white"
            />
            <path
              d="M280.728 10.949a1 1 0 0 1 .893-1.449H288v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2.004 2.004 0 0 0 0-1.796l-4.095-8.153ZM288 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.569 7.996a3 3 0 0 1-2.605 1.512H296v-21Z"
              onClick={() => {
                if (!noClick && latestStage >= 5) {
                  setStage(5)
                }
              }}
              opacity={latestStage === 5 ? '1' : latestStage < 5 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 5
                  ? rawColours.status.done.light
                  : latestStage === 5
                    ? '#dfa737'
                    : latestStage > 5
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
              cursor={!noClick && latestStage >= 5 ? 'pointer' : ''}
            />
            <path
              d="M314.728 10.949a1 1 0 0 1 .893-1.449H322v21h-6.379a1 1 0 0 1-.893-1.449l4.095-8.153a2.004 2.004 0 0 0 0-1.796l-4.095-8.153ZM322 9.5h8v21h-8zm8 0h2.259a3 3 0 0 1 2.605 1.512l4.569 7.996a2 2 0 0 1 0 1.984l-4.569 7.996a3 3 0 0 1-2.605 1.512H330v-21Z"
              opacity={latestStage === 6 ? '1' : latestStage < 6 ? '0.3' : '1'}
              fill={
                isNotAtLatestStage && stage === 6
                  ? rawColours.status.done.light
                  : latestStage === 6
                    ? '#dfa737'
                    : latestStage > 6
                      ? '#63A6A9'
                      : rawColours.primary.black[200]
              }
            />
            <g opacity="0.3">
              <circle
                cx="368"
                cy="20"
                r="20"
                fill={rawColours.primary.black[200]}
              />
              <g opacity="0.6">
                <path
                  d="M363.5 20L366.5 23L372.5 17M378 20C378 25.5228 373.523 30 368 30C362.477 30 358 25.5228 358 20C358 14.4772 362.477 10 368 10C373.523 10 378 14.4772 378 20Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </svg>
        </SvgIcon>
      )}
    </div>
  )
}

export default CostsFlowDiagram
