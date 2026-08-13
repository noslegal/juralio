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

import { Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import PrivateLozenge from '../../../../../components/data-display/private-lozenge/PrivateLozenge'
import TaskChip from '../../../../../components/data-display/task-chip/TaskChip'
import TaskReferenceNumber from '../../../../../components/data-display/task-reference-number/TaskReferenceNumber'
import UserList from '../../../../../components/layouts/user-list/UserList'
import { getDateDisplayString } from '../../../../../services/helpers/date-helper'
import { getPostTypeIcon } from '../../../../../services/helpers/post/post-icon-helper'
import { sortMatterViewersLast } from '../../../../../services/helpers/user/user-helper'
import { WorkstreamIcon } from '../../../../../theme/navigation/CommonIcons'
import UsersControlContainer from '../../../../users/UsersControlContainer'

const useStyles = makeStyles()({
  flexRow: {
    display: 'flex',
  },
  flexRowFull: {
    display: 'flex',
    width: '100%',
  },
  workstreamColumn: {
    borderRadius: '4px',
    backgroundColor: '#F1F1EE',
    paddingLeft: '4px',
    paddingRight: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '8px',
  },
  workstreamIcon: {
    width: '16px',
    height: '16px',
  },
  workstreamRef: {
    fontSize: '12px',
  },
  postNameText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '8px',
  },
  taskChipWrapper: {
    maxWidth: '400px',
    flex: 1,
    minWidth: 0,
  },
  taskRefWrapper: {
    marginLeft: '4px',
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '5%',
  },
})

const quickFilterBySearch = filterVal => (value, row) =>
  row._search.includes(filterVal.toLowerCase())

const ProjectNameCell = ({ project, showPrivate }) => {
  const { classes } = useStyles()
  return (
    <div className={classes.flexRow}>
      <div className={classes.workstreamColumn}>
        <WorkstreamIcon className={classes.workstreamIcon} />
        <Typography variant="subtitle2" className={classes.workstreamRef}>
          {project.referenceNumber.slice(1)}
        </Typography>
      </div>
      <Typography>{project.name}</Typography>
      {showPrivate && project.isPrivate && <PrivateLozenge />}
    </div>
  )
}

const PostNameCell = ({ t, post }) => {
  const { classes } = useStyles()
  const postType = post.type === null ? t('common.note') : post.type
  return (
    <Tooltip disableTouchListener title={postType}>
      <div className={classes.flexRow} data-test="postColumnHeader">
        {getPostTypeIcon(t, post)}
        <Typography
          data-test="name-text"
          variant="caption"
          className={classes.postNameText}
        >
          {post.name}
        </Typography>
      </div>
    </Tooltip>
  )
}

const TaskCell = ({ task, projectId, matterId }) => {
  const { classes } = useStyles()
  return (
    <div className={classes.flexRowFull}>
      <div className={classes.taskChipWrapper} data-test="taskColumnHeader">
        <TaskChip
          isLink={true}
          task={task}
          projectId={projectId}
          matterId={matterId}
          closeHandler={() => {}}
        />
      </div>
      <div className={classes.taskRefWrapper}>
        <TaskReferenceNumber task={task} compact={true} />
      </div>
    </div>
  )
}

export const postColumns = (
  t,
  isTemplate,
  projectId,
  matterId,
  isMatterOverview = false,
  projects = []
) => {
  return [
    ...(isMatterOverview
      ? [
          {
            field: 'projectName',
            headerName: t('common.project'),
            flex: 1.5,
            sortable: true,
            renderCell: params => {
              const project = projects.find(
                p => p.id === params.row._post.project.id
              )
              if (!project) return ''
              return <ProjectNameCell project={project} showPrivate={false} />
            },
            getApplyQuickFilterFn: quickFilterBySearch,
          },
        ]
      : []),

    {
      field: 'name',
      headerName: t('common.post'),
      flex: 2,
      sortable: false,
      renderCell: params => <PostNameCell t={t} post={params.row._post} />,
      getApplyQuickFilterFn: quickFilterBySearch,
    },

    ...(!isTemplate
      ? [
          {
            field: 'users',
            headerName: t('authorsPanel.title'),
            flex: 1.5,
            sortable: false,
            renderCell: params => (
              <UsersControlContainer
                showAvatarList={true}
                floatLeft={true}
                users={sortMatterViewersLast(
                  params.row.users.map(u => {
                    u.id = u.username
                    u.enabled = true
                    u.isActiveOnMatter = true
                    return { ...u, user: u }
                  })
                )}
                renderUsersList={() => (
                  <UserList
                    onRemoveClick={null}
                    canRemoveSelf={true}
                    showRoleHeadings={true}
                    hideItemRole={true}
                    users={params.row.users.map(u => {
                      u.id = u.username
                      u.enabled = true
                      u.isActiveOnMatter = true
                      return { user: u }
                    })}
                  />
                )}
              />
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),

    {
      field: '_task',
      headerName: t('common.belongsTo'),
      flex: 2,
      sortable: true,
      sortComparator: (v1, v2) =>
        (v1?.name ?? '').localeCompare(v2?.name ?? ''),
      renderCell: params => (
        <TaskCell
          task={params.row._task}
          projectId={
            projectId !== undefined ? projectId : params.row._post.project.id
          }
          matterId={matterId}
        />
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]
}

export const generateTaskColumns = (
  t,
  handleOptionsClick,
  projectId,
  matterId,
  isReadOnly,
  isTemplate,
  isMatterOverview = false,
  delAndMileTable = false
) => {
  return [
    ...(isMatterOverview
      ? [
          {
            field: 'projectName',
            headerName: t('common.project'),
            flex: 1.5,
            sortable: true,
            renderCell: params => {
              const project = params.row._project
              if (!project) return ''
              return <ProjectNameCell project={project} showPrivate={true} />
            },
            getApplyQuickFilterFn: quickFilterBySearch,
          },
        ]
      : []),

    {
      field: 'name',
      headerName: delAndMileTable
        ? t('common.deliverablesOrmilestones')
        : t('common.taskAndphases'),
      flex: 2,
      sortable: true,
      renderCell: params => (
        <TaskCell
          task={params.row._task}
          projectId={
            projectId !== undefined ? projectId : params.row._task.project.id
          }
          matterId={matterId}
        />
      ),
      getApplyQuickFilterFn: quickFilterBySearch,
    },

    ...(!isTemplate
      ? [
          {
            field: 'teamMembers',
            headerName: t('postOverviewTable.responsibleTeam'),
            flex: 1.5,
            sortable: false,
            renderCell: params => (
              <UsersControlContainer
                floatLeft={true}
                users={sortMatterViewersLast(
                  params.row.teamMembers.map(u => {
                    u.isActiveOnMatter = true
                    return { ...u, user: u }
                  })
                )}
                renderUsersList={() => (
                  <UserList
                    onRemoveClick={null}
                    canRemoveSelf={true}
                    showRoleHeadings={true}
                    hideItemRole={true}
                    users={params.row.teamMembers.map(u => {
                      u.isActiveOnMatter = true
                      return { user: u }
                    })}
                  />
                )}
                showAvatarList={true}
              />
            ),
            getApplyQuickFilterFn: () => () => false,
          },

          {
            field: 'lastUpdated',
            headerName: t('common.lastUpdated'),
            flex: 1,
            sortable: true,
            renderCell: params => (
              <Typography variant="caption">
                {Date.parse(params.value)
                  ? getDateDisplayString(params.value)
                  : '-'}
              </Typography>
            ),
            getApplyQuickFilterFn: () => () => false,
          },
        ]
      : []),
  ]
}
