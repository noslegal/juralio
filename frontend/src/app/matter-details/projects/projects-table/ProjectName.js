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
import { makeStyles } from 'tss-react/mui'
import WorkstreamReferenceNumberChip from '../../../../components/data-display/workstream-reference-number-chip/WorkstreamReferenceNumberChip'
import TextFieldWithEditIcon from '../../../../components/inputs/read-edit-field/TextFieldWithEditIcon'
import { MAX_FIELD_LENGTHS, OPERATION_MODE } from '../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  field: { paddingLeft: 8, width: '90%' },
}))

const ProjectName = props => {
  const { classes } = useStyles()
  const updateName = name =>
    props.actions.updateProject(props.matterId, props.project.id, {
      name,
    })

  const clearErrorMessage = () =>
    props.actions.clearErrorMessage(props.project.id)

  return (
    <div className={classes.root} data-test={`project-${props.project.id}`}>
      <WorkstreamReferenceNumberChip
        referenceNumber={props.project.referenceNumber}
      />
      <div className={classes.field}>
        <TextFieldWithEditIcon
          canEdit={props.mode === OPERATION_MODE.EDIT}
          updateValue={updateName}
          variant="subtitle2"
          value={props.project.name}
          maxLength={MAX_FIELD_LENGTHS.PROJECT_NAME}
          errorMessage={props.project.errorMessage}
          clearErrorMessages={clearErrorMessage}
          required
          disableBottomMargin
          onClick={() => {}}
        />
      </div>
    </div>
  )
}

ProjectName.propTypes = {
  project: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  clearErrorMessage: PropTypes.func,
  update: PropTypes.func,
}

export default ProjectName
