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

import {
  RadioGroup,
  Chip,
  Popover,
  Radio,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))

const ListViewSwitcher = props => {
  const { setView, view } = props
  const [showViewSwitcher, setShowViewSwitcher] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()

  const handleChange = e => {
    switch (parseInt(e)) {
      case 0:
        break
      case 1:
        break
      case 2:
        break
      default:
        break
    }
    setView(parseInt(e))
    setShowViewSwitcher(false)
  }

  return (
    <>
      <Chip
        data-test="view-ordering"
        className={view > 0 ? classes.selectedChip : ''}
        style={{ marginRight: '4px' }}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowViewSwitcher(!showViewSwitcher)
        }}
        filled
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography>
              {'Order ' +
                (view === 0
                  ? '(Custom)'
                  : view === 1
                    ? '(Taskmap)'
                    : '(End date)')}
            </Typography>
            <ArrowDropDownIcon />
          </div>
        }
      />
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowViewSwitcher(false)}
        anchorEl={anchorEl}
        open={showViewSwitcher}
      >
        <RadioGroup value={view} onChange={e => handleChange(e.target.value)}>
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={0}
            control={<Radio value={0} color="primary" />}
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography style={{ marginRight: '6px' }}>
                  {'Custom order'}
                </Typography>
                <Typography variant="caption">(Drag and drop)</Typography>
              </div>
            }
          />
          <FormControlLabel
            data-test="end-date-ordering"
            style={{ marginLeft: '0px' }}
            value={0}
            control={<Radio value={2} color="primary" />}
            label="End date order"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={1}
            control={<Radio color="primary" />}
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography style={{ marginRight: '6px' }}>
                  {'Taskmap order'}
                </Typography>
              </div>
            }
          />
        </RadioGroup>
      </Popover>
    </>
  )
}
export default ListViewSwitcher
