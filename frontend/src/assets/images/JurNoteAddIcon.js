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

function JurNoteAdd(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M9.34165389,20.0006859 L2,20 C0.8954305,20 0,19.1045695 0,18 L0,18 L0,2 C0,0.8954305 0.8954305,0 2,0 L2,0 L10,0 L16,6 L16.0008069,12.0830939 C15.6753441,12.0284458 15.340994,12 15,12 C14.6593547,12 14.3253396,12.0283876 14.0001915,12.0829263 L14,7 L9,7 L9,2 L2,2 L2,18 L9,18 L9,18 C9,18.7015272 9.1203964,19.3749342 9.34165389,20.0006859 Z M9,14 L9,16 L4,16 L4,14 L9,14 Z M12,10 L12,12 L4,12 L4,10 L12,10 Z"
        id="Combined-Shape"
      ></path>
      <polygon
        id="Path"
        points="19 17 19 19 16 19 16 22 14 22 14 19 11 19 11 17 14 17 14 14 16 14 16 17"
      ></polygon>
    </SvgIcon>
  )
}

export default JurNoteAdd
