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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { LABEL_MODIFIERS, LABEL_TYPES } from '../../../app/constants'
import colorModifiers from '../../../theme/color-modifiers'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import ModifierOptions from './ModifierOptions'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(0.5),
    width: 'fit-content',
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    paddingTop: theme.spacing(0.25),
    maxHeight: theme.spacing(2),
  },
  risk: {
    backgroundColor: rawColours.primary.grey[200],
    color: rawColours.primary.black.black,
    cursor: 'pointer',
  },
  riskModifier: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  workflow: {
    backgroundColor: rawColours.primary.black.black,
    color: rawColours.primary.white.primary,
  },
  userDefined: {
    backgroundColor: colorModifiers.selectedAction(rawColours.text.black),
    color: colorModifiers.primaryText(rawColours.text.black),
  },
  text: {
    letterSpacing: 0.4,
  },
  indicator: {
    paddingRight: theme.spacing(0.6),
  },
  editIcon: {
    padding: 0,
    fontSize: '1rem',
  },
  editIconLight: {
    padding: 0,
    fontSize: '1rem',
    color: rawColours.primary.white.primary,
  },
  modifierIcon: {
    cursor: 'pointer',
    fill: colorModifiers.activeAction(rawColours.text.black),
    width: theme.spacing(2),
    height: theme.spacing(2),
    marginLeft: theme.spacing(0.5),
  },
  closeIcon: {
    cursor: 'pointer',
    fill: colorModifiers.activeAction(rawColours.text.black),
    width: theme.spacing(2),
    height: theme.spacing(2),
    marginLeft: theme.spacing(0.5),
  },
  iconWrapper: {
    display: 'flex',
  },
}))

const getModifierBackground = modifier => {
  switch (modifier) {
    case LABEL_MODIFIERS.RED:
      return colorModifiers.riskLabel(rawColours.riskLabels.red.primary)
    case LABEL_MODIFIERS.AMBER:
      return colorModifiers.riskLabel(rawColours.riskLabels.amber.primary)
    case LABEL_MODIFIERS.GREEN:
      return colorModifiers.riskLabel(rawColours.riskLabels.green.primary)
    default:
      return
  }
}

const LabelChip = props => {
  const { classes } = useStyles()
  const {
    addMode,
    editLabel,
    labelId,
    labelType,
    modifier,
    showEditIcon,
    showModifiers,
    showLightBackground,
    showStrikethroughText,
    text,
  } = props

  const isRisk = labelType === LABEL_TYPES.RISK
  const isUserDefined = labelType === LABEL_TYPES.USER_DEFINED
  const [showModifierOptions, setShowModifierOptions] = useState(false)
  const showCloseIcon = showModifiers && !isRisk
  const [anchorEl, setAnchorEl] = useState(null)
  const isViewOnly = props.isReadOnly //useIsViewOnly({ activities: [] })
  if (!text) return null

  return (
    <div
      className={classNames(
        classes.root,
        isRisk
          ? classes.risk
          : isUserDefined
            ? classes.userDefined
            : classes.workflow,
        showLightBackground ? classes.riskModifier : ''
      )}
      onClick={event => {
        if (isRisk && showModifiers) {
          setAnchorEl(event.currentTarget)
          setShowModifierOptions(true)
        }
      }}
      data-test="label-chip"
      style={{
        color: getModifierBackground(modifier),
      }}
    >
      {isRisk && (
        <div className={classes.indicator} data-test="label-chip-indicator">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle
              cx="5"
              cy="5"
              r="4.5"
              fill={
                modifier ? rawColours.riskLabels[modifier].primary : 'black'
              }
              fillOpacity={isRisk && showLightBackground ? 1 : 0.38}
            />
          </svg>
        </div>
      )}
      <Typography
        className={classes.text}
        variant="caption"
        data-test="label-chip-text"
        style={{
          color:
            modifier && modifier === 'amber'
              ? rawColours.riskLabels.amber.text
              : '',
          textDecoration: showStrikethroughText ? 'line-through' : '',
        }}
      >
        {isUserDefined && '#'}
        {text}
      </Typography>
      {showEditIcon && (
        <IconButton
          data-test="edit-label-button"
          aria-label="edit"
          size="small"
          disabled={isViewOnly}
          onClick={() => editLabel(labelId)}
        >
          <EditIcon
            className={
              isRisk || isUserDefined ? classes.editIcon : classes.editIconLight
            }
          />
        </IconButton>
      )}
      {isRisk && showModifiers && (
        <div
          id={`modifiers-option-button-${labelId}`}
          className={classes.iconWrapper}
        >
          <ArrowDropDownIcon
            className={classes.modifierIcon}
            data-test="risk-modifier-button"
          />
        </div>
      )}
      {showCloseIcon && !addMode && (
        <div
          className={classes.iconWrapper}
          onClick={() => {
            props.handleModifierUpdate(null)
          }}
        >
          {!props.viewOnly && (
            <CloseIcon
              className={classes.closeIcon}
              data-test="label-remove-button"
              style={{
                fill: !isUserDefined
                  ? colorModifiers.activeAction(rawColours.primary.grey[200])
                  : '',
              }}
            />
          )}
        </div>
      )}
      {showModifierOptions && (
        <ModifierOptions
          viewOnly={props.viewOnly}
          anchorEl={anchorEl}
          closeModifierOptions={() => setShowModifierOptions(false)}
          handleModifierUpdate={modifier => {
            props.handleModifierUpdate(modifier)
            setShowModifierOptions(false)
          }}
          existingModifier={modifier}
        />
      )}
    </div>
  )
}

LabelChip.propTypes = {
  addMode: PropTypes.bool,
  editLabel: PropTypes.func,
  labelId: PropTypes.string,
  labelType: PropTypes.string,
  showEditIcon: PropTypes.bool,
  showModifiers: PropTypes.bool,
  showLightBackground: PropTypes.bool,
  showStrikethroughText: PropTypes.bool,
  text: PropTypes.string,
}

export default LabelChip
