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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  applyHistoryFilters,
  downloadHistoryCsv,
  fetchHistory,
  fetchHistoryFilterOptions,
  resetHistory,
} from '../../../redux/ducks/matter-history'
import MatterHistory from './MatterHistory'

const MatterHistoryContainer = ({ matter }) => {
  const dispatch = useDispatch()
  const matterId = matter?.id
  const {
    events,
    nextCursor,
    filters,
    filterOptions,
    loading,
    loadingMore,
    exporting,
    error,
  } = useSelector(state => state.matterHistory)
  const currentUser = useSelector(state => state.auth.data.auth)

  useEffect(() => {
    if (!matterId) return undefined
    dispatch(fetchHistoryFilterOptions(matterId))
    dispatch(fetchHistory(matterId, { append: false }))
    return () => dispatch(resetHistory())
  }, [matterId, dispatch])

  const handleFilterChange = updatedFilters =>
    dispatch(applyHistoryFilters(matterId, updatedFilters))

  const handleLoadMore = () =>
    dispatch(fetchHistory(matterId, { append: true }))

  const handleDownloadCsv = () => dispatch(downloadHistoryCsv(matterId))

  return (
    <MatterHistory
      matter={matter}
      events={events}
      nextCursor={nextCursor}
      filters={filters}
      filterOptions={filterOptions}
      loading={loading}
      loadingMore={loadingMore}
      exporting={exporting}
      error={error}
      currentUser={currentUser}
      onFilterChange={handleFilterChange}
      onLoadMore={handleLoadMore}
      onDownloadCsv={handleDownloadCsv}
    />
  )
}

export default MatterHistoryContainer
