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

function JurTemplate(props) {
  return (
    <SvgIcon {...props}>
      <path
        d="M3,13 L5,13 L5,11 L3,11 L3,13 L3,13 Z M3,17 L5,17 L5,15 L3,15 L3,17 L3,17 Z M5,21 L5,19 L3,19 C3,20.1 3.89,21 5,21 L5,21 Z M3,9 L5,9 L5,7 L3,7 L3,9 L3,9 Z M15,21 L17,21 L17,19 L15,19 L15,21 L15,21 Z M19,3 L9,3 C7.89,3 7,3.9 7,5 L7,15 C7,16.1 7.89,17 9,17 L19,17 C20.1,17 21,16.1 21,15 L21,5 C21,3.9 20.1,3 19,3 L19,3 Z M19,15 L9,15 L9,5 L19,5 L19,15 L19,15 Z M11,21 L13,21 L13,19 L11,19 L11,21 L11,21 Z M7,21 L9,21 L9,19 L7,19 L7,21 L7,21 Z"
        id="path-1"
      ></path>
    </SvgIcon>
  )
}

export default JurTemplate
