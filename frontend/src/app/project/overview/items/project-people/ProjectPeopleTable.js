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

import { Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
} from '../../../../../components/navigation/common/location-context-helper'
import JuralioLink from '../../../../../components/navigation/juralio-link/JuralioLink'
import JuralioTable from '../../../../../components/table/JuralioTable'
import {
  renderUserColumn,
  useUserColumnStyles,
} from '../../../../../services/helpers/table/juralio-table-common-columns'
import { populateTable } from './project-people-data-helper'

const ProjectPeopleTable = props => {
  const history = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const userColumnClasses = useUserColumnStyles()

  const { classes } = makeStyles()(theme => ({
    column: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      paddingLeft: theme.spacing(3),
    },
  }))()

  if (!props.matterAdmins || !props.teamOnProject) return null

  const rows = populateTable(
    t,
    props.matterAdmins,
    props.isMatterOverview
      ? props.matterTeam.map(u => ({ ...u, ...u.user }))
      : props.teamOnProject,
    props.privateTeamMembers,
    props.matterId,
    props.isPrivate
  )

  const isUserMatterAdmin =
    props.matterAdmins.filter(u => u.user.username === props.currentUser) !==
    null

  const getPrivateWorkstreamTitle = () => (
    <div className={classNames(classes.column, classes.title)}>
      <Typography variant="h6" data-test="private-workstream-people-title">
        {t('project.overview.people.headers.tableHeader_private')}
      </Typography>
      {isUserMatterAdmin ? (
        <>
          <Typography
            variant="caption"
            data-test="private-workstream-people-subtitle"
          >
            {t(
              'project.overview.people.headers.privateTableSubtitlePartial1of2'
            )}
          </Typography>
          <JuralioLink
            data-test="link-to-matter-admin"
            variant="caption"
            onClick={() =>
              history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
                state: {
                  tabItem: 2,
                  workstreamId: getProjectIdFromLocation(location),
                },
              })
            }
            value={t(
              'project.overview.people.headers.privateTableSubtitleLink'
            )}
          />
          <Typography
            variant="caption"
            data-test="private-workstream-people-subtitle"
          >
            {t(
              'project.overview.people.headers.privateTableSubtitlePartial2of2'
            )}
          </Typography>
        </>
      ) : (
        <Typography
          variant="caption"
          data-test="private-workstream-people-subtitle"
        >
          {t('project.overview.people.headers.privateTableSubtitle')}
        </Typography>
      )}
    </div>
  )

  const columns = [
    {
      field: 'displayName',
      headerName: t('common.name'),
      flex: 2,
      filterable: false,
      sortable: true,
      renderCell: params =>
        renderUserColumn(
          t,
          userColumnClasses.classes,
          params.row._user,
          props.currentUser
        ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'email',
      headerName: t('common.email'),
      flex: 2,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    // {
    //   field: 'groupName',
    //   headerName: t('common.group'),
    //   flex: 1,
    //   filterable: true,
    //   sortable: true,
    //   getApplyQuickFilterFn: () => () => false,
    // },
    {
      field: 'matterRolesDisplay',
      headerName: t('project.overview.people.headers.matterRoles'),
      flex: 1.5,
      filterable: false,
      sortable: false,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'taskCount',
      headerName: t('project.overview.people.headers.inProgressTasks'),
      flex: 1,
      filterable: false,
      sortable: true,
      renderCell: params => (
        <Typography
          data-test="active-task-count"
          style={{ textAlign: 'center' }}
          variant="caption"
        >
          {params.value}
        </Typography>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  return (
    <div data-test="projectPeopleTable">
      <JuralioTable
        title={
          props.isPrivate ? (
            getPrivateWorkstreamTitle()
          ) : (
            <Typography variant="h6" component="span" className={classes.title}>
              {props.isMatterOverview
                ? t('project.overview.people.headers.matterTableHeader')
                : t('project.overview.people.headers.tableHeader')}
            </Typography>
          )
        }
        columns={columns}
        rows={rows}
        //filters={filters}
        tableBodyHeight="calc(100vh - 360px)"
      />
    </div>
  )
}

ProjectPeopleTable.propTypes = {
  matterAdmins: PropTypes.array,
  teamOnProject: PropTypes.array,
}

export default ProjectPeopleTable
