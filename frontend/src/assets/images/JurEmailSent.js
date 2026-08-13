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
import image from './email-sent.svg'
function GoogleLogin(props) {
  return (
    <img
      src={image}
      alt="Email sent"
      data-test="email-sent-image"
      style={{
        width: '100px',
        marginBottom: '32px',
        marginTop: '32px',
      }}
    />
  )
}

export default GoogleLogin
