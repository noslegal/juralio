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

import { addImage } from './images'

export const buildCustomerLogo = (ws, blob) => {
  const imageWidth = blob.width
  const imageHeight = blob.height
  const maxWidth = 124
  const scale = maxWidth / imageWidth
  // Slap on the logo
  addImage(
    ws,
    { x: 12, y: 12, w: imageWidth * scale, h: imageHeight * scale },
    blob.blob
  )
}
