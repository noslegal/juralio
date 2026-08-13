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

import {
  DATE_FORMAT_FULL,
  NOTE_TYPES,
  TASK_STATUS,
} from '../../../../app/constants'
import { getImageHelper } from '../../../../services/favicon/favicon-service'
import {
  MeetingNoteIcon,
  NoteIcon,
} from '../../../../theme/navigation/CommonIcons'
import ResultTemplate from './ResultTemplate'
import { Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import withRouter from '../../../../services/navigation/WithRouter'
import { getStatusColour } from '../../../../services/helpers/task/task-status-colour-helper'
import colorModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import { findMatchingSubsection } from './result-helpers'

const styles = makeStyles()(theme => ({
  icon: {
    width: 36,
    height: 36,
  },
  body: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}))

const PostResult = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const result = props.result

  const getLocation = () => {
    if (result.postType === NOTE_TYPES.MEETING) {
      return t('globalSearch.results.post.meetingLocation', {
        date: getDateDisplayString(
          result.meetingDate.replace('Z', ''),
          DATE_FORMAT_FULL,
          true
        ),
        name: result.taskName,
        workstream: !result.isSWM ? result.workstreamName : result.matterName,
      })
    }
    if (result.postType === NOTE_TYPES.WEB) {
      return t('globalSearch.results.post.webLocation', {
        name: result.taskName,
        workstream: !result.isSWM ? result.workstreamName : result.matterName,
      })
    }
    if (result.postType === NOTE_TYPES.DOCUMENT) {
      return t('globalSearch.results.post.documentLocation', {
        name: result.taskName,
        workstream: !result.isSWM ? result.workstreamName : result.matterName,
      })
    }
    return t('globalSearch.results.post.noteLocation', {
      name: result.taskName,
      workstream: !result.isSWM ? result.workstreamName : result.matterName,
    })
  }
  const title = result.name
  const subtitle = result.url ? result.url : ''
  const location = getLocation()
  const getIcon = () => {
    if (result.postType) {
      switch (result.postType) {
        case NOTE_TYPES.WEB:
          return (
            <Tooltip title={NOTE_TYPES.WEB}>
              <div>
                <img
                  src={getImageHelper(
                    result.url,
                    result.postType === NOTE_TYPES.DOCUMENT
                      ? 'document_link.svg'
                      : 'web_link.svg'
                  )}
                  alt={t('notificationIcon.notificationIconAlt')}
                  style={{
                    width: 36,
                    height: 36,
                    color: result.status
                      ? getStatusColour(TASK_STATUS.DONE)
                      : getStatusColour(TASK_STATUS.IN_PROGRESS),
                  }}
                  data-test="web-icon"
                />
              </div>
            </Tooltip>
          )
        case NOTE_TYPES.DOCUMENT:
          return (
            <Tooltip title={NOTE_TYPES.DOCUMENT}>
              <div>
                <img
                  src={getImageHelper(
                    result.url,
                    result.postType === NOTE_TYPES.DOCUMENT
                      ? 'document_link.svg'
                      : 'web_link.svg'
                  )}
                  alt={t('notificationIcon.notificationIconAlt')}
                  style={{
                    width: 36,
                    height: 36,
                    color: result.status
                      ? getStatusColour(TASK_STATUS.DONE)
                      : getStatusColour(TASK_STATUS.IN_PROGRESS),
                  }}
                  data-test="web-icon"
                />
              </div>
            </Tooltip>
          )
        case NOTE_TYPES.MEETING:
          return (
            <Tooltip title="Meeting Note">
              <div>
                <MeetingNoteIcon
                  className={classes.icon}
                  style={{
                    color: getStatusColour(
                      result.status ? TASK_STATUS.DONE : TASK_STATUS.IN_PROGRESS
                    ),
                  }}
                />
              </div>
            </Tooltip>
          )
        default:
          break
      }
    }
    return (
      <Tooltip title="Post">
        <div>
          <NoteIcon
            className={classes.icon}
            style={{
              color: getStatusColour(
                result.status ? TASK_STATUS.DONE : TASK_STATUS.IN_PROGRESS
              ),
            }}
          />
        </div>
      </Tooltip>
    )
  }
  const getBody = () => {
    let displayText = result.description || ''
    let shortenedDescription =
      findMatchingSubsection(displayText, props.query) || result.description
    return (
      <Typography
        dangerouslySetInnerHTML={{
          __html: shortenedDescription
            ? shortenedDescription.replace('<p>', "<p style='margin:unset;'>")
            : shortenedDescription,
        }}
        className={classes.body}
      />
    )
  }

  const goTo = () => {
    props.router.navigate(
      `/matter/${result.matterId}/workstream/${result.workstreamId}/task/${result.taskId}/post/${result.id}`
    )

    props.close()
  }
  let locationChips = {}
  if (result.isSWM) {
    locationChips = {
      matter: result.matterName,
    }
  } else {
    locationChips = {
      workstream: result.workstreamName,
      matter: result.matterName,
    }
  }
  return (
    <ResultTemplate
      title={title}
      subtitle={subtitle}
      location={location}
      subtitleStyleOverride={{
        color: colorModifiers.secondaryText(rawColours.text.black),
      }}
      icon={getIcon()}
      body={getBody()}
      goTo={goTo}
      locationChips={locationChips}
      query={props.query}
    />
  )
}

export default withRouter(PostResult)
