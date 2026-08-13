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
import { Button, Paper, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import WithLoader from '../../components/feedback/with-loader/WithLoader'
import JuralioTable from '../../components/table/JuralioTable'
import {
  compareNumbersDescending,
  compareStrings,
} from '../../services/helpers/table/juralio-table-sorting-helper'
import matterService from '../../services/matter/matter-service'
import { DeleteIcon } from '../../theme/navigation/CommonIcons'
import { MATTER_STATUS } from '../constants'
import { displayConfirmationDialog } from '../global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { updateMatterDetails } from '../matter-details/matter-details-actions'
import { updateSingleMatter } from '../matter-list/matter-list-actions'
import ClientMatterAvatar from './ClientMatterAvatar'

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
    justifyItems: 'center',
  },
  headerIcon: { paddingRight: theme.spacing() },
  headerTitle: { display: 'flex', flexDirection: 'row', alignItems: 'center' },
}))

const DeletedMattersList = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const t = props.t
  const [matters, setMatters] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  const _DeletedMattersList = innerProps => (
    <JuralioTable
      title={innerProps.title}
      rows={innerProps.rows}
      columns={innerProps.columns}
      rowDataTest="deleted-matters-list-item"
      noRowsText={t('search.noResults')}
      tableBodyHeight="calc(100vh - 360px)"
    />
  )

  const SpinnerTable = WithLoader(200)(_DeletedMattersList)

  const fetchDeletedMatterLogs = () => {
    matterService.getDeletedMatterLogs().then(res => {
      if (res.status === 200) {
        setIsLoaded(true)
        setMatters(res.body)
      } else {
        dispatch(showSnackbar(t('common.error')))
      }
    })
  }

  const handleMatterRestore = (e, matter) => {
    e.stopPropagation()
    const confirmOptions = {
      actionText: t('common.restore'),
      titleText: t('matterDeletion.restoreConfirmationTitle', {
        matterName: matter.matterName,
      }),
      promptText: t('matterDeletion.restoreConfirmationPrompt'),
      usageContext: 'RestoreDeletedMatter',
      headerIcon: ReplayIcon,
      dontTranslatePromptText: true,
      cancel: () => {},
    }
    dispatch(
      displayConfirmationDialog(confirmOptions, () => {
        dispatch(
          updateMatterDetails(matter.matterId, {
            matterStatus: MATTER_STATUS.ACTIVE,
          })
        )
          .then(() => {
            dispatch(
              updateSingleMatter(matter.matterId, {
                matterStatus: MATTER_STATUS.ACTIVE,
              })
            )
          })
          .then(() => {
            dispatch(showSnackbar(t('matterDeletion.restoreMatterSuccess')))
            fetchDeletedMatterLogs()
          })
      })
    )
  }

  useEffect(() => {
    fetchDeletedMatterLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDaysRemaining = date => {
    const deletedDate = new Date(date)
    deletedDate.setDate(deletedDate.getDate() + 30)
    const daysRemaining = Math.max(
      Math.floor(
        (deletedDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      ),
      0
    )
    if (daysRemaining === 0) {
      return '< 1'
    }
    return daysRemaining
  }

  const formatDeletionDate = date => {
    const deleteDate = new Date(date)
    return `${deleteDate.toLocaleDateString()} ${t(
      'common.at'
    )} ${deleteDate.toLocaleTimeString()}`
  }

  const columns = [
    {
      field: 'matter',
      headerName: t('organisationAdmin.matters.matterClient'),
      flex: 2,
      filterable: false,
      sortable: true,
      renderCell: params => <ClientMatterAvatar matter={params.row.matter} />,
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'deletedBy',
      headerName: t('matterDeletion.deletedBy'),
      flex: 1,
      filterable: false,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'deletedOn',
      headerName: t('matterDeletion.deletedOn'),
      flex: 1,
      filterable: false,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'status',
      headerName: t('common.status'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => {
        const matterLog = params.row.matter
        const deleteDate = matterLog.permanentlyDeleted
          ? formatDeletionDate(matterLog.permanentlyDeleted)
          : getDaysRemaining(matterLog.markedForDeletion)
        return matterLog.permanentlyDeleted ? (
          <>
            <Typography
              style={{ paddingLeft: 4, fontSize: 'unset', fontWeight: 700 }}
              data-test="matter-permanently-deleted"
            >
              {t('matterDeletion.permanentlyDeleted')}
            </Typography>
            <Typography
              style={{ paddingLeft: 4, fontSize: 'unset' }}
              data-test="matter-permanently-deleted"
            >
              {deleteDate}
            </Typography>
          </>
        ) : (
          <>
            <Typography
              style={{ paddingLeft: 4, fontSize: 'unset' }}
              data-test="matter-delete-days-left"
            >{`${deleteDate} ${t('matterDeletion.daysLeft', {
              plural: deleteDate > 1 ? 's' : '',
            })}`}</Typography>
            <Button
              startIcon={<ReplayIcon />}
              size="small"
              data-test="restore-deleted-matter-button"
              onClick={e => handleMatterRestore(e, matterLog)}
            >
              {t('common.restore')}
            </Button>
          </>
        )
      },
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = matters
    .sort((a, b) => compareStrings(a.matterClient, b.matterClient))
    .sort((a, b) =>
      compareNumbersDescending(a.markedForDeletion, b.markedForDeletion)
    )
    .map(matter => ({
      id: matter.matterId,
      matter,
      deletedBy: matter.deletedBy,
      deletedOn: formatDeletionDate(matter.markedForDeletion),
      _search: `${matter.matterClient} ${matter.matterName}`.toLowerCase(),
    }))

  const renderTableHeader = () => (
    <div className={classes.header}>
      <div className={classes.headerTitle}>
        <DeleteIcon className={classes.headerIcon} />
        <Typography
          data-test="deleted-matters-table-title"
          variant={'h6'}
          className={classes.title}
          style={{ paddingRight: 4 }}
        >
          {t('matterDeletion.deletedMatters')}
        </Typography>
      </div>
      <Typography
        data-test="deleted-matters-table-subheader"
        variant={'caption'}
        className={classes.title}
        style={{ paddingLeft: 4, paddingTop: 4 }}
      >
        {t('matterDeletion.panelSubheader')}
      </Typography>
    </div>
  )

  return (
    <Paper style={{ padding: '24px' }}>
      <SpinnerTable
        isLoaded={isLoaded}
        title={renderTableHeader()}
        rows={rows}
        columns={columns}
      />
    </Paper>
  )
}
export default DeletedMattersList
