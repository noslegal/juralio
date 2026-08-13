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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { ListItem, Tooltip } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import React, { Fragment } from 'react'
import colorModifiers from '../../../theme/color-modifiers'
import { TaskIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import {
  constants,
  PEOPLE_URL_PARTIAL,
  TASKS_URL_PARTIAL,
} from './overview-constants'

export const getTab = () => {
  if (window.location.href.includes(PEOPLE_URL_PARTIAL)) {
    return constants.PEOPLE
  } else if (window.location.href.includes(TASKS_URL_PARTIAL)) {
    return constants.POST
  }
  return constants.OVERVIEW
}

export const buildMenuItem = (
  classes,
  loading,
  selectedMenuItem,
  setSelectedMenuItem,
  isMatterOverview,
  header,
  body,
  type,
  tooltip
) => {
  const isSelected = selectedMenuItem === type
  return (
    <Tooltip
      title={tooltip}
      disableHoverListener={typeof tooltip !== 'string'}
      disableFocusListener={typeof tooltip !== 'string'}
    >
      <ListItem
        button
        className={classNames(
          classes.menuItem,
          isSelected ? classes.menuItemSelected : classes.menuItemNotSelected
        )}
        style={{
          backgroundColor: isMatterOverview
            ? isSelected
              ? rawColours.primary.white.primary
              : colorModifiers.secondaryBackground(
                  rawColours.primary.white.primary
                )
            : '',
          '&:hover': {
            backgroundColor: isMatterOverview
              ? isSelected
                ? rawColours.primary.white.primary
                : colorModifiers.hoverAction(rawColours.action.dark)
              : '',
          },
        }}
        data-test="menuItem"
        onClick={() => setSelectedMenuItem(constants[type])}
      >
        <div className={classes.menuItemHeader}>
          {loading ? (
            <Fragment>
              <Skeleton data-test="project-overview-skeleton-icon">
                <TaskIcon className={classes.tasksIcon} />
              </Skeleton>
              <Skeleton
                width="30%"
                className={classes.skeletonText}
                data-test="project-overview-skeleton-title"
              >
                <Typography className={classes.taskCountText} />
              </Skeleton>
            </Fragment>
          ) : (
            header
          )}
          <ArrowForwardIcon
            className={classNames(
              classes.menuItemArrow,
              isSelected ? classes.menuItemArrowSelected : ''
            )}
          />
        </div>
        <div className={classes.menuItemBodyWrapper}>
          {loading ? (
            <Skeleton
              className={classes.skeletonBody}
              data-test="project-overview-skeleton-body"
            />
          ) : (
            body
          )}
        </div>
      </ListItem>
    </Tooltip>
  )
}

export const getTaskCountTooltip = (t, itemCounts, isMatterOverview) => {
  const taskCount = itemCounts.taskCount
  const postCount = itemCounts.postCount || 0
  const overviewType = isMatterOverview ? 'matter' : 'workstream'
  if (taskCount === 1 || postCount === 1) {
    return t('project.overview.counts', {
      taskCount: taskCount === 1 ? 'one' : taskCount,
      postCount: postCount === 1 ? 'one' : postCount,
      tasks: taskCount !== 1 ? 'tasks' : 'task',
      posts: postCount !== 1 ? 'posts' : 'post',
      isWorkstream: overviewType,
    })
  }
  if (taskCount === 0) {
    return t('project.overview.countsNoTasks', {
      isWorkstream: overviewType,
    })
  }
  if (postCount === 0) {
    return t('project.overview.countsNoPosts', {
      taskCount: taskCount,
      tasks: taskCount !== 1 ? 'tasks' : 'task',
      isWorkstream: overviewType,
    })
  }
  return t('project.overview.counts', {
    taskCount: taskCount,
    postCount: postCount,
    tasks: taskCount !== 1 ? 'tasks' : 'task',
    posts: postCount !== 1 ? 'posts' : 'post',
    isWorkstream: overviewType,
  })
}
