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
import WizardImg1 from './img/FtueTaskmapImg1.svg'
import WizardImg2 from './img/FtueTaskmapImg2.svg'
import WizardImg3 from './img/FtueTaskmapImg3.svg'
import WizardImg4 from './img/FtueTaskmapImg4.svg'
import WizardImg5 from './img/FtueTaskmapImg5.svg'

const TaskmapFtue = props => {
  const titles = [
    props.t('ftue.taskmap.getStarted'),
    props.t('ftue.taskmap.workflowStatus'),
    props.t('ftue.taskmap.breakdown'),
    props.t('ftue.taskmap.taskTypes'),
    props.t('ftue.taskmap.dndTitle'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenTaskmap"
      data-test="taskmap-ftue"
      titles={titles}
      onClose={props.onClose}
      indexUpdate={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={WizardImg1}
        subTitleText={props.t('ftue.taskmap.getStartedSubtitle')}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={props.t('ftue.taskmap.workflowStatusSubtitle')}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={WizardImg3}
        subTitleText={props.t('ftue.taskmap.breakdownSubtitle')}
      />

      <FTUEScreen
        datatest="screen4"
        imageurl={WizardImg4}
        subTitleText={props.t('ftue.taskmap.taskTypeSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen5"
        imageurl={WizardImg5}
        subTitleText={props.t('ftue.taskmap.dndSubtitle')}
        dangerous={true}
      />
    </FTUEWizard>
  )
}

export default withTranslation()(TaskmapFtue)
