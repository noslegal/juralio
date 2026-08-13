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

import {
  ATLASSIAN_URL,
  GOOGLE_URLS,
  MICROSOFT_URL,
  MIRO_URL,
  NOTE_TYPES,
} from '../app/constants'

export const getPostCountAndLabelText = (t, postCount = 0) => {
  if (!postCount) {
    // Cover count being null.
    postCount = 0
  }
  return (
    postCount + ' ' + (postCount !== 1 ? t('common.posts') : t('common.post'))
  )
}

export const POST = 'Post'

export const isMicrosoftUrl = postUrl => {
  return MICROSOFT_URL.test(postUrl)
}

export const isMiroUrl = postUrl => {
  if (postUrl.includes(MIRO_URL.EMBED)) return true
  if (postUrl.includes(MIRO_URL.BOARD)) return true
  return false
}

export const isFigmaUrl = postUrl =>
  /https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.test(
    postUrl
  )

export const isAtlassianUrl = postUrl => postUrl.includes(ATLASSIAN_URL)

export const isGDriveUrl = postUrl => {
  if (postUrl.includes(GOOGLE_URLS.DOCUMENT)) return true
  if (postUrl.includes(GOOGLE_URLS.SLIDES)) return true
  if (postUrl.includes(GOOGLE_URLS.SHEET)) return true
  if (postUrl.includes(GOOGLE_URLS.GENERIC)) return true
  return false
}

export const getGoogleNoteType = postUrl => {
  if (postUrl.includes(GOOGLE_URLS.SHEET)) return NOTE_TYPES.GOOGLE_SHEET
  if (postUrl.includes(GOOGLE_URLS.DOCUMENT)) return NOTE_TYPES.GOOGLE_DOC
  if (postUrl.includes(GOOGLE_URLS.SLIDES)) return NOTE_TYPES.GOOGLE_SLIDES
  if (postUrl.includes(GOOGLE_URLS.GENERIC)) return NOTE_TYPES.GOOGLE_FILE
  return NOTE_TYPES.WEB
}

export const getMiscrosoftNoteType = postUrl => {
  if (postUrl.includes('/:w:') || postUrl.includes('.doc'))
    return NOTE_TYPES.MS_WORD
  if (postUrl.includes('/:p:') || postUrl.includes('.ppt'))
    return NOTE_TYPES.MS_POWERPOINT
  if (postUrl.includes('/:x:') || postUrl.includes('.xls'))
    return NOTE_TYPES.MS_EXCEL
  if (postUrl.includes('/:u:') || postUrl.includes('.vsd'))
    return NOTE_TYPES.MS_VISIO
  if (postUrl.includes('/:b:')) return NOTE_TYPES.MS_ONEDRIVE
  if (postUrl.includes('/:o:')) return NOTE_TYPES.MS_ONENOTE

  return NOTE_TYPES.WEB
}

export const getPostType = (url, postType) => {
  if (isGDriveUrl(url)) {
    return getGoogleNoteType(url)
  } else if (isMicrosoftUrl(url)) {
    return getMiscrosoftNoteType(url)
  } else if (isMiroUrl(url)) {
    return NOTE_TYPES.MIRO
  } else if (isFigmaUrl(url)) {
    return NOTE_TYPES.FIGMA
  } else if (isAtlassianUrl(url)) {
    return NOTE_TYPES.ATLASSIAN
  } else if (postType === POST) {
    return null
  } else {
    return postType
  }
}

export const formatMicrosoftEmbedUrl = url => {
  let msUrl = new URL(url)
  let urlParams = msUrl.searchParams
  urlParams.set('action', 'embedview')

  return msUrl.toString()
}
