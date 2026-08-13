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

function JurNote(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6,2 C4.8954305,2 4,2.8954305 4,4 L4,20 C4,21.1045695 4.8954305,22 6,22 L18,22 C19.1045695,22 20,21.1045695 20,20 L20,8 L14,2 L6,2 M6,4 L13,4 L13,9 L18,9 L18,20 L6,20 L6,4 M8,12 L8,14 L16,14 L16,12 L8,12 M8,16 L8,18 L13,18 L13,16 L8,16 Z"></path>
    </SvgIcon>
  )
}

export default JurNote
