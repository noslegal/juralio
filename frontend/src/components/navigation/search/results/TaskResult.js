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

import { TaskIcon } from '../../../../theme/navigation/CommonIcons'
import ResultTemplate from './ResultTemplate'
import { Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import withRouter from '../../../../services/navigation/WithRouter'
import { getStatusColour } from '../../../../services/helpers/task/task-status-colour-helper'
import { DATE_FORMAT_FULL, TASK_STATUS } from '../../../../app/constants'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import { findMatchingSubsection } from './result-helpers'
import JurDeliverable from '../../../../assets/images/JurDeliverable'
import JurMilestone from '../../../../assets/images/JurMilestone'

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

const TaskResult = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const result = props.result
  const title = result.name

  const generateSubtitle = () => {
    if (!result.dateToDisplay) {
      return ''
    }
    if (result.status === TASK_STATUS.DONE) {
      return t('globalSearch.results.task.subtitle.finished', {
        date: getDateDisplayString(
          result.dateToDisplay.replace('Z', ''),
          DATE_FORMAT_FULL,
          true
        ),
      })
    } else if (result.status === TASK_STATUS.IN_PROGRESS) {
      return t('globalSearch.results.task.subtitle.plannedEnd', {
        date: getDateDisplayString(
          result.dateToDisplay.replace('Z', ''),
          DATE_FORMAT_FULL,
          true
        ),
      })
    } else {
      return t('globalSearch.results.task.subtitle.plannedStart', {
        date: getDateDisplayString(
          result.dateToDisplay.replace('Z', ''),
          DATE_FORMAT_FULL,
          true
        ),
      })
    }
  }

  const subtitle = generateSubtitle()
  const location =
    result.level === 1
      ? t('globalSearch.phaseOf')
      : `${String.fromCharCode(result.level + 64)} -Task of`
  const getIcon = () => {
    if (result.isDeliverable) {
      return (
        <Tooltip title={t('common.deliverable')}>
          <div>
            <JurDeliverable
              scale={'0.8'}
              className={classes.icon}
              stroke={getStatusColour(result.status)}
            />
          </div>
        </Tooltip>
      )
    } else if (result.isMilestone) {
      return (
        <Tooltip title={t('common.milestone')}>
          <div>
            <JurMilestone
              className={classes.icon}
              style={{
                color: getStatusColour(result.status),
              }}
            />
          </div>
        </Tooltip>
      )
    } else
      return (
        <Tooltip title="Task">
          <div>
            <TaskIcon
              className={classes.icon}
              style={{
                color: getStatusColour(result.status),
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
      `/matter/${result.matterId}/workstream/${result.workstreamId}/task/${result.id}`
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
      locationChips={locationChips}
      icon={getIcon()}
      body={getBody()}
      goTo={goTo}
      query={props.query}
    />
  )
}

export default withRouter(TaskResult)
