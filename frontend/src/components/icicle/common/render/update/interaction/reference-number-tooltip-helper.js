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
import ReactDOMServer from 'react-dom/server'
import i18n from 'i18next'

import Icon from '@mdi/react'
import { mdiPound } from '@mdi/js'
import { getMilestoneOrTaskString } from '../../../../../../services/helpers/task/task-util-helper'

export const generateTooltip = (referenceNumber, task) => {
  return ReactDOMServer.renderToString(
    <div style={{ minWidth: 325 }}>
      &nbsp;
      {getTooltipText(task)}
    </div>
  )
}

export const renderReferenceNumberIcon = () => (
  <Icon path={mdiPound} size={0.5} style={{ marginBottom: -1 }} />
)

export const getTooltipText = task =>
  window.location.href.includes('/template')
    ? i18n.t('taskCardContent.referenceNumberTemplate')
    : i18n.t('taskCardContent.referenceNumber', {
        type: getMilestoneOrTaskString(task),
      })
