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

import { MattersIcon } from '../../../../theme/navigation/CommonIcons'
import ResultTemplate from './ResultTemplate'
import { Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import withRouter from '../../../../services/navigation/WithRouter'
import { getStatusColour } from '../../../../services/helpers/task/task-status-colour-helper'
import { TASK_STATUS } from '../../../../app/constants'
import TaskStatusBars from '../../global-header/matter-switcher/TaskStatusBars'
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

const MatterResult = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const result = props.result
  const title = result.name
  const isSWM = result.isSWM
  const subtitle = ''
  const location = t('globalSearch.results.matter.location', {
    refNumber: result.userDefinedReferenceNumber,
  })
  const getIcon = () => {
    return (
      <Tooltip title="Matter">
        <div>
          <MattersIcon
            className={classes.icon}
            style={{
              color: getStatusColour(
                result.active ? TASK_STATUS.IN_PROGRESS : TASK_STATUS.DONE
              ),
            }}
          />
        </div>
      </Tooltip>
    )
  }
  const getBody = () => {
    const taskCount = result.taskCounts
      ? Object.values(result.taskCounts).reduce((a, b) => a + b) -
        result.taskCounts.notRequiredCount
      : 0
    let shortenedDescription =
      findMatchingSubsection(result.description, props.query) ||
      result.description
    return (
      <>
        <Typography
          dangerouslySetInnerHTML={{
            __html: shortenedDescription
              ? shortenedDescription.replace('<p>', "<p style='margin:unset;'>")
              : shortenedDescription,
          }}
          className={classes.body}
        />
        {isSWM && (
          <TaskStatusBars
            workstream={result}
            taskCount={taskCount}
            masonry={true}
          />
        )}
      </>
    )
  }

  const goTo = () => {
    props.router.navigate(`/matter/${result.id}/overview`)
    props.close()
  }
  return (
    <ResultTemplate
      title={title}
      subtitle={subtitle}
      location={location}
      locationChips={{ client: result.clientName }}
      icon={getIcon()}
      body={getBody()}
      goTo={goTo}
      query={props.query}
    />
  )
}

export default withRouter(MatterResult)
