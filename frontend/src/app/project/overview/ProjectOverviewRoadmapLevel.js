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

import ArrowForward from '@mui/icons-material/ArrowForward'
import { Typography } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import TaskReferenceNumber from '../../../components/data-display/task-reference-number/TaskReferenceNumber'
import UserList from '../../../components/layouts/user-list/UserList'
import {
  getMatterIdFromLocation,
  getTaskDetailsUrl,
} from '../../../components/navigation/common/location-context-helper'
import { sendTextToClipboard } from '../../../services/clipboard/clipboard-service'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { TASK_STATUS } from '../../constants'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import {
  getEndDate,
  getStartDate,
} from '../../roadmap/helpers/task-dates-helper'

import UsersControlContainer from '../../users/UsersControlContainer'
import MilestoneChips from './items/MilestoneChips'
import ProjectOverviewRoadmapRender from './items/ProjectOverviewRoadmapRender'
import utc from 'dayjs/plugin/utc'

const styles = makeStyles()(theme => ({
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: rawColours.primary.grey[200],
    height: theme.spacing(5),
    alignItems: 'center',
    width: '100%',
  },
  taskName: {
    fontSize: theme.spacing(2),
    marginRight: theme.spacing(),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  userControlWrapper: {
    marginLeft: 'auto',
    marginRight: theme.spacing(),
  },
  link: {
    color: rawColours.primary.black.black,
    overflow: 'hidden',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: theme.spacing(2),
  },
  displayWrapper: {
    overflow: 'hidden',
    width: '100%',
    height: theme.spacing(12.5),
  },
  goToOverview: {
    fontSize: theme.spacing(1.5),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    marginRight: theme.spacing(),
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    borderRadius: theme.spacing(0.5),
    marginLeft: 'auto',
    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.black[100]
      ),
    },
  },
  goToOverviewIcon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}))

const ProjectOverviewRoadmapLevel = props => {
  dayjs.extend(utc)
  const { classes } = styles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const task = props.task
  const history = useNavigate()
  const location = useLocation()
  const doneChildrenCount = task.taskCounts.doneCount

  const inProgressChildrenCount = task.taskCounts.inProgressCount
  const notStartedChildrenCount = task.taskCounts.notStartedCount
  const noDatesSet =
    !task.plannedStartDate &&
    !task.actualStartDate &&
    !task.plannedEndDate &&
    !task.actualEndDate &&
    !task.status === TASK_STATUS.NOT_STARTED

  const getBoundaryDates = task => {
    let noStartDate = false
    let noEndDate = false
    let earliestDate = getStartDate(task, false)
    let latestDate = getEndDate(task, false)
    if (earliestDate === null) {
      earliestDate = new Date()
      noStartDate = true
    } else {
      earliestDate = dayjs.utc(earliestDate)
    }
    if (latestDate === null) {
      latestDate = new Date()
      noEndDate = true
    } else {
      latestDate = dayjs.utc(latestDate)
    }
    return [earliestDate, latestDate, noStartDate, noEndDate]
  }

  return (
    <div data-test="project-overview-roadmap-level">
      <div
        className={classes.titleRow}
        style={{
          backgroundColor:
            props.isMatterOverview && !props.isSingleWorkstreamMatter
              ? rawColours.overview.matterSecondary
              : '',
        }}
      >
        <div
          onClick={() => {
            history(
              getTaskDetailsUrl(
                getMatterIdFromLocation(location),
                props.projectId,
                task.id
              )
            )
          }}
          className={classes.link}
        >
          <Typography
            data-test="project-overview-roadmap-task-name"
            className={classes.taskName}
          >
            {task.name}
          </Typography>
        </div>
        <div
          onClick={() => {
            sendTextToClipboard(
              window.location.href.split('overview')[0] + 'task/' + task.id
            )

            dispatch(showSnackbar(t('taskDetails.urlOfTaskCopiedToClipbard')))
          }}
          style={{ cursor: 'pointer' }}
        >
          <TaskReferenceNumber task={task} />
        </div>
        {task.teamMembers && (
          <div className={classes.userControlWrapper}>
            <UsersControlContainer
              users={task.teamMembers.map(u => {
                u.isActiveOnMatter = true
                return { user: u }
              })}
              renderUsersList={() => (
                <UserList
                  users={task.teamMembers.map(u => {
                    u.isActiveOnMatter = true
                    return { user: u }
                  })}
                  onRemoveClick={null}
                  canRemoveSelf={true}
                />
              )}
              floatLeft={false}
              showAvatarList={true}
            />
          </div>
        )}
        <Typography
          className={classes.goToOverview}
          onClick={() => {
            history(
              getTaskDetailsUrl(
                getMatterIdFromLocation(location),
                props.projectId,
                task.id
              )
            )
          }}
          data-test="go-to-overview"
        >
          {task.level > 1
            ? t('projectOverview.goToTaskDetails')
            : t('projectOverview.goToPhaseDetails')}
          <ArrowForward className={classes.goToOverviewIcon} />
        </Typography>
      </div>
      <div className={classes.displayWrapper}>
        <ProjectOverviewRoadmapRender
          shouldIncludeTodaysDate={props.shouldIncludeTodaysDate}
          noDatesSet={noDatesSet}
          navigateToTask={() => props.navigateToTask(task.id)}
          dates={getBoundaryDates(task, props.earliestDate, props.latestDate)}
          earliestDate={props.earliestDate}
          latestDate={props.latestDate}
          task={task}
          workstream={props.workstream}
        />
        <MilestoneChips
          task={task}
          workstreamId={props.workstream.id}
          earliestDate={props.earliestDate}
          latestDate={props.latestDate}
          shouldIncludeTodaysDate={props.shouldIncludeTodaysDate}
        />
      </div>
    </div>
  )
}

export default ProjectOverviewRoadmapLevel
