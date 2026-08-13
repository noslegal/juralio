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

import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => {
  return {
    icon: {
      minWidth: 'auto',
      paddingLeft: theme.spacing(),
      marginRight: theme.spacing(3),
    },
    upper: {
      color: juralioColours.darkText.secondary,
    },
    lower: {
      color: juralioColours.darkControl.backgroundSecondary,
    },
  }
})

const NavigationItem = props => {
  const [isOpen, setIsOpen] = useState(false)
  const [canOpen, setCanOpen] = useState(true)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const Icon = props.link.icon

  const renderLinkContent = () => (
    <>
      <ListItemIcon
        className={classNames(
          classes.icon,
          props.lower ? classes.lower : classes.upper
        )}
      >
        <Icon data-test={`${props.link.dataTest}-icon`} />
      </ListItemIcon>
      <ListItemText
        data-test={`${props.link.dataTest}-text`}
        primary={t(props.link.linkText)}
        className={props.lower ? classes.lower : classes.upper}
        slotProps={{
          primary: { variant: props.lower ? 'caption' : 'body2' },
        }}
      />
    </>
  )

  const topLevelProps = {
    button: true,
    'data-test': `${props.link.dataTest}-navigation`,
  }

  return (
    <Tooltip
      placement="right"
      title={t(props.link.linkText)}
      disableHoverListener={!(props.displayTooltips && canOpen)}
      open={props.displayTooltips && canOpen && isOpen}
      onOpen={() => {
        setIsOpen(canOpen)
      }}
      onClose={() => {
        setIsOpen(false)
        setCanOpen(false)
        setTimeout(() => setCanOpen(true), 250)
      }}
    >
      {props.link.onClick ? (
        <ListItem onClick={props.link.onClick} {...topLevelProps}>
          {renderLinkContent()}
        </ListItem>
      ) : (
        <ListItem
          activeClassName="Mui-selected"
          to={props.link.linkLocation}
          component={NavLink}
          {...topLevelProps}
        >
          {renderLinkContent()}
        </ListItem>
      )}
    </Tooltip>
  )
}

export default NavigationItem
