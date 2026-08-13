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

function ReduceIcon(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.01.846C18.129.833 23.099 5.78 23.114 11.898s-4.933 11.089-11.05 11.103C5.946 23.016.975 18.068.96 11.95S5.893.861 12.01.846"
          fill="#fff"
        />
        <path
          d="M12.01.846C18.129.833 23.099 5.78 23.114 11.898v0c.015 6.118-4.933 11.089-11.05 11.103v0C5.946 23.016.975 18.068.96 11.95v0C.945 5.832 5.893.861 12.01.846"
          stroke="#98A2B3"
          strokeWidth=".462"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m10.794 7.003.008 3.692m0 0-3.692.009m3.692-.009L6.485 6.397m6.794 10.446-.009-3.692m0 0 3.692-.008m-3.692.009 4.318 4.297"
          stroke="#98A2B3"
          strokeWidth="1.23"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default ReduceIcon
