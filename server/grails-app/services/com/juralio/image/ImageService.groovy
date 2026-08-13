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

package com.juralio.image

import grails.gorm.transactions.Transactional
import org.springframework.web.multipart.MultipartFile

@Transactional
class ImageService {

    //https://gist.github.com/leommoore/f9e57ba2aa4bf197ebc5
    //Reference docs for the magic numbers

    static final int MAX_LOGO_SIZE_BYTES = 200 * 1024 // 200 KB

    /**
     * Validates the image and returns the MIME type derived from magic bytes, or null if invalid.
     */
    String validateImageAndGetMimeType(MultipartFile file) {
        if (file.size > MAX_LOGO_SIZE_BYTES) {
            return null
        }
        String origFileType = URLConnection.guessContentTypeFromName(file.filename)
        if (!['image/jpg', 'image/jpeg', 'image/png'].contains(origFileType)) {
            return null
        }
        if (origFileType == 'image/jpeg' || origFileType == 'image/jpg') {
            return checkJPEG(file) ? 'image/jpeg' : null
        }
        if (origFileType == 'image/png') {
            return checkPNG(file) ? 'image/png' : null
        }
        return null
    }

    def validateImage(MultipartFile file, List<String> acceptedContentTypes = ['image/jpg', 'image/jpeg', 'image/png']) {
        return validateImageAndGetMimeType(file) != null
    }

    private boolean checkJPEG(MultipartFile file) throws IOException {
        String fileName = file.filename.toUpperCase()
        boolean extension = fileName.endsWith(".JPG") || fileName.endsWith(".JPEG")
        if (!extension) {
            return false
        }
        InputStream ii = null
        try {
            ii = file.getInputStream()
            byte[] magic = new byte[3]
            int count = ii.read(magic)
            if (count < 3) return false
            return magic[0] == -1 && magic[1] == -40 && magic[2] == -1 //0xFF 0xD8 0xFF
        } finally {
            try {
                if (ii != null) ii.close()
            } catch (IOException ex) {
            }
        }
    }

    private boolean checkPNG(MultipartFile file) throws IOException {
        String fileName = file.filename.toUpperCase()
        boolean extension = fileName.endsWith(".PNG")
        if (!extension) {
            return false
        }
        InputStream ii = null
        try {
            ii = file.getInputStream()
            byte[] magic = new byte[8]
            int count = ii.read(magic)
            if (count < 8) return false
            // Full 8-byte PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
            return magic[0] == -119 && magic[1] == 80 && magic[2] == 78 &&
                   magic[3] == 71 && magic[4] == 13 && magic[5] == 10 &&
                   magic[6] == 26 && magic[7] == 10
        } finally {
            try {
                if (ii != null) ii.close()
            } catch (IOException ex) {
            }
        }
    }
}
