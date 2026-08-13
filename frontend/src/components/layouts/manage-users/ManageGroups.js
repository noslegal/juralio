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

import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, IconButton, MenuItem, Select, Typography } from '@mui/material'
import { DeleteIcon } from '../../../theme/navigation/CommonIcons'
import GroupsIcon from '@mui/icons-material/Groups'
import { Box } from '@mui/system'
import { MuiDataGridTheme } from '../../../services/helpers/table/juralio-table-theme-helper'
import { renderHeaderWithToolTip } from '../../../services/helpers/table/juralio-table-helper'
import juralioColours from '../../../theme/juralio-colours'
import organisationService from '../../../services/organisation/organisation-service'
import CreateGroupDialog from './CreateGroupDialog'
import GroupAvatar from './GroupAvatar'
import GroupImageDialog from './GroupImageDialog'
import ConfirmationDialog from '../../dialog/confirmation-dialog/ConfirmationDialog'
import { useTranslation } from 'react-i18next'
import { cloneDeep } from 'lodash'
import { makeStyles } from 'tss-react/mui'
import JurGroupAdd from '../../../assets/images/JurGroupAdd'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  tableTitle: {
    display: 'flex',
    marginBottom: theme.spacing(),
  },
  title: {
    marginLeft: theme.spacing(),
  },
  usersSummary: { display: 'flex', flexDirection: 'row' },
  count: {
    fontWeight: theme.typography.fontWeightBold,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  addPersonButton: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
  buttonSpan: {
    width: 'max-content',
  },
  buttonDiv: {
    display: 'flex',
  },
  editMsgButton: {
    marginTop: theme.spacing(2),
    width: 'auto',
    marginLeft: 'auto',
  },
  logoCellWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  subtitleRow: {
    marginBottom: theme.spacing(2),
  },
  addGroupButton: {
    marginLeft: 'auto',
    marginTop: theme.spacing(0.5),
  },
  dataGridWrapper: {
    minHeight: 400,
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyItems: 'center',
  },
  infoIcon: {
    paddingLeft: theme.spacing(1),
    color: juralioColours.darkText.secondary,
  },
  dataGrid: {
    ...MuiDataGridTheme,
    '& .MuiDataGrid-row.internal-row': {
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
    '& .MuiDataGrid-row.internal-row .MuiDataGrid-cell': {
      backgroundColor: 'rgba(0,0,0,0.08)',
    },
  },
}))

