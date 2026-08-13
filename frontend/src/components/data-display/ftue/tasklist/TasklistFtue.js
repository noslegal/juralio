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
import { withTranslation } from 'react-i18next'
import FTUEScreen from '../FTUEScreen'
import FTUEWizard from '../FTUEWizard'
import tasklistFtue1 from './img/tasklistFtue1.svg'
import tasklistFtue2 from './img/tasklistFtue2.svg'
import tasklistFtue3 from './img/tasklistFtue3.svg'
const TasklistFtue = props => {
  const titles = [
    props.t('ftue.tasklist.getStarted'),
    props.t('ftue.tasklist.ordering'),
    props.t('ftue.tasklist.filtering'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenTasklist"
      data-test="tasklist-ftue"
      titles={titles}
      indexUpdate={() => {}}
      onClose={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={tasklistFtue1}
        subTitleText={props.t('ftue.tasklist.getStartedSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={tasklistFtue2}
        subTitleText={props.t('ftue.tasklist.orderingSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={tasklistFtue3}
        subTitleText={props.t('ftue.tasklist.filteringSubtitle')}
        dangerous={true}
      />
    </FTUEWizard>
  )
}
export default withTranslation()(TasklistFtue)
