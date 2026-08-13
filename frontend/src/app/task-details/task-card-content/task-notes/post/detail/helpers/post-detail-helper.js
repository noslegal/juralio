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

import { getDateDisplayString } from '../../../../../../../services/helpers/date-helper'

export const getRecentSavedDisplayString = (t, lastSavedDate) => {
  let now = new Date()
  let lastSave = new Date(lastSavedDate)

  let timeDifference = now.getTime() - lastSave.getTime()
  let secondsAgo = Math.round(timeDifference / 1000)

  if (secondsAgo < 60) {
    //under a minute
    return `${secondsAgo} ${t(
      secondsAgo === 1 ? 'postDetails.secAgo' : 'postDetails.secsAgo'
    )}`
  }
  let minsAgo = Math.round(secondsAgo / 60)
  if (minsAgo < 60) {
    //under an hour
    return `${minsAgo} ${t(
      minsAgo === 1 ? 'postDetails.minAgo' : 'postDetails.minsAgo'
    )}`
  }
  let hoursAgo = Math.round(minsAgo / 60)
  if (hoursAgo < 24) {
    // inlast 24hrs
    return `${hoursAgo} ${t(
      hoursAgo === 1 ? 'postDetails.hourAgo' : 'postDetails.hoursAgo'
    )}`
  }
  return getDateDisplayString(lastSavedDate, undefined, true)
}

export const getPostDate = props => {
  const { t, post } = props
  if (post.finalised && post.finalisedBy) {
    return t('postDetails.finalisedOnBy', {
      date: getDateDisplayString(post.lastUpdated, undefined, true),
      user: `${post.finalisedBy.firstname} ${post.finalisedBy.lastname}`,
    })
  }
  if (post.finalised) {
    return `${t('postDetails.finalisedOn')} ${getDateDisplayString(
      post.lastUpdated,
      undefined,
      true
    )}`
  }

  return post.lastUpdated !== post.dateCreated
    ? `${t('postDetails.lastSaved')} ${getRecentSavedDisplayString(
        t,
        post.lastUpdated
      )}`
    : `${t('postDetails.created')} ${getDateDisplayString(post.dateCreated)}`
}

export const getPostTitle = (t, postDetails) =>
  t('entity.post') + ' ' + postDetails?.referenceNumber?.replace('POST', '#')
