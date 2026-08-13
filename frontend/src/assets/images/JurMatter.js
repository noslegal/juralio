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

function JurMatter(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5,3 C3.89,3 3,3.89 3,5 L3,19 C3,20.11 3.89,21 5,21 L19,21 C20.11,21 21,20.11 21,19 L21,5 C21,3.89 20.11,3 19,3 L5,3 M5,5 L19,5 L19,19 L5,19 L5,5 M7,7 L7,11 L11,11 L11,7 L7,7 M7,13 L7,17 L11,17 L11,13 L7,13 M13,7 L13,11 L17,11 L17,7 L13,7 M13,13 L13,17 L17,17 L17,13 L13,13"></path>
    </SvgIcon>
  )
}

export default JurMatter
