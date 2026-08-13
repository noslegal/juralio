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

import ReplayIcon from '@mui/icons-material/Replay'
import { Button, IconButton, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { displayConfirmationDialog } from '../../../app/global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import JuralioLink from '../../../components/navigation/juralio-link/JuralioLink'
import api from '../../../services/helpers/fetch/fetch-helper.js'
import { compareStrings } from '../../../services/helpers/table/juralio-table-sorting-helper'
import { DeleteIcon } from '../../../theme/navigation/CommonIcons'
import OrganisationAvatar from '../common/OrganisationAvatar'
import processData from './organisations-table-data-provider'
import OrganisationsTable from './OrganisationsTable.js'
import OrganisationStatusToggle from './OrganisationStatusToggle'

const useStyles = makeStyles()(theme => ({
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.background.default,
  },
}))

const OrganisationsTableContainer = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { setSelectedOrganisation } = props
  const dispatch = useDispatch()

  const openOrganisationDetails = params => {
    const org = params.row._org
    if (
      typeof org.permanentlyDeleted === 'string' &&
      !org.isPendingDeletion &&
      org.permanentlyDeleted
    )
      return
    setSelectedOrganisation(org)
  }

  const handleOrgDeleteRestore = (e, org, isDelete) => {
    e.stopPropagation()

    const confirmOptions = {
      actionText: isDelete ? t('common.delete') : t('common.restore'),
      titleText: isDelete
        ? t('matterDeletion.deleteConfirmationTitle', { matterName: org.name })
        : t('matterDeletion.restoreConfirmationTitle', {
            matterName: org.name,
          }),
      promptText: isDelete
        ? t('sysAdmin.manageOrganisations.deleteConfirmationPrompt')
        : t('sysAdmin.manageOrganisations.restoreConfirmationPrompt'),
      usageContext: isDelete ? 'DeleteOrganisation' : 'RestoreOrganisation',
      headerIcon: isDelete ? DeleteIcon : ReplayIcon,
      dontTranslatePromptText: true,
      cancel: () => {},
    }
    isDelete
      ? dispatch(
          displayConfirmationDialog(confirmOptions, () => {
            api(`organisations/${org.id}`, 'DELETE').then(res => {
              if (res.status === 200) {
                dispatch(
                  showSnackbar(t('sysAdmin.manageOrganisations.deleteSuccess'))
                )
                props.getOrganisations()
              } else {
                dispatch(showSnackbar(t('common.error')))
              }
            })
          })
        )
      : dispatch(
          displayConfirmationDialog(confirmOptions, () => {
            api(`organisations/${org.id}/restore`, 'POST', {
              id: org.id,
            }).then(res => {
              if (res.status === 200) {
                dispatch(
                  showSnackbar(t('sysAdmin.manageOrganisations.restoreSuccess'))
                )
                props.getOrganisations()
              } else {
                dispatch(showSnackbar(t('common.error')))
              }
            })
          })
        )
  }

  const formatDeletionDate = date => {
    const deleteDate = new Date(date)
    return `${deleteDate.toLocaleDateString()} ${t(
      'common.at'
    )} ${deleteDate.toLocaleTimeString()}`
  }

  const getDeletionDate = date => {
    const deletedDate = new Date(date)
    deletedDate.setDate(deletedDate.getDate() + 30)
    return deletedDate
  }

  const columns = [
    {
      field: '_org',
      headerName: t('entity.organisation'),
      flex: 2,
      filterable: false,
      sortable: true,
      sortComparator: (v1, v2) => compareStrings(v1.name, v2.name),
      renderHeader: () => (
        <span data-test="organisation-name-header">
          {t('entity.organisation')}
        </span>
      ),
      renderCell: params => {
        const org = params.row._org
        return (
          <div className={classes.nameCell} data-test="organisation-name">
            <OrganisationAvatar
              organisation={org}
              editable={!org?.permanentlyDeleted}
            />
            <JuralioLink variant="caption" value={org.name} />
            {org.isFrozen && (
              <Typography variant="caption" data-test="frozen-org">
                ({t('common.frozen')})
              </Typography>
            )}
          </div>
        )
      },
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'activeUserCount',
      headerName: t('sysAdmin.activeUsers.headerActive'),
      flex: 1,
      filterable: false,
      sortable: true,
      renderHeader: () => (
        <span data-test="active-accounts-header">
          {t('sysAdmin.activeUsers.headerActive')}
        </span>
      ),
      renderCell: params => (
        <span data-test="number-of-active-accounts">{params.value}</span>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'enabled',
      headerName: t('common.status'),
      flex: 1.5,
      filterable: true,
      sortable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: true, label: t('common.active') },
        { value: false, label: t('common.inactive') },
      ],
      renderHeader: () => (
        <span data-test="status-header">{t('common.status')}</span>
      ),
      renderCell: params => {
        const org = params.row._org
        const content =
          !org.isPendingDeletion && org?.permanentlyDeleted ? (
            <Typography>
              {t('sysAdmin.manageOrganisations.permanentlyDeletedStatus', {
                permanentlyDeleted: formatDeletionDate(org?.permanentlyDeleted),
                deletedBy: org?.deletedBy,
              })}
            </Typography>
          ) : org?.isPendingDeletion ? (
            <Tooltip
              title={t('sysAdmin.manageOrganisations.deletionPendingTooltip', {
                markedForDeletion: formatDeletionDate(org?.markedForDeletion),
                deletedBy: org?.deletedBy,
                deletedDate: formatDeletionDate(
                  getDeletionDate(org?.markedForDeletion)
                ),
              })}
            >
              <Typography>
                {t('sysAdmin.manageOrganisations.deletionPending')}
              </Typography>
            </Tooltip>
          ) : (
            <OrganisationStatusToggle
              currentValue={org.enabled.toString()}
              updateStatus={e => {
                props.handleChangeOrganisationActivity(org.id, {
                  enabled: !org.enabled,
                })
                e.preventDefault()
              }}
            />
          )
        return <span data-test="organisation-status">{content}</span>
      },
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'delete',
      headerName: t('common.delete'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => {
        const org = params.row._org
        return org.isPendingDeletion ? (
          <Button
            startIcon={<ReplayIcon />}
            size="small"
            data-test="restore-deleted-org-button"
            onClick={e => handleOrgDeleteRestore(e, org, false)}
          >
            {t('common.restore')}
          </Button>
        ) : org?.permanentlyDeleted ? null : (
          <IconButton
            aria-label="Delete organisation"
            data-test="delete-org-button"
            onClick={e => handleOrgDeleteRestore(e, org, true)}
          >
            <DeleteIcon />
          </IconButton>
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = processData(t, props.organisations)

  const filters = [
    {
      name: 'enabled',
      label: t('common.status'),
      options: [t('common.active'), t('common.inactive')],
      matchFn: (row, selected) =>
        selected.includes(
          row._org.enabled ? t('common.active') : t('common.inactive')
        ),
    },
  ]

  return (
    <OrganisationsTable
      columns={columns}
      rows={rows}
      filters={filters}
      onRowClick={openOrganisationDetails}
    />
  )
}

export default OrganisationsTableContainer
