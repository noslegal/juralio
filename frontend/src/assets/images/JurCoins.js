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
import juralioColours from '../../theme/juralio-colours'

function JurCoins(props) {
  const customColour = props.customColour
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="23.631"
        viewBox="0 0 24 23.631"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.032 4.923c0 1.088 -2.424 1.969 -5.415 1.969S2.201 6.011 2.201 4.923m10.831 0C13.032 3.836 10.608 2.954 7.617 2.954S2.201 3.836 2.201 4.923m10.831 0V9.312c-1.203 0.361 -1.969 0.908 -1.969 1.519m-8.862 -5.908v11.815c0 1.088 2.424 1.969 5.416 1.969 1.309 0 2.51 -0.169 3.446 -0.45V10.831M2.201 8.862c0 1.087 2.424 1.969 5.416 1.969 1.309 0 2.51 -0.169 3.446 -0.45m-8.862 2.42c0 1.087 2.424 1.969 5.416 1.969 1.309 0 2.51 -0.169 3.446 -0.45m10.831 -3.488c0 1.088 -2.424 1.969 -5.415 1.969s-5.416 -0.882 -5.416 -1.969m10.831 0C21.894 9.743 19.47 8.862 16.479 8.862s-5.416 0.882 -5.416 1.969m10.831 0v7.877C21.894 19.795 19.47 20.677 16.479 20.677s-5.416 -0.882 -5.416 -1.969V10.831M21.894 14.769c0 1.088 -2.424 1.969 -5.415 1.969S11.063 15.857 11.063 14.769"
          stroke={customColour ? customColour : juralioColours.darkText.primary}
          strokeWidth="1.136123076923077"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurCoins
