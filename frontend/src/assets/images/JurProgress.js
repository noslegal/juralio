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

function JurProgress(props) {
  return (
    <SvgIcon {...props} width="17" height="18" viewBox="0 0 17 18">
      <g clipPath="url(#clip0_759_27833)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.25 0C1.00736 0 0 1.00736 0 2.25V15.75C0 16.9926 1.00736 18 2.25 18H14.75C15.9926 18 17 16.9926 17 15.75V2.25C17 1.00736 15.9926 0 14.75 0H2.25ZM2.71875 3.82813H13.6875V6.26563H2.71875V3.82813ZM5.15625 8.09375H14.9063V10.5313H5.15625V8.09375ZM10.0313 12.3594H3.32813V14.7969H10.0313V12.3594Z"
          fill="#333232"
        />
      </g>
      <defs>
        <clipPath id="clip0_759_27833">
          <rect width="17" height="18" fill="white" />
        </clipPath>
      </defs>
    </SvgIcon>
  )
}

export default JurProgress
