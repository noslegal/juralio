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

import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { DATE_FORMAT_FULL } from '../../../app/constants'
import theme from '../../../theme/juralio-theme'
import { getDateDisplayString } from '../../helpers/date-helper'
import StylisedP from './components/StylisedP.jsx'
import { headerGenerator } from './header-generator.jsx'
import { postBodyGenerator } from './post/body-generator.jsx'
import { titleGenerator } from './post/title-generator.jsx'
import { taskBodyGenerator } from './task/body-generator.jsx'
import { titleGenerator as taskTitleGenerator } from './task/title-generator.jsx'
const wrap = content => {
  return (
    <html>
      <body>{content}</body>
    </html>
  )
}

export const generateHtml = (
  t,
  matter,
  workstream,
  task,
  post,
  reportType,
  options = {}
) => {
  const clientName = matter.clientName
  const matterName = matter.name
  const matterRef = matter.userDefinedReferenceNumber
  const workstreamName = workstream.name
  const isPost = reportType === 'post'
  const isTask = reportType === 'task'

  let title
  let body
  if (isPost) {
    title = titleGenerator(t, post, task)
    body = postBodyGenerator(post)
  }
  if (isTask) {
    title = taskTitleGenerator(t, task)
    body = taskBodyGenerator(t, task, workstream, options.includePosts)
  }

  const html = (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div>
          {title}
          <br />
          {body}
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
  const header = (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div>
          {headerGenerator(
            t,
            clientName,
            matterName,
            matterRef,
            workstreamName
          )}
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )

  const footer = (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <StylisedP>
          {t('exports.reportDownload.footer.exportedFrom', {
            date: getDateDisplayString(new Date(), DATE_FORMAT_FULL, true),
          })}
        </StylisedP>
      </ThemeProvider>
    </StyledEngineProvider>
  )

  return [
    renderToString(wrap(html)),
    renderToString(wrap(header)),
    renderToString(wrap(footer)),
  ]
}
