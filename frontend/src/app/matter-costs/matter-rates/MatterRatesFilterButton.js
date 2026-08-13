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

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, Menu, MenuItem, Typography } from '@mui/material'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  button: {
    marginLeft: theme.spacing(),
    backgroundColor: rawColours.primary.purple[200],
    '&:hover': {
      backgroundColor: rawColours.primary.purple[100],
    },
    width: theme.spacing(18),
  },
  text: {
    fontSize: theme.spacing(1.5),
    textTransform: 'none',
  },
  optionText: {
    marginRight: theme.spacing(),
    fontSize: theme.spacing(1.5),
  },
}))

const MatterRatesFilterButton = props => {
  const { classes } = styles()
  const [showMenu, setShowMenu] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        className={classes.button}
        data-test="costs-filter-button"
        endIcon={<KeyboardArrowDownIcon position="end" />}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowMenu(true)
        }}
      >
        <Typography className={classes.text}>
          {props.costsEnum[props.selectedCostsFilter]}
        </Typography>
      </Button>
      {showMenu && (
        <Menu
          open={true}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={() => {
            setShowMenu(false)
          }}
        >
          {Object.keys(props.costsEnum)
            .filter(k => parseInt(k) !== props.selectedCostsFilter)
            .map(k => (
              <MenuItem
                key={k}
                data-test={`costs-filter-${props.costsEnum[k]
                  .toLowerCase()
                  .replace(' ', '')}`}
                onClick={() => {
                  props.setSelectedCostsFilter(parseInt(k))
                  setShowMenu(false)
                }}
              >
                <Typography className={classes.optionText}>
                  {props.costsEnum[k]}
                </Typography>
              </MenuItem>
            ))}
        </Menu>
      )}
    </>
  )
}
export default MatterRatesFilterButton
