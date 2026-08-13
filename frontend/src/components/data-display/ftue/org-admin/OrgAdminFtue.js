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
import WizardImg1 from './img/FtueOrgAdminImg1.svg'
import WizardImg2 from './img/FtueOrgAdminImg2.svg'
import WizardImg3 from './img/FtueOrgAdminImg3.svg'
import WizardImg4 from './img/FtueOrgAdminImg4.svg'
import WizardImg5 from './img/FtueOrgAdminImg5.svg'
import WizardImg6 from './img/FtueOrgAdminImg6.svg'

const OrgAdminFtue = props => {
  const titles = [
    props.t('ftue.orgAdmin.getStarted'),
    props.t('ftue.orgAdmin.manageYourUsers'),
    props.t('ftue.orgAdmin.controlSecurity'),
    props.t('ftue.orgAdmin.administerMatters'),
    props.t('ftue.orgAdmin.adjustLabels'),
    props.t('ftue.orgAdmin.documentSystems'),
  ]
  return (
    <FTUEWizard
      ftueFlagName="hasSeenOrgAdmin"
      data-test="OrgAdmin-ftue"
      titles={titles}
      indexUpdate={() => {}}
      onClose={() => {}}
    >
      <FTUEScreen
        datatest="screen1"
        imageurl={WizardImg1}
        subTitleText={props.t('ftue.orgAdmin.getStartedSubtitle')}
      />
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={props.t('ftue.orgAdmin.manageYourUsersSubtitle')}
      />
      <FTUEScreen
        datatest="screen3"
        imageurl={WizardImg3}
        subTitleText={props.t('ftue.orgAdmin.controlSecuritySubtitle')}
      />
      <FTUEScreen
        datatest="screen4"
        imageurl={WizardImg4}
        subTitleText={props.t('ftue.orgAdmin.administerMattersSubtitle')}
      />
      <FTUEScreen
        datatest="screen5"
        imageurl={WizardImg5}
        subTitleText={props.t('ftue.orgAdmin.adjustLabelsSubtitle')}
      />
      <FTUEScreen
        datatest="screen6"
        imageurl={WizardImg6}
        subTitleText={props.t('ftue.orgAdmin.documentSystemsSubtitle')}
      />
    </FTUEWizard>
  )
}

export default withTranslation()(OrgAdminFtue)
