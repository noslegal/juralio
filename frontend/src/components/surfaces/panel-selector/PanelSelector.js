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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { ClickAwayListener, Popover, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    minWidth: '80%',
    flexGrow: 1,
    textAlign: 'right',
    marginRight: theme.spacing(2),
  },
  currentSelection: {
    marginRight: theme.spacing(2),
    '&:hover': {
      backgroundColor: juralioColours.hover.hover,
    },
    borderRadius: theme.shape.borderRadius,
    color: juralioColours.named.black[200],
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,
    cursor: 'pointer',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.25),
  },
  pannelSelectorContainer: {
    margin: theme.spacing(),
  },
}))

const PanelSelector = props => {
  const { classes } = useStyles()
  const [panelOpen, setPanelOpen] = useState(false)

  const handleSelectorClick = () => setPanelOpen(!panelOpen)
  const handleSelectorClose = () => setPanelOpen(false)
  const anchorEl = useRef()

  return (
    <>
      <div className={classes.topRow} ref={anchorEl}>
        <div className={classes.label}>
          {props.labelText && (
            <Typography
              className={classes.projectInboxTitle}
              variant="overline"
              data-test="selector-label"
            >
              {props.labelText}
            </Typography>
          )}
        </div>

        <div
          className={classes.currentSelection}
          data-test="panel-selector-toggle"
          onClick={handleSelectorClick}
        >
          {props.children[0]}
          <ArrowDropDownIcon />
        </div>
      </div>
      <Popover
        open={panelOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        data-test="panel-popover"
        onKeyDown={e => {
          if (e.keyCode === 27) {
            handleSelectorClose()
          }
        }}
      >
        <ClickAwayListener onClickAway={handleSelectorClick}>
          <div
            data-test="panel-selector-panel"
            className={classes.pannelSelectorContainer}
          >
            {React.Children.map(
              props.children.slice(1, props.children.length),
              child => {
                return child
                  ? React.cloneElement(child, {
                      closeHandler: handleSelectorClose,
                    })
                  : null
              }
            )}
          </div>
        </ClickAwayListener>
      </Popover>
    </>
  )
}

PanelSelector.propTypes = {
  labelText: PropTypes.string,
  children: PropTypes.array,
}

export default PanelSelector
