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

import { Typography, useMediaQuery } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import zeroStateImage from '../../../assets/images/PineTree.png'
import { filterTasksBasedOnFilter } from '../../../services/helpers/task/task-util-helper'
import juralioTheme from '../../../theme/juralio-theme'
import TodoFilter from '../todos/todo-filter/TodoFilter'
import TodoAndRecentlyViewedZeroState from '../zero-state/TodoAndRecentlyViewedZeroState'
import RecentlyVisitedLoadingState from './RecentlyViewedLoadingState'
import RecentlyViewedMatter from './RecentlyViewedMatter'

const useStyles = makeStyles()(theme => ({
  recentTasksPanelZeroState: {
    textAlign: 'center',
    alignItems: 'center',
    paddingTop: '20%',
  },
  recentTasksPanel: {
    height: `calc(100% - ${theme.spacing(8)})`,
  },
}))

const RecentlyViewedMatterList = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { isLoading, recentTasks, handleMatterExpand, expandedMatterId } = props
  const isMobile = useMediaQuery(juralioTheme.breakpoints.down('md'))
  const matters = useSelector(state => state.matters)

  const [filter, setFilter] = useState('')

  const generateSearchBar = () => {
    return (
      <TodoFilter
        setFilter={setFilter}
        filter={filter}
        autoFocus={true}
        context={'recentlyViewed'}
      />
    )
  }

  const filteredTasks = filterTasksBasedOnFilter(filter, recentTasks, matters)

  if (isLoading) {
    return <RecentlyVisitedLoadingState />
  }

  if (recentTasks?.length === 0) {
    return (
      <div
        data-test="home-recent-tasks-panel"
        className={classes.recentTasksPanelZeroState}
      >
        <img
          style={{ pointerEvents: 'none' }}
          width="160"
          height="276"
          src={zeroStateImage}
          alt={t('inboxZeroState.imageAlt')}
          data-test="zero-state-image"
        />
        <Typography variant="h5" data-test="home-recent-tasks-zero-state">
          {t('recentPanel.noRecentTasks')}
        </Typography>
      </div>
    )
  }

  return (
    <div
      data-test="home-recent-tasks-panel"
      className={classes.recentTasksPanel}
    >
      {generateSearchBar()}
      {filter !== '' && filteredTasks && filteredTasks.length === 0 ? (
        <TodoAndRecentlyViewedZeroState
          noSearchResults={true}
          context={'recentlyViewed'}
        />
      ) : (
        [
          ...new Set(
            filter !== '' && filteredTasks
              ? filteredTasks.map(task => task.matterId)
              : recentTasks?.map(task => task.matterId)
          ),
        ]
          .slice(0, 10)
          .map((matterId, index) => (
            <RecentlyViewedMatter
              key={index}
              matterId={matterId}
              matters={matters.matters}
              expanded={matterId === expandedMatterId || filter !== ''}
              tasks={recentTasks
                .filter(task => task.matterId === matterId)
                .slice(0, 10)}
              onExpand={() =>
                handleMatterExpand(
                  matterId === expandedMatterId ? null : matterId
                )
              }
              isMobile={isMobile}
            />
          ))
      )}
    </div>
  )
}

export default RecentlyViewedMatterList
