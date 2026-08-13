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

import DownloadIcon from '@mui/icons-material/Download'
import HistoryIcon from '@mui/icons-material/History'
import { Box, Button, CircularProgress } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import NoContent from '../../../components/data-display/no-content/NoContent'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import HistoryFilterBar from './filters/HistoryFilterBar'
import HistoryEventGroup from './HistoryEventGroup'
import { groupHistoryEvents } from './history-grouping'

const useStyles = makeStyles()(theme => ({
  root: {
    margin: 'auto',
    maxWidth: theme.spacing(120),
    width: '100%',
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
  },
  centred: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  loadMore: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  downloadButton: {
    marginBottom: theme.spacing(1),
  },
}))

const MatterHistory = ({
  events,
  nextCursor,
  filters,
  filterOptions,
  loading,
  loadingMore,
  exporting,
  error,
  currentUser,
  onFilterChange,
  onLoadMore,
  onDownloadCsv,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const groups = groupHistoryEvents(events)

  return (
    <div className={classes.root} data-test="matter-history-panel">
      <Box className={classes.toolbar}>
        <div className={classes.titleWrap}>
          <PanelTitle
            icon={<HistoryIcon />}
            header={t('matterHistory.header')}
            caption={t('matterHistory.subheader')}
          />
        </div>
        <Button
          className={classes.downloadButton}
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onDownloadCsv}
          disabled={exporting || events.length === 0}
          data-test="history-download-csv"
        >
          {t('matterHistory.downloadCsv')}
        </Button>
      </Box>

      <HistoryFilterBar
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={onFilterChange}
      />

      {loading && (
        <div className={classes.centred} data-test="history-loading">
          <CircularProgress />
        </div>
      )}

      {!loading && error && <NoContent>{t('matterHistory.error')}</NoContent>}

      {!loading && !error && events.length === 0 && (
        <NoContent>{t('matterHistory.empty')}</NoContent>
      )}

      {!loading &&
        !error &&
        groups.map(group => (
          <HistoryEventGroup
            key={group.id}
            group={group}
            currentUser={currentUser}
          />
        ))}

      {!loading && nextCursor && (
        <div className={classes.loadMore}>
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            data-test="history-load-more"
          >
            {loadingMore
              ? t('matterHistory.loadingMore')
              : t('matterHistory.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default MatterHistory
