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

import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { EMPTY_STRING } from '../../../app/constants'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import juralioColours from '../../../theme/juralio-colours'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import ReadEditField from './ReadEditField'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
  },
  editable: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    display: 'flex',
    color: juralioColours.darkControl.backgroundSecondary,
    padding: theme.spacing(0, 0, 0, 2),
    cursor: 'pointer',
  },
}))

const TextFieldWithEditIcon = props => {
  const [isEditing, setIsEditing] = useState(false)
  const [validationMessage, setValidationMessage] = useState(EMPTY_STRING)
  const [localValueCopy, setLocalValueCopy] = useState(EMPTY_STRING)
  const { t } = useTranslation()
  const { classes } = useStyles()

  const clearValidation = () => setValidationMessage(EMPTY_STRING)

  const enterEditState = () => {
    clearValidation()
    setIsEditing(true)
  }

  const getValidationMessage = validationMessage
    ? validationMessage
    : props.errorMessage

  const exitEditState = () => {
    if (getValidationMessage) {
      setLocalValueCopy(props.value)
    } else {
    }

    props.clearErrorMessages && props.clearErrorMessages()
    if (props.clearEditing) {
      props.clearEditing()
    }
    setIsEditing(false)
  }

  const blurHandler = value => {
    props.clearErrorMessages && props.clearErrorMessages()
    const hasValue = checkTextHasNonWhitespaceContent(value)
    const newValue = value
    const isNewValueValid = hasValue || !props.required

    if (isNewValueValid) {
      setLocalValueCopy(newValue)
      exitEditState()
      return props.updateValue(newValue)
    }

    setValidationMessage(t('commonValidationMessages.requiredField'))
    return Promise.reject()
  }
  const editMode = isEditing || props.errorMessage?.length > 0 || props.editing

  const clickHandler = () => {
    !props.hideIcon && props.canEdit && enterEditState()
  }

  useEffect(
    () =>
      setLocalValueCopy(
        props.rejectedValue ? props.rejectedValue : props.value
      ),
    [props.value, props.rejectedValue, setLocalValueCopy]
  )

  const renderEditIcon = () => {
    if (!isEditing && props.canEdit) {
      return <EditIcon data-test="edit-icon" className={classes.icon} />
    }
  }

  return (
    <div className={classNames(classes.root)}>
      <div
        className={classes.editable}
        onClick={clickHandler}
        data-test="text-field-with-edit-icon"
      >
        <ReadEditField
          value={localValueCopy}
          onBlur={blurHandler}
          onClick={props.onClick}
          onNoChangeBlur={exitEditState}
          maxLength={props.maxLength}
          variant={props.variant}
          zeroState={props.placeholder || EMPTY_STRING}
          hasInitialFocus={false}
          validationMessage={getValidationMessage}
          clearValidation={clearValidation}
          disableClickToEdit={true}
          editMode={editMode}
          cancelHandler={exitEditState}
          wrapText={props.wrapText}
          multiline={props.multiline}
          autoWidth={props.autoWidth}
          label={props.label}
          usageContext={props.usageContext || 'TextFieldWithEditIcon'}
          collapseProps={props.collapseProps}
        />
        {!props.hideIcon && renderEditIcon()}
      </div>
    </div>
  )
}

TextFieldWithEditIcon.propTypes = {
  /** value */
  value: PropTypes.string,
  /** updateValue */
  updateValue: PropTypes.func.isRequired,
  /** rejectedValue */
  rejectedValue: PropTypes.string,
  /** maxLength */
  maxLength: PropTypes.number.isRequired,
  /** multiline */
  multiline: PropTypes.bool,
  /** clearErrorMessages */
  clearErrorMessages: PropTypes.func,
  /** placeholder */
  placeholder: PropTypes.any,
  /** required */
  required: PropTypes.bool,
  /** canEdit */
  canEdit: PropTypes.bool,
  /** hide icon */
  hideIcon: PropTypes.bool,
  /** label */
  label: PropTypes.string,
  /** disableBottomMargin */
  disableBottomMargin: PropTypes.bool,
}

export default TextFieldWithEditIcon
