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
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  diagram: {
    scale: '20',
    marginLeft: '20%',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
}))

const MatterRatesFlowDiagram = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div>
      {props.showTitle && (
        <Typography variant="h6">
          {props.stage === 5 || props.stage === 6
            ? t('Set up rates table')
            : t('Set up your cost building blocks')}
        </Typography>
      )}
      <SvgIcon
        className={classes.diagram}
        viewBox="0 0 456 40"
        data-test="costs-flow-diagram"
      >
        <svg
          width="286"
          height="40"
          viewBox="0 0 286 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="20"
            fill={
              props.stage === 0
                ? '#dfa737'
                : props.stage >= 1
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <path
            d="M21.5988 13V27H19.6188V14.74H16.4588V13H21.5988Z"
            fill="white"
          />
          <path
            d="M48.6809 10.9299C48.3649 10.2663 48.8488 9.5 49.5838 9.5H66.259C67.3356 9.5 68.3296 10.0769 68.8638 11.0116L73.433 19.0077C73.7843 19.6226 73.7843 20.3774 73.433 20.9923L68.8638 28.9884C68.3296 29.9231 67.3356 30.5 66.259 30.5H49.5838C48.8488 30.5 48.3649 29.7337 48.6809 29.0701L52.5905 20.8599C52.8496 20.3159 52.8496 19.6841 52.5905 19.1401L48.6809 10.9299Z"
            opacity={props.stage === 1 ? '1' : props.stage < 1 ? '0.3' : '1'}
            fill={
              props.stage === 0
                ? '#dfa737'
                : props.stage >= 1
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <circle
            cx="102"
            cy="20"
            r="20"
            opacity={props.stage === 1 ? '1' : props.stage < 1 ? '0.3' : '1'}
            fill={
              props.stage === 1
                ? '#dfa737'
                : props.stage >= 2
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <path
            opacity={props.stage === 1 ? '1' : props.stage < 1 ? '0.3' : '1'}
            d="M107.058 25.26V27H96.9978V25.64L102.698 20.14C103.391 19.4733 103.858 18.9 104.098 18.42C104.338 17.9267 104.458 17.4333 104.458 16.94C104.458 16.2067 104.198 15.64 103.678 15.24C103.171 14.8267 102.438 14.62 101.478 14.62C99.9311 14.62 98.7378 15.1267 97.8978 16.14L96.5378 14.96C97.0845 14.2933 97.7978 13.7733 98.6778 13.4C99.5711 13.0267 100.564 12.84 101.658 12.84C103.124 12.84 104.291 13.1933 105.158 13.9C106.024 14.5933 106.458 15.54 106.458 16.74C106.458 17.4867 106.298 18.1933 105.978 18.86C105.658 19.5267 105.051 20.2867 104.158 21.14L99.8778 25.26H107.058Z"
            fill="white"
          />
          <path
            d="M130.681 10.9299C130.365 10.2663 130.849 9.5 131.584 9.5H148.259C149.336 9.5 150.33 10.0769 150.864 11.0116L155.433 19.0077C155.784 19.6226 155.784 20.3774 155.433 20.9923L150.864 28.9884C150.33 29.9231 149.336 30.5 148.259 30.5H131.584C130.849 30.5 130.365 29.7337 130.681 29.0701L134.591 20.8599C134.85 20.3159 134.85 19.6841 134.591 19.1401L130.681 10.9299Z"
            opacity={props.stage === 2 ? '1' : props.stage < 2 ? '0.3' : '1'}
            fill={
              props.stage === 1
                ? '#dfa737'
                : props.stage >= 2
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <circle
            cx="184"
            cy="20"
            r="20"
            opacity={props.stage === 2 ? '1' : props.stage < 2 ? '0.3' : '1'}
            fill={
              props.stage === 2
                ? '#dfa737'
                : props.stage >= 3
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <path
            opacity={props.stage === 2 ? '1' : props.stage < 2 ? '0.3' : '1'}
            d="M184.597 18.88C185.971 19.0133 187.017 19.44 187.737 20.16C188.457 20.8667 188.817 21.7733 188.817 22.88C188.817 23.68 188.617 24.4067 188.217 25.06C187.817 25.7 187.217 26.2133 186.417 26.6C185.631 26.9733 184.664 27.16 183.517 27.16C182.517 27.16 181.557 27.0133 180.637 26.72C179.717 26.4133 178.964 25.9933 178.377 25.46L179.297 23.88C179.777 24.3333 180.391 24.7 181.137 24.98C181.884 25.2467 182.677 25.38 183.517 25.38C184.557 25.38 185.364 25.16 185.937 24.72C186.524 24.28 186.817 23.6733 186.817 22.9C186.817 22.1267 186.531 21.5267 185.957 21.1C185.384 20.6733 184.517 20.46 183.357 20.46H182.237V19.06L185.757 14.74H179.017V13H188.257V14.36L184.597 18.88Z"
            fill="white"
          />
          <path
            d="M212.681 10.9299C212.365 10.2663 212.849 9.5 213.584 9.5H230.259C231.336 9.5 232.33 10.0769 232.864 11.0116L237.433 19.0077C237.784 19.6226 237.784 20.3774 237.433 20.9923L232.864 28.9884C232.33 29.9231 231.336 30.5 230.259 30.5H213.584C212.849 30.5 212.365 29.7337 212.681 29.0701L216.591 20.8599C216.85 20.3159 216.85 19.6841 216.591 19.1401L212.681 10.9299Z"
            opacity={props.stage === 3 ? '1' : props.stage < 3 ? '0.3' : '1'}
            fill={
              props.stage === 2
                ? '#dfa737'
                : props.stage >= 3
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <circle
            cx="266"
            cy="20"
            r="20"
            opacity={props.stage === 3 ? '1' : props.stage < 3 ? '0.3' : '1'}
            fill={
              props.stage === 2
                ? '#dfa737'
                : props.stage >= 3
                  ? '#63A6A9'
                  : rawColours.primary.black[200]
            }
          />
          <g opacity={props.stage === 3 ? '1' : props.stage < 3 ? '0.3' : '1'}>
            <path
              d="M261.5 20L264.5 23L270.5 17M276 20C276 25.5228 271.523 30 266 30C260.477 30 256 25.5228 256 20C256 14.4772 260.477 10 266 10C271.523 10 276 14.4772 276 20Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </SvgIcon>
    </div>
  )
}

export default MatterRatesFlowDiagram
