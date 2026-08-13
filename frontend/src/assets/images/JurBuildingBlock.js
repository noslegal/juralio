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

function JurBuildingBlock(props) {
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
          d="M12 12h11.077M12 0.923v22.154M6.831 0.923h10.338c2.068 0 3.102 0 3.892 0.402a3.692 3.692 0 0 1 1.614 1.614C23.077 3.729 23.077 4.763 23.077 6.831v10.338c0 2.068 0 3.102 -0.402 3.892a3.692 3.692 0 0 1 -1.614 1.614C20.271 23.077 19.237 23.077 17.169 23.077H6.831c-2.068 0 -3.102 0 -3.892 -0.402a3.692 3.692 0 0 1 -1.614 -1.614C0.923 20.271 0.923 19.237 0.923 17.169V6.831c0 -2.068 0 -3.102 0.402 -3.892a3.692 3.692 0 0 1 1.614 -1.614C3.729 0.923 4.763 0.923 6.831 0.923Z"
          stroke={props.colour}
          strokeWidth="1.8461538461538463"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurBuildingBlock
