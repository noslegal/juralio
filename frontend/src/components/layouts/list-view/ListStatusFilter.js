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
} from '@mui/material'
import { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  donePip: {
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  inProgressPip: {
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  notStartedPip: {
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  notRequiredPip: {
    backgroundColor: rawColours.status.notRequired.dark,
    width: theme.spacing(1.5),
    height: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))

const ListStatusFilter = props => {
  const { setStatusFilter, statusFilter } = props
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()

  const handleChange = e => {
    setStatusFilter(parseInt(e.target.value))
    setShowStatusFilter(false)
  }

  return (
    <>
      <Chip
        data-test="status-filter"
        className={statusFilter !== 0 ? classes.selectedChip : ''}
        style={{ marginRight: '4px' }}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowStatusFilter(true)
        }}
        filled
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {statusFilter === 0 && (
              <>
                <div className={classes.notStartedPip} />
                <div className={classes.inProgressPip} />
              </>
            )}
            {statusFilter === 1 && <div className={classes.notStartedPip} />}
            {statusFilter === 2 && <div className={classes.inProgressPip} />}
            {statusFilter === 3 && <div className={classes.donePip} />}
            {statusFilter === 4 && <div className={classes.notRequiredPip} />}
            {statusFilter === 5 && (
              <>
                <div className={classes.notStartedPip} />
                <div className={classes.inProgressPip} />
                <div className={classes.donePip} />
                <div className={classes.notRequiredPip} />
              </>
            )}
            <ArrowDropDownIcon />
          </div>
        }
      />
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowStatusFilter(false)}
        anchorEl={anchorEl}
        open={showStatusFilter}
      >
        <RadioGroup value={statusFilter} onChange={e => handleChange(e)}>
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={0}
            control={<Radio value={0} color="primary" />}
            label="NS and IP"
            data-test="status-filter-ns-ip"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={1}
            control={<Radio color="primary" />}
            label="Not started (NS)"
            data-test="status-filter-ns"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={2}
            control={<Radio color="primary" />}
            label="In progress (IP)"
            data-test="status-filter-ip"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={3}
            control={<Radio color="primary" />}
            label="Done"
            data-test="status-filter-d"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={4}
            control={<Radio color="primary" />}
            label="Not required"
            data-test="status-filter-nr"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={5}
            control={<Radio value={5} color="primary" />}
            label="All"
            data-test="status-filter-all"
          />
        </RadioGroup>
      </Popover>
    </>
  )
}
export default ListStatusFilter
