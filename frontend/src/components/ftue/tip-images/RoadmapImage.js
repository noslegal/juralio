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

import React from 'react'
import { makeStyles } from 'tss-react/mui'

const style = makeStyles()(theme => ({
  wrapper: {
    width: '100%',
    height: '100%',
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
  },
}))

const RoadmapImage = () => {
  const { classes } = style()
  return (
    <div className={classes.wrapper}>
      <svg
        width="83"
        height="83"
        viewBox="0 0 83 83"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="83" height="83" rx="9.65895" fill="white" />
        <g filter="url(#filter0_ddd_2564_4765)">
          <rect
            x="5"
            y="26"
            width="61.1628"
            height="12.2326"
            rx="1.39801"
            fill="#F4E1BA"
          />
          <path
            d="M9.54346 37.184H37.8531V39.98H9.54346V37.184Z"
            fill="#DFA837"
          />
          <g clipPath="url(#clip0_2564_4765)">
            <circle
              cx="38.5524"
              cy="37.883"
              r="2.27176"
              fill="#F4E1BA"
              stroke="#DFA837"
              strokeWidth="1.0485"
            />
          </g>
          <g clipPath="url(#clip1_2564_4765)">
            <circle cx="7.79601" cy="37.883" r="2.27176" fill="#DFA837" />
            <circle
              cx="7.79601"
              cy="37.883"
              r="2.27176"
              stroke="#DFA837"
              strokeWidth="1.0485"
            />
            <circle
              cx="7.79601"
              cy="37.883"
              r="2.27176"
              stroke="black"
              strokeOpacity="0.2"
              strokeWidth="1.0485"
            />
          </g>
          <rect
            x="13.0386"
            y="43.1255"
            width="65.0073"
            height="12.2326"
            rx="1.39801"
            fill="#D1E5E6"
          />
          <path
            d="M14.5146 54.3096H26.3977V57.1056H14.5146V54.3096Z"
            fill="#63A6A9"
          />
          <g clipPath="url(#clip2_2564_4765)">
            <circle cx="15.8346" cy="55.3581" r="2.27176" fill="#63A6A9" />
            <circle
              cx="15.8346"
              cy="55.3581"
              r="2.27176"
              stroke="#63A6A9"
              strokeWidth="1.0485"
            />
            <circle
              cx="15.8346"
              cy="55.3581"
              r="2.27176"
              stroke="black"
              strokeOpacity="0.2"
              strokeWidth="1.0485"
            />
          </g>
          <circle cx="26.3195" cy="55.3581" r="2.27176" fill="#63A6A9" />
          <circle
            cx="26.3195"
            cy="55.3581"
            r="2.27176"
            stroke="#63A6A9"
            strokeWidth="1.0485"
          />
          <circle
            cx="26.3195"
            cy="55.3581"
            r="2.27176"
            stroke="black"
            strokeOpacity="0.2"
            strokeWidth="1.0485"
          />
        </g>
        <defs>
          <filter
            id="filter0_ddd_2564_4765"
            x="3.9515"
            y="25.301"
            width="75.1429"
            height="36.3482"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.349502" />
            <feGaussianBlur stdDeviation="0.524252" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2564_4765"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.349502" />
            <feGaussianBlur stdDeviation="0.174751" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0"
            />
            <feBlend
              mode="normal"
              in2="effect1_dropShadow_2564_4765"
              result="effect2_dropShadow_2564_4765"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius="0.349502"
              operator="erode"
              in="SourceAlpha"
              result="effect3_dropShadow_2564_4765"
            />
            <feOffset dy="0.699003" />
            <feGaussianBlur stdDeviation="0.174751" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="effect2_dropShadow_2564_4765"
              result="effect3_dropShadow_2564_4765"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect3_dropShadow_2564_4765"
              result="shape"
            />
          </filter>
          <clipPath id="clip0_2564_4765">
            <rect
              width="5.94153"
              height="6.29103"
              fill="white"
              transform="translate(35.7563 35.087)"
            />
          </clipPath>
          <clipPath id="clip1_2564_4765">
            <rect
              width="5.94153"
              height="6.29103"
              fill="white"
              transform="translate(5 35.087)"
            />
          </clipPath>
          <clipPath id="clip2_2564_4765">
            <rect
              width="5.94153"
              height="6.29103"
              fill="white"
              transform="translate(13.0386 52.5621)"
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

export default RoadmapImage
