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

package com.juralio.noticeboard

import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.web.multipart.MultipartFile

@Secured(['IS_AUTHENTICATED_FULLY'])
class NoticeboardController {
    static allowedMethods = [addNotice    : "POST", getNotice: "GET", getNoticeById: "GET", deleteNoticeById: "DELETE",
                             getNoticeMeta: "GET", listNoticeMeta: "GET", featureNotice: "POST"]

    NoticeService noticeService

    @Secured("hasRole('ROLE_SYSADMIN')")
    def addNotice() {
        try {
            // set title and subtitle
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(params, ['title', 'subtitle'], [])

            MultipartFile multipartFile = request.getFile('file')
            if (!multipartFile || multipartFile.empty) {
                throw new Exception()
            }
            Notice notice = noticeService.saveNotice(validatedBody, multipartFile)
            respond([id: notice.id], status: HttpStatus.OK)
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def listNoticeMeta() {
        try {
            respond noticeService.listNoticeMeta()
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def getNoticeMeta() {
        try {
            Notice notice = noticeService.getNoticeMeta(params.notice_id as long)
            respond notice, [status: HttpStatus.OK, view: '/noticeboard/_notice']
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def getNoticeById() {
        try {
            File file = noticeService.getNoticeById(params.notice_id as long)
            response.setContentType("image/svg+xml")
            response.setContentLength(file.size().toInteger())
            OutputStream out = response.getOutputStream()
            out.write(file.bytes)
            out.close()
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def deleteNoticeById() {
        try {
            noticeService.deleteNoticeById(params.notice_id as long)
            render status: HttpStatus.OK
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def featureNotice() {
        try {
            noticeService.featureNotice(params.notice_id as long)
            render status: HttpStatus.OK
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def getNotice() {
        try {
            render(status: HttpStatus.OK, text: noticeService.getNoticeId())
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
