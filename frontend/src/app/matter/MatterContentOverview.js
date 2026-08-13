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

import InboxIcon from '@mui/icons-material/Inbox'
import { Tab, Tabs, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../theme/raw-colours'
import MatterResourcesContainer from '../matter-resources/MatterResourcesContainer'
import MatterContentPostTable from './tables/MatterContentPostTable'
import MatterContentTasksTable from './tables/MatterContentTasksTable'

const styles = makeStyles()(theme => ({
  wrapper: {
    margin: theme.spacing(2),
  },
  tab: {
    color: rawColours.primary.black[100],
    opacity: 1,
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
    },
  },
  row: {
    display: 'flex',
  },
  title: { marginLeft: theme.spacing() },
}))

const MatterContentOverview = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const [tab, setTab] = useState(0)

  const renderTabs = () => {
    return (
      <Tabs
        value={tab}
        onChange={(e, v) => {
          setTab(v)
        }}
        position={'static'}
        elevation={0}
        indicatorColor={'primary'}
        slotProps={{
          indicator: {
            style: { background: rawColours.primary.primary.main },
          },
        }}
      >
        <Tab
          label={t('common.taskAndphases')}
          data-test="task-tab"
          value={0}
          className={classes.tab}
        />
        <Tab
          label={t('common.deliverablesAndmilestones')}
          data-test="deliverables-and-milestones-tab"
          value={1}
          className={classes.tab}
        />
        <Tab
          label={t('common.posts')}
          data-test="post-tab"
          value={2}
          className={classes.tab}
        />
      </Tabs>
    )
  }

  const renderTasksTable = () => {
    return (
      <MatterContentTasksTable
        matterId={props.matterId}
        tasks={props.tasks.filter(x => !x.isDeliverable && !x.isMilestone)}
        projects={props.projects}
      />
    )
  }
  const renderDelAndMileTable = () => {
    return (
      <MatterContentTasksTable
        matterId={props.matterId}
        tasks={props.tasks.filter(x => x.isDeliverable || x.isMilestone)}
        projects={props.projects}
      />
    )
  }
  const renderPostsTable = () => {
    return (
      <MatterContentPostTable
        matterId={props.matterId}
        tasks={props.tasks}
        projects={props.projects}
        posts={props.posts}
      />
    )
  }
  return (
    <div className={classes.wrapper} data-test="project-content-container">
      <div className={classes.row}>
        <InboxIcon />
        <Typography
          variant="h6"
          data-test="content-title"
          className={classes.title}
        >
          {t('project.overview.content.title', {
            overviewType: 'Matter',
          })}
        </Typography>
      </div>
      <MatterResourcesContainer matterId={props.matterId} />
      {renderTabs()}
      {tab === 0 && renderTasksTable()}
      {tab === 1 && renderDelAndMileTable()}
      {tab === 2 && renderPostsTable()}
    </div>
  )
}

export default MatterContentOverview
