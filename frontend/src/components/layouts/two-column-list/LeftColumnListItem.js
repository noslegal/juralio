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

import { ListItemButton, Typography } from '@mui/material'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import withUser from '../../../services/with-user/WithUser'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
    padding: 0,
    paddingTop: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
  },
  selectedRoot: {
    backgroundColor: JuralioNamedColours.black[200],
    color: juralioColours.whiteText.primary,
    '&:hover': {
      backgroundColor: juralioColours.darkText.primary,
    },
  },
  icon: {
    color: JuralioNamedColours.black[200],
    paddingTop: theme.spacing(0.5),
    height: theme.spacing(5),
    marginLeft: theme.spacing(0.5),
    width: theme.spacing(5),
  },
  selectedIcon: {
    color: theme.palette.common.white,
  },
  textColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing(33),
  },
  subtitle: {
    color: juralioColours.control.borderLight,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1.5),
  },
  selectedSubtitle: {
    color: juralioColours.whiteText.secondary,
  },
})

const LeftColumnItem = props => {
  const { selectItem, itemKey, icon, isSelected } = props

  return (
    <ListItemButton
      className={`${props.classes.root} ${
        isSelected ? props.classes.selectedRoot : ''
      }`}
      onClick={() => {
        if (props.selectionResetHandler) props.selectionResetHandler()
        selectItem(itemKey)
      }}
      data-test={props.dataTest}
    >
      <div
        className={`${props.classes.icon} ${
          isSelected ? props.classes.selectedIcon : ''
        }`}
      >
        {icon}
      </div>
      <div className={props.classes.textColumn}>
        <Typography variant="subtitle1">{props.header}</Typography>
        <Typography
          variant="caption"
          className={`${props.classes.subtitle} ${
            isSelected ? props.classes.selectedSubtitle : ''
          }`}
        >
          {props.subtitle}
        </Typography>
      </div>
    </ListItemButton>
  )
}

export default withUser(withStyles(LeftColumnItem, styles))
