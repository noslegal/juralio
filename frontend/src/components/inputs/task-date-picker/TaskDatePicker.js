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

import { Button, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { DATE_FORMAT_FULL, TASK_STATUS } from '../../../app/constants'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import colourModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    textTransform: 'none',
    marginLeft: theme.spacing(0.5),
    color: colourModifiers.secondaryText(rawColours.text.black),
  },
  text: {
    color: colourModifiers.primaryText(rawColours.text.black),
    padding: theme.spacing(0.5),
  },
  button: {
    borderRadius: 4,
    padding: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    color: juralioColours.darkText.primary,
    textTransform: 'none',
    fontWeight: 'unset',
    backgroundColor: colourModifiers.alternativeHoverAction(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      opacity: '60%',
    },
  },
}))

const TaskDatePicker = props => {
  const { classes } = useStyles()
  const {
    label,
    buttonLabel,
    showDatePicker,
    dateType,
    date,
    taskId,
    disabled,
  } = props

  const isOverdue = date && new Date(date) < new Date()
  const { t } = useTranslation()

  return (
    <Tooltip
      title={t('matter.viewOnly')}
      disableHoverListener={!props.viewOnly}
    >
      <div className={classes.root}>
        {label && (
          <Typography variant="caption" className={classes.label}>
            {label}
          </Typography>
        )}
        <Button
          data-test="task-date-picker"
          color="inherit"
          classes={{
            colorInherit: classes.button,
          }}
          variant="contained"
          disableElevation
          style={{
            color: isOverdue ? rawColours.error.primary : 'unset',
            backgroundColor:
              props.taskStatus === TASK_STATUS.NOT_STARTED &&
              colourModifiers.restingButtonOpacity(
                rawColours.primary.grey.main
              ),
          }}
          onClick={() => showDatePicker(dateType)}
          id={`taskDatePicker-${dateType}-${taskId}`}
          disabled={disabled}
        >
          <Typography variant="caption" className={classes.text}>
            {date
              ? getDateDisplayString(date, DATE_FORMAT_FULL, false)
              : buttonLabel}
          </Typography>
        </Button>
      </div>
    </Tooltip>
  )
}

export default TaskDatePicker

TaskDatePicker.propTypes = {
  label: PropTypes.string,
  buttonLabel: PropTypes.string.isRequired,
  taskId: PropTypes.number.isRequired,
}
