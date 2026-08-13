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
import rawColours from '../../../../theme/raw-colours'
import { findMatchingSubsection } from './result-helpers'

const styles = makeStyles()(theme => ({
  icon: {
    width: 36,
    height: 36,
    color: rawColours.status.template.dark,
  },
  body: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}))

const TemplateTaskResult = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const result = props.result
  const title = result.name

  const subtitle = ''
  const location = `${
    result.level === 1 ? 'Phase of ' : String.fromCharCode(result.level + 64)
  } -Task of `
  const getIcon = () => {
    return (
      <Tooltip title="Template task">
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
          __html: result.description
            ? shortenedDescription.replace('<p>', "<p style='margin:unset;'>")
            : shortenedDescription,
        }}
        className={classes.body}
      />
    )
  }

  const goTo = () => {
    props.router.navigate(`/template/${result.templateId}/task/${result.id}`)
    props.close()
  }
  return (
    <ResultTemplate
      title={title}
      subtitle={subtitle}
      location={location}
      locationChips={{ template: result.templateName }}
      icon={getIcon()}
      body={getBody()}
      goTo={goTo}
      query={props.query}
    />
  )
}

export default withRouter(TemplateTaskResult)
