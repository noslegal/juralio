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

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CloudIcon from '@mui/icons-material/Cloud'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import ActiveUsers from '../../admin/active-users/ActiveUsers'
import GlobalUsers from '../../admin/global-users/GlobalUsers'
import OrganisationDetailContainer from '../../admin/organisations/detail/OrganisationDetailContainer'
import OrganisationsContainer from '../../admin/organisations/OrganisationsContainer'
import TemporaryPasswordDisplayDialog from '../../app/organisation/users/TemporaryPasswordDisplayDialog'
import TwoColumnList from '../../components/layouts/two-column-list/TwoColumnList'
import { MattersIcon } from '../../theme/navigation/CommonIcons'
import InstanceManagementContainer from '../instance-management/InstanceManagementContainer'
import SysadminManagementContainer from '../sysadmin-management/SysadminManagementContainer'
const Home = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [selectedOrganisation, setSelectedOrganisation] = useState()

  const listItems = {
    organisations: {
      dataTest: 'organisations',
      prompt: '',
      header: t('sysAdmin.organisations.header'),
      subtitle: t('sysAdmin.organisations.subtitle'),
      icon: <MattersIcon />,
      selectionResetHandler: () => setSelectedOrganisation(),
      component: selectedOrganisation ? (
        <OrganisationDetailContainer
          setSelectedOrganisation={setSelectedOrganisation}
          organisation={selectedOrganisation}
        />
      ) : (
        <OrganisationsContainer
          setSelectedOrganisation={setSelectedOrganisation}
          organisation={selectedOrganisation}
        />
      ),
    },
    users: {
      dataTest: 'accounts',
      prompt: '',
      header: t('sysAdmin.accounts.header'),
      subtitle: t('sysAdmin.accounts.subtitle'),
      icon: <PeopleIcon />,
      component: <GlobalUsers />,
    },
    monthlyActiveUsers: {
      dataTest: 'active-users',
      prompt: '',
      header: t('sysAdmin.activeUsers.header'),
      subtitle: t('sysAdmin.activeUsers.subtitle'),
      icon: <SettingsIcon />,
      component: <ActiveUsers />,
    },
    instanceManagement: {
      dataTest: 'instance-management',
      prompt: '',
      header: t('sysAdmin.instanceManagement.header'),
      subtitle: t('sysAdmin.instanceManagement.subtitle'),
      icon: <CloudIcon />,
      component: <InstanceManagementContainer />,
    },
    sysadminManagment: {
      dataTest: 'sysadmin-management',
      prompt: '',
      header: t('sysAdmin.sysadminManagement.header'),
      subtitle: t('sysAdmin.sysadminManagement.subtitle'),
      icon: <AdminPanelSettingsIcon />,
      component: <SysadminManagementContainer />,
    },
  }

  return (
    <React.Fragment>
      <TwoColumnList listItems={listItems} />
      <TemporaryPasswordDisplayDialog />
    </React.Fragment>
  )
}

export default Home
