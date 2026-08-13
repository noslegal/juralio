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

const EMU_PER_PX = 9525

const sniffExtension = base64 => {
  if (base64.startsWith('iVBOR')) return 'png'
  if (base64.startsWith('/9j/')) return 'jpeg'
  if (base64.startsWith('R0lGOD')) return 'gif'
  return 'png'
}

const parseImageData = data => {
  const dataUri = /^data:image\/(\w+);base64,(.*)$/s.exec(data)
  if (dataUri) {
    const extension = dataUri[1] === 'jpg' ? 'jpeg' : dataUri[1]
    return { base64: dataUri[2], extension }
  }
  return { base64: data, extension: sniffExtension(data) }
}

// Places a base64 image using the legacy position shape:
//   { x, y, w, h }        px offsets from the sheet origin
//   { r, c, x, y, w, h }  px offsets from a cell (0-based r/c; may be negative)
export const addImage = (ws, pos, data) => {
  const { base64, extension } = parseImageData(data)
  const imageId = ws.workbook.addImage({ base64, extension })
  ws.addImage(imageId, {
    tl: {
      nativeCol: pos.c || 0,
      nativeColOff: (pos.x || 0) * EMU_PER_PX,
      nativeRow: pos.r || 0,
      nativeRowOff: (pos.y || 0) * EMU_PER_PX,
    },
    ext: { width: pos.w, height: pos.h },
    editAs: 'oneCell',
  })
}
