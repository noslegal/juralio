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

import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { TASK_OPERATION_DESTINATION } from './TaskOperationDestinationTypeDefinitions'

const useStyles = makeStyles()(() => ({
  root: {
    width: '100%',
  },
}))

export const DestinationMenu = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()

  return (
    <Select
      value={props.selectedMoveType}
      onChange={props.handleChange}
      displayEmpty
      data-test="destination-selection-dropdown"
      className={classes.root}
    >
      <MenuItem value="" data-test="destination-selection-prompt">
        {t('taskMove.selectDestination')}
      </MenuItem>
      {props.allowMoveToPhase && (
        <MenuItem
          value={TASK_OPERATION_DESTINATION.LEVEL_A}
          data-test="destination-level-a"
        >
          {t('taskMove.destinations.levelA')}
        </MenuItem>
      )}
      <MenuItem
        value={TASK_OPERATION_DESTINATION.SUBTASK_OF}
        data-test="destination-subtask-of"
      >
        {t('taskMove.destinations.subtaskOf')}
      </MenuItem>
      {props.hideProject ? null : (
        <MenuItem
          value={TASK_OPERATION_DESTINATION.ANOTHER_PROJECT}
          data-test="destination-another-project"
        >
          {props.isTemplate !== undefined
            ? t('taskMove.destinations.template')
            : t('taskMove.destinations.anotherWorkstream')}
        </MenuItem>
      )}
    </Select>
  )
}

DestinationMenu.propTypes = {
  /** selectedMoveType */
  selectedMoveType: PropTypes.string.isRequired,
  /** handleChange */
  handleChange: PropTypes.func.isRequired,
  /** root */
  root: PropTypes.string,
  /** hideProject */
  hideProject: PropTypes.bool,
}
