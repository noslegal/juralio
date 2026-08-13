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

import { AppBar, Tab, Tabs, Typography } from '@mui/material'
import SimpleChip from '../../components/data-display/simple-chip/SimpleChip'
import UserList from '../../components/layouts/user-list/UserList'
import BackToListLink from '../../components/navigation/back-to-list-link/BackToListLink'
import colorModifiers from '../../theme/color-modifiers'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'
import { updateProject } from '../matter-details/projects/projects-actions'
import ProjectStatusToggle from '../matter-details/projects/projects-table/ProjectStatusToggle'
import UsersControlContainer from '../users/UsersControlContainer'
import ClientMatterAvatar from './ClientMatterAvatar'

export const projectColumns = (classes, t, dispatch, readOnly, props) => [
  {
    field: 'name',
    headerName: t('orgMatterInfo.headerProject'),
    flex: 2,
    filterable: false,
    sortable: true,
    renderCell: params => (
      <Typography
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '800px',
          maxHeight: '5em',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflowWrap: 'break-word',
        }}
      >
        {params.row.name}
      </Typography>
    ),
    getApplyQuickFilterFn: filterVal => (value, row) =>
      row._search.includes(filterVal.toLowerCase()),
  },
  {
    field: '_project',
    headerName: t('orgMatterInfo.headerStatus'),
    flex: 1,
    filterable: false,
    sortable: false,
    renderCell: params => (
      <ProjectStatusToggle
        currentValue={params.row._project.active}
        readOnly={readOnly}
        updateStatus={() =>
          dispatch(
            updateProject(props.selectedMatter.id, params.row._project.id, {
              active: !params.row._project.active,
            })
          )
        }
      />
    ),
    getApplyQuickFilterFn: () => () => false,
  },
  {
    field: 'isPrivate',
    headerName: t('common.privateQuestion'),
    flex: 1,
    filterable: false,
    sortable: true,
    renderCell: params =>
      params.row.isPrivate ? (
        <SimpleChip
          text={t('common.private')}
          options={{
            dataTest: 'finalised-post-privacy-chip',
            color: rawColours.primary.white.primary,
            backgroundColor: colorModifiers.primaryText(
              rawColours.primary.black.black
            ),
            minWidth: 47,
            maxWidth: 75,
            height: 18,
            textTransform: 'capitalize',
          }}
        />
      ) : null,
    getApplyQuickFilterFn: () => () => false,
  },
  {
    field: 'privateTeam',
    headerName: t('common.access'),
    flex: 2,
    filterable: false,
    sortable: false,
    renderCell: params =>
      params.row.privateTeam ? (
        <UsersControlContainer
          users={params.row.privateTeam}
          renderUsersList={() => (
            <UserList
              users={params.row.privateTeam}
              onRemoveClick={null}
              canRemoveSelf={true}
            />
          )}
          floatLeft={false}
          showAvatarList={true}
        />
      ) : null,
    getApplyQuickFilterFn: () => () => false,
  },
]

export const projectData = (sortedProjects, t) =>
  sortedProjects?.map(project => ({
    id: project.id,
    _project: project,
    name: project.name,
    isPrivate: project.isPrivate,
    privateTeam: project.isPrivate ? project.privateWorkstreamTeam : null,
    _search: project.name.toLowerCase(),
  }))

export const generateTitle = (props, classes, t, selectedTab, handleChange) => (
  <div className={classes.tableTitle}>
    <BackToListLink
      actionHandler={() => props.setSelectedMatter('')}
      linkText={t('organisationAdmin.matters.backCaption')}
    />
    <div className={classes.padding}>
      <ClientMatterAvatar matter={props.selectedMatter} />
    </div>
    <Typography data-test="active-users-table-title" variant={'subtitle1'}>
      <AppBar className={classes.tabBar} position={'static'} elevation={0}>
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
          <Tab label={t('common.people')} value={0} data-test="users-tab" />
          <Tab
            label={t('entity.workstreams')}
            value={1}
            data-test="projects-tab"
          />
        </Tabs>
      </AppBar>
    </Typography>
  </div>
)
