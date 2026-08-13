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

import { Button } from '@mui/material'
import TextField from '@mui/material/TextField'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  textField: {
    width: '100%',
    marginRight: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    gap: theme.spacing(),
  },
}))

const LabelAddEdit = props => {
  const { classes } = useStyles()
  const {
    cancelText,
    cancelHandler,
    labelId,
    labelName,
    labelType,
    placeHolderText,
    saveText,
    saveHandler,
    editLabel,
  } = props

  const [disableSave, setDisableSave] = useState(true)
  const [labelText, setLabelText] = useState(labelName)

  const exitEditingMode = () => {
    if (cancelHandler) {
      cancelHandler()
    }
    editLabel(null)
  }
  const saveLabelHandler = () => {
    labelId === '-1'
      ? saveHandler(labelText, labelType)
      : saveHandler({ id: labelId, name: labelText })
    exitEditingMode()
  }
  const onKeyPress = e => {
    if ((e.key === 'Enter' || e.key === 'Tab') && labelText.length > 0) {
      saveLabelHandler()
      return
    }

    if (e.key === 'Escape') {
      exitEditingMode()
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.textField}>
        <TextField
          id="standard-basic"
          data-test="label-text-field"
          defaultValue={labelName}
          onChange={e => {
            setDisableSave(e.target.value.trim() === labelName)
            setLabelText(e.target.value)
          }}
          onKeyDown={onKeyPress}
          variant="standard"
          autoFocus={true}
          fullWidth={true}
          placeholder={placeHolderText}
          slotProps={{
            htmlInput: {
              maxLength: MAX_FIELD_LENGTHS.LABEL,
            },
          }}
        />
      </div>
      <div className={classes.buttons}>
        <Button
          data-test="label-text-field-save-button"
          variant="contained"
          color="primary"
          size="small"
          onClick={saveLabelHandler}
          disabled={disableSave || labelText.length === 0}
        >
          {saveText}
        </Button>
        <Button
          data-test="label-text-field-cancel-button"
          variant="outlined"
          color="primary"
          size="small"
          onClick={exitEditingMode}
        >
          {cancelText}
        </Button>
      </div>
    </div>
  )
}

LabelAddEdit.propTypes = {
  cancelText: PropTypes.string.isRequired,
  cancelHandler: PropTypes.func.isRequired,
  labelId: PropTypes.string.isRequired,
  labelName: PropTypes.string.isRequired,
  saveText: PropTypes.string.isRequired,
  saveHandler: PropTypes.func.isRequired,
  editLabel: PropTypes.func.isRequired,
}

export default LabelAddEdit
