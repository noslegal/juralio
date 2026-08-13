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

import { FormControl, FormHelperText } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import React, { useEffect } from 'react'
import { TASK_PARENT_TYPE } from './TaskParentTypeDefinitions'
import { CONFIG } from '../../../../app/constants'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  root: {},
  destinationField: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },
  icon: {
    color: 'currentColor',
  },
}))

const TaskParentTypeSelect = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const inputElementRef = React.createRef()
  let autoFocusTimer

  const handleChange = e => {
    props.onChange(e.target.value)
  }

  const focus = () => {
    autoFocusTimer = setTimeout(() => {
      if (inputElementRef.current) {
        inputElementRef.current.focus()
      }
    }, 200)
  }

  useEffect(() => {
    if (props.autoFocus) {
      focus()
    }
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(autoFocusTimer)
    }
    //eslint-disable-next-line
  }, [])

  return (
    <div
      className={classes.destinationField}
      style={{ opacity: props.enabled ? 1 : 0.6 }}
    >
      <FormControl error={props.error}>
        <Select
          disabled={!props.enabled}
          value={props.selectedParentType}
          onChange={handleChange}
          data-test="destination-type-selection-dropdown"
          inputProps={{
            classes: {
              root: classes.root,
              icon: props.enabled ? classes.icon : null,
            },
            ref: inputElementRef,
          }}
        >
          <MenuItem
            value={TASK_PARENT_TYPE.UNDEFINED}
            data-test="destination-type-header"
          >
            {t('common.chooseADestination')}
          </MenuItem>
          {props.levelACount < CONFIG.LEVEL_A_TASK_LIMIT && (
            <MenuItem
              value={TASK_PARENT_TYPE.LEVEL_A}
              data-test="destination-level-a"
            >
              {t('taskMove.destinations.levelA')}
            </MenuItem>
          )}
          {!props.projectIsEmpty && (
            <MenuItem
              value={TASK_PARENT_TYPE.SUBTASK_OF}
              data-test="destination-subtask-of"
            >
              {t('taskMove.destinations.subtaskOf')}
            </MenuItem>
          )}
        </Select>
        {props.error ? (
          <FormHelperText data-test="destination-type-selection-dropdown-validation-message">
            {props.validationMessage}
          </FormHelperText>
        ) : null}
      </FormControl>
    </div>
  )
}

export default TaskParentTypeSelect
