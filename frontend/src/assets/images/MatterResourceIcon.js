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

const MatterResourceIcon = props => {
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
        d="M70.8333 39.5835V25.4168C70.8333 23.0833 70.8333 21.9165 70.3792 21.0252C69.9797 20.2412 69.3423 19.6038 68.5583 19.2043C67.667 18.7502 66.5002 18.7502 64.1667 18.7502L12.5 18.7502M54.1667 60.4168V74.5835C54.1667 76.917 54.1667 78.0838 53.7125 78.9751C53.3131 79.7591 52.6756 80.3965 51.8916 80.796C51.0003 81.2502 49.8336 81.2502 47.5 81.2502H12.5M12.5 8.3335L12.5 91.6668M12.5 60.4168L80.8333 60.4168C83.1669 60.4168 84.3337 60.4168 85.225 59.9627C86.009 59.5632 86.6464 58.9258 87.0459 58.1418C87.5 57.2505 87.5 56.0837 87.5 53.7502V46.2502C87.5 43.9166 87.5 42.7498 87.0459 41.8585C86.6464 41.0745 86.009 40.4371 85.225 40.0376C84.3337 39.5835 83.1669 39.5835 80.8333 39.5835L12.5 39.5835L12.5 60.4168Z"
        stroke={props.strokeColour}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MatterResourceIcon
