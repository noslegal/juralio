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

package server

import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import java.nio.file.Paths

import java.nio.file.Files
import java.time.LocalDate


@Secured(['IS_AUTHENTICATED_FULLY'])
class ExportController {
    static allowedMethods = [exportMatter: "GET"]

    ExportService exportService

    String encoding = "UTF-8"
    String xlsxMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    def exportMatter() {
        OutputStream outs = response.outputStream
        try {
            response.status = HttpStatus.OK.value()
            response.setHeader "Content-disposition", "attachment; filename=${exportService.EXCEL_FILENAME}"
            response.contentType = "${xlsxMimeType};charset=${encoding}"
            exportService.exportMatter(outs, params.matter_id as long)
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST, text: "Failed to export matter"
        } finally {
            if (outs) {
                outs.flush()
                outs.close()
            }
        }
    }
}
