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

package com.juralio.noticeboard.dao


import com.juralio.noticeboard.Notice
import grails.gorm.transactions.Transactional

@Transactional
class NoticeDAOService {

    def noticeClazz = Notice.class

    Notice getNotice(long id) {
        return Notice.get(id)
    }

    def deleteNotice(long id) {
        Notice notice = Notice.get(id)
        notice.delete()
    }

    List<Notice> list() {
        return Notice.list([sort: 'id', order: 'desc', max: 12])
    }

    Notice save(Notice notice) {
        if (notice.validate()) {
            notice.save()
        }
        return notice
    }

    List<Notice> findAllFeatured() {
        return noticeClazz.findAllByFeatured(true)
    }

    List<Notice> findAllNotices() {
        return noticeClazz.findAll()
    }
}
