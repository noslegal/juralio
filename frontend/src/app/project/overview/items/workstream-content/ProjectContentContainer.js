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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { withStyles } from 'tss-react/mui'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
  getTemplateTaskPostUrl,
  getWorkstreamTaskPostUrl,
} from '../../../../../components/navigation/common/location-context-helper'
import { checkIfPrivateWorkstreamMember } from '../../../../../services/helpers/user/user-roles-helper'
import withRouter from '../../../../../services/navigation/WithRouter'
import juralioColours from '../../../../../theme/juralio-colours'
import rawColours from '../../../../../theme/raw-colours'
import MatterResourcesContainer from '../../../../matter-resources/MatterResourcesContainer'
import {
  generatePostTableData,
  generateTaskTableData,
} from '../../OverviewHelpers'
import {
  generateTaskColumns,
  postColumns,
} from './project-tasks-and-posts-columns'
import ProjectTasksAndPostsTable from './ProjectContentTable'
import {
  buildPostFilters,
  buildTaskFilters,
} from './workstream-content-custom-filters'

const style = theme => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyItems: 'center',
    fontWeight: '500 !important',
  },
  infoIcon: {
    paddingLeft: theme.spacing(1),
    color: juralioColours.darkText.secondary,
  },
  tab: {
    color: rawColours.primary.black[100],
    opacity: 1,
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
    },
  },
  description: {
    marginTop: theme.spacing(2),
  },
  heading: {
    display: 'flex',
  },
  contentTitle: {
    marginLeft: theme.spacing(1.5),
  },
  userOptionButton: {
    fontWeight: 'normal',
    fontSize: '14px',
    fontFamily: theme.typography.fontFamily,
    color: juralioColours.menu.item,
    textTransform: 'none !important',
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginTop: '-6px',
  },
  icon: {
    marginRight: theme.spacing(0.5),
  },
})

const ProjectContentContainer = props => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.auth.data.details)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)

  useEffect(() => {
    if (props.isMatterOverview) {
    } else {
    }
  }, []) //eslint-disable-line

  const mappedTeam = matterTeam.map(member => {
    member.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
      props.project,
      member.user
    )
    return member
  })

  const [tab, setTab] = useState(0)

  const TaskColumns = generateTaskColumns(
    t,
    mappedTeam,
    props.projectId,
    props.matterId,
    props.isReadOnly,
    props.isTemplate,
    false,
    false
  )

  const delAndMileColumns = generateTaskColumns(
    t,
    mappedTeam,
    props.projectId,
    props.matterId,
    props.isReadOnly,
    props.isTemplate,
    false,
    true
  )

  const PostColumns = postColumns(
    t,
    props.isTemplate,
    props.projectId,
    props.matterId,
    false,
    []
  )

  const taskTableTasks = props.tasks.filter(
    x => !x.isMilestone && !x.isDeliverable
  )
  const delMileTasks = props.tasks.filter(x => x.isMilestone || x.isDeliverable)

  const taskFilters = buildTaskFilters(taskTableTasks, t, {
    isTemplate: props.isTemplate,
  })
  const delMileFilters = buildTaskFilters(delMileTasks, t, {
    isTemplate: props.isTemplate,
  })
  const postFilters = buildPostFilters(props.posts ?? [], t, {
    isTemplate: props.isTemplate,
  })

  const generateColumns = () =>
    tab === 2
      ? { columns: PostColumns, filters: postFilters }
      : tab === 1
        ? { columns: delAndMileColumns, filters: delMileFilters }
        : { columns: TaskColumns, filters: taskFilters }

  const handlePostClick = params => {
    const post = params.row._post
    const urlBase = props.isTemplate
      ? getTemplateTaskPostUrl(props.projectId, post.taskId, post.id)
      : getWorkstreamTaskPostUrl(
          props.matterId,
          props.projectId,
          post.taskId,
          post.id
        )
    if (urlBase.includes('undefined')) {
      console.error(post)
      console.error(urlBase)
    }
    navigate(urlBase)
  }

  const handleTaskCellClick = params => {
    if (['name', 'teamMembers', 'lastUpdated'].includes(params.field)) {
      const task = params.row._task
      const urlBase = props.isTemplate
        ? getTemplateTaskDetailsUrl(props.projectId, task.id)
        : getTaskDetailsUrl(props.matterId, props.projectId, task.id)
      if (urlBase.includes('undefined')) {
        console.error(task)
        console.error(urlBase)
      } else {
        navigate(urlBase)
      }
    }
  }

  const generateRows = () => {
    if (tab === 2) {
      return generatePostTableData(
        props.posts,
        t,
        props.tasks,
        props.isTemplate,
        false,
        [],
        mappedTeam
      )
    } else if (tab === 1) {
      return generateTaskTableData(
        props.tasks.filter(x => x.isMilestone || x.isDeliverable),
        t,
        currentUser,
        false,
        [],
        props.isTemplate,
        mappedTeam
      )
    }
    return generateTaskTableData(
      props.tasks.filter(x => !x.isMilestone && !x.isDeliverable),
      t,
      currentUser,
      false,
      [],
      props.isTemplate,
      mappedTeam
    )
  }

  const { columns, filters } = generateColumns()
  const rows = generateRows()

  const renderTabs = () => (
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
        className={props.classes.tab}
      />
      <Tab
        label={t('common.deliverablesAndmilestones')}
        data-test="deliverables-and-milestones-tab"
        value={1}
        className={props.classes.tab}
      />
      <Tab
        label={t('common.posts')}
        data-test="post-tab"
        value={2}
        className={props.classes.tab}
      />
    </Tabs>
  )

  return (
    <div
      data-test="project-content-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <div className={props.classes.heading}>
        <InboxIcon />
        <Typography
          variant="h6"
          data-test="content-title"
          className={props.classes.contentTitle}
        >
          {t('project.overview.content.title', {
            overviewType: props.isMatterOverview
              ? 'Matter'
              : props.isTemplate
                ? 'Template'
                : 'Workstream',
          })}
        </Typography>
      </div>
      <MatterResourcesContainer
        matterId={props.matterId}
        projectId={props.isMatterOverview ? undefined : props.projectId}
        isTemplate={props.isTemplate}
        isSystemTemplate={props.project.isSystemTemplate}
      />

      <ProjectTasksAndPostsTable
        columns={columns}
        rows={rows}
        filters={filters}
        onRowClick={tab === 2 ? handlePostClick : undefined}
        onCellClick={tab === 0 ? handleTaskCellClick : undefined}
        noRowsText={t('project.overview.posts.noPostsInProject')}
        title={renderTabs()}
      />
    </div>
  )
}

export default withRouter(withStyles(ProjectContentContainer, style))
