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
export const sysadminUserCreationOrgSteps = (t, closeForever = () => {}) => [
  {
    selector: '[data-test=organisation]',
    content: (
      <p data-test="status-filter-tour-content" style={{ marginRight: '30px' }}>
        {t('tours.sysadminUserCreationOrg.body')}
        <p
          data-test="status-tour-close-forever"
          onClick={closeForever}
          style={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          {t('tours.common.dontShowAgain')}
        </p>
        <svg
          height="10.5"
          width="20"
          style={{
            position: 'absolute',
            top: '-10px',
            right: '225px',
            fill: 'rgb(0, 77, 109)',
          }}
        >
          <path d="M9 0 L0 10 18 10 Z" />
        </svg>
      </p>
    ),
    position: 'bottom',
    style: {
      backgroundColor: 'rgb(0, 77, 109)',
      color: 'rgba(255, 255, 255, 0.87)',
      fontFamily: 'Montserrat',
      width: '270px',
      padding: '0px',
      height: '108px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '16px',
      paddingLeft: '8px',
      zIndex: 10000,
    },
  },
]
