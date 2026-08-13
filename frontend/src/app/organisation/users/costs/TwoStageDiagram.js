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

import { SvgIcon } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  diagram: {
    scale: '20',
    marginLeft: theme.spacing(32),
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
}))

const TwoStageDiagram = props => {
  const { stage } = props
  const { classes } = useStyles()

  return (
    <div>
      <SvgIcon
        className={classes.diagram}
        viewBox="0 0 388 40"
        data-test="costs-flow-diagram"
      >
        <svg
          width="204"
          height="40"
          viewBox="0 0 204 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="20"
            fill={
              stage > 0
                ? rawColours.status.done.dark
                : rawColours.status.inProgress.dark
            }
          />
          <path
            d="M21.5988 13V27H19.6188V14.74H16.4588V13H21.5988Z"
            fill="white"
          />
          <g opacity={stage > 0 ? '1' : '0.3'}>
            <path
              d="M48.6809 10.9299C48.3649 10.2663 48.8488 9.5 49.5838 9.5H66.259C67.3356 9.5 68.3296 10.0769 68.8638 11.0116L73.433 19.0077C73.7843 19.6226 73.7843 20.3774 73.433 20.9923L68.8638 28.9884C68.3296 29.9231 67.3356 30.5 66.259 30.5H49.5838C48.8488 30.5 48.3649 29.7337 48.6809 29.0701L52.5905 20.8599C52.8496 20.3159 52.8496 19.6841 52.5905 19.1401L48.6809 10.9299Z"
              fill={
                stage > 0
                  ? rawColours.status.done.dark
                  : stage === 0
                    ? rawColours.primary.black.black
                    : rawColours.status.inProgress.dark
              }
            />
          </g>
          <circle
            opacity={stage > 0 ? '1' : '0.3'}
            cx="102"
            cy="20"
            r="20"
            fill={
              stage > 2
                ? rawColours.status.done.dark
                : stage === 0
                  ? rawColours.primary.black.black
                  : rawColours.status.inProgress.dark
            }
          />
          <path
            opacity="0.6"
            d="M107.058 25.26V27H96.9978V25.64L102.698 20.14C103.391 19.4733 103.858 18.9 104.098 18.42C104.338 17.9267 104.458 17.4333 104.458 16.94C104.458 16.2067 104.198 15.64 103.678 15.24C103.171 14.8267 102.438 14.62 101.478 14.62C99.9311 14.62 98.7378 15.1267 97.8978 16.14L96.5378 14.96C97.0845 14.2933 97.7978 13.7733 98.6778 13.4C99.5711 13.0267 100.564 12.84 101.658 12.84C103.124 12.84 104.291 13.1933 105.158 13.9C106.024 14.5933 106.458 15.54 106.458 16.74C106.458 17.4867 106.298 18.1933 105.978 18.86C105.658 19.5267 105.051 20.2867 104.158 21.14L99.8778 25.26H107.058Z"
            fill="white"
          />
          <g opacity={stage > 0 ? '1' : '0.3'}>
            <path
              d="M130.681 10.9299C130.365 10.2663 130.849 9.5 131.584 9.5H148.259C149.336 9.5 150.33 10.0769 150.864 11.0116L155.433 19.0077C155.784 19.6226 155.784 20.3774 155.433 20.9923L150.864 28.9884C150.33 29.9231 149.336 30.5 148.259 30.5H131.584C130.849 30.5 130.365 29.7337 130.681 29.0701L134.591 20.8599C134.85 20.3159 134.85 19.6841 134.591 19.1401L130.681 10.9299Z"
              fill={
                stage > 2
                  ? rawColours.status.done.dark
                  : stage === 1 || stage === 2
                    ? rawColours.status.inProgress.dark
                    : rawColours.primary.black.black
              }
            />
          </g>
          <g opacity={stage === 3 ? '1' : '0.3'}>
            <circle
              cx="184"
              cy="20"
              r="20"
              fill={
                stage === 3
                  ? rawColours.status.done.dark
                  : rawColours.primary.black.black
              }
            />
            <g opacity="0.6">
              <path
                d="M179.5 20L182.5 23L188.5 17M194 20C194 25.5228 189.523 30 184 30C178.477 30 174 25.5228 174 20C174 14.4772 178.477 10 184 10C189.523 10 194 14.4772 194 20Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </g>
        </svg>
      </SvgIcon>
    </div>
  )
}

export default TwoStageDiagram
