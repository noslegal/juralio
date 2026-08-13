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

import { useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import JurTemplate from '../../../../assets/images/JurTemplate'
import colorModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import TemplateSwitcher from './TemplateSwitcher'

const useStyles = makeStyles()(theme => ({
  container: {
    height: '-webkit-fill-available',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  iconActive: {
    color: rawColours.primary.grey[200],
    cursor: 'pointer',
  },
  iconDefault: {
    color: colorModifiers.secondaryBackground(rawColours.primary.grey[200]),
  },
}))

const TemplateSwitcherContainer = props => {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const isOnTemplatesRoute = location.pathname.startsWith('/template')

  const { classes } = useStyles()

  const handleClick = () => {
    props.showFab(open)
    setOpen(!open)
  }

  return (
    <div className={classes.container}>
      <div onClick={handleClick}>
        <JurTemplate
          className={
            props.showHover === 3 || open || isOnTemplatesRoute
              ? classes.iconActive
              : classes.iconDefault
          }
        />
      </div>
      {open && !isMobileView && (
        <TemplateSwitcher
          handleClickAway={() => {
            props.showFab(open)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default TemplateSwitcherContainer
