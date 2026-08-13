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
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Popover,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import cloneDeep from 'lodash/cloneDeep'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'

const styles = makeStyles()(theme => ({
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))

const ListPhaseFilter = props => {
  const { selectedPhases, setSelectedPhases, phases } = props
  const [showPhaseFilter, setShowPhaseFilter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = styles()

  const handleChange = id => {
    if (selectedPhases.includes(id)) {
      let x = cloneDeep(selectedPhases)
      x.splice(
        x.findIndex(x => x === id),
        1
      )
      setSelectedPhases(x)
    } else {
      let x = cloneDeep(selectedPhases)
      x.push(id)
      setSelectedPhases(x)
    }
  }

  return (
    <>
      <Chip
        data-test="phase-filter"
        className={selectedPhases.length > 0 ? classes.selectedChip : ''}
        style={{ marginRight: '4px' }}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowPhaseFilter(true)
        }}
        filled
        label={
          selectedPhases.length > 0
            ? selectedPhases.length + '/' + phases.length + ' phases'
            : 'All phases'
        }
      />
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowPhaseFilter(false)}
        anchorEl={anchorEl}
        open={showPhaseFilter}
      >
        <FormControl>
          {phases.map(phase => {
            return (
              <>
                <FormControlLabel
                  data-test={'phase-button'}
                  style={{ marginLeft: '0px' }}
                  value={0}
                  control={
                    <Checkbox
                      onChange={() => handleChange(phase.id)}
                      value={0}
                      color="primary"
                      checked={selectedPhases.includes(phase.id)}
                    />
                  }
                  label={<Typography>{phase.name}</Typography>}
                />
              </>
            )
          })}
        </FormControl>
      </Popover>
    </>
  )
}
export default ListPhaseFilter
