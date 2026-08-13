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

function JurTaskMultiple(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7,1 C5.89,1 5,1.89 5,3 L5,17 C5,18.11 5.89,19 7,19 L21,19 C22.11,19 23,18.11 23,17 L23,3 C23,1.89 22.11,1 21,1 L7,1 M3,5 L3,21 L21,21 L21,23 L3,23 C1.8954305,23 1,22.1045695 1,21 L1,5 L3,5 M7,3 L21,3 L21,17 L7,17 L7,3 M9,5 L9,9 L13,9 L13,5 L9,5"></path>
    </SvgIcon>
  )
}

export default JurTaskMultiple
