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

import api, { svgApi } from '../helpers/fetch/fetch-helper'

export default {
  getNoticeId() {
    return api('noticeboard/notice')
  },
  addNotice(svg, title, subtitle) {
    const formData = new FormData()
    formData.append('file', svg)
    formData.append('title', title)
    formData.append('subtitle', subtitle)

    return svgApi('noticeboard/notice', 'POST', formData)
  },
  listNoticesMeta() {
    return api('noticeboard/meta')
  },
  getNoticeById(id) {
    return svgApi('noticeboard/notice/' + id)
  },
  getNoticeMetaById(id) {
    return api('noticeboard/notice/' + id + '/meta')
  },
  deleteNotice(id) {
    return api('noticeboard/notice/' + id, 'DELETE')
  },
  featureNotice(id) {
    return api('noticeboard/notice/' + id + '/feature', 'POST')
  },
}
