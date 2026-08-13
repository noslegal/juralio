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
import MilestoneIcon from '../../../assets/images/JurMilestone'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import JurTask from '../../../assets/images/JurTask'
import JurWorkstream from '../../../assets/images/JurWorkstream'

const useStyles = makeStyles()(theme => ({
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
}))

const ListTaskTypeFilter = props => {
  const {
    setShowOnlyMilestones,
    setShowOnlyTasks,
    setShowOnlyDeliverables,
    value,
    setValue,
  } = props
  const [showTaskTypeFilter, setShowTaskTypeFilter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()

  const handleChange = e => {
    switch (parseInt(e)) {
      case 0:
        setShowOnlyTasks(false)
        setShowOnlyDeliverables(false)
        setShowOnlyMilestones(false)
        break
      case 1:
        setShowOnlyTasks(true)
        setShowOnlyDeliverables(false)
        setShowOnlyMilestones(false)
        break
      case 2:
        setShowOnlyTasks(false)
        setShowOnlyDeliverables(true)
        setShowOnlyMilestones(false)
        break
      case 3:
        setShowOnlyTasks(false)
        setShowOnlyDeliverables(false)
        setShowOnlyMilestones(true)
        break
      default:
        break
    }
    setValue(parseInt(e))
    setShowTaskTypeFilter(false)
  }

  return (
    <>
      <Chip
        data-test="task-type-filter"
        className={value > 0 ? classes.selectedChip : ''}
        style={{ marginRight: '4px' }}
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowTaskTypeFilter(!showTaskTypeFilter)
        }}
        filled
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {value === 0 ? (
              //this is the wrong icon and needs fixed
              <JurWorkstream />
            ) : value === 1 ? (
              <JurTask />
            ) : value === 2 ? (
              <JurDeliverable />
            ) : (
              <MilestoneIcon
                style={{
                  color: juralioColours.taskStatus.notStarted,
                }}
              />
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
        onClose={() => setShowTaskTypeFilter(false)}
        anchorEl={anchorEl}
        open={showTaskTypeFilter}
      >
        <RadioGroup value={value} onChange={e => handleChange(e.target.value)}>
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={0}
            control={<Radio value={0} color="primary" />}
            label="Everything"
            data-test="everything"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={1}
            control={<Radio value={1} color="primary" />}
            label="Only tasks"
            data-test="only-tasks"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={1}
            control={<Radio value={2} color="primary" />}
            label="Only deliverables"
            data-test="only-deliverables"
          />
          <FormControlLabel
            style={{ marginLeft: '0px' }}
            value={1}
            control={<Radio value={3} color="primary" />}
            label="Only milestones"
            data-test="only-milestones"
          />
        </RadioGroup>
      </Popover>
    </>
  )
}
export default ListTaskTypeFilter
