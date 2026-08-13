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

function JurCompact(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="45"
        height="45"
        viewBox="0 0 45 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.625 16.875H39.375M5.625 28.125H39.375M14.625 5.625H30.375C33.5253 5.625 35.1004 5.625 36.3037 6.23809C37.3621 6.77738 38.2226 7.63789 38.7619 8.6963C39.375 9.89956 39.375 11.4747 39.375 14.625V30.375C39.375 33.5253 39.375 35.1004 38.7619 36.3037C38.2226 37.3621 37.3621 38.2226 36.3037 38.7619C35.1004 39.375 33.5253 39.375 30.375 39.375H14.625C11.4747 39.375 9.89956 39.375 8.6963 38.7619C7.63789 38.2226 6.77738 37.3621 6.23809 36.3037C5.625 35.1004 5.625 33.5253 5.625 30.375V14.625C5.625 11.4747 5.625 9.89956 6.23809 8.6963C6.77738 7.63789 7.63789 6.77738 8.6963 6.23809C9.89956 5.625 11.4747 5.625 14.625 5.625Z"
          stroke={props.stroke}
          strokeWidth="3.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCompact
