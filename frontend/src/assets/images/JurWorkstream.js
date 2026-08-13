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

function JurWorkstream(props) {
  return (
    <SvgIcon {...props}>
      <path d="M19,3 C20.0595455,3 20.9186364,3.81092975 20.9945464,4.85006292 L21,5 L21,19 C21,20.0595455 20.1890702,20.9186364 19.1499371,20.9945464 L19,21 L5,21 C3.94045455,21 3.08136364,20.1890702 3.00545361,19.1499371 L3,19 L3,5 C3,3.94045455 3.81092975,3.08136364 4.85006292,3.00545361 L5,3 L19,3 Z M19,5 L5,5 L5,19 L19,19 L19,5 Z M11,13 L11,17 L7,17 L7,13 L11,13 Z M11,7 L11,11 L7,11 L7,7 L11,7 Z"></path>
    </SvgIcon>
  )
}

export default JurWorkstream
