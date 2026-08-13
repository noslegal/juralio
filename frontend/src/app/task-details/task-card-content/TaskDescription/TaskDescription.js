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
import { useTranslation } from 'react-i18next'
import { connect, useDispatch, useSelector } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import RichTextInlineEditor from '../../../../components/inputs/rich-text-inline-editor/RichTextInlineEditor'
import colourModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import { MAX_FIELD_LENGTHS } from '../../../constants'
import {
  startEditingTaskDescription,
  stopEditingTaskDescription,
  updateTaskDescription,
} from '../../../task-map/selected-task/selected-task-actions'
import { updateTemplateTaskDescription } from '../../../template-task-details/template-task-actions'
import { Typography } from '@mui/material'

const styles = theme => ({
  root: {
    overflow: 'auto',
  },
  title: { marginTop: theme.spacing(), marginBottom: theme.spacing() },
  editingBackground: {
    backgroundColor: colourModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
  },
  readOnlyEmpty: {
    marginTop: theme.spacing(1),
  },
})

const TaskDescription = props => {
  const { classes } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const descriptionText = useSelector(state => state.selectedTask.description)
  const text = props.matterId ? descriptionText : props.description
  const updateDescription = value => {
    dispatch(stopEditingTaskDescription())
    if (props.matterId) {
      dispatch(
        updateTaskDescription(
          props.matterId,
          props.projectId,
          props.taskId,
          value
        )
      )
    } else {
      dispatch(
        updateTemplateTaskDescription(props.templateId, props.taskId, value)
      )
    }
  }

  if (props.isReadOnly && (text === '' || text === null)) {
    return (
      <Typography className={classes.readOnlyEmpty} variant="caption">
        {t('taskCardContent.descriptionViewOnly')}
      </Typography>
    )
  }

  return (
    <div data-test="task-description" className={classes.root}>
      <RichTextInlineEditor
        text={text}
        variant={'body1'}
        placeholder={t('taskCardContent.descriptionZeroText')}
        isReadOnly={props.isReadOnly}
        saveHandler={updateDescription}
        collapseProps={{ collapsedHeight: 128 }}
        maxChars={MAX_FIELD_LENGTHS.TASK_DESCRIPTION.toString()}
        showCharCount={true}
        compact
      />
    </div>
  )
}

TaskDescription.propTypes = {
  /** updateHandler */
  updateHandler: PropTypes.func.isRequired,
  /** description */
  description: PropTypes.string,
}

function mapStateToProps(state) {
  return {
    editingTaskDescription: state.selectedTask.isEditingDescription,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      startEditingTaskDescription: bindActionCreators(
        startEditingTaskDescription,
        dispatch
      ),
      stopEditingTaskDescription: bindActionCreators(
        stopEditingTaskDescription,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(TaskDescription, styles))
