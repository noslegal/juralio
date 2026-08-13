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

function JurStandard(props) {
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
          d="M5.625 22.875H39.375M14.625 6H30.375C33.5253 6 35.1004 6 36.3037 6.61309C37.3621 7.15238 38.2226 8.01289 38.7619 9.0713C39.375 10.2746 39.375 11.8497 39.375 15V30.75C39.375 33.9003 39.375 35.4754 38.7619 36.6787C38.2226 37.7371 37.3621 38.5976 36.3037 39.1369C35.1004 39.75 33.5253 39.75 30.375 39.75H14.625C11.4747 39.75 9.89956 39.75 8.6963 39.1369C7.63789 38.5976 6.77738 37.7371 6.23809 36.6787C5.625 35.4754 5.625 33.9003 5.625 30.75V15C5.625 11.8497 5.625 10.2746 6.23809 9.0713C6.77738 8.01289 7.63789 7.15238 8.6963 6.61309C9.89956 6 11.4747 6 14.625 6Z"
          stroke={props.stroke}
          strokeWidth="3.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurStandard
