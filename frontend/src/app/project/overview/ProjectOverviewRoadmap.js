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

import MapIcon from '@mui/icons-material/Map'
import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskDetailsUrl,
} from '../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import ProjectOverviewRoadmapLevel from './ProjectOverviewRoadmapLevel'

const styles = makeStyles()(theme => ({
  title: {
    fontWeight: 500,
    paddingBottom: theme.spacing(2),
    background: rawColours.primary.white.primary,
    fontSize: theme.spacing(2),
  },
  roadmapWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  icon: {
    marginRight: theme.spacing(),
  },
  background: {
    background: `repeating-linear-gradient(90deg, ${colorModifiers.divider(
      rawColours.divider.dark
    )},  ${colorModifiers.divider(
      rawColours.divider.dark
    )} 1px, #fff 2px, #fff 100px)`,
  },
  titleWrapper: {
    width: '100%',
    backgroundColor: rawColours.primary.white.primary,
    display: 'flex',
    paddingLeft: theme.spacing(3),
  },
}))

const ProjectOverviewRoadmap = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const history = useNavigate()
  const location = useLocation()

  const earliestDate =
    props.tasks
      .map(task => [
        task.plannedEndDate,
        task.actualEndDate,
        task.plannedStartDate,
        task.actualStartDate,
      ])
      .flat()
      .filter(t => t !== null)
      .map(t => new Date(t))
      .sort((a, b) => {
        if (a.getTime() > b.getTime()) {
          return 1
        } else if (b.getTime() > a.getTime()) {
          return -1
        } else {
          return 0
        }
      })[0] || new Date()

  const latestDate =
    props.tasks
      .map(task => [
        task.plannedEndDate,
        task.actualEndDate,
        task.plannedStartDate,
        task.actualStartDate,
      ])
      .flat()
      .filter(t => t !== null)
      .map(t => new Date(t))
      .sort((a, b) => {
        if (a.getTime() > b.getTime()) {
          return -1
        } else if (b.getTime() > a.getTime()) {
          return 1
        } else {
          return 0
        }
      })[0] || new Date()

  const navigateToTask = taskId => {
    history(
      getTaskDetailsUrl(
        getMatterIdFromLocation(location),
        props.isMatterOverview
          ? props.project.id
          : getProjectIdFromLocation(location),
        taskId
      )
    )
  }

  return (
    <div className={classes.background} data-test="project-overview-roadmap">
      <div className={classes.titleWrapper}>
        <MapIcon className={classes.icon} />
        <Typography variant="h6" className={classes.title}>
          {props.isMatterOverview
            ? t('matter.overview.matterProgress')
            : t('project.overview.workstreamProgress')}
        </Typography>
      </div>
      <div
        className={classes.roadmapWrapper}
        style={{ height: `${window.innerHeight - 186}px` }}
      >
        {props.tasks.map((task, index) => (
          <ProjectOverviewRoadmapLevel
            task={task}
            earliestDate={earliestDate}
            latestDate={latestDate}
            index={index}
            navigateToTask={navigateToTask}
            isMatterOverview={props.isMatterOverview}
            workstream={props.workstream}
            projectId={
              props.isMatterOverview
                ? props.projectId
                : getProjectIdFromLocation(location)
            }
          />
        ))}
      </div>
    </div>
  )
}

export default ProjectOverviewRoadmap
