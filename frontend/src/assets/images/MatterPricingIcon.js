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

const MatterPricingIcon = props => {
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
        d="M33.3335 33.3335H33.3752M19.0116 12.2387L12.2387 19.0116C10.7975 20.4528 10.0768 21.1735 9.5615 22.0145C9.10459 22.7601 8.76789 23.5729 8.56375 24.4232C8.3335 25.3823 8.3335 26.4014 8.3335 28.4397L8.3335 40.3106C8.3335 42.3489 8.3335 43.368 8.56375 44.3271C8.76789 45.1774 9.10459 45.9903 9.56149 46.7359C10.0768 47.5768 10.7975 48.2975 12.2387 49.7387L44.1913 81.6913C49.1416 86.6415 51.6167 89.1167 54.4708 90.044C56.9813 90.8597 59.6856 90.8597 62.1962 90.044C65.0503 89.1167 67.5254 86.6415 72.4756 81.6913L81.6913 72.4756C86.6415 67.5254 89.1167 65.0503 90.044 62.1962C90.8597 59.6857 90.8597 56.9813 90.044 54.4708C89.1167 51.6167 86.6415 49.1416 81.6913 44.1913L49.7387 12.2387C48.2975 10.7975 47.5768 10.0768 46.7359 9.5615C45.9903 9.10459 45.1774 8.76789 44.3271 8.56375C43.368 8.3335 42.3489 8.3335 40.3106 8.3335L28.4397 8.3335C26.4014 8.3335 25.3823 8.3335 24.4232 8.56375C23.5729 8.76789 22.7601 9.10459 22.0145 9.56149C21.1735 10.0768 20.4529 10.7975 19.0116 12.2387ZM35.4168 33.3335C35.4168 34.4841 34.4841 35.4168 33.3335 35.4168C32.1829 35.4168 31.2502 34.4841 31.2502 33.3335C31.2502 32.1829 32.1829 31.2502 33.3335 31.2502C34.4841 31.2502 35.4168 32.1829 35.4168 33.3335Z"
        stroke={props.strokeColour}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default MatterPricingIcon
