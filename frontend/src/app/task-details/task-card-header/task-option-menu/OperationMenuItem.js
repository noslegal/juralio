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

import Icon from '@mdi/react'
import { Tooltip, Typography } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import React, { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'

const styles = theme => ({
  menuText: {
    color: juralioColours.darkText.secondary,
  },
  menuIcon: {
    display: 'inline-block',
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    opacity: 0.6,
  },
  menuIconSvg: {
    display: 'inline-block',
    marginLeft: '-4px',
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    verticalAlign: 'middle',
    opacity: 0.9,
  },
})

const OperationMenuItem = forwardRef((props, ref) => {
  const MenuIcon = props.icon
  const { t } = useTranslation()
  return (
    <Tooltip
      placement={'right'}
      disableFocusListener={!props.tooltipText}
      disableTouchListener={!props.tooltipText}
      disableHoverListener={!props.tooltipText}
      title={props.tooltipText}
    >
      <span>
        <MenuItem
          ref={ref}
          onClick={event => props.handleClick(event, props.task)}
          disabled={props.disabled}
        >
          {props.iconPath ? (
            <Icon
              path={props.iconPath}
              size={1}
              color={juralioColours.control.borderLight}
              className={props.classes.menuIconSvg}
            />
          ) : (
            <MenuIcon className={props.classes.menuIcon} display="inline" />
          )}

          <span
            data-test={`task-card-option-menu-${props.operationType.toLowerCase()}`}
          >
            <Typography
              className={props.classes.menuText}
              variant="subtitle1"
              data-test={`menu-text-${props.operationType.toLowerCase()}`}
            >
              {t('operationMenuItem.' + props.operationType.toLowerCase())}
            </Typography>
          </span>
        </MenuItem>
      </span>
    </Tooltip>
  )
})

export default withStyles(OperationMenuItem, styles)
