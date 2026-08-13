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

import React from 'react'
import { useTranslation } from 'react-i18next'

const MatterRatesIcon = props => {
  const { t } = useTranslation()

  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M47.9167 45.8333C39.7807 45.8333 35.2193 45.8333 27.0833 45.8333M47.9167 62.5C39.7807 62.5 35.2193 62.5 27.0833 62.5M47.9167 29.1667C39.7807 29.1667 35.2193 29.1667 27.0833 29.1667M62.5 12.5L62.5 87.5M32.5 12.5L67.5 12.5C74.5007 12.5 78.001 12.5 80.6749 13.8624C83.0269 15.0608 84.9392 16.9731 86.1376 19.3251C87.5 21.999 87.5 25.4993 87.5 32.5V67.5C87.5 74.5007 87.5 78.001 86.1376 80.6749C84.9392 83.0269 83.0269 84.9392 80.6749 86.1376C78.001 87.5 74.5007 87.5 67.5 87.5H32.5C25.4993 87.5 21.999 87.5 19.3251 86.1376C16.9731 84.9392 15.0608 83.0269 13.8624 80.6749C12.5 78.001 12.5 74.5007 12.5 67.5L12.5 32.5C12.5 25.4993 12.5 21.999 13.8624 19.3251C15.0608 16.9731 16.9731 15.0608 19.3251 13.8624C21.999 12.5 25.4993 12.5 32.5 12.5Z"
        stroke={props.strokeColour}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MatterRatesIcon
