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
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { ACTIVITIES } from '../../../constants'
import {
  getArchivedTasks,
  resetArchivedTasksStatus,
} from './task-archive-actions'
import TaskArchiveTable from './TaskArchiveTable'

const TaskArchiveTableContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const archivedTasks = useSelector(
    state => state.taskArchive.unarchive.archiveTask
  )

  const { matter } = props
  const matterId = matter.id.toString()
  const isMatterAdmin = matter?.activities.indexOf(ACTIVITIES.MATTER_ADMIN) > -1
  const isMatterTeamMember =
    matter?.activities.indexOf(ACTIVITIES.MATTER_TEAM_MEMBER) > -1
  const isMatterViewer = matter?.activities.includes(ACTIVITIES.MATTER_VIEWER)

  useEffect(() => {
    if (!isMatterViewer) {
      dispatch(getArchivedTasks(matterId))
    }
    return () => {
      dispatch(resetArchivedTasksStatus())
    }
  }, [dispatch, matterId]) //eslint-disable-line

  return (
    <div data-test="archive-container">
      {isMatterAdmin && isMatterTeamMember ? (
        <TaskArchiveTable matterId={matter.id} archivedTasks={archivedTasks} />
      ) : (
        <div>
          <Typography color="error">
            {t('unarchiveDialog.invalidUser')}
          </Typography>
        </div>
      )}
    </div>
  )
}

TaskArchiveTableContainer.propTypes = {
  matter: PropTypes.object.isRequired,
}

export default TaskArchiveTableContainer
