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

import com.juralio.aws.S3Service
import com.juralio.common.ValidatedParameterMap
import com.juralio.noticeboard.dao.NoticeDAOService
import grails.gorm.transactions.Transactional
import org.springframework.web.multipart.MultipartFile

@Transactional
class NoticeService {

    S3Service s3Service
    NoticeDAOService noticeDAOService

    Notice saveNotice(ValidatedParameterMap validatedBody, MultipartFile multipartFile) {
        def key = "juralio/noticeboard"

        String fileName = multipartFile.getOriginalFilename()
        String[] fileNameAndExt = fileName.split("\\.")
        if (fileNameAndExt.size() != 2) {
            throw new Exception("File does not have extension")
        }
        String uniqueFileName = fileNameAndExt[0] + UUID.randomUUID() + "." + fileNameAndExt[1]

        Notice notice = new Notice()
        notice.imageKey = key
        notice.imageName = uniqueFileName
        notice.title = validatedBody.get("title")
        notice.subtitle = validatedBody.get("subtitle")
        notice.liveStart = new Date()
        notice.liveEnd = new Date()
        notice.weight = 1
        noticeDAOService.save(notice)

        s3Service.uploadFile(multipartFile, key, notice.imageName)

        return notice
    }

    def listNoticeMeta() {
        return noticeDAOService.list()
    }

    def getNoticeMeta(long id) {
        return noticeDAOService.getNotice(id)
    }

    def getNoticeById(long id) {
        Notice notice = noticeDAOService.getNotice(id)
        def key = "juralio/noticeboard/" + notice.imageName
        return s3Service.getFile(key)
    }

    def deleteNoticeById(long id) {
        Notice notice = noticeDAOService.getNotice(id)
        def key = "juralio/noticeboard/" + notice.imageName
        s3Service.deleteFileByPath(key)
        noticeDAOService.deleteNotice(id)
    }

    def featureNotice(long id) {
        // if notice is already featured, unfeature it
        Notice notice = noticeDAOService.getNotice(id)
        if (notice.featured) {
            notice.featured = false
            noticeDAOService.save(notice)
            return
        }

        // unfeature all notices
        List<Notice> featured = noticeDAOService.findAllFeatured()
        featured.each { n ->
            n.featured = false
            noticeDAOService.save(n)
        }
        // feature this notice
        notice.featured = true
        noticeDAOService.save(notice)
    }

    def getNoticeId() {
        List<Notice> featured = noticeDAOService.findAllFeatured()
        if (featured.isEmpty()) {
            List<Notice> notices = noticeDAOService.findAllNotices()
            Random rand = new Random()
            int randomIndex = rand.nextInt(notices.size())
            return notices.get(randomIndex).id
        } else {
            return featured.get(0).id
        }
    }
}
