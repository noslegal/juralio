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

import ErrorIcon from '@mui/icons-material/Error'
import { FormControlLabel, Radio, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const PreviousLocationOption = props => {
  const {
    classes,
    PREVIOUS_LOCATION,
    handleLocationChange,
    newLocationDisabled,
    selectedLocation,
    task,
  } = props
  const { t } = useTranslation()

  return (
    <FormControlLabel
      classes={{ root: classes.radioText }}
      value={PREVIOUS_LOCATION}
      onChange={handleLocationChange}
      disabled={newLocationDisabled}
      checked={selectedLocation === PREVIOUS_LOCATION}
      control={<Radio color="primary" data-test="radio-prev" />}
      label={
        <React.Fragment>
          <Typography variant="subtitle1">
            {t('unarchiveDialog.radioPreviousLocation')}
          </Typography>
          <Typography variant="caption" className={classes.subtitle}>
            {t('unarchiveDialog.radioPrevSubtitle')}
          </Typography>
          {task.restoreToParentName && (
            <div className={classes.previousLocation}>
              <Typography
                variant="caption"
                className={classes.previousLocationSub}
              >
                {t('unarchiveDialog.radioPrevSub')}
              </Typography>
              <Typography variant="subtitle2">
                {task.restoreToProjectName}
              </Typography>
            </div>
          )}

          <div className={classes.previousLocation}>
            {!task.restoreToParentName && (
              <React.Fragment>
                <ErrorIcon fontSize="small" className={classes.unrecorded} />
                <Typography className={classes.unrecorded}>
                  {t('unarchiveDialog.unrecorded')}
                </Typography>
              </React.Fragment>
            )}
            {task.restoreToParentName && (
              <React.Fragment>
                <Typography
                  variant="caption"
                  className={classes.previousLocationSub}
                >
                  {t('unarchiveDialog.radioPrevSub2')}
                </Typography>
                <Typography variant="subtitle2">
                  {task.restoreToParentName === '0'
                    ? t('unarchiveDialog.isParent')
                    : task.restoreToParentName}
                </Typography>
              </React.Fragment>
            )}
          </div>
        </React.Fragment>
      }
    />
  )
}

export default PreviousLocationOption
