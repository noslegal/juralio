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
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  DialogContentText,
  TextField,
  Typography,
  DialogContent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import matterService from '../../../../services/matter/matter-service'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { makeStyles } from 'tss-react/mui'
import WarningIcon from '@mui/icons-material/WarningAmber'
import {
  fetchMatterOverview,
  updateMatterDetails,
} from '../../matter-details-actions'
import {
  getMatterIdFromLocation,
  getMatterAdminUrl,
} from '../../../../components/navigation/common/location-context-helper'
import { useLocation } from 'react-router'
import { useNavigate } from 'react-router-dom'
import BigDataSpinner from '../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { fetchTeam } from '../../../../redux/ducks/matter-team'
import { POSITIONS } from '../../../constants'
import GroupAvatar from '../../../../components/layouts/manage-users/GroupAvatar'
import JuralioTable from '../../../../components/table/JuralioTable'

const useStyles = makeStyles()(() => ({
  container: {
    width: '100%',
  },
  marginBottom16: {
    marginBottom: '16px',
  },
  marginTop16: {
    marginTop: '16px',
  },
  groupCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}))

const GroupPositionTable = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { team } = props
  const [value, setValue] = useState('')
  const [showPositionDialog, setShowPositionDialog] = useState(false)
  const [row, setRow] = useState()
  const [rows, setRows] = useState([])
  const matterOverview = useSelector(state => state.matterDetails.overview)
  const [newValue, setNewValue] = useState()
  const location = useLocation()
  const matterId = getMatterIdFromLocation(location)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    dispatch(fetchMatterOverview(matterId)).then(res => {
      setIsLoading(false)
    })
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (matterOverview?.positionsOfGroups) {
      setRows(
        matterOverview.positionsOfGroups.map((item, index) => ({
          id: index,
          group: item.group,
          position: item.position.id,
        }))
      )
    }
  }, [matterOverview])

  const handlePositionChange = () => {
    matterService
      .updateGroupPosition(matterOverview.id, {
        groupId: row.group.id,
        positionId: newValue,
      })
      .then(() => {
        const newRows = rows.map(r => ({
          ...r,
          position: matterOverview.positionsForMatter.filter(
            pos => pos.positionId !== r.position
          )[0].positionId,
        }))
        setRows(newRows)
        setShowPositionDialog(false)

        const otherRow = rows.find(r => r.group.id !== row.group.id)
        const newClientName =
          matterOverview.positionsForMatter.filter(
            x => x.positionId === newValue
          )[0].name === POSITIONS.CLIENT.name
            ? row.group.name
            : otherRow
              ? otherRow.group.name
              : '-'

        dispatch(
          updateMatterDetails(matterId, {
            clientName: newClientName,
            department: '',
          })
        )
        navigate(getMatterAdminUrl(matterId), {
          state: { tabItem: 0 },
        })
      })
  }

  const handleDelete = group => {
    dispatch(
      displayConfirmationDialog(
        {
          actionText: t('common.confirm'),
          titleText: t(
            'matterAdmin.people.groupPositionTable.removeGroupTitle',
            { group: group.name }
          ),
          promptText: t(
            'matterAdmin.people.groupPositionTable.removeGroupPrompt1'
            // {
            //   count: team.map(x => x.organisationGroup).includes(undefined)
            //     ? ''
            //     : team.filter(x => x.organisationGroup.id === group.id).length,
            // }
          ),
          extraComponent: (
            <DialogContentText className={classes.marginTop16}>
              {t('matterAdmin.people.groupPositionTable.removeGroupPrompt2')}
            </DialogContentText>
          ),
          usageContext: 'removeGroup',
          dontTranslatePromptText: true,
          cancel: () => {},
        },
        () => {
          matterService
            .deleteGroupFromMatter(matterOverview.id, group.id)
            .then(res => {
              if (res.status === 200) {
                setRows(prev => prev.filter(r => r.group.id !== group.id))
                //refetch if switch back to users page
                dispatch(fetchTeam(matterId, false, true))
              }
            })
        }
      )
    )
  }

  const columns = [
    {
      field: 'group',
      headerName: t('matterAdmin.people.groupPositionTable.groupHeader'),
      flex: 1,
      renderCell: params => {
        const group = params.row.group
        return (
          <div className={classes.groupCell}>
            <GroupAvatar
              group={group}
              orgId={group.organisationId}
              editable={false}
            />
            <span>{group.name}</span>
          </div>
        )
      },
    },
    {
      field: 'position',
      headerName: t('matterAdmin.people.groupPositionTable.positionHeader'),
      flex: 1, // equal width
      renderCell: params => {
        return (
          <Select
            value={params.row.position}
            size="small"
            fullWidth
            onChange={e => {
              setRow(params.row)
              setNewValue(e.target.value)
              setShowPositionDialog(true)
            }}
          >
            {matterOverview.positionsForMatter.map(position => (
              <MenuItem value={position.positionId}>{position.name}</MenuItem>
            ))}
          </Select>
        )
      },
    },
    {
      field: 'delete',
      headerName: t('matterAdmin.people.groupPositionTable.deleteHeader'),
      flex: 1, // equal width
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Tooltip
          title={
            params.row.group.isInternal
              ? t('matterAdmin.people.groupPositionTable.internalGroupTooltip')
              : ''
          }
        >
          <span>
            <IconButton
              disabled={params.row.group.isInternal}
              onClick={() => handleDelete(params.row.group)}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ]

  if (isLoading === true) {
    return <BigDataSpinner size={100} />
  }

  return (
    <Box className={classes.container}>
      {showPositionDialog && (
        <JuralioDialog
          titleIcon={WarningIcon}
          handleCancel={() => {
            setRow()
            setNewValue()
            setShowPositionDialog(false)
          }}
          handleAction={handlePositionChange}
          actionLabel={t('common.confirm')}
          disabled={value !== 'UPDATE'}
          open={showPositionDialog}
          titleText={t(
            'matterAdmin.people.groupPositionTable.switchPositionTitle'
          )}
        >
          <DialogContent>
            <Typography className={classes.marginBottom16}>
              {t(
                'matterAdmin.people.groupPositionTable.switchPositionCostsWarning'
              )}
            </Typography>
            {rows.length > 1 && (
              <Typography className={classes.marginBottom16}>
                {t(
                  'matterAdmin.people.groupPositionTable.switchPositionExternalWarning'
                )}
              </Typography>
            )}
            <Typography>
              {t(
                'matterAdmin.people.groupPositionTable.switchPositionTypeConfirm'
              )}
            </Typography>
            <TextField
              variant="outlined"
              value={value}
              onChange={e => {
                setValue(e.target.value)
              }}
            />
          </DialogContent>
        </JuralioDialog>
      )}
      <JuralioTable
        rows={rows}
        columns={columns}
        tableBodyHeight={400}
        hideToolbar
        hideFooter
        initialPageSize={100}
      />
    </Box>
  )
}
export default GroupPositionTable
