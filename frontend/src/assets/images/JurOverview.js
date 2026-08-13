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

function JurOverview(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 9H17.5M6.5 3H13.5C14.9001 3 15.6002 3 16.135 3.32698C16.6054 3.6146 16.9878 4.07354 17.2275 4.63803C17.5 5.27976 17.5 6.11984 17.5 7.8V16.2C17.5 17.8802 17.5 18.7202 17.2275 19.362C16.9878 19.9265 16.6054 20.3854 16.135 20.673C15.6002 21 14.9001 21 13.5 21H6.5C5.09987 21 4.3998 21 3.86502 20.673C3.39462 20.3854 3.01217 19.9265 2.77248 19.362C2.5 18.7202 2.5 17.8802 2.5 16.2V7.8C2.5 6.11984 2.5 5.27976 2.77248 4.63803C3.01217 4.07354 3.39462 3.6146 3.86502 3.32698C4.3998 3 5.09987 3 6.5 3Z"
          stroke={props.colour}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurOverview
