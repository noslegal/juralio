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
import { getDateDisplayString } from '../../../helpers/date-helper'
import { flatTaskListFromTree } from '../../../task/data-provider/task-list-data-provider'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import StylisedP from '../components/StylisedP.jsx'

const getSiblingTaskCount = siblings => {
  return siblings
    ? Math.max(siblings.filter(task => task.datesLinkedToSiblings).length, 0)
    : 0
}
const integerToWordLimitTen = int => {
  switch (int) {
    case 1:
      return 'one'
    case 2:
      return 'two'
    case 3:
      return 'three'
    case 4:
      return 'four'
    case 5:
      return 'five'
    case 6:
      return 'six'
    case 7:
      return 'seven'
    case 8:
      return 'eight'
    case 9:
      return 'nine'
    case 10:
      return 'ten'
    default:
      return int
  }
}

const getPeopleString = authors => {
  let returnString = []
  for (let i = 0; i < Math.min(2, authors.length); i++) {
    returnString.push(formatUserDisplayName(authors[i]))

    if (i === 0) {
      if (authors.length > 2) {
        returnString.push(', ')
      } else if (authors.length === 2) {
        returnString.push(' and ')
      }
    }
  }
  if (authors.length > 2) {
    returnString.push(` and ${integerToWordLimitTen(authors.length - 2)} more`)
  }

  return returnString.join('')
}

const getSuccinctPostType = post => {
  if (!post.type) {
    return 'Note'
  }
  if (post.type === NOTE_TYPES.ATLASSIAN) {
    return 'Atlassian'
  }
  if (post.type === NOTE_TYPES.FIGMA) {
    return 'Figma'
  }
  if (post.type === NOTE_TYPES.MIRO) {
    return 'Miro'
  }
  if (post.type === NOTE_TYPES.DOCUMENT) {
    return 'Document'
  }
  if (post.type === null) {
    return 'Note'
  }
  return post.type
}

