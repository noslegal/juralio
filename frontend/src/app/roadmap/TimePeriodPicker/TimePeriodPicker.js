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

//import AddIcon from '@mui/icons-material/Add'
//import RemoveIcon from '@mui/icons-material/Remove'
import { Button, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { isIE } from '../../../services/helpers/ie-helper'
import juralioColours from '../../../theme/juralio-colours'
import { TimePeriods } from './TimePeriodPickerConstants'
import rawColours from '../../../theme/raw-colours'

const isBrowserIE = isIE()

const styles = makeStyles()(theme => ({
  timePeriodPickerWrapper: {
    position: 'fixed',
    bottom: theme.spacing(1.75),
    right: theme.spacing(11.25),
    zIndex: 999,
    height: theme.spacing(4),
    width: theme.spacing(20.5),
    display: 'flex',
    borderRadius: 5,
    border: '1px solid lightgrey',
    overflow: 'hidden',
    boxShadow:
      '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
  },
  timePickerButton: {
    zIndex: 1301,
    color: rawColours.primary.black[200],
    backgroundColor: theme.palette.common.white,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
    width: theme.spacing(4),
    minWidth: `${theme.spacing(4)} !important`,
    borderRadius: theme.spacing(0),
  },

  timeFrameWrapper: {
    paddingTop: isBrowserIE ? theme.spacing(0.75) : 0,
    backgroundColor: theme.palette.common.white,
    width: '100%',
    display: 'flex',
    '&:hover': {
      cursor: 'pointer',
    },
    borderRight: '1px solid lightgrey',
    borderLeft: '1px solid lightgrey',
  },
  timeFrameWrapperDisabled: {
    '&:hover': {
      cursor: 'unset',
    },
  },
  timeFrameText: {
    margin: 'auto',
    color: juralioColours.darkText.primary,
  },
}))

const getButtonStyle = () => (isBrowserIE ? { marginLeft: -4 } : {})

const TimePeriodPicker = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  const timePeriods = TimePeriods(t)

  const getDisplayText = () => {
    return (
      <div
        className={classNames(
          classes.timeFrameWrapper,
          props.disabled ? classes.timeFrameWrapperDisabled : ''
        )}
        onClick={() => !props.disabled && props.openTimePeriodPickerPopover()}
      >
        <Typography
          className={classes.timeFrameText}
          data-test="time-picker-current-selection"
        >
          {props.displayText}
        </Typography>
      </div>
    )
  }

  return (
    <div
      data-test="roadmap-time-period-picker"
      className={classes.timePeriodPickerWrapper}
    >
      <Tooltip
        title={
          props.previousTimeOption > -1
            ? timePeriods[props.previousTimeOption]
            : ''
        }
        placement="top"
      >
        <Button
          disabled={props.disableLeft || props.disabled}
          className={`${classes.timePickerButton} ${classes.buttonLeft}`}
          onClick={props.selectPreviousTimeOption}
          data-test="time-period-previous-button"
        >
          {/* <RemoveIcon style={getButtonStyle()} /> */}-
        </Button>
      </Tooltip>
      {getDisplayText()}
      <Tooltip
        title={
          props.nextTimeOption > -1 ? timePeriods[props.nextTimeOption] : ''
        }
        placement="top"
      >
        <Button
          disabled={props.disableRight || props.disabled}
          className={`${classes.timePickerButton} ${classes.buttonRight}`}
          onClick={props.selectNextTimeOption}
          data-test="time-period-next-button"
        >
          {/* <AddIcon style={getButtonStyle()} /> */}+
        </Button>
      </Tooltip>
    </div>
  )
}

export default TimePeriodPicker
