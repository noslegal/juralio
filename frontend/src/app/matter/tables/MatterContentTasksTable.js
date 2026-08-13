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

import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getTaskDetailsUrl } from '../../../components/navigation/common/location-context-helper'
import JuralioTable from '../../../components/table/JuralioTable'
import { generateTaskColumns } from '../../project/overview/items/workstream-content/project-tasks-and-posts-columns'
import { buildTaskFilters } from '../../project/overview/items/workstream-content/workstream-content-custom-filters'
import { generateTaskTableData } from '../../project/overview/OverviewHelpers'

const MatterContentTasksTable = props => {
  const { t } = useTranslation()
  const currentUser = useSelector(state => state.auth.data.details)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const navigate = useNavigate()

  const delAndMileTable =
    props.tasks[0]?.isMilestone || props.tasks[0]?.isDeliverable

  const columns = generateTaskColumns(
    t,
    () => {},
    undefined,
    props.matterId,
    false,
    false,
    true,
    delAndMileTable
  )

  const rows = generateTaskTableData(
    props.tasks,
    t,
    currentUser,
    true,
    props.projects,
    false,
    matterTeam
  )

  const filters = buildTaskFilters(props.tasks, t, {
    isTemplate: false,
    includeProject: true,
    projects: props.projects,
  })

  const handleTaskCellClick = params => {
    if (
      ['projectName', 'name', 'teamMembers', 'lastUpdated'].includes(
        params.field
      )
    ) {
      const task = params.row._task
      const urlBase = getTaskDetailsUrl(
        props.matterId,
        task.project.id,
        task.id
      )
      if (urlBase.includes('undefined')) {
        console.error(task)
        console.error(urlBase)
      } else {
        navigate(urlBase)
      }
    }
  }

  return (
    <JuralioTable
      columns={columns}
      rows={rows}
      filters={filters}
      onCellClick={handleTaskCellClick}
      tableBodyHeight="calc(100vh - 500px)"
      noRowsText={t('matter.overview.tasks.noTasks')}
      dataTest="matterTasksTable"
    />
  )
}

export default MatterContentTasksTable
