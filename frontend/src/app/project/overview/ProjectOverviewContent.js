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

import {
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import OverviewTimelineIcon from '../../../assets/images/OverviewTimelineIcon'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskDetailsUrl,
} from '../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../theme/color-modifiers'
import { OverviewMapIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { shouldIncludeToday } from './items/roadmap-helpers'
import ProjectOverviewRoadmapLevel from './ProjectOverviewRoadmapLevel'
import ProjectOverviewTaskMapContainer from './ProjectOverviewTaskMapContainer'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import JurShift from '../../../assets/images/JurShift'
import BulkShiftDialog from '../../task-details/task-options/task-shift/BulkShiftDialog'
import { TASK_STATUS } from '../../constants'
import { useSelector } from 'react-redux'

const styles = makeStyles()(theme => ({
  title: {
    fontWeight: 400,
    marginLeft: theme.spacing(2),
    background: rawColours.primary.white.primary,
    marginRight: theme.spacing(3),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  link: {
    cursor: 'pointer',
  },
  roadmapWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    background: `repeating-linear-gradient(90deg, ${colorModifiers.divider(
      rawColours.divider.dark
    )},  ${colorModifiers.divider(
      rawColours.divider.dark
    )} 1px, #fff 2px, #fff 100px)`,
  },
  taskmapWrapper: {
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: '100%',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    overflowY: 'scroll',
  },
  toggleGroup: {
    marginLeft: theme.spacing(2),
    height: theme.spacing(5),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    background: 'white',
    paddingBottom: theme.spacing(2),
  },
  titleTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  toggleButton: {
    color: rawColours.primary.primary.main,
    paddingLeft: theme.spacing(),
    paddingBottom: theme.spacing(0.25),
    paddingRight: theme.spacing(),
    borderColor: rawColours.primary.primary.main,
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
      background: colorModifiers.selectedAction(
        rawColours.primary.primary.main
      ),
    },
  },
}))

const ProjectOverviewContent = props => {
  dayjs.extend(utc)
  const { t } = useTranslation()
  const { classes } = styles()
  const history = useNavigate()
  const location = useLocation()
  const OVERVIEW_TAB_ROADMAP = 0
  const OVERVIEW_TAB_TASKMAP = 1
  const [overviewTab, setOverviewTab] = useState(OVERVIEW_TAB_ROADMAP)
  const [shouldIncludeTodaysDate, setShouldIncludeTodaysDate] = useState(false)
  const [showBulkShift, setShowBulkShift] = useState(false)
  const project = useSelector(state => state.project)

  useEffect(() => {
    setShouldIncludeTodaysDate(shouldIncludeToday(props.tasks))
  }, [props.tasks])

  const findDates = tasks => {
    let dates = tasks
      .map(task => [
        task.plannedStartDate,
        task.plannedEndDate,
        task.actualStartDate,
        task.actualEndDate,
      ])
      .flat()
      .filter(t => t != null)
      .map(d => new Date(d).getTime())
      .sort()

    if (dates.length === 0) {
      return [null, null]
    }
    return [dates[0], dates[dates.length - 1]]
  }

  const [startDate, endDate] = findDates(props.project.levelATasks)

  const earliestDate = dayjs.utc(startDate)

  const latestDate = dayjs.utc(endDate)

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

  const getTitle = () => {
    return (
      <div className={classes.titleWrapper}>
        <ToggleButtonGroup
          variant="contained"
          size="small"
          value={overviewTab}
          exclusive
          className={classes.toggleGroup}
          onChange={(e, v) => {
            if (v !== null) {
              setOverviewTab(v)
            }
          }}
        >
          <Tooltip title={t('entity.roadmap')}>
            <ToggleButton
              value={OVERVIEW_TAB_ROADMAP}
              data-test="overview-map-button"
              className={classes.toggleButton}
              selected={OVERVIEW_TAB_ROADMAP === overviewTab}
            >
              <OverviewMapIcon
                style={{
                  color:
                    OVERVIEW_TAB_ROADMAP === overviewTab
                      ? rawColours.primary.primary.main
                      : colorModifiers.filterIn(rawColours.primary.black.black),
                }}
              />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('entity.taskmap')}>
            <ToggleButton
              value={OVERVIEW_TAB_TASKMAP}
              className={classes.toggleButton}
              data-test="overview-timeline-button"
            >
              <OverviewTimelineIcon
                style={{
                  color:
                    OVERVIEW_TAB_TASKMAP === overviewTab
                      ? rawColours.primary.primary.main
                      : colorModifiers.filterIn(rawColours.primary.black.black),
                }}
              />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>

        <div className={classes.titleTextWrapper}>
          <Typography
            variant="h6"
            className={classes.title}
            data-test="workstream-title"
          >
            {props.isMatterOverview
              ? t('matterOverview.matterOverview')
              : t('projectOverview.title')}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Tooltip
        style={{
          zIndex: 1000,
          position: 'absolute',
          top: '12px',
          right: '12px',
        }}
        title={
          props.isViewOnly ? t('matter.viewOnly') : t('bulkShifting.title')
        }
      >
        <span>
          <Button
            data-test="bulk-shift-button"
            disabled={
              project?.tasks?.filter(
                t =>
                  t.status === TASK_STATUS.NOT_STARTED &&
                  (t.plannedStartDate || t.plannedEndDate)
              ).length === 0
            }
            onClick={() => setShowBulkShift(true)}
            variant="outlined"
            style={{
              textTransform: 'none',
            }}
            size="small"
          >
            <Typography style={{ marginRight: '8px' }}>
              {t('bulkShifting.title')}
            </Typography>
            <JurShift
              fill={
                project?.tasks?.filter(
                  t =>
                    t.status === TASK_STATUS.NOT_STARTED &&
                    (t.plannedStartDate || t.plannedEndDate)
                ).length === 0
                  ? 'grey'
                  : rawColours.primary.primary.main
              }
            />
          </Button>
        </span>
      </Tooltip>
      {showBulkShift && (
        <BulkShiftDialog
          isMatterOverview={props.isMatterOverview}
          cancelHandler={() => setShowBulkShift(false)}
        />
      )}
      {getTitle()}
      {overviewTab === OVERVIEW_TAB_ROADMAP && (
        <div
          className={classes.roadmapWrapper}
          style={{ height: `${window.innerHeight - 186}px` }}
          data-test="project-overview-roadmap"
        >
          {props.tasks.map((task, index) => (
            <ProjectOverviewRoadmapLevel
              shouldIncludeTodaysDate={shouldIncludeTodaysDate}
              task={task}
              earliestDate={earliestDate}
              latestDate={latestDate}
              index={index}
              navigateToTask={navigateToTask}
              isMatterOverview={props.isMatterOverview}
              isSingleWorkstreamMatter={props.isMatterOverview}
              workstream={props.project}
              projectId={
                props.isMatterOverview
                  ? props.projectId
                  : getProjectIdFromLocation(location)
              }
            />
          ))}
        </div>
      )}
      {overviewTab === OVERVIEW_TAB_TASKMAP && (
        <div
          className={classes.taskmapWrapper}
          style={{ height: `${window.innerHeight - 256}px` }}
          data-test="project-overview-taskmap"
        >
          <ProjectOverviewTaskMapContainer
            zeroStateText={'zero'}
            isForbidden={false}
            isReadOnly={true}
            noLoad={false}
            projectId={
              props.isMatterOverview
                ? props.projectId
                : getProjectIdFromLocation(location)
            }
            isViewOnly={true}
          />
        </div>
      )}
    </div>
  )
}

export default ProjectOverviewContent
