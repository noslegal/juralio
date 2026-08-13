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

function ExpandIcon(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M11.883.846C18 .833 22.971 5.78 22.985 11.898s-4.934 11.089-11.051 11.103S.846 18.067.832 11.949 5.765.861 11.883.846"
          fill="#fff"
        />
        <path
          d="M11.883.846C18 .833 22.971 5.78 22.985 11.898s-4.934 11.089-11.051 11.103S.846 18.067.832 11.949 5.765.861 11.883.846"
          stroke="#98A2B3"
          strokeWidth={0.462}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m13.142 13.151 4.318 4.298m0 0-.009-3.692m.009 3.692-3.692.009m-3.092-6.762-4.32-4.299m0 0 .009 3.692m-.009-3.692 3.692-.009"
          stroke="#98A2B3"
          strokeWidth={1.231}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default ExpandIcon
