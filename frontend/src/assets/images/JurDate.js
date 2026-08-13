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

function JurDate(props) {
  return (
    <SvgIcon {...props}>
      <path d="M19,20 L5,20 L5,9 L19,9 M16,2 L16,4 L8,4 L8,2 L6,2 L6,4 L5,4 C3.89,4 3,4.89 3,6 L3,20 C3,21.1045695 3.8954305,22 5,22 L19,22 C20.1045695,22 21,21.1045695 21,20 L21,6 C21,4.89 20.1,4 19,4 L18,4 L18,2"></path>
    </SvgIcon>
  )
}

export default JurDate
