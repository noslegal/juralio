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

import { Tooltip, Typography } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  selectedOptionReadOnly: {
    boxSizing: 'border-box',
    height: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  selectInput: {
    boxSizing: 'border-box',
    minHeight: 'unset',
    height: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    '&.MuiSelect-select': {
      paddingLeft: `${theme.spacing(1)} !important`,
      paddingRight: `${theme.spacing(1)} !important`,
    },
  },
  selectedOption: {
    borderRadius: theme.spacing(0.5),
    overflow: 'hidden',
    fontSize: theme.spacing(1.5),
    letterSpacing: '0.4px',
    lineHeight: theme.spacing(2), // Only works as string.
    marginRight: 5,
    width: theme.spacing(9.5),
  },
  offOptionOptionDropdown: {
    backgroundColor: juralioColours.taskCell.background.done,
    color: juralioColours.darkText.primary,
    '&:hover': {
      backgroundColor: juralioColours.toggle.done,
    },
  },
  onOptionOptionSelected: {
    backgroundColor: juralioColours.taskCell.background.inProgress,
    color: juralioColours.darkText.primary,
    '&:hover': {
      backgroundColor: juralioColours.toggle.draft,
    },
  },
  optionText: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '0.4px',
    maxHeight: theme.spacing(3),
    color: juralioColours.darkText.primary,
  },
  selectDropdownArrow: {
    marginRight: theme.spacing(0.5),
  },
  selectDropdownArrowDark: {
    marginRight: theme.spacing(0.5),
    fill: 'white',
  },
}))

const statusMenuProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  getContentAnchorEl: null,
}

/** General two status display and selector. */
const StatusSelect = props => {
  const { classes } = useStyles()
  const { currentValue, options } = props

  const isOnValueSelected = currentValue === options.optionOnValue

  const statusSelectInputProps = {
    classes: {
      icon: props.darkChevron
        ? classes.selectDropdownArrowDark
        : classes.selectDropdownArrow,
      iconOpen: props.darkChevron
        ? classes.selectDropdownArrowDark
        : classes.selectDropdownArrow,
    },
  }

  return props.readOnly ? (
    <div disabled data-test="status-select-readonly">
      <Tooltip title={props.tooltipText}>
        <Typography
          className={classNames(
            classes.selectedOption,
            classes.selectedOptionReadOnly,
            isOnValueSelected
              ? classes.onOptionOptionSelected
              : classes.offOptionOptionDropdown
          )}
        >
          {isOnValueSelected ? options.optionOnName : options.optionOffName}
        </Typography>
      </Tooltip>
    </div>
  ) : (
    <Select
      className={classNames(
        classes.selectedOption,
        isOnValueSelected
          ? classes.onOptionOptionSelected
          : classes.offOptionOptionDropdown
      )}
      style={isOnValueSelected ? props.style?.on : props.style?.off}
      renderValue={() =>
        isOnValueSelected ? options.optionOnName : options.optionOffName
      }
      disableUnderline
      classes={{ select: classes.selectInput }}
      data-test="status-select-selection-dropdown"
      value={currentValue}
      onClick={event => event.stopPropagation()}
      onChange={event => {
        event.preventDefault()
        event.stopPropagation()
        props.updateStatus(event, event.target.value)
      }}
      MenuProps={statusMenuProps}
      inputProps={statusSelectInputProps}
    >
      <MenuItem
        value={options.optionOnValue}
        data-test="status-select-on-option"
        style={isOnValueSelected ? { display: 'none' } : {}}
        className={classes.optionText}
      >
        {options.optionOnName}
      </MenuItem>
      <MenuItem
        value={options.optionOffValue}
        data-test="status-select-off-option"
        style={isOnValueSelected ? {} : { display: 'none' }}
        className={classes.optionText}
      >
        {options.optionOffName}
      </MenuItem>
    </Select>
  )
}

StatusSelect.propTypes = {
  currentValue: PropTypes.any,
  options: PropTypes.object.isRequired,
  updateStatus: PropTypes.func.isRequired,
}

export default StatusSelect
