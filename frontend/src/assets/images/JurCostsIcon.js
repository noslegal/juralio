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

function JurCosts(props) {
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
          d="M12 17a5 5 0 1 0 10 0 5 5 0 0 0 -10 0Zm0 0c0 -1.126 0.372 -2.165 1 -3.001v-9m-1 12c0 0.826 0.2 1.605 0.554 2.29 -0.843 0.712 -2.788 1.21 -5.055 1.21 -3.037 0 -5.5 -0.895 -5.5 -1.999v-13.5m11 0c0 1.104 -2.462 1.999 -5.5 1.999 -3.037 0 -5.5 -0.895 -5.5 -1.999m11 0C13 3.896 10.538 3 7.5 3 4.463 3 2 3.896 2 5m0 9c0 1.104 2.462 1.999 5.5 1.999 2.189 0 4.079 -0.465 4.965 -1.138m0.535 -5.363c0 1.105 -2.462 2 -5.5 2 -3.037 0 -5.5 -0.895 -5.5 -1.999"
          stroke={props.colour}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCosts
