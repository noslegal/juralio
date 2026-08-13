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

import { Tab, Tabs } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MATTER_STATUS } from '../constants'
import DeletedMattersList from './DeletedMattersList'
import MattersListContainer from './MattersListContainer'

const MattersListPanel = props => {
  const [tab, setTab] = useState(MATTER_STATUS.ACTIVE)
  const { t } = useTranslation()
  return (
    <>
      <Tabs
        value={tab}
        onChange={(event, value) => setTab(value)}
        position="static"
        elevation={0}
        indicatorColor="primary"
      >
        <Tab
          label={t('entity.matters')}
          data-test="matters-tab"
          value={MATTER_STATUS.ACTIVE}
        />
        <Tab
          label={t('matterDeletion.deletedMatters')}
          data-test="deleted-matters-tab"
          value={MATTER_STATUS.PENDING_DELETION}
        />
      </Tabs>
      {tab === MATTER_STATUS.ACTIVE ? (
        <MattersListContainer organisationId={props.organisationId} />
      ) : (
        <DeletedMattersList t={t} />
      )}
    </>
  )
}

export default MattersListPanel
