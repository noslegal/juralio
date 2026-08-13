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

import uniq from 'lodash/uniq'
import {
  convertTaskStatusString,
  levelNumberToLetter,
} from '../../../../../services/helpers/task/task-util-helper'

// Each filter config: { name, label, options, matchFn(row, selectedValues) }

export const buildTaskFilters = (
  tasks,
  t,
  { isTemplate = false, includeProject = false, projects = [] } = {}
) => {
  const filters = []

  if (includeProject) {
    const projectOptions = uniq(
      (projects ?? []).map(p => p?.name).filter(Boolean)
    )
    if (projectOptions.length) {
      filters.push({
        name: 'projectName',
        label: t('common.project'),
        options: projectOptions,
        matchFn: (row, selected) => selected.includes(row.projectName),
      })
    }
  }

  filters.push({
    name: 'status',
    label: t('common.status'),
    options: uniq(tasks.map(task => convertTaskStatusString(t, task.status))),
    matchFn: (row, selected) => selected.includes(row.status),
  })

  filters.push({
    name: 'level',
    label: t('postOverviewTable.levelFilter'),
    options: uniq(tasks.map(task => levelNumberToLetter(task.level))),
    matchFn: (row, selected) => selected.includes(row.level),
  })

  if (!isTemplate) {
    const teamOptions = uniq(
      tasks
        .flatMap(task => task.teamMembers ?? [])
        .map(tm => tm.username)
        .filter(Boolean)
    )
    filters.push({
      name: 'teamFilterList',
      label: t('postOverviewTable.responsibleTeam'),
      options: teamOptions,
      matchFn: (row, selected) =>
        selected.some(f => row.teamFilterList?.includes(f)),
    })

    filters.push({
      name: 'following',
      label: t('postOverviewTable.following'),
      options: [
        t('postOverviewTable.followingText'),
        t('postOverviewTable.notFollowingText'),
      ],
      matchFn: (row, selected) => selected.includes(row.following),
    })

    const labelOptions = uniq(
      tasks.flatMap(task => task.labels?.map(l => l.name) ?? [])
    )
    filters.push({
      name: 'labels',
      label: t('postOverviewTable.labels'),
      options: labelOptions,
      matchFn: (row, selected) => selected.some(f => row.labels?.includes(f)),
    })

    // filters.push({
    //   name: 'milestoneType',
    //   label: t('postOverviewTable.allTasksMilestonesFilter'),
    //   options: [
    //     `${t('entity.milestone')}s`,
    //     `${t('entity.task')}s`,
    //   ],
    //   matchFn: (row, selected) => selected.includes(row.milestoneType),
    // })
  }

  return filters.filter(f => f.options.length > 0)
}

export const buildPostFilters = (
  posts,
  t,
  { isTemplate = false, includeProject = false, projects = [] } = {}
) => {
  const filters = []

  if (includeProject) {
    const projectOptions = uniq(
      (projects ?? []).map(p => p?.name).filter(Boolean)
    )
    if (projectOptions.length) {
      filters.push({
        name: 'projectName',
        label: t('common.project'),
        options: projectOptions,
        matchFn: (row, selected) => selected.includes(row.projectName),
      })
    }
  }

  filters.push({
    name: 'status',
    label: t('common.status'),
    options: uniq(
      posts.map(p => (p.finalised ? t('postMenu.final') : t('postMenu.draft')))
    ),
    matchFn: (row, selected) => selected.includes(row.status),
  })

  filters.push({
    name: 'type',
    label: t('exports.tableHeadings.type'),
    options: uniq(posts.map(p => p.type || t('entity.note'))),
    matchFn: (row, selected) => selected.includes(row.type),
  })

  if (!isTemplate) {
    const editorOptions = uniq(
      posts
        .flatMap(p => p.authors ?? [])
        .map(e => e.username)
        .filter(Boolean)
    )
    filters.push({
      name: 'editorFilterList',
      label: t('postOverviewTable.editorFilter'),
      options: editorOptions,
      matchFn: (row, selected) =>
        selected.some(f => row.editorFilterList?.includes(f)),
    })
  }

  return filters.filter(f => f.options.length > 0)
}
