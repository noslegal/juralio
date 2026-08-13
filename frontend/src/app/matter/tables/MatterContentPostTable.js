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
import { getWorkstreamTaskPostUrl } from '../../../components/navigation/common/location-context-helper'
import JuralioTable from '../../../components/table/JuralioTable'
import { postColumns } from '../../project/overview/items/workstream-content/project-tasks-and-posts-columns'
import { buildPostFilters } from '../../project/overview/items/workstream-content/workstream-content-custom-filters'
import { generatePostTableData } from '../../project/overview/OverviewHelpers'

const MatterContentPostTable = props => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)

  const columns = postColumns(
    t,
    false,
    undefined,
    props.matterId,
    true,
    props.projects
  )

  const rows = generatePostTableData(
    props.posts,
    t,
    props.tasks,
    false,
    true,
    props.projects,
    matterTeam
  )

  const filters = buildPostFilters(props.posts ?? [], t, {
    isTemplate: false,
    includeProject: true,
    projects: props.projects,
  })

  const handlePostClick = params => {
    const post = params.row._post
    const urlBase = getWorkstreamTaskPostUrl(
      props.matterId,
      post.project.id,
      post.taskId,
      post.id
    )
    if (urlBase.includes('undefined')) {
      console.error(post)
      console.error(urlBase)
    } else {
      navigate(urlBase)
    }
  }

  return (
    <JuralioTable
      columns={columns}
      rows={rows}
      filters={filters}
      onRowClick={handlePostClick}
      tableBodyHeight="calc(100vh - 500px)"
      noRowsText={t('matter.overview.tasks.noTasks')}
      dataTest="matterPostssTable"
    />
  )
}

export default MatterContentPostTable
