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

import { Tooltip } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../../app/constants'
import IsWidthDown from '../../../hooks/width-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { DateIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import {
  lightButtonBackgroundColour,
  lightButtonHoverColour,
} from '../light-button/LightButton'
import DatePickerOld from './DatePickerOld'

const styles = theme => ({
  root: {
    padding: theme.spacing(),

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0.5),
    },

    borderRadius: theme.spacing(),
    maxWidth: theme.spacing(42.5),
    overflow: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  rootNoPadding: {
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0.5),
    },

    borderRadius: theme.spacing(),
    width: theme.spacing(42.5),
    maxWidth: theme.spacing(42.5),
    overflow: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  withoutDate: {
    flex: 1,
    height: theme.spacing(6),
    width: '100%',
  },
  withDate: {
    flex: 1,
    height: theme.spacing(6),
    width: '100%',
  },
  dateIcon: {
    color: JuralioNamedColours.black[200],
    paddingRight: theme.spacing(),
  },
  inputTop: {
    cursor: 'pointer',
    backgroundColor: lightButtonBackgroundColour,
    '&:hover': {
      backgroundColor: lightButtonHoverColour,
    },
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    height: theme.spacing(2.5),
  },
  input: {
    cursor: 'pointer',
  },
  floatingLabelFocusStyle: {
    cursor: 'pointer',
    color: JuralioNamedColours.black[200],
    paddingLeft: theme.spacing(0.5),
    textAlign: 'center',
  },
  error: {
    color: juralioColours.error,
  },
  notStarted: {
    backgroundColor: colorModifiers.restingButtonOpacity(
      rawColours.primary.grey.main
    ),
  },
})

const DateField = props => {
  const { error, classes } = props
  const { t } = useTranslation()

  const isCompletedMilestone =
    props.task?.isMilestone && props.task?.status === TASK_STATUS.DONE

  return (
    <Tooltip title={props.viewOnly ? t('matter.viewOnly') : ''}>
      <div
        className={props.noPadding ? classes.rootNoPadding : classes.root}
        style={!IsWidthDown('md', props.width) ? { width: '100%' } : null}
      >
        {!props.hideIcon && (
          <DateIcon
            className={classNames(classes.dateIcon, error && classes.error)}
          />
        )}

        <DatePickerOld
          isCompletedMilestone={isCompletedMilestone}
          minDate={props.minDate}
          maxDate={props.maxDate}
          value={props.value ? props.value : null}
          label={props.label}
          onChange={props.onChange}
          disableFuture={props.disableFuture}
          clearable={props.clearable}
          onClose={() => {}}
          error={error}
          disabled={props.disabled}
          data-test={props['data-test']}
          isTaskNotStarted={props.isTaskNotStarted}
        />
      </div>
    </Tooltip>
  )
}

export default withStyles(DateField, styles)
