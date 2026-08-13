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

import i18n from 'i18next'
import React from 'react'
import { NOTE_TYPES } from '../../../../app/constants'
import StylisedP from '../components/StylisedP.jsx'

export const postBodyGenerator = post => {
  const t = i18n.t
  if (post.type === NOTE_TYPES.MEETING || post.type === null) {
    return (
      <div
        data-test="post-description"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />
    )
  }
  const isSpecialLink = ['Google', NOTE_TYPES.MIRO, NOTE_TYPES.FIGMA].some(e =>
    post.type.includes(e)
  )
  if (isSpecialLink) {
    return (
      <StylisedP>
        {t('exports.reportDownload.post.iframe', { url: post.url })}
      </StylisedP>
    )
  }
  if (post.description != null && post.description.length > 0) {
    return (
      <div
        data-test="post-description"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />
    )
  }
  return (
    <div>
      <StylisedP>
        {t('exports.reportDownload.post.noDescription', { url: post.url })}
      </StylisedP>
    </div>
  )
}