const generatePostsTable = (t, task) => {
  return (
    <>
      <StylisedP>
        <b>
          {task.posts.length > 0 &&
            t('exports.reportDownload.taskDetails.postsTable.title', {
              count: integerToWordLimitTen(task.posts.length),
              s: task.posts.length !== 1 ? 's' : '',
            })}
        </b>
      </StylisedP>
      {task.posts.length > 0 && (
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ backgroundColor: '#efefef' }}>
                {t('exports.reportDownload.taskDetails.postsTable.type')}
              </td>
              <td style={{ backgroundColor: '#efefef' }}>
                {t('exports.reportDownload.taskDetails.postsTable.name')}
              </td>
              <td style={{ backgroundColor: '#efefef' }}>
                {t(
                  'exports.reportDownload.taskDetails.postsTable.finalisedOrLastEdited'
                )}
              </td>
              <td style={{ backgroundColor: '#efefef' }}>
                {t('exports.reportDownload.taskDetails.postsTable.people')}
              </td>
              <td style={{ backgroundColor: '#efefef' }}>
                {t('exports.reportDownload.taskDetails.postsTable.about')}
              </td>
            </tr>
            {task.posts.map(post => (
              <tr>
                <td>{getSuccinctPostType(post)}</td>
                <td>{post.name}</td>
                <td>
                  {getDateDisplayString(
                    post.lastUpdated,
                    DATE_FORMAT_FULL,
                    true
                  )}
                </td>
                <td>{getPeopleString(post.authors)}</td>
                <td>
                  {`${post.privatePost ? t('common.Private') : ''} ${
                    post.finalised ? '' : t('common.Draft')
                  }`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

const generateBoldList = (t, items) => {
  return items.map((item, i) => {
    return (
      <>
        <b>{item}</b>
        {i < items.length - 2 ? ', ' : ''}
        {i === items.length - 2 ? ` ${t('common.and')}  ` : ''}
      </>
    )
  })
}

const generateTaskDetailsContent = (t, task, workstream, includePosts) => {
  const flatTasks = flatTaskListFromTree(task)
  const flatTasksNoMilestones = flatTasks.filter(t => !t.isMilestone)
  const flatTasksNoDeliverables = flatTasks.filter(t => !t.isDeliverable)
  const subtasks = task.tasks.filter(t => !t.isMilestone)
  const indirectSubtasks = flatTasksNoMilestones - subtasks.length
  const milestoneCount = flatTasks.length - flatTasksNoMilestones.length
  const deliverableCount = flatTasks.length - flatTasksNoDeliverables.length
  const linkedSiblings = getSiblingTaskCount(workstream.tasks) - 1
  const subtaskString = t(
    'exports.reportDownload.taskDetails.additionalInformation.subtasks',
    {
      count: integerToWordLimitTen(subtasks.length),
      s: subtasks.length > 1 ? 's' : '',
    }
  )
  const indirectSubtaskString = t(
    'exports.reportDownload.taskDetails.additionalInformation.indirectSubtasks',
    {
      count: integerToWordLimitTen(indirectSubtasks),
      s: indirectSubtasks > 1 ? 's' : '',
    }
  )

  const milestoneString = t(
    'exports.reportDownload.taskDetails.additionalInformation.milestones',
    {
      count: integerToWordLimitTen(milestoneCount),
      s: milestoneCount.length > 1 ? 's' : '',
    }
  )

  const deliverableString = t(
    'exports.reportDownload.taskDetails.additionalInformation.deliverables',
    {
      count: integerToWordLimitTen(deliverableCount),
      s: deliverableCount.length > 1 ? 's' : '',
    }
  )

  const linkedSiblingsString = t(
    'exports.reportDownload.taskDetails.additionalInformation.linkedSiblings',
    {
      count: integerToWordLimitTen(linkedSiblings),
      s: linkedSiblings > 1 ? 's ' : ' ',
    }
  )
  return (
    <>
      <StylisedP>This task:</StylisedP>
      <ul>
        {includePosts && task.posts.length === 0 && (
          <li>
            {t(
              'exports.reportDownload.taskDetails.additionalInformation.noPosts'
            )}
          </li>
        )}
        {subtasks.length > 0 && (
          <li>
            {subtaskString}
            {generateBoldList(
              t,
              subtasks.map(s => s.name)
            )}
          </li>
        )}
        {subtasks.length === 0 && (
          <li>
            {t(
              'exports.reportDownload.taskDetails.additionalInformation.noDirectSubtasks'
            )}
          </li>
        )}
        {indirectSubtasks > 0 && <li>{indirectSubtaskString}</li>}
        {milestoneCount > 0 && (
          <li>
            {milestoneString + ' '}
            &nbsp;
            {generateBoldList(
              t,
              subtasks.filter(x => x.isMilestone).map(s => s.name)
            )}
          </li>
        )}
        {milestoneCount === 0 && (
          <li>
            {t(
              'exports.reportDownload.taskDetails.additionalInformation.noMilestones'
            )}
          </li>
        )}

        {deliverableCount > 0 && (
          <li>
            {deliverableString + ' '}
            &nbsp;
            {generateBoldList(
              t,
              subtasks.filter(x => x.isDeliverable).map(s => s.name)
            )}
          </li>
        )}
        {deliverableCount === 0 && (
          <li>
            {t(
              'exports.reportDownload.taskDetails.additionalInformation.noDeliverables'
            )}
          </li>
        )}

        {linkedSiblings > 0 && (
          <li>
            {linkedSiblingsString}
            {generateBoldList(
              t,
              workstream.tasks
                .filter(t => t.datesLinkedToSiblings && t.id !== task.id)
                .map(s => s.name)
            )}
          </li>
        )}
        {linkedSiblings === 0 && (
          <li>
            {t(
              'exports.reportDownload.taskDetails.additionalInformation.noLinkedSiblings'
            )}
          </li>
        )}
      </ul>
    </>
  )
}

export const taskBodyGenerator = (t, task, workstream, includePosts) => {
  return (
    <div>
      {task.description && (
        <StylisedP>
          <b>{t('exports.reportDownload.taskDetails.taskDescription')}</b>
        </StylisedP>
      )}
      {task.description && (
        <div
          data-test="task-description"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}
      {includePosts && generatePostsTable(t, task)}
      {generateTaskDetailsContent(t, task, workstream, includePosts)}
    </div>
  )
}
