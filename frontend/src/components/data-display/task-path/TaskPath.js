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

import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import ChevronGap, { CHEVRON_OPACITIES } from './ChevronGap'
import { getTaskAncestors } from './task-path-helper'
import TaskPathItem from './TaskPathItem'

export const TASK_PATH_HEIGHT = 24

const styles = theme => ({
  root: {
    display: 'flex',
    height: TASK_PATH_HEIGHT,
    alignItems: 'center',
    overflow: 'hidden',
  },
  taskPathList: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    paddingLeft: 0,
  },
  beforeItems: {
    width: theme.spacing(),
    height: '100%',
    opacity: '0.6',
  },
})

const TaskPath = props => {
  const renderPathItems = () => {
    const ancestors = getTaskAncestors(props.task)
    const highestLevel = ancestors.length
    if (highestLevel > 0 && !ancestors[0].id) {
      return null // Prevent key warning.
    }

    return (
      <>
        {ancestors?.length === 0 && (
          <ChevronGap
            backgroundColour={props.backgroundColour}
            leftOpacity={
              props.task.level > 1
                ? CHEVRON_OPACITIES.faded
                : CHEVRON_OPACITIES.full
            }
            rightOpacity={CHEVRON_OPACITIES.full}
          />
        )}
        <ul className={props.classes.taskPathList}>
          {ancestors.map(item => (
            <li key={item.id}>
              <TaskPathItem
                onClick={props.onClick}
                task={item}
                lastItemFlag={highestLevel}
                usageContext={props.usageContext}
                darkBackground={props.darkBackground}
                backgroundColour={props.backgroundColour}
              />
            </li>
          ))}
        </ul>
        {ancestors?.length > 0 && (
          <ChevronGap
            backgroundColour={props.backgroundColour}
            leftOpacity={
              props.task.level > 1
                ? CHEVRON_OPACITIES.faded
                : CHEVRON_OPACITIES.full
            }
            rightOpacity={CHEVRON_OPACITIES.full}
          />
        )}
      </>
    )
  }

  return (
    <div className={props.classes.root}>
      <div
        className={props.classes.beforeItems}
        style={{ backgroundColor: props.backgroundColour }}
      />
      {renderPathItems()}
    </div>
  )
}

TaskPath.propTypes = {
  task: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  usageContext: PropTypes.string,
  darkBackground: PropTypes.bool,
}

export default withStyles(TaskPath, styles)
