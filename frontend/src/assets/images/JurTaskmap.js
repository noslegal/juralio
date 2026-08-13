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

function JurTaskmap(props) {
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
          d="M12 12h10M12 2v20M7.333 2h9.333c1.867 0 2.8 0 3.513.363a3.33 3.33 0 0 1 1.456 1.457C22 4.533 22 5.467 22 7.333v9.333c0 1.867 0 2.8-.364 3.513a3.33 3.33 0 0 1-1.456 1.456c-.713.364-1.647.364-3.513.364H7.334c-1.867 0-2.8 0-3.513-.364a3.33 3.33 0 0 1-1.457-1.456C2 19.467 2 18.533 2 16.667V7.334c0-1.867 0-2.8.363-3.513A3.33 3.33 0 0 1 3.82 2.364C4.533 2 5.467 2 7.333 2"
          stroke={props.colour}
          strokeWidth="2.222"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurTaskmap
