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

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import Noticeboard from './Noticeboard.js'
import {
  addNotice,
  listNotices,
  getNoticeByIdStoreInList,
  featureNotice,
  deleteNotice,
} from './noticeboard-actions'
import { MAX_FIELD_LENGTHS, MEGA_BYTE } from '../../app/constants'

const CHAR_LIMIT = MAX_FIELD_LENGTHS.NOTICE

const NoticeboardContainer = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const noticesMeta = useSelector(state => state.noticeboard.meta)
  const notices = useSelector(state => state.noticeboard.notices)
  const [svg, setSvg] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [helperText, setHelperText] = useState('')

  useEffect(() => {
    _listNotices()
  }, [t]) // eslint-disable-line

  useEffect(() => {
    if (noticesMeta) {
      noticesMeta.forEach(noticeMeta =>
        dispatch(getNoticeByIdStoreInList(noticeMeta.id))
      )
    }
  }, [noticesMeta]) // eslint-disable-line

  const validateForm = text => {
    if (text.length > CHAR_LIMIT) setHelperText(t('noticeboard.formHelperText'))
    else setHelperText('')
  }

  const submitDisabled = () => {
    return (
      svg === '' || title === '' || subtitle === '' || helperText.length > 0
    )
  }

  const initLocalState = () => {
    setSvg('')
    setTitle('')
    setSubtitle('')
    setHelperText('')
  }

  const onSvgChange = event => {
    if (event.target.files[0].size > MEGA_BYTE) {
      setHelperText(t('noticeboard.fileTooBig'))
      return
    }
    setSvg(event.target.files[0])
  }

  const onTitleChange = event => {
    setTitle(event.target.value)
    validateForm(event.target.value)
  }

  const onSubtitleChange = event => {
    setSubtitle(event.target.value)
    validateForm(event.target.value)
  }

  const uploadNotice = e => {
    e.preventDefault()
    dispatch(addNotice(svg, title, subtitle))
    initLocalState()
  }

  const _featureNotice = id => {
    dispatch(featureNotice(id))
  }

  const _deleteNotice = id => {
    dispatch(deleteNotice(id))
  }

  const _listNotices = () => dispatch(listNotices())

  return (
    <Noticeboard
      svg={svg}
      setSvg={setSvg}
      title={title}
      setTitle={setTitle}
      subtitle={subtitle}
      setSubtitle={setSubtitle}
      helperText={helperText}
      setHelperText={setHelperText}
      onSvgChange={onSvgChange}
      onTitleChange={onTitleChange}
      onSubtitleChange={onSubtitleChange}
      submitDisabled={submitDisabled}
      uploadNotice={uploadNotice}
      listNotices={_listNotices}
      noticesMeta={noticesMeta}
      notices={notices}
      featureNotice={_featureNotice}
      deleteNotice={_deleteNotice}
    />
  )
}

export default NoticeboardContainer
