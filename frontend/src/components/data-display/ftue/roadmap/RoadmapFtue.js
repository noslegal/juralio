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
import WizardImg1 from './img/roadmapFTUE1.svg'
import WizardImg2 from './img/roadmapFTUE2.svg'
import WizardImg3 from './img/roadmapFTUE3.svg'
import WIzardImg4 from './img/roadmapFTUE4.svg'

const RoadmapFtue = props => {
  const titles = [
    props.t('ftue.roadmap.gettingStarted'),
    props.t('ftue.roadmap.expandSubtasks'),
    props.t('ftue.roadmap.overdueDates'),
    props.t('ftue.roadmap.addAndAdjust'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenRoadmap"
      data-test="Roadmap-ftue"
      titles={titles}
      indexUpdate={() => {}}
      onClose={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={WizardImg1}
        subTitleText={props.t('ftue.roadmap.gettingStartedSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={props.t('ftue.roadmap.expandSubtasksSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={WizardImg3}
        subTitleText={props.t('ftue.roadmap.overdueDatesSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen4"
        imageurl={WIzardImg4}
        subTitleText={props.t('ftue.roadmap.addAndAdjustSubtitle')}
        dangerous={true}
      />
    </FTUEWizard>
  )
}

export default withTranslation()(RoadmapFtue)
