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

function JurMilestone(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M9.29118 1.64816L1.64818 9.29116C0.704414 10.2349 0.704414 11.7651 1.64818 12.7088L9.29118 20.3518C10.2349 21.2956 11.7651 21.2956 12.7089 20.3518L20.3519 12.7088C21.2956 11.7651 21.2956 10.2349 20.3519 9.29116L12.7089 1.64816C11.7651 0.704393 10.2349 0.704392 9.29118 1.64816Z"
        fill=""
        stroke="rgb(100, 100, 100)"
        strokeWidth="1.5"
      />
      <path
        d="M9.82141 6.90906L6.90117 9.8293C6.25029 10.4802 6.25029 11.5355 6.90117 12.1863L9.82141 15.1066C10.4723 15.7574 11.5276 15.7574 12.1784 15.1066L15.0987 12.1863C15.7496 11.5354 15.7496 10.4802 15.0987 9.8293L12.1784 6.90906C11.5276 6.25818 10.4723 6.25818 9.82141 6.90906Z"
        fill="white"
      />
    </SvgIcon>
  )
}

export default JurMilestone
