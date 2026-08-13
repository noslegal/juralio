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
import WizardImg1 from './img/TemplateImg1.svg'
import WizardImg2 from './img/TemplateImg2.svg'
import WizardImg3 from './img/TemplateImg3.svg'
import WizardImg4 from './img/TemplateImg4.svg'

const TemplateTaskmapFTUE = props => {
  const titles = [
    props.t('ftue.templateTaskmap.getStarted'),
    props.t('ftue.templateTaskmap.breakdown'),
    props.t('ftue.templateTaskmap.taskTypes'),
    props.t('ftue.templateTaskmap.buildOrder'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenTemplateTaskmap"
      data-test="taskmap-ftue"
      titles={titles}
      onClose={() => {}}
      indexUpdate={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={WizardImg1}
        subTitleText={props.t('ftue.templateTaskmap.getStartedSubtitle')}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={props.t('ftue.templateTaskmap.breakdownSubtitle')}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={WizardImg3}
        subTitleText={props.t('ftue.templateTaskmap.taskTypeSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen4"
        imageurl={WizardImg4}
        subTitleText={props.t('ftue.templateTaskmap.buildOrderSubtitle')}
        dangerous={true}
      />
    </FTUEWizard>
  )
}

export default withTranslation()(TemplateTaskmapFTUE)
