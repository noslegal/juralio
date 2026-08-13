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

import React, { useState } from 'react'

import ManageUsers from '../ManageUsers'
import { Paper, Tab, Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ManageGroups from '../ManageGroups'

const ManageOrganisationUsers = props => {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  return (
    <>
      <Tabs value={tab} onChange={(event, value) => setTab(parseInt(value))}>
        <Tab value={0} label={t('organisationAdmin.accounts.header')}>
          {}
        </Tab>
        {!props.isSysadmin && <Tab value={1} label={t('Groups')}></Tab>}
      </Tabs>
      <Paper style={{ padding: '24px' }}>
        {tab === 0 && (
          <ManageUsers
            isOrganisation
            organisationId={props.organisationId}
            currentUserTitleSize="subtitle1"
          />
        )}
        {tab === 1 && <ManageGroups organisationId={props.organisationId} />}
      </Paper>
    </>
  )
}

export default ManageOrganisationUsers
