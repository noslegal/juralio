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

import { FormControlLabel, Radio, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import InfoTooltip from '../../data-display/info-tooltip/InfoTooltip'

const radioStyles = theme => ({
  radioOption: {
    paddingLeft: theme.spacing(2),
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  title: {
    fontSize: theme.spacing(2),
    color: juralioColours.darkText.primary,
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
    fontSize: theme.spacing(1.5),
  },
  label: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: theme.spacing(25),
  },
  radio: {
    '&$checked': {
      color: juralioColours.theme.primary.main,
    },
  },
  checked: {},
  tooltip: {
    marginLeft: theme.spacing(),
  },
})

const RadioOption = props => {
  const { labelPlacement, tooltipText } = props
  return (
    <FormControlLabel
      value={props.value}
      className={props.classes.label}
      control={
        <Radio
          classes={{
            root: props.classes.radio,
            checked: props.classes.checked,
          }}
        />
      }
      label={
        <div className={props.classes.radioOption}>
          <div className={props.classes.titleContainer}>
            <Typography
              data-test="radio-option-title"
              className={props.classes.title}
            >
              {props.title}
            </Typography>
            {tooltipText && (
              <div className={props.classes.tooltip}>
                <InfoTooltip text={tooltipText} />
              </div>
            )}
          </div>
          {props.subTitle && (
            <Typography
              data-test="radio-option-subtitle"
              className={props.classes.subtitle}
            >
              {props.subTitle}
            </Typography>
          )}
        </div>
      }
      labelPlacement={labelPlacement}
    />
  )
}

RadioOption.propTypes = {
  labelPlacement: PropTypes.oneOf(['start', 'top', 'bottom', 'end']),
  levelNumber: PropTypes.number,
}

export default withStyles(RadioOption, radioStyles)
