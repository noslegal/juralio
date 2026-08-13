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

import React from 'react'
import { DATE_FORMAT_FULL, NOTE_TYPES } from '../../../../app/constants'
import {
  getDateDisplayString,
  getTimeDisplayString,
} from '../../../helpers/date-helper'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import StylisedP from '../components/StylisedP.jsx'

const genrateEditorAndViewerList = (t, post) => {
  if (!post.authors) {
    return
  }

  return (
    <StylisedP dataTest="title-post-authors-and-editors">
      {post.authors.map((author, i) => {
        return (
          <>
            <b data-test="title-post-author">
              {formatUserDisplayName(author.user)}
            </b>
            {i < post.authors.length - 2 ? ', ' : ''}
            {i === post.authors.length - 2 ? ' and ' : ''}
          </>
        )
      })}
      {post.authors.length > 1
        ? t('exports.reportDownload.post.areEditors')
        : t('exports.reportDownload.post.isEditor')}
    </StylisedP>
  )
}

const generateMeetingTime = (t, post) => {
  return (
    <StylisedP>
      <b data-test="title-meeting-times">
        {t('exports.reportDownload.post.meetingOn') +
          ' ' +
          getDateDisplayString(post.startTime) +
          t('exports.reportDownload.post.from') +
          getTimeDisplayString(post.startTime) +
          t('exports.reportDownload.post.to') +
          getTimeDisplayString(post.endTime)}
      </b>
    </StylisedP>
  )
}

const generateMeetingAttendeesList = (t, post) => {
  return (
    <StylisedP dataTest="title-meeting-attended-by">
      {t('exports.reportDownload.post.attendedBy')}
      {post.members.map((member, i) => {
        return (
          <>
            <b data-test="title-post-member">
              {formatUserDisplayName(member.user)}
            </b>
            {i < post.members.length - 2 ? ', ' : ''}
            {i === post.members.length - 2 ? ' and ' : ''}
          </>
        )
      })}
    </StylisedP>
  )
}

const generateMeetingNote = (t, post) => {
  return (
    <>
      {generateMeetingTime(t, post)}
      {post.members.length > 0 && generateMeetingAttendeesList(t, post)}
    </>
  )
}

const generateBasicNote = (t, post) => {
  return (
    <StylisedP>
      <b data-test="title-post-last-edited-or-finalised">
        {post.finalised
          ? t('exports.reportDownload.post.finalisedOn')
          : t('exports.reportDownload.post.noteLastEdited')}
        &nbsp;
        {getDateDisplayString(post.lastUpdated, DATE_FORMAT_FULL, true)}
      </b>
    </StylisedP>
  )
}

const getLinkText = post => {
  if (post.type === NOTE_TYPES.ATLASSIAN) {
    return 'Atlassian Link'
  }
  if (post.type === NOTE_TYPES.FIGMA) {
    return 'Figma Link'
  }
  if (post.type === NOTE_TYPES.MIRO) {
    return 'Miro Link'
  }
  if (post.type.includes('Google')) {
    return 'Google Link'
  }
  if (post.type === NOTE_TYPES.DOCUMENT) {
    return 'Document link'
  }
  return 'Link'
}

const generateLinkNote = (t, post) => {
  const link = (
    <a href={post.url} target="_blank" rel="noopener noreferrer">
      {post.url}
    </a>
  )
  return (
    <>
      <StylisedP>
        <b>
          {getLinkText(post)}: {link}
        </b>
      </StylisedP>
      <StylisedP>
        <b>
          {post.finalised
            ? t('exports.reportDownload.post.finalised')
            : t('exports.reportDownload.post.lastEdited')}
          &nbsp;
          {getDateDisplayString(post.lastUpdated, DATE_FORMAT_FULL, true)}
        </b>
      </StylisedP>
    </>
  )
}

const generatePostBody = (t, post) => {
  switch (post.type) {
    case null:
      return generateBasicNote(t, post)
    case NOTE_TYPES.MEETING:
      return generateMeetingNote(t, post)
    default:
      return generateLinkNote(t, post)
  }
}

export const titleGenerator = (t, post, task) => {
  return (
    <div>
      <StylisedP style={{ display: 'flex' }}>
        {t('exports.reportDownload.taskDetails.thisIsAJuralio')}&nbsp;
        <b data-test="title-post-type">
          {post.type === null ? 'post' : post.type}
        </b>
        &nbsp;{t('common.in')} &nbsp;
        <b data-test="title-task-name">{task.name}</b>,&nbsp;task number&nbsp;
        <b data-test="title-task-reference-number">#{task.referenceNumber}</b>
        &nbsp;within this matter
      </StylisedP>
      <StylisedP
        style={{ fontSize: '32px', fontWeight: '400' }}
        dataTest="title-post-name"
      >
        {post.name}
      </StylisedP>
      <StylisedP style={{ display: 'flex' }}>
        {post.isPrivate && (
          <span
            style={{
              backgroundColor: 'black',
              color: 'white',
            }}
            data-test="title-private-chip"
          >
            {t('common.Private')}
          </span>
        )}
        &nbsp;
        {!post.finalised && (
          <span
            style={{ backgroundColor: '#FFF2CC' }}
            data-test="title-draft-chip"
          >
            {t('common.Draft')}
          </span>
        )}
      </StylisedP>
      {genrateEditorAndViewerList(t, post)}
      {generatePostBody(t, post)}
    </div>
  )
}
