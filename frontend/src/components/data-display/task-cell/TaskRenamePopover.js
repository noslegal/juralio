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

import { Popover, TextField } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  MAX_FIELD_LENGTHS,
  TASK_MAP_VIEW_MODE_ENUM,
} from '../../../app/constants'

const anchorOrigin = {
  vertical: 0,
  horizontal: 4,
}
const compactAnchorOrigin = {
  vertical: -12,
}
const transformOrigin = {
  vertical: 5,
  horizontal: 10,
}
const transformOriginPlaceholder = {
  vertical: 15,
  horizontal: 10,
}
const compactTransformOrigin = {
  vertical: 4,
  horizontal: 'left',
}
const popoverStyle = {
  boxShadow: 'none',
}

const textInputProps = {
  disableUnderline: true,
  inputProps: { 'aria-label': 'bare', maxLength: MAX_FIELD_LENGTHS.TASK_NAME },
}

const TaskRenamePopover = props => {
  const [renameState, setRenameState] = useState(null)
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const compactMode = props.isTemplate
    ? true
    : detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT

  useEffect(() => {
    setRenameState({
      textValue: props.task ? props.task.name : '',
    })
  }, [props.task])

  const evaluatedAnchor =
    typeof props.anchor === 'function' ? props.anchor() : props.anchor

  const onBlur = () => {
    const isNameNew = !props.task
    const isNameDifferent =
      props.task && renameState && renameState.textValue !== props.task.name
    const isValidTaskName =
      !!renameState &&
      !!renameState.textValue &&
      renameState.textValue.match(/^\s*$/) === null

    if ((isNameNew || isNameDifferent) && isValidTaskName) {
      return props.updateNameHandler(
        renameState.textValue,
        props.task ? props.task.id : null
      )
    }
  }

  const onKeyPress = e => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      onBlur()
      setRenameState(null)
      props.onClose('save')
      e.preventDefault()
    }

    if (e.key === 'Escape') {
      setRenameState(null)
      props.onClose()
    }
  }

  const onChange = e =>
    setRenameState({ ...renameState, textValue: e.target.value })

  const popoverWidth = evaluatedAnchor ? evaluatedAnchor.clientWidth : 0
  const textFieldStyle = {
    minWidth: Math.max(popoverWidth, 156),
    paddingLeft: 4,
    paddingRight: 4,
  }

  //onFocus function used to fix IE11 bug where focus was at wrong position
  const focusHandler = e => {
    const val = e.target.value
    e.target.value = ''
    e.target.value = val
    e.target.select()
  }

  const closeHandler = () => {
    setRenameState(null)
    props.onClose()
  }

  //fix issue with name popover losing position
  if (!document.body.contains(evaluatedAnchor)) {
    return ''
  }

  return (
    <Popover
      anchorEl={evaluatedAnchor}
      open={!!evaluatedAnchor}
      anchorOrigin={compactMode ? compactAnchorOrigin : anchorOrigin}
      transformOrigin={
        compactMode
          ? compactTransformOrigin
          : props.placeholder
            ? transformOriginPlaceholder
            : transformOrigin
      }
      style={popoverStyle}
      onClose={closeHandler}
    >
      <TextField
        value={renameState ? renameState.textValue : ''}
        data-test="edit-name-field"
        style={textFieldStyle}
        onChange={onChange}
        onKeyDown={onKeyPress}
        onBlur={onBlur}
        margin="none"
        autoFocus
        onFocus={focusHandler}
        slotProps={{
          input: textInputProps,
        }}
      />
    </Popover>
  )
}

TaskRenamePopover.propTypes = {
  /** task */
  task: PropTypes.object,
  /** updateNameHandler */
  updateNameHandler: PropTypes.func.isRequired,
  /** onClose */
  onClose: PropTypes.func.isRequired,
  /** anchor */
  anchor: PropTypes.object,
}

export default TaskRenamePopover
