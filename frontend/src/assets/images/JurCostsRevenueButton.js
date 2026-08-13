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

function JurCostsRevenueButton(props) {
  return (
    <SvgIcon style={props.style} viewBox="0 0 60 60" fontSize="large">
      <svg
        width={60}
        height={60}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <g opacity={0.8} filter="url(#filter0_d_4218_14897)">
          <path
            d="M2 29C2 13.536 14.536 1 30 1C45.464 1 58 13.536 58 29C58 44.464 45.464 57 30 57C14.536 57 2 44.464 2 29Z"
            fill="#E1DED8"
          />
          <path
            d="M3 29C3 14.0883 15.0883 2 30 2C44.9117 2 57 14.0883 57 29C57 43.9117 44.9117 56 30 56C15.0883 56 3 43.9117 3 29Z"
            stroke="#989390"
            strokeWidth={2}
          />
          <path
            d="M22.9997 27.8346V32.5013M36.9997 25.5013V30.168M35.833 19.668C38.6898 19.668 40.235 20.1052 41.0038 20.4443C41.1062 20.4895 41.1574 20.5121 41.3051 20.6531C41.3937 20.7376 41.5554 20.9856 41.597 21.1007C41.6663 21.2928 41.6663 21.3978 41.6663 21.6078V34.1476C41.6663 35.2079 41.6663 35.738 41.5073 36.0105C41.3456 36.2876 41.1897 36.4165 40.8869 36.523C40.5893 36.6277 39.9886 36.5123 38.7872 36.2815C37.9463 36.1199 36.9489 36.0013 35.833 36.0013C32.333 36.0013 28.833 38.3346 24.1663 38.3346C21.3095 38.3346 19.7644 37.8974 18.9955 37.5583C18.8932 37.5131 18.842 37.4905 18.6942 37.3495C18.6056 37.265 18.444 37.017 18.4024 36.9019C18.333 36.7098 18.333 36.6048 18.333 36.3948L18.333 23.855C18.333 22.7947 18.333 22.2646 18.492 21.9921C18.6537 21.715 18.8097 21.5861 19.1124 21.4796C19.41 21.3749 20.0107 21.4903 21.2121 21.7211C22.0531 21.8827 23.0504 22.0013 24.1663 22.0013C27.6663 22.0013 31.1663 19.668 35.833 19.668ZM32.9163 29.0013C32.9163 30.6121 31.6105 31.918 29.9997 31.918C28.3888 31.918 27.083 30.6121 27.083 29.0013C27.083 27.3905 28.3888 26.0846 29.9997 26.0846C31.6105 26.0846 32.9163 27.3905 32.9163 29.0013Z"
            stroke={props.customColour ? props.customColour : '#504C4B'}
            strokeWidth={1.66667}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_4218_14897"
            x={0}
            y={0}
            width={60}
            height={60}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy={1} />
            <feGaussianBlur stdDeviation={1} />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.05 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_4218_14897"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_4218_14897"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
    </SvgIcon>
  )
}

export default JurCostsRevenueButton
