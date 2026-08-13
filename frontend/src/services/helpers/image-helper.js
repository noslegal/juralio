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

import { VALID_IMAGE_TYPES } from '../../app/constants'

const MAX_LOGO_SIZE_BYTES = 200 * 1024

export const validateImageFile = (file, t) => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return t('sysAdmin.organisations.invalidFileType')
  }
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return t('sysAdmin.organisations.fileTooLarge')
  }
  return null
}

const resizeImageFile = (file, callback = () => {}, maxSize = 250) => {
  const reader = new FileReader()
  reader.onload = readerEvent => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      let width = image.width
      let height = image.height
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height
          height = maxSize
        }
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(image, 0, 0, width, height)
      const dataUrl = canvas.toDataURL(file.type)
      const resizedImageBlob = dataURItoBlob(dataUrl)
      const resizedImageFile = blobToFile(resizedImageBlob, file.name)
      //have to return the resized image as a callback due to the reader onload being asynchronous
      callback(resizedImageFile)
    }
    image.src = readerEvent.target.result
  }
  reader.readAsDataURL(file)
}

export const blobToFile = (blob, fileName) => {
  return new File([blob], fileName)
}

const dataURItoBlob = dataURI => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1])
  else byteString = unescape(dataURI.split(',')[1])
  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], { type: mimeString })
}

export default resizeImageFile
