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
import WizardImg1 from './img/FtueMatterAdmin1.svg'
import WizardImg2 from './img/FtueMatterAdmin2.svg'
import WizardImg3 from './img/FtueMatterAdmin3.svg'
import WizardImg4 from './img/FtueMatterAdmin4.svg'
import WizardImg5 from './img/FtueMatterAdmin5.svg'
import WizardImg6 from './img/FtueMatterAdmin6.svg'

const MatterAdminFtue = props => {
  const titles = [
    props.t('ftue.matterAdmin.getStartedTitle'),
    props.t('ftue.matterAdmin.managePeopleTitle'),
    props.t('ftue.matterAdmin.placeHolderTitle'),
    props.t('ftue.matterAdmin.workstreamTitle'),
    props.t('ftue.matterAdmin.archiveTitle'),
    props.t('ftue.matterAdmin.labelTitle'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenMatterAdmin"
      data-test="matterAdmin-ftue"
      titles={titles}
      indexUpdate={() => {}}
      onClose={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={WizardImg1}
        subTitleText={props.t('ftue.matterAdmin.getStarted')}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={props.t('ftue.matterAdmin.managePeople')}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={WizardImg3}
        subTitleText={props.t('ftue.matterAdmin.placeholder')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen4"
        imageurl={WizardImg4}
        subTitleText={props.t('ftue.matterAdmin.workstream')}
      />
      <FTUEScreen
        datatest="screen5"
        imageurl={WizardImg5}
        subTitleText={props.t('ftue.matterAdmin.archive')}
      />
      <FTUEScreen
        datatest="screen6"
        imageurl={WizardImg6}
        subTitleText={props.t('ftue.matterAdmin.label')}
      />
    </FTUEWizard>
  )
}

export default withTranslation()(MatterAdminFtue)
