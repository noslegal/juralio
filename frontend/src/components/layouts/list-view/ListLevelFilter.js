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

import { Chip, Popover, Button, ButtonGroup } from '@mui/material'
import { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import {
  TASK_MAP,
  TASK_MAP_LEVELS_INTEGER_LOOKUP,
} from '../../../app/constants'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  buttonGroup: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  buttonSelectedNoHover: {
    color: `${juralioColours.whiteText.primary} !important`,
    border: `1px solid ${juralioColours.darkText.secondary} `,
    background: rawColours.primary.black.black,
    '&:hover': {
      color: `${juralioColours.whiteText.primary} !important`,
      border: `1px solid ${juralioColours.darkText.secondary} `,
      background: rawColours.primary.black[100],
    },
  },
  buttonUnselected: {
    color: `${juralioColours.darkText.secondary} !important`,
    border: `1px solid ${juralioColours.darkText.secondary} `,
    background: juralioColours.levelSelector.unselected,
    '&:hover': {
      color: `${juralioColours.whiteText.primary} !important`,
      border: `1px solid ${juralioColours.darkText.secondary} `,
      background: rawColours.primary.black[100],
    },
  },
  buttonGroupWrapper: {
    display: 'flex',
  },
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))

const generateButtonGroup = (
  selectedLevel = 0,
  setLevel = () => {},
  setShowLevelFilter
) => {
  const { classes } = styles()
  /**
   * Have to fill the  array with data to map over it as map ignores empty entries
   * Have to look up index +1 as taskmap levels commit the cardinal sin of not being zero indexed
   */
  const getClass = i => {
    if (i + 1 === selectedLevel) {
      return classes.buttonSelectedNoHover
    } else {
      return i < selectedLevel
        ? classes.buttonSelectedNoHover
        : classes.buttonUnselected
    }
  }
  return (
    <div className={classes.buttonGroupWrapper}>
      <ButtonGroup color="primary" className={classes.buttonGroup}>
        {new Array(TASK_MAP.MAX_TASK_DEPTH - 1).fill(0).map((_, i) => (
          <Button
            key={i}
            className={getClass(i)}
            onClick={() => {
              setLevel(i + 1)
              setShowLevelFilter(false)
            }}
            data-test={'level-button'}
          >
            {TASK_MAP_LEVELS_INTEGER_LOOKUP[i + 2]}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}

const ListLevelFilter = props => {
  const { selectedLevel, setSelectedLevel } = props
  const [showLevelFilter, setShowLevelFilter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = styles()

  return (
    <>
      <Chip
        data-test="level-filter"
        className={selectedLevel !== 5 ? classes.selectedChip : ''}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowLevelFilter(true)
        }}
        filled
        label={
          selectedLevel === 5
            ? 'All tasks'
            : selectedLevel === 4
              ? 'B-E'
              : selectedLevel === 3
                ? 'B-D'
                : selectedLevel === 2
                  ? 'B-C'
                  : 'B'
        }
      />
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowLevelFilter(false)}
        anchorEl={anchorEl}
        open={showLevelFilter}
      >
        {generateButtonGroup(
          selectedLevel,
          setSelectedLevel,
          setShowLevelFilter
        )}
      </Popover>
    </>
  )
}
export default ListLevelFilter
