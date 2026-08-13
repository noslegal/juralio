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

function JurShift(props) {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 44 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#a)">
          <path
            d="M25 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42.39.39 1.02.39 1.41 0l6.59-6.59a.996.996 0 0 0 0-1.41l-6.58-6.6a.996.996 0 1 0-1.41 1.41L36.17 11H25c-.55 0-1 .45-1 1s.45 1 1 1Z"
            fill={props.fill ? props.fill : '#000'}
          />
        </g>
        <g clipPath="url(#b)">
          <path
            d="M19 19H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42a.996.996 0 0 0-1.41 0l-6.59 6.59a.996.996 0 0 0 0 1.41l6.59 6.59a.996.996 0 1 0 1.41-1.41L7.83 21H19c.55 0 1-.45 1-1s-.45-1-1-1Z"
            fill={props.fill ? props.fill : '#000'}
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill={props.fill ? props.fill : '#fff'} d="M20 0h24v24H20z" />
          </clipPath>
          <clipPath id="b">
            <path fill={props.fill ? props.fill : '#fff'} d="M0 8h24v24H0z" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  )
}

export default JurShift
