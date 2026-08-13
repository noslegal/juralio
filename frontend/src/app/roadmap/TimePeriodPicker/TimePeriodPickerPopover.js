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

import { Button, ClickAwayListener, Paper, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { TimePeriods } from './TimePeriodPickerConstants'

const styles = makeStyles()(theme => ({
  popoverWrapper: {
    position: 'fixed',
    bottom: theme.spacing(6),
    right: theme.spacing(10.5),
    zIndex: 1302,
    width: theme.spacing(22.5),
    display: 'flex',
    flexDirection: 'column',
  },
  optionsButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    width: '100%',
    textTransform: 'unset !important',
  },
  selectedOption: {
    backgroundColor: juralioColours.named.beige[200],
  },
}))

const TimePeriodPickerPopover = props => {
  const { t } = useTranslation()
  const timePeriods = TimePeriods(t)
  const { classes } = styles()
  const generationOption = option => {
    return (
      <div key={option}>
        <Button
          data-test="time-period-picker-option"
          className={`${classes.optionsButton} ${
            props.currentSelection === option && classes.selectedOption
          }`}
          disabled={props.currentSelection === option}
          onClick={() => props.selectOption(option)}
        >
          <Typography>{timePeriods[option]}</Typography>
        </Button>
      </div>
    )
  }

  return (
    <ClickAwayListener
      onClickAway={() => props.selectOption(props.currentSelection)}
    >
      <Paper
        className={classes.popoverWrapper}
        data-test="time-period-picker-popover"
      >
        {props.timePeriodOptions.map(option => generationOption(option))}
      </Paper>
    </ClickAwayListener>
  )
}

export default TimePeriodPickerPopover
