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

import { mdiArchive } from '@mdi/js'
import Icon from '@mdi/react'
import { Paper, Tab, Tabs } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import ClosedInfoBox from '../../../components/data-display/closed-info-box/ClosedInfoBox'

import juralioColours from '../../../theme/juralio-colours'
import { STATUS_TYPE } from '../../constants'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import TaskPostArchiveTableContainer from './posts/TaskPostArchiveTableContainer'
import TaskArchiveTableContainer from './tasks/TaskArchiveTableContainer'

const useStyles = makeStyles()(theme => ({
  contentPaper: {
    padding: theme.spacing(3),
    borderRadius: 12,
  },
}))

const MatterArchiveContainer = props => {
  const [selectedTab, setSelectedTab] = useState(0)
  const handleChange = (event, newValue) => setSelectedTab(newValue)

  const { classes } = useStyles()
  const { t } = useTranslation()
  return (
    <div>
      {props.matter.matterStatus === STATUS_TYPE.ACTIVE && (
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          slotProps={{
            indicator: {
              style: {
                backgroundColor: juralioColours.taskStatus.done,
              },
            },
          }}
        >
          <Tab label={t('common.tasks')} value={0} data-test="tasks-tab"></Tab>
          <Tab label={t('common.posts')} value={1} data-test="posts-tab"></Tab>
        </Tabs>
      )}
      <Paper className={classes.contentPaper}>
        <PanelTitle
          icon={<Icon path={mdiArchive} size={1} />}
          header={t('matterAdmin.archive.header')}
          caption={t('matterAdmin.archive.subtitle')}
        />
        {props.matter.matterStatus === STATUS_TYPE.CLOSED && (
          <ClosedInfoBox text={t('matterAdmin.archive.closedHelper')} />
        )}
        {selectedTab === 0 &&
          props.matter.matterStatus === STATUS_TYPE.ACTIVE && (
            <TaskArchiveTableContainer
              data-test="archive-panel"
              matter={props.matter}
            />
          )}
        {selectedTab === 1 &&
          props.matter.matterStatus === STATUS_TYPE.ACTIVE && (
            <TaskPostArchiveTableContainer matter={props.matter} />
          )}
      </Paper>
    </div>
  )
}

export default MatterArchiveContainer
