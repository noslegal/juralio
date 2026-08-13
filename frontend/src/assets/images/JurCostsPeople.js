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

function JurCostsPeople(props) {
  return (
    <SvgIcon viewBox="0 0 62 42" style={{ scale: '2' }} {...props}>
      <svg
        width={57}
        height={57}
        viewBox="0 0 57 57"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M52.25 49.875V45.125C52.25 40.6984 49.2224 36.9789 45.125 35.9243M36.8125 7.81555C40.294 9.22485 42.75 12.6381 42.75 16.625C42.75 20.6119 40.294 24.0252 36.8125 25.4344M40.375 49.875C40.375 45.4486 40.375 43.2353 39.6519 41.4895C38.6877 39.1617 36.8383 37.3123 34.5105 36.3481C32.7647 35.625 30.5514 35.625 26.125 35.625H19C14.5736 35.625 12.3603 35.625 10.6145 36.3481C8.28674 37.3123 6.43734 39.1617 5.47314 41.4895C4.75 43.2353 4.75 45.4486 4.75 49.875M32.0625 16.625C32.0625 21.8717 27.8092 26.125 22.5625 26.125C17.3158 26.125 13.0625 21.8717 13.0625 16.625C13.0625 11.3783 17.3158 7.125 22.5625 7.125C27.8092 7.125 32.0625 11.3783 32.0625 16.625Z"
          stroke="black"
          strokeWidth={4.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCostsPeople
