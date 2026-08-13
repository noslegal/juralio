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
import { makeStyles } from 'tss-react/mui'
import AvatarWithTextItem from '../../data-display/avatar-with-text-item/AvatarWithTextItem'

import JurMilestone from '../../../assets/images/JurMilestone'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from '../../../app/task-map/task-filter/task-filter-actions'
import JurTask from '../../../assets/images/JurTask'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const TaskTypeSelector = props => {
  const { handleMilestone, handleDeliverable, handleEverything } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const taskTypeSelectionText = useSelector(
    state => state.taskMapFilter.taskTypeSelectionText
  )

  return (
    <div className={classes.root}>
      <div>
        <AvatarWithTextItem
          icon={JurTask}
          title={t('filter.allTaskTypes')}
          titleDataTest="task-type-everyone"
          onClickHandler={() => {
            dispatch(
              taskFilterActions.setTaskTypeSelectionText(
                t('filter.allTaskTypes')
              )
            )
            handleEverything()
          }}
          darkMode={taskTypeSelectionText === t('filter.allTaskTypes')}
        />
        <AvatarWithTextItem
          icon={JurMilestone}
          title={t('filter.justMilestones')}
          titleDataTest="task-type-milestone"
          onClickHandler={() => {
            dispatch(
              taskFilterActions.setTaskTypeSelectionText(
                t('filter.justMilestones')
              )
            )
            handleMilestone()
          }}
          darkMode={taskTypeSelectionText === t('filter.justMilestones')}
        />
        <AvatarWithTextItem
          icon={JurDeliverable}
          title={t('filter.justDeliverable')}
          titleDataTest="task-type-deliverable"
          onClickHandler={() => {
            dispatch(
              taskFilterActions.setTaskTypeSelectionText(
                t('filter.justDeliverable')
              )
            )
            handleDeliverable()
          }}
          darkMode={taskTypeSelectionText === t('filter.justDeliverable')}
        />
      </div>
    </div>
  )
}

export default TaskTypeSelector
