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

function JurRoadmap(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="21.333"
        viewBox="0 0 24 21.333"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.223 8.444c1.035 0 1.553 0 1.96-.168a2.22 2.22 0 0 0 1.204-1.203c.169-.409.169-.927.169-1.963 0-1.035 0-1.552-.169-1.96a2.23 2.23 0 0 0-1.203-1.204c-.408-.169-.927-.169-1.961-.169h-8.89c-1.036 0-1.553 0-1.961.169a2.23 2.23 0 0 0-1.203 1.203C2 3.558 2 4.076 2 5.11s0 1.553.169 1.963c.225.544.657.976 1.203 1.203.408.168.925.168 1.961.168zm4.444 11.112c1.036 0 1.553 0 1.961-.169a2.23 2.23 0 0 0 1.203-1.203c.169-.408.169-.927.169-1.961s0-1.553-.169-1.961a2.23 2.23 0 0 0-1.203-1.203c-.408-.169-.925-.169-1.961-.169H5.333c-1.036 0-1.553 0-1.961.169a2.22 2.22 0 0 0-1.203 1.203C2 14.67 2 15.187 2 16.222c0 1.036 0 1.555.169 1.963a2.22 2.22 0 0 0 1.203 1.203c.408.169.925.169 1.961.169z"
          stroke={props.colour}
          strokeWidth="2.222"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurRoadmap
