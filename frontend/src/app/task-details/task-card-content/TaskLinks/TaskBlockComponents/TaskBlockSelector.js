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
  Autocomplete,
  createFilterOptions,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { renderLevelAndReferenceNumber } from '../../../../../components/navigation/global-header/global-search/GlobalSearchItem'
import { TASK_STATUS } from '../../../../constants'

const styles = makeStyles()(theme => ({
  optionWrapper: {
    display: 'flex',
    width: '100%',
  },
  optionText: {
    marginRight: theme.spacing(),
  },
  levelWrapper: {
    marginLeft: 'auto',
  },
  inputField: {
    maxHeight: '150px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  noResults: {
    display: 'flex',
  },
  link: {
    cursor: 'pointer',
  },
  autocomplete: { marginTop: theme.spacing(0.5) },
}))

const TaskBlockSelector = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  let inputRef = useRef()

  useEffect(() => {
    if (props.hasLoadedTaskBlocks) {
      inputRef.focus()
    }
  }, [props.hasLoadedTaskBlocks])

  const options = props.validTasks
    .filter(t => !props.selectedTasks.includes(t))
    .filter(t => (props.blocks ? t.status !== TASK_STATUS.IN_PROGRESS : true))

  return (
    <Autocomplete
      onOpen={props.onOpen()}
      multiple
      className={classes.autocomplete}
      disableClearable
      onChange={(e, v) => {
        e.stopPropagation()
        props.setSelectedTasks(v)
      }}
      data-test="task-block-selector"
      renderInput={params => (
        <TextField
          {...params}
          placeholder={
            props.hasMaxedOutBlocks
              ? t('taskBlocksDialog.maxBlocksReached')
              : props.hasLoadedTaskBlocks
                ? t('taskBlocksDialog.searchForTasks')
                : t('taskBlocksDialog.loadingTasks')
          }
          inputRef={input => {
            inputRef = input
          }}
          className={classes.inputField}
        />
      )}
      disabled={!props.hasLoadedTaskBlocks || props.hasMaxedOutBlocks}
      value={props.selectedTasks}
      options={options}
      getOptionLabel={option => (
        <div className={classes.optionWrapper}>
          <Typography className={classes.optionText} data-test="option-name">
            {option.name}
          </Typography>
          <div className={classes.levelWrapper}>
            {renderLevelAndReferenceNumber(option, -1)}
          </div>
        </div>
      )}
      filterOptions={createFilterOptions({
        stringify: option => `${option.name} ${option.referenceNumber}`,
      })}
      noOptionsText={
        props.isLoaded ? (
          <Typography className={classes.noResults}>
            {options.length === 0
              ? t('taskBlocksDialog.noValidBlocks')
              : t('taskBlocksDialog.taskUnavlailable')}
          </Typography>
        ) : (
          <BigDataSpinner size={20} />
        )
      }
      renderValue={(tagValue, getItemProps) =>
        tagValue.map((option, index) => {
          return null
        })
      }
    />
  )
}
export default TaskBlockSelector
