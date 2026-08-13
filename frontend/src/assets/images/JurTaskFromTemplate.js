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

function JurTaskFromTemplate(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.99414 17.8944V19.9999C0.887381 19.9998 0 19.0523 0 17.8944H1.99414ZM5.98242 17.8944V19.9999H3.98828V17.8944H5.98242ZM9.97168 17.8944V19.9999H7.97754V17.8944H9.97168ZM13.96 17.8944V19.9999H11.9658V17.8944H13.96ZM1.99414 13.6844V15.7899H0V13.6844H1.99414ZM10.7734 1.05261C10.4229 1.69214 10.1758 2.40211 10.0557 3.15808H5.98242V13.6844H15.9541V10.5262C16.6536 10.5262 17.3243 10.3978 17.9482 10.1649V13.6844C17.9481 14.8422 17.0509 15.7899 15.9541 15.7899H5.98242C4.87586 15.7897 3.98841 14.8421 3.98828 13.6844V3.15808C3.98828 2.00032 4.87578 1.05283 5.98242 1.05261H10.7734ZM1.99414 9.47351V11.579H0V9.47351H1.99414ZM1.99414 5.26355V7.36804H0V5.26355H1.99414Z"
          fill="black"
        />
        <rect x="14.9481" width="1.99427" height="8.42105" fill="black" />
        <rect
          width="2.10526"
          height="8.03277"
          transform="matrix(0.000778086 -1 1 0.00086711 11.9656 5.30194)"
          fill="black"
        />
      </svg>
    </SvgIcon>
  )
}

export default JurTaskFromTemplate
