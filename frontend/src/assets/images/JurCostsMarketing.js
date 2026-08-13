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

function JurCostsMarketing(props) {
  return (
    <SvgIcon viewBox="0 0 62 42" style={{ scale: '2' }} {...props}>
      <svg
        width={49}
        height={49}
        viewBox="0 0 49 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M24.5 32.6667V42.875M36.75 42.875L28.6825 36.1521C27.1946 34.9122 26.4506 34.2922 25.6202 34.0553C24.888 33.8464 24.112 33.8464 23.3798 34.0553C22.5493 34.2922 21.8054 34.9122 20.3174 36.1521L12.25 42.875M16.3333 22.4583V24.5M24.5 18.375V24.5M32.6666 14.2917V24.5M44.9166 6.125H4.08331M6.12498 6.125H42.875V22.8667C42.875 26.297 42.875 28.0121 42.2074 29.3224C41.6202 30.4749 40.6832 31.4119 39.5307 31.9991C38.2205 32.6667 36.5053 32.6667 33.075 32.6667H15.925C12.4947 32.6667 10.7795 32.6667 9.46929 31.9991C8.3168 31.4119 7.37979 30.4749 6.79256 29.3224C6.12498 28.0121 6.12498 26.297 6.12498 22.8667V6.125Z"
          stroke="black"
          strokeWidth={4.08333}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCostsMarketing
