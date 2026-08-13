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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import {
  renderEndLevelIndicator,
  renderLevelIndicator,
} from '../../components/icicle/desktop/helper/level-indicators-helper'
import { DEFAULT_TASK_WIDTH } from './taskmap-helpers/consts'
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from '../task-map/task-filter/task-filter-actions'

const style = makeStyles()(theme => ({
  wrapper: {
    position: 'sticky',
    zIndex: '1000',
    display: 'flex',
    width: '100%',
    height: theme.spacing(2),
    flexDirection: 'row',
    top: theme.spacing(3),
  },
  level: {
    position: 'absolute',
    cursor: 'pointer',
  },
  indicatorWrapper: {
    display: 'flex',
    '&:hover': {
      opacity: 0.6,
    },
  },
  indicatorText: {
    position: 'absolute',
    top: '2px',
    color: 'white',
  },
  indicatorTextStart: {
    left: '8px',
  },
  indicatorTextMid: {
    left: '42px',
  },
  indicatorTextEnd: {
    left: '16px',
  },
  endIndicatorButton: {
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
}))

const LevelIndicators = props => {
  const { t } = useTranslation()
  const zoom = useSelector(state => state.improvedTaskmap.zoomLevel)
  const dispatch = useDispatch()
  const expandCollapseTaskFilter = useSelector(
    state => state.taskMapFilter.expandCollapseTaskFilter
  )
  const structure = useSelector(state => state.improvedTaskmap.structure)
  const project = useSelector(state => state.project)
  const { width, maxWidth } = props

  const collectCollapsibleIdsFromLevel = (
    taskList,
    level,
    depth = 1,
    acc = []
  ) => {
    taskList?.forEach(task => {
      if (task?.tasks?.length > 0) {
        if (depth >= level) {
          acc.push(task.id)
        }
        collectCollapsibleIdsFromLevel(task.tasks, level, depth + 1, acc)
      }
    })
    return acc
  }

  const expandToLevel = level => {
    const idsToCollapse = collectCollapsibleIdsFromLevel(structure, level)
    expandCollapseTaskFilter
      .filter(id => !idsToCollapse.includes(id))
      .forEach(id => dispatch(taskFilterActions.expandTask(id)))
    idsToCollapse
      .filter(id => !expandCollapseTaskFilter.includes(id))
      .forEach(id => dispatch(taskFilterActions.collapseTask(id)))
  }
  const getWidth = () => {
    return document.getElementById('improved-taskmap-wrapper')
      ? document.getElementById('improved-taskmap-wrapper')?.offsetWidth
      : 0
  }

  const getLeftOffset = index => {
    if (index === 0) {
      return '32px'
    } else {
      return index * DEFAULT_TASK_WIDTH + 50 + (index - 1) * 10
    }
  }

  // Level 1 = A, 2 = B, ... for the tooltip text
  const getLevelLetter = level => String.fromCharCode(64 + level)
  const { classes } = style()
  return (
    <div
      className={classes.wrapper}
      style={
        project.selectionMode
          ? { visibility: 'collapse' }
          : { width: `${getWidth()}px`, zoom: zoom }
      }
    >
      {Array.from(Array(width)).map((_, index) => {
        return (
          <Tooltip
            key={index}
            title={t('taskMap.filterToLevel', {
              level: getLevelLetter(index + 1),
            })}
          >
            <div
              data-test={'level-indicator' + (index + 1)}
              onClick={() => {
                expandToLevel(index + 1)
              }}
              className={classes.level}
              style={{
                left: getLeftOffset(index),
              }}
            >
              {renderLevelIndicator(index, classes)}
            </div>
          </Tooltip>
        )
      })}
      {width < maxWidth &&
        expandCollapseTaskFilter.length > 0 &&
        Array.from(Array(maxWidth - width)).map((_, i) => {
          return (
            <Tooltip
              key={i}
              title={t('taskMap.filterToLevel', {
                level: getLevelLetter(i + width + 1),
              })}
            >
              {renderEndLevelIndicator(i, width, expandToLevel, classes)}
            </Tooltip>
          )
        })}
    </div>
  )
}
export default LevelIndicators
