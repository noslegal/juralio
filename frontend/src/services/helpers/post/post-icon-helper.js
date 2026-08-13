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

import { SvgIcon, Tooltip } from '@mui/material'
import React from 'react'
import { NOTE_TYPES } from '../../../app/constants'
import atlassianLogo from '../../../assets/images/atlassian-icon-blue.svg'
import figmaLogo from '../../../assets/images/Figma-Icon.svg'
import { NoteIcon } from '../../../theme/navigation/CommonIcons'
import { getImageHelper } from '../../favicon/favicon-service'
import { linkTypeList } from './post-link-type-list'

export const getPostTypeIcon = (t, post, size = { width: 32, height: 32 }) => {
  const linkType = linkTypeList.find(icon => icon.label === post.type)

  if (linkType) {
    if (
      linkType.dataTest === 'atlassian' ||
      linkType.dataTest === 'figma-file'
    ) {
      return (
        <Tooltip title={linkType.label} placement="left">
          <img
            style={{ height: '16px', 'margin-left': '6px' }}
            src={linkType.dataTest === 'atlassian' ? atlassianLogo : figmaLogo}
            alt={t('notificationIcon.notificationIconAlt')}
            data-test={
              linkType.dataTest === 'atlassian' ? 'atlassian' : 'figma-file'
            }
          />
        </Tooltip>
      )
    }
    if (
      post.url &&
      linkType.dataTest !== 'word' &&
      linkType.dataTest !== 'excel' &&
      linkType.dataTest !== 'powerpoint'
    ) {
      let fallback =
        post.type === NOTE_TYPES.DOCUMENT ? 'document_link.svg' : 'web_link.svg'
      if (linkType.iconUrl) {
        fallback = linkType.iconUrl
      }
      return (
        <Tooltip title={linkType.label} placement="left">
          <img
            src={getImageHelper(post.url, fallback)}
            alt={t('notificationIcon.notificationIconAlt')}
            style={size}
            data-test="web-icon"
          />
        </Tooltip>
      )
    }
    return (
      <Tooltip title={linkType.label} placement="left">
        <SvgIcon data-test={linkType.dataTest}>
          <path
            d={linkType.iconPath}
            style={{ transform: linkType.transform }}
          />
        </SvgIcon>
      </Tooltip>
    )
  }
  return (
    <Tooltip title={t('entity.note')} placement="left">
      <NoteIcon />
    </Tooltip>
  )
}
