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

import { NOTE_TYPES } from '../../../../app/constants'
import { getImageHelper } from '../../../../services/favicon/favicon-service'
import {
  MeetingNoteIcon,
  NoteIcon,
} from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'
import ResultTemplate from './ResultTemplate'
import { Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import withRouter from '../../../../services/navigation/WithRouter'
import { findMatchingSubsection } from './result-helpers'

const styles = makeStyles()(theme => ({
  icon: {
    color: rawColours.status.template.dark,
    width: 36,
    height: 36,
  },
  body: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}))

const TemplatePostResult = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const result = props.result
  const title = result.name
  const subtitle = ''
  const location = t('globalSearch.results.templateNote.location', {
    name: result.templateTaskName,
  })
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
                    color: rawColours.status.template.dark,
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
                    color: rawColours.status.template.dark,
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
                    color: rawColours.status.template.dark,
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
              color: rawColours.status.template.dark,
            }}
          />
        </div>
      </Tooltip>
    )
  }
  const getBody = () => {
    let shortenedDescription =
      findMatchingSubsection(result.description, props.query) ||
      result.description
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
      `/template/${result.templateId}/task/${result.templateTaskId}/post/${result.id}`
    )
    props.close()
  }
  return (
    <ResultTemplate
      title={title}
      subtitle={subtitle}
      location={location}
      icon={getIcon()}
      body={getBody()}
      goTo={goTo}
      locationChips={{ template: result.templateName }}
      query={props.query}
    />
  )
}

export default withRouter(TemplatePostResult)
