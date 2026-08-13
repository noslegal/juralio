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

function JurCreateTask(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.8334 11.6667V14.1667H18.3334V15.8334H15.8334V18.3334H14.1667V15.8334H11.6667V14.1667H14.1667V11.6667H15.8334ZM15 1.66669C15.883 1.66669 16.5989 2.34246 16.6621 3.20841L16.6667 3.33335L16.6673 10.2847C16.1458 10.1004 15.5846 10 15 10V3.33335H3.33335V15H10C10 15.5846 10.1004 16.1458 10.2847 16.6673L3.33335 16.6667C2.4504 16.6667 1.73449 15.9909 1.67123 15.125L1.66669 15V3.33335C1.66669 2.4504 2.34246 1.73449 3.20841 1.67123L3.33335 1.66669H15ZM8.33335 5.00002V8.33335H5.00002V5.00002H8.33335Z"
          fill="black"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCreateTask
