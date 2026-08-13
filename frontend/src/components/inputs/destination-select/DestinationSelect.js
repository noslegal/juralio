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

import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { TASK_PARENT_TYPE } from '../../dialog/destination-dialog/task-parent-type-select/TaskParentTypeDefinitions'
import WorkstreamListItem from '../workstream-select/WorkstreamListItem'

const useStyles = makeStyles()(theme => ({
  searchContainer: {
    paddingTop: theme.spacing(2),
  },
  selectStyle: {
    width: '100%',
  },
}))

const DestinationSelect = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { projects } = props

  const handleChange = e => {
    let project = projects.items.filter(p => p.name === e.target.value)
    props.setParentTypeSelection(e.target.value)
    props.handleProjectInitialised(project[0], e.target.value)
    if (e.target.value === TASK_PARENT_TYPE.LEVEL_A) {
      props.setError(e.target.value)
    }
    if (!Object.values(TASK_PARENT_TYPE).includes(e.target.value)) {
      //check if parent type is in class ie if it is a project vs level a
      props.handleProjectChange(project[0])
    }
  }

  return (
    <div
      data-test="destination-select-container"
      className={classes.searchContainer}
    >
      <FormControl
        className={classes.selectStyle}
        error={
          props.parentTypeSelection === TASK_PARENT_TYPE.LEVEL_A && props.error
        }
      >
        <Select
          data-test="destination-select"
          className={classes.selectStyle}
          value={props.parentTypeSelection}
          defaultValue={TASK_PARENT_TYPE.UNDEFINED}
          onChange={handleChange}
        >
          <MenuItem disabled value={TASK_PARENT_TYPE.UNDEFINED}>
            {t('templates.selectDestination')}
          </MenuItem>
          {projects.items.length < 16 && (
            <MenuItem
              data-test="new-stream"
              key={'newStream'}
              value={TASK_PARENT_TYPE.NEW_WORKSTREAM}
            >
              {t('templates.createWorkstream')}
            </MenuItem>
          )}
          {projects.items.length > 1
            ? projects.items
                .filter(p => (!props.showClosed ? p.active : true))
                .map(p => {
                  return [
                    <MenuItem value={p.name}>
                      <WorkstreamListItem item={p} />
                    </MenuItem>,
                  ]
                })
            : [
                <MenuItem
                  data-test="level-a"
                  key={TASK_PARENT_TYPE.LEVEL_A}
                  value={TASK_PARENT_TYPE.LEVEL_A}
                >
                  {t('templates.levelA')}
                </MenuItem>,
                <MenuItem
                  data-test="subtask-of"
                  key={TASK_PARENT_TYPE.SUBTASK_OF}
                  value={TASK_PARENT_TYPE.SUBTASK_OF}
                >
                  {t('templates.subtask')}
                </MenuItem>,
              ]}
        </Select>
        <FormHelperText>
          {props.parentTypeSelection === TASK_PARENT_TYPE.LEVEL_A &&
            props.error}
        </FormHelperText>
      </FormControl>

      {props.parentTypeSelection === TASK_PARENT_TYPE.SUBTASK_OF &&
        props.renderTaskSelect()}
      {props.parentTypeSelection === TASK_PARENT_TYPE.NEW_WORKSTREAM &&
        props.renderProjectName()}
      {!Object.values(TASK_PARENT_TYPE).includes(props.parentTypeSelection) &&
        props.renderParentSelection()}
    </div>
  )
}

DestinationSelect.propTypes = {
  selectedMatterId: PropTypes.number.isRequired,
  selectedProjectId: PropTypes.number,
  projects: PropTypes.object.isRequired,
  handleProjectChange: PropTypes.func.isRequired,
  newMatterDetails: PropTypes.func.isRequired,
  renderTaskSelect: PropTypes.func.isRequired,
  renderProjectName: PropTypes.func.isRequired,
  parentTypeSelection: PropTypes.string.isRequired,
  setParentTypeSelection: PropTypes.func.isRequired,
  renderParentSelection: PropTypes.func.isRequired,
  handleProjectInitialised: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  error: PropTypes.string.isRequired,
  showClosed: PropTypes.bool,
}

export default DestinationSelect
