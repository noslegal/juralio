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

function OverviewTimelineIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M0 0H9V12H0V0Z" />
      <path d="M11 0H20V5H11V0Z" />
      <path d="M11 7H20V12H11V7Z" />
      <path d="M0 14H9V20H0V14Z" />
    </SvgIcon>
  )
}

export default OverviewTimelineIcon
