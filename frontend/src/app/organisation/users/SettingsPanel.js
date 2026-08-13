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

import { makeStyles } from 'tss-react/mui'
import OrganisationDocumentsPanel from './OrganisationDocumentsPanel'
import OrganisationSecurityContainer from './security/OrganisationSecurityContainer'
import { Paper, Tab, Tabs } from '@mui/material'
import { useTranslation } from 'react-i18next'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(() => ({
  root: {
    width: '100%',
  },
  tab: {
    color: rawColours.primary.black[100],
    opacity: 1,
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
    },
  },
}))

const tabIndicatorProps = {
  style: { background: rawColours.primary.primary.main, marginTop: 8 },
}

const SETTINGS_TABS = { SECURITY: 0, DOCUMENTS: 1 }

const SettingsPanel = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { organisation } = props
  const [selectedTab, setSelectedTab] = useState(SETTINGS_TABS.SECURITY)

  return (
    <div className={classes.root}>
      <Tabs
        value={selectedTab}
        onChange={(event, value) => setSelectedTab(value)}
        position="static"
        elevation={0}
        indicatorColor="primary"
        slotProps={{ indicator: tabIndicatorProps }}
      >
        <Tab
          label={t('organisationAdmin.settings.securityTab')}
          data-test="security-tab"
          value={SETTINGS_TABS.SECURITY}
          className={classes.tab}
        />
        <Tab
          label={t('organisationAdmin.settings.documentsTab')}
          data-test="documents-tab"
          value={SETTINGS_TABS.DOCUMENTS}
          className={classes.tab}
        />
      </Tabs>
      <Paper style={{ padding: '24px' }}>
        {selectedTab === SETTINGS_TABS.SECURITY ? (
          <OrganisationSecurityContainer organisation={organisation} />
        ) : (
          <OrganisationDocumentsPanel organisation={organisation} />
        )}
      </Paper>
    </div>
  )
}

export default SettingsPanel
