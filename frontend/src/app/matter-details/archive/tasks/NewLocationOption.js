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

import { FormControl, FormControlLabel, Radio, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import WorkstreamSelect from '../../../../components/inputs/workstream-select/WorkstreamSelect'
import { APP_CONTEXT } from '../../../constants'
import TaskMoveTaskSelect from '../../../task-details/task-options/task-move/task-move-dialog/task-select/TaskMoveTaskSelect'
import { DestinationMenu } from '../../../task-details/task-options/task-move/task-move-dialog/TaskMoveDestinationMenu'

const NewLocationOption = props => {
  const {
    classes,
    NEW_LOCATION,
    handleLocationChange,
    selectedLocation,
    matterId,
    selectedProject,
    selectedMoveType,
    handleProjectChange,
    handleDestinationTypeChange,
    selectedTask,
    targetTasks,
    handleTaskChange,
  } = props
  const { t } = useTranslation()

  return (
    <FormControlLabel
      classes={{ root: classes.radioText, label: classes.label }}
      value={NEW_LOCATION}
      onChange={handleLocationChange}
      checked={selectedLocation === NEW_LOCATION}
      control={<Radio color="primary" data-test="radio-new" />}
      label={
        <div className={classes.label}>
          <Typography variant="subtitle1">
            {t('unarchiveDialog.radioNewLocation')}
          </Typography>
          <Typography variant="caption" className={classes.subtitle}>
            {t('unarchiveDialog.radioNewSubtitle')}
          </Typography>
          {selectedLocation === NEW_LOCATION && (
            <FormControl className={classes.newLocation}>
              <Typography
                variant="subtitle1"
                data-test="destination-select-label"
                className={classes.selectLabel}
              >
                {t('unarchiveDialog.restoreTo')}
              </Typography>
              <div className={classes.selects}>
                <div className={classes.select}>
                  <WorkstreamSelect
                    matterId={matterId}
                    selectionChangeHandler={handleProjectChange}
                    placeholder={t('unarchiveDialog.selectDestination')}
                    selectFirstProject={false}
                  />
                </div>

                {selectedProject && (
                  <div className={classes.selectMiddle}>
                    <DestinationMenu
                      selectedMoveType={selectedMoveType}
                      handleChange={handleDestinationTypeChange}
                      hideProject={true}
                      allowMoveToPhase={true}
                    />
                  </div>
                )}
                {selectedMoveType === APP_CONTEXT.TASK && (
                  <div className={classes.select}>
                    <TaskMoveTaskSelect
                      selectedTask={selectedTask}
                      validTargetTasks={targetTasks}
                      selectionChangeHandler={handleTaskChange}
                      placeholderText={'Select a task'}
                    />
                  </div>
                )}
              </div>
            </FormControl>
          )}
        </div>
      }
    />
  )
}

export default NewLocationOption
