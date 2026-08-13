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

import SettingsIcon from '@mui/icons-material/Settings'
import { Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import StatusSelect from '../../../../components/inputs/status-select/StatusSelect'
import UserList from '../../../../components/layouts/user-list/UserList'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { clearErrorMessage } from '../../../../redux/actions/global-projects-actions'
import { compareStrings } from '../../../../services/helpers/table/juralio-table-sorting-helper'
import rawColours from '../../../../theme/raw-colours'
import { OPERATION_MODE } from '../../../constants'
import { updateProject } from '../../../project/project-actions'
import UsersControlContainer from '../../../users/UsersControlContainer'
import { generateClosedRow, generateOpenRow } from './creator-closer-row-helper'
import ProjectName from './ProjectName'
import processData from './projects-table-data-provider'
import ProjectsTable from './ProjectsTable.js'
import ProjectStatusToggle from './ProjectStatusToggle'

const styles = theme => ({
  row: {
    display: 'flex',
  },
  settingsIcon: {
    color: rawColours.primary.black[200],
    marginLeft: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    cursor: 'pointer',
  },
})

const ProjectsTableContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isViewOnly = useIsViewOnly({ activities: [] })
  const [rows, setRows] = useState([])

  useEffect(() => {
    const processed = processData(t, props.data)
    setRows(processed.sort((a, b) => a._project.id - b._project.id))
  }, [props.data, t])

  const openWorkstreamDetails = params => {
    props.setSelectedWorkstreamIndex(
      props.data.findIndex(d => d.name === params.row._project.name)
    )
  }

  const _updateProject = (matterId, workstreamId, properties) =>
    dispatch(updateProject(matterId, workstreamId, properties))

  const _clearErrorMessage = projectId => dispatch(clearErrorMessage(projectId))

  const columns = [
    {
      field: '_project',
      headerName: t('entity.workstream'),
      flex: 2,
      minWidth: 400,
      filterable: false,
      sortable: true,
      sortComparator: (v1, v2) => compareStrings(v1.name, v2.name),
      renderCell: params => (
        <div data-test="project-list-item">
          <ProjectName
            project={params.row._project}
            mode={OPERATION_MODE.EDIT}
            matterId={props.matterId}
            actions={{
              updateProject: _updateProject,
              clearErrorMessage: _clearErrorMessage,
            }}
          />
        </div>
      ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'active',
      headerName: props.readOnly ? '' : t('common.status'),
      flex: 1,
      filterable: !props.readOnly,
      sortable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: true, label: t('common.active') },
        { value: false, label: t('common.closed') },
      ],
      renderCell: params => {
        if (props.readOnly) return null
        return (
          <ProjectStatusToggle
            currentValue={params.row.active}
            readOnly={isViewOnly}
            updateStatus={() => {
              if (params.row.active) {
              } else {
              }
              props.actions
                .updateProject(props.matterId, params.row._project.id, {
                  active: !params.row.active,
                })
                .then(() =>
                  props.actions.fetchMatterDetails(props.matterId, false)
                )
            }}
          />
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'isPrivate',
      headerName: t('common.visibility'),
      flex: 1,
      filterable: !props.readOnly,
      sortable: false,
      type: 'singleSelect',
      valueOptions: [
        { value: true, label: t('common.private') },
        { value: false, label: t('common.notPrivate') },
      ],
      renderCell: params => (
        <StatusSelect
          darkChevron={params.row.isPrivate}
          options={{
            optionOnValue: true,
            optionOnName: t('common.private'),
            optionOffValue: false,
            optionOffName: t('common.notPrivate'),
          }}
          style={{
            on: {
              backgroundColor: rawColours.primary.black[200],
              color: 'white',
              paddingLeft: 4,
              paddingright: 8,
            },
            off: {
              color: 'black',
              backgroundColor: 'Gainsboro',
            },
          }}
          currentValue={params.row.isPrivate}
          updateStatus={e => {
            props.actions
              .updateProject(props.matterId, params.row._project.id, {
                isPrivate: e.target.value,
              })
              .then(() =>
                props.actions.fetchMatterDetails(props.matterId, false)
              )
          }}
          readOnly={isViewOnly}
        />
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'privateTeam',
      headerName: t('common.whoCanSee'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => {
        if (params.row.privateTeam === null) {
          return (
            <Typography variant="caption">
              {t('matterAdmin.workstreams.everyoneCanSeeThis')}
            </Typography>
          )
        }
        return (
          <div className={props.classes.row}>
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
            <Tooltip
              title={t(
                'matterAdmin.workstreams.editWhoCanSeePrivateWorkstream'
              )}
            >
              <SettingsIcon
                className={props.classes.settingsIcon}
                data-test="private-workstream-settings"
                onClick={() => openWorkstreamDetails(params)}
              />
            </Tooltip>
          </div>
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'creatorCloser',
      headerName: t('common.created') + ' / ' + t('common.closed'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => {
        const value = params.row.creatorCloser
        if (value[0][2] === true)
          return generateOpenRow(value, props.classes, t)
        if (value[0][2] === false)
          return generateClosedRow(value, props.classes, t)
      },
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  return (
    <ProjectsTable
      actions={props.actions}
      columns={columns}
      rows={rows}
      matterId={props.matterId}
      mode={OPERATION_MODE.VIEW}
      readOnly={true}
      toggleStatus={props.toggleStatus}
      openHandler={openWorkstreamDetails}
    />
  )
}

export default withStyles(ProjectsTableContainer, styles)
