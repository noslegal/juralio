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

import { saveAs } from 'file-saver'
import { LABEL_TYPES, TASK_STATUS } from '../../../../app/constants'
import { sortLabels } from '../../../../app/task-details/task-label/task-label-helpers'
import { flatTaskListFromTree } from '../../../task/data-provider/task-list-data-provider'
import { EXPORT_FORMATS } from '../common/constants-reports'
import { buildCustomerLogo } from '../common/excel/build-customer-logo'
import { buildLogo } from '../common/excel/build-logo'
import { setPrintConfiguration } from '../common/excel/configure-print'
import { setRichText } from '../common/excel/rich-text'
import { createSheet } from '../common/excel/sheet-builder'
import { createWorkbook, writeWorkbook } from '../common/excel/workbook'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { juralio_logo_with_text } from '../common/image-data'
import { getTaskTeam } from '../common/report-text-helpers'
import { buildRoadmapContent } from '../roadmap/build-roadmap-report'
import { applyRoadmapStyle } from '../roadmap/roadmap-styler'
import { buildTeamList } from '../team/build-team-list-report'
import { applyTeamStyle } from '../team/team-styler'
import { buildTaskList } from './build-task-tree-list'
import { applyStyle } from './task-list-styler'

const getLabelColour = label => {
  if (label.type === LABEL_TYPES.RISK) {
    if (label.modifier === 'amber') {
      return 'bf9001'
    }
    if (label.modifier === 'green') {
      return '69a84f'
    }
    return 'ff0201'
  }
  return 'black'
}

const generateLabels = (worksheet, labels, x, y) => {
  const formatName = label =>
    label.type === LABEL_TYPES.USER_DEFINED ? `#${label.name}` : label.name

  labels.sort(sortLabels).forEach((labelList, i) => {
    if (labelList) {
      let l = labelList.slice(0, 2)
      let extra = (labelList.length = l.length)
      if (extra > 0) {
        l.push({ name: `(+${extra})`, type: null })
      }
      setRichText(
        worksheet,
        `${x}${y + i}`,
        l.map((label, j) => {
          return {
            t: 's',
            v: formatName(label) + (j < l.length - 2 ? ', ' : ''),
            s: {
              italic: label.type === LABEL_TYPES.USER_DEFINED,
              bold: label.type === LABEL_TYPES.WORKFLOW,
              color: { rgb: getLabelColour(label) },
              sz: 8,
              name: 'Ariel',
            },
          }
        })
      )
    }
  })
}

const buildReport = (t, reportData, callback = () => {}, options = {}) => {
  createWorkbook().then(async newWorkbook => {
    const content = []
    const roadmapContent = []
    const teamSummary = []
    const taskStatusPerRow = []
    const { matter, project, username } = reportData

    let taskList = flatTaskListFromTree(project)
    taskList = taskList
      .filter(t => t.level <= options.level)
      .filter(task => task.status !== TASK_STATUS.NOT_REQUIRED)
    let teamList = []
    const downloadFilename = generateDownloadFilename(
      project.name,
      EXPORT_FORMATS.EXCEL
    )

    // Build Excel
    if (options.teams) {
      const team = reportData.team
      buildTeamList(t, teamSummary, team, matter, project, username)
      const teamWorkSheet = createSheet(
        newWorkbook,
        t('exports.common.workstreamTeam'), // Limit on worksheet name.
        teamSummary
      )
      buildLogo(teamWorkSheet, { r: 1, c: 4, x: -62, w: 62, h: 18 })
      if (reportData.logo) {
        buildCustomerLogo(teamWorkSheet, reportData.logo)
      } else {
        buildCustomerLogo(teamWorkSheet, {
          blob: juralio_logo_with_text,
          height: 36,
          width: 124,
        })
      }

      // Set for Printing including Headers and Footers.
      setPrintConfiguration(
        t,
        teamWorkSheet,
        project.people ? project.people.length : 0,
        options.printType,
        4
      )

      // Format the content
      applyTeamStyle(t, teamWorkSheet, team.length, project.isPrivate)
    }
    // Task list
    if (options.taskList) {
      buildTaskList(
        t,
        content,
        matter,
        project,
        taskStatusPerRow,
        username,
        options.level,
        options.includeLabels
      )

      taskList.forEach(t => {
        teamList.push(getTaskTeam(undefined, t))
      })
      teamList = teamList.map(l => l.length / 50)

      const ws = createSheet(
        newWorkbook,
        t('exports.workstreamTaskList'), // Limit on worksheet name.
        content
      )
      let labels = project.tasks.map(t => t.labels)

      if (options.includeLabels) {
        generateLabels(ws, labels, 'F', 7)
      }

      // Add the Logo
      buildLogo(ws, { r: 1, c: 8, x: -62, w: 62, h: 18 })
      if (reportData.logo) {
        buildCustomerLogo(ws, reportData.logo)
      } else {
        buildCustomerLogo(ws, {
          blob: juralio_logo_with_text,
          height: 36,
          width: 124,
        })
      }

      // Set for Printing including Headers and Footers.
      setPrintConfiguration(t, ws, taskList.length, options.printType, 7)

      // Format the content
      applyStyle(
        ws,
        teamList.length - 1,
        taskStatusPerRow,
        teamList,
        project.isPrivate
      )
    }

    if (options.roadmap) {
      const roadMapTasks = flatTaskListFromTree(project).filter(
        task =>
          task.level <= options.level &&
          task.status !== TASK_STATUS.NOT_REQUIRED
      )
      buildRoadmapContent(
        t,
        roadmapContent,
        matter,
        project,
        username,
        roadMapTasks,
        options
      )

      let labels = project.tasks.map(t => t.labels)

      const roadmapWorksheet = createSheet(
        newWorkbook,
        t('exports.common.workstreamRoadmap'), // Limit on worksheet name.
        roadmapContent
      )
      if (options.includeLabels) {
        generateLabels(roadmapWorksheet, labels, 'BB', 7)
      }
      // Add the Logo
      buildLogo(roadmapWorksheet, { r: 1, c: 56, x: -62, w: 62, h: 18 })
      if (reportData.logo) {
        buildCustomerLogo(roadmapWorksheet, reportData.logo)
      } else {
        buildCustomerLogo(roadmapWorksheet, {
          blob: juralio_logo_with_text,
          height: 36,
          width: 124,
        })
      }

      // Set for Printing including Headers and Footers.
      setPrintConfiguration(
        t,
        roadmapWorksheet,
        taskList.length,
        options.printType,
        56
      )

      // Format the content
      applyRoadmapStyle(t, roadmapWorksheet, roadMapTasks, project.isPrivate)
    }

    // Download
    const wbout = await writeWorkbook(newWorkbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )
    callback()

    return {
      taskList: content,
      filename: downloadFilename,
      roadmap: roadmapContent,
      teamsSummary: teamSummary,
    }
  })
}

export default buildReport
