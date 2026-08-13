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
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: theme.spacing(16),
  },
  selectedOption: {
    borderRadius: theme.spacing(0.5),
    fontSize: theme.spacing(1.25),
    height: theme.spacing(3),
    letterSpacing: '0.4px',
    marginLeft: theme.spacing(2),
    marginRight: '5px',
    textAlign: 'center',
    textTransform: 'capitalize',
    width: theme.spacing(12),
  },
  optionText: {
    lineHeight: theme.spacing(2),
    letterSpacing: '0.4px',
    color: juralioColours.darkText.primary,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  selectDropdownArrow: {
    fill: juralioColours.darkText.secondary,
  },
  grey: {
    backgroundColor: juralioColours.taskCell.background.inProgress,
    color: juralioColours.darkText.secondary + '!important',
    '&:hover': {
      backgroundColor: juralioColours.toggle.draft,
    },
  },
  blue: {
    backgroundColor: juralioColours.taskCell.background.done,
    color: juralioColours.darkText.secondary + '!important',
    '&:hover': {
      backgroundColor: juralioColours.toggle.done,
    },
  },
}))

const selectProps = {
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

const SelectToggle = props => {
  const { classes } = useStyles()
  const StatusSelectInputProps = {
    classes: {
      icon: classes.selectDropdownArrow,
    },
  }

  const [toolTipOpen, setToolTipOpen] = useState(false)
  const [options, setOptions] = useState(undefined)
  useEffect(() => {
    setOptions(
      props.options.filter(
        option =>
          option.optionLabel !==
          props.options[props.selectedOptionIndex].optionLabel
      )
    )
    setToolTipOpen(false)
  }, [props.options, props.selectedOptionIndex, props.dialogCancelledHandler])

  if (!options || props.selectedOptionIndex === undefined) return null

  const onOpen = () => {
    setToolTipOpen(false)
  }

  const onClose = () => {
    setToolTipOpen(false)
  }

  const selectThisOption = selectedOption => {
    let selectedIndex = props.options.findIndex(
      option => option.optionLabel === selectedOption.optionLabel
    )
    setOptions(
      props.options.filter(
        option => option.optionLabel !== selectedOption.optionLabel
      )
    )
    props.options[selectedIndex].action()
    setToolTipOpen(false)
  }

  return (
    <div className={classes.root}>
      <Tooltip
        title={props.options[props.selectedOptionIndex].toolTip}
        open={toolTipOpen}
        onMouseEnter={() => !props.disabled && setToolTipOpen(false)}
      >
        <Select
          onMouseEnter={() => !props.disabled && setToolTipOpen(true)}
          onMouseLeave={() => setToolTipOpen(false)}
          className={classNames(classes.selectedOption, {
            [classes.grey]: props.options[props.selectedOptionIndex].grey,
            [classes.blue]: props.options[props.selectedOptionIndex].blue,
          })}
          renderValue={() =>
            props.options[props.selectedOptionIndex].selectLabel
          }
          disableUnderline
          data-test="select-toggle"
          value={options[0].optionLabel}
          onChange={() => {}}
          inputProps={StatusSelectInputProps}
          MenuProps={selectProps}
          onOpen={onOpen}
          onClose={onClose}
          disabled={props.disabled}
        >
          {options.map(option => (
            <MenuItem
              onClick={() => selectThisOption(option)}
              key={option.optionLabel}
              value={option.optionLabel}
              className={classNames(classes.root, {
                [classes.grey]: option.grey,
                [classes.blue]: option.blue,
              })}
              data-test={`select-toggle-${option.optionLabel}`}
            >
              <Typography variant="body1" className={classes.optionText}>
                {option.optionLabel}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </Tooltip>
    </div>
  )
}

export default SelectToggle
