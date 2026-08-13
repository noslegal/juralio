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

import { Switch, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  switchAndText: { display: 'flex', alignItems: 'center' },
}))

const ToggleWithLabel = props => {
  const { classes } = useStyles()

  const {
    checked,
    disabledTooltipText,
    enabled,
    isAddEnabled,
    item,
    updateHandler,
    labelText,
  } = props

  return (
    <div className={classes.root}>
      <Tooltip title={!isAddEnabled && !enabled ? disabledTooltipText : ''}>
        <div className={classes.switchAndText}>
          <Switch
            disabled={!enabled}
            data-test="switch-with-text"
            color="primary"
            checked={checked}
            onChange={() => updateHandler(item.id.toString(), checked, item)}
          />

          <Typography
            variant="caption"
            data-test="switch-with-text-status"
            style={enabled ? {} : { color: rawColours.primary.grey.main }}
          >
            {labelText[checked ? 'on' : 'off']}
          </Typography>
        </div>
      </Tooltip>
    </div>
  )
}

ToggleWithLabel.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabledTooltipText: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  isAddEnabled: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  labelText: PropTypes.object.isRequired,
  updateHandler: PropTypes.func.isRequired,
}

export default ToggleWithLabel
