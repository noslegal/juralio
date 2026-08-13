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
import { makeStyles } from 'tss-react/mui'
import MatterSwitcher from './MatterSwitcher'
import MobileMatterSwitcher from './mobile/MatterSwitcher'
import JurMatter from '../../../../assets/images/JurMatter'
import rawColours from '../../../../theme/raw-colours'
import colorModifiers from '../../../../theme/color-modifiers'

const MatterSwitcherContainer = props => {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))

  const { classes } = makeStyles()(() => ({
    container: {
      height: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  }))()

  const handleClick = () => {
    if (!open && window.location.href.includes('/home')) {
    }
    props.showFab(open)
    setOpen(!open)
  }

  return (
    <div className={classes.container}>
      <div
        onClick={() => {
          handleClick()
        }}
      >
        <JurMatter
          style={
            props.showHover === 2
              ? { color: rawColours.primary.grey[200], cursor: 'pointer' }
              : {
                  color: colorModifiers.secondaryBackground(
                    rawColours.primary.grey[200]
                  ),
                }
          }
        />
      </div>

      {open && !isMobileView && (
        <MatterSwitcher
          handleClickAway={() => {
            props.showFab(open)
            setOpen(false)
          }}
        />
      )}
      {open && isMobileView && (
        <MobileMatterSwitcher
          handleClickAway={() => {
            props.showFab(open)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default MatterSwitcherContainer