const ManageGroups = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [groups, setGroups] = useState([])
  const [rows, setRows] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editLogoGroup, setEditLogoGroup] = useState(null)

  useEffect(() => {
    organisationService.getGroupsForOrg(props.organisationId).then(res => {
      if (res.status === 200) {
        setGroups(res.body)
      }
    })
  }, []) //eslint-disable-line

  useEffect(() => {
    setRows(
      groups
        .sort((a, b) => b.isInternal - a.isInternal)
        .map((g, index) => {
          return {
            id: g.id,
            group: g,
            name: g.name,
            position: g.defaultPosition.name === 'Client' ? 0 : 1,
            numUsers: g.userCount,
            numMatters: g.matterCount,
            rowIdx: index,
            delete: g.userCount > 0 ? false : true,
            customLogo: g.customLogo,
          }
        })
    )
  }, [groups])

  const columns = [
    {
      field: 'customLogo',
      headerName: '',
      width: 60,
      editable: false,
      flex: 0,
      sortable: false,
      renderHeader: () => null,
      align: 'center',
      renderCell: params => (
        <div className={classes.logoCellWrapper}>
          <GroupAvatar
            group={params.row.group}
            orgId={props.organisationId}
            editable={true}
            onEdit={group => setEditLogoGroup(group)}
          />
        </div>
      ),
    },
    {
      field: 'name',
      headerName: t('common.name'),
      width: 90,
      editable: true,
      flex: 1,
      renderCell: params => {
        let value = params.value
        if (params.row.group.isInternal) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography dataTest="groupName">
                <b>
                  {value}
                  <br />
                  <i>{t('organisationAdmin.groups.internal')}</i>
                </b>
              </Typography>
            </Box>
          )
        } else {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography dataTest="groupName">{value}</Typography>
            </Box>
          )
        }
      },
    },
    {
      field: 'position',
      headerName: t('organisationAdmin.groups.positionHeader'),
      width: 120,
      editable: false,
      flex: 1,
      renderHeader: () =>
        renderHeaderWithToolTip(
          classes,
          t('organisationAdmin.groups.positionHeader'),
          t('organisationAdmin.groups.positionTT')
        ),
      // Custom cell renderer to display a selector
      renderCell: params => {
        let value = params.value
        const handleChange = event => {
          // Stop propagation to prevent DataGrid's row click or selection events
          event.stopPropagation()
          setShowConfirmSwitch({
            newValue: event.target.value,
            rowIdx: params.row.rowIdx,
            id: params.row.id,
          })
        }

        //options map over positions once added
        return (
          <Select
            dataTest="position-selector"
            value={value}
            label={t('organisationAdmin.groups.positionHeader')}
            onChange={handleChange}
            variant="outlined"
          >
            <MenuItem dataTest="clientChoice" value={0}>
              {t('matterDetails.client')}
            </MenuItem>
            <MenuItem dataTest="advisorChoice" value={1}>
              {t('matterDetails.advisor')}
            </MenuItem>
          </Select>
        )
      },
    },
    {
      field: 'numUsers',
      headerName: t('organisationAdmin.groups.userCountHeader'),
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      editable: false,
      flex: 1,
    },
    {
      field: 'numMatters',
      headerName: t('organisationAdmin.groups.matterCountHeader'),
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      editable: false,
      flex: 1,
    },

    {
      field: 'delete',
      headerName: t('common.delete'),
      width: 120,
      editable: false,
      flex: 0.5,
      // Custom cell renderer to display a Button
      renderCell: params => {
        const show = params.value

        const handleClick = event => {
          // Stop propagation to prevent DataGrid's row click or selection events
          event.stopPropagation()
          setShowDelete(params.row)
        }
        if (show) {
          return (
            <IconButton
              data-test="delete-group"
              variant="contained"
              color="disabled"
              size="small"
              onClick={handleClick}
            >
              <DeleteIcon />
            </IconButton>
          )
        } else {
          return <></>
        }
      },
    },
  ]

  return (
    <>
      <div dataTest="group-table">
        <div className={classes.tableTitle}>
          <GroupsIcon />
          <Typography
            data-test="table-title"
            variant={'subtitle1'}
            className={classes.title}
          >
            {t('organisationAdmin.groups.header')}
          </Typography>
        </div>
        <div className={classes.subtitleRow}>
          <Typography data-test="table-subtitle">
            {t('organisationAdmin.groups.subtitle', {
              groupCount: groups.length,
              s: groups.length > 1 ? 's' : '',
            })}
          </Typography>
          <Button
            startIcon={<JurGroupAdd />}
            data-test="new-group"
            className={classes.addGroupButton}
            variant="outlined"
            onClick={() => {
              setShowDialog(true)
            }}
          >
            {t('organisationAdmin.groups.add')}
          </Button>
        </div>
        <Box className={classes.dataGridWrapper}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            disableColumnMenu
            disableColumnSorting
            getRowClassName={params =>
              params.row.group.isInternal ? 'internal-row' : ''
            }
            processRowUpdate={(updatedRow, originalRow) => {
              organisationService.updateGroup(
                props.organisationId,
                updatedRow.id,
                {
                  name: updatedRow.name,
                }
              )
              return updatedRow
            }}
            onProcessRowUpdateError={e => {}}
            // onCellEditStop={(params, event) => {
            //   console.log(params, event)
            // }}
            className={classes.dataGrid}
          />
        </Box>
      </div>
      <CreateGroupDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        orgId={props.organisationId}
        groups={groups}
        setSelectedOrgGroups={setGroups}
      />
      {showDelete && (
        <ConfirmationDialog
          titleText={t('organisationAdmin.groups.deleteDialogTitle')}
          promptText={t('organisationAdmin.groups.deleteDialogBody')}
          actionText={t('common.delete')}
          cancelHandler={() => {
            setShowDelete(false)
          }}
          actionHandler={() => {
            organisationService
              .deleteGroup(props.organisationId, showDelete.id)
              .then(res => {
                if (res.status === 200) {
                  let rowIdx = showDelete.rowIdx
                  let a = cloneDeep(rows)
                  a.splice(rowIdx, 1)
                  setRows([...a])
                  setShowDelete(false)
                }
              })
          }}
        />
      )}
      {editLogoGroup && (
        <GroupImageDialog
          group={editLogoGroup}
          orgId={props.organisationId}
          onClose={() => setEditLogoGroup(null)}
          onLogoChange={(groupId, hasLogo) => {
            setGroups(prev =>
              prev.map(g =>
                g.id === groupId ? { ...g, customLogo: hasLogo } : g
              )
            )
          }}
        />
      )}
      {showConfirmSwitch && (
        <ConfirmationDialog
          titleText={t('organisationAdmin.groups.positionChangeDialogHeader')}
          promptText={t('organisationAdmin.groups.positionChangeDialogBody', {
            position: showConfirmSwitch.newValue
              ? t('matterDetails.advisor')
              : t('matterDetails.client'),
          })}
          actionText={t('common.confirm')}
          cancelHandler={() => {
            setShowConfirmSwitch(false)
          }}
          actionHandler={() => {
            let a = rows
            a[showConfirmSwitch.rowIdx].position = showConfirmSwitch.newValue
            setRows([...a])
            //will do a backend save after matter stage
            organisationService
              .updateGroup(props.organisationId, showConfirmSwitch.id, {
                positionId: showConfirmSwitch.newValue,
              })
              .then(res => {
                setShowConfirmSwitch(false)
              })
          }}
        />
      )}
    </>
  )
}
export default ManageGroups
