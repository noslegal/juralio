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

function JurDetailed(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="45"
        height="46"
        viewBox="0 0 45 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32.8125 21.25H23.4375M32.8125 28.75H23.4375M32.8125 13.75H23.4375M16.875 6.25L16.875 40M14.625 6.25H30.375C33.5253 6.25 35.1004 6.25 36.3037 6.86309C37.3621 7.40238 38.2226 8.26289 38.7619 9.3213C39.375 10.5246 39.375 12.0997 39.375 15.25V31C39.375 34.1503 39.375 35.7254 38.7619 36.9287C38.2226 37.9871 37.3621 38.8476 36.3037 39.3869C35.1004 40 33.5253 40 30.375 40H14.625C11.4747 40 9.89956 40 8.6963 39.3869C7.63789 38.8476 6.77738 37.9871 6.23809 36.9287C5.625 35.7254 5.625 34.1503 5.625 31V15.25C5.625 12.0997 5.625 10.5246 6.23809 9.3213C6.77738 8.26289 7.63789 7.40238 8.6963 6.86309C9.89956 6.25 11.4747 6.25 14.625 6.25Z"
          stroke={props.stroke}
          strokeWidth="3.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurDetailed
