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

import { ImageRun } from 'docx'
import { juralio_logo_with_text, postIconData } from './image-data'

const createImage = (imageBase64, w, h) =>
  new ImageRun({
    data: Buffer.from(imageBase64, 'base64'),
    transformation: {
      width: w,
      height: h,
    },
  })

export const getJuralioLogoImage = () =>
  createImage(juralio_logo_with_text, 124, 36)

export const postIcons = {
  getNoteIcon: () => createImage(postIconData.note_icon, 24, 26),
  getWordIcon: () => createImage(postIconData.word_icon, 24, 26),
  getExcelIcon: () => createImage(postIconData.excel_icon, 24, 26),
  getLinkIcon: () => createImage(postIconData.link_icon, 24, 26),
  getVideoIcon: () => createImage(postIconData.video_icon, 24, 26),
  getEmailIcon: () => createImage(postIconData.email_icon, 24, 26),
  getImageIcon: () => createImage(postIconData.image_icon, 24, 26),
  getPowerpointIcon: () => createImage(postIconData.powerpoint_icon, 24, 26),
}
