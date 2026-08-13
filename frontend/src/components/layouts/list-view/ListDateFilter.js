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
import { MobileDatePicker as MuiDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import DateRangeIcon from '@mui/icons-material/DateRange'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
import { t } from 'i18next'

const useStyles = makeStyles()(theme => ({
  selectedChip: {
    backgroundColor: rawColours.primary.black[200],
    color: juralioColours.whiteText.primary,
  },
  picker: {
    width: '140px',
  },
  chip: {
    marginRight: '4px',
  },
  flexRow: {
    display: 'flex',
    alignItems: 'center',
  },
  controlLabel: {
    marginLeft: '0px',
  },
  beforePickerWrapper: {
    marginLeft: '8px',
  },
  afterPickerWrapper: {
    marginLeft: '20px',
  },
}))

const ListDateFilter = props => {
  const { setDateFilter, dateFilter, setFilterDate } = props
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [beforeValue, setBeforeValue] = useState(new Date())
  const [afterValue, setAfterValue] = useState(new Date())
  const [openBefore, setOpenBefore] = useState(false)
  const [openAfter, setOpenAfter] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()

  const handleChange = e => {
    setFilterDate(new Date())
    setBeforeValue(new Date())
    setAfterValue(new Date())
    setDateFilter(parseInt(e.target.value))
  }

  return (
    <>
      <Chip
        data-test="date-filter"
        className={
          dateFilter !== 0
            ? `${classes.chip} ${classes.selectedChip}`
            : classes.chip
        }
        onClick={e => {
          setAnchorEl(e.currentTarget)
          setShowDateFilter(true)
        }}
        filled
        label={
          <div className={classes.flexRow}>
            {dateFilter === 0 && (
              <>
                <div className={classes.notStartedPip} />
                <div className={classes.inProgressPip} />
              </>
            )}
            {dateFilter === 1 && <div className={classes.notStartedPip} />}
            {dateFilter === 2 && <div className={classes.inProgressPip} />}
            {dateFilter === 3 && <div className={classes.donePip} />}
            {dateFilter === 4 && <div className={classes.notStartedPip} />}
            <DateRangeIcon />
            <ArrowDropDownIcon />
          </div>
        }
      />
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowDateFilter(false)}
        anchorEl={anchorEl}
        open={showDateFilter}
      >
        <RadioGroup value={dateFilter} onChange={e => handleChange(e)}>
          <FormControlLabel
            className={classes.controlLabel}
            value={0}
            control={<Radio value={0} color="primary" />}
            label="Any date"
            data-test="any-end"
          />
          <FormControlLabel
            data-test="before-end"
            className={classes.controlLabel}
            value={1}
            control={<Radio color="primary" />}
            label={
              <div className={classes.flexRow}>
                <Typography>{t('common.before')}</Typography>
                <div className={classes.beforePickerWrapper}>
                  <MuiDatePicker
                    open={openBefore}
                    onOpen={() => {
                      setDateFilter(1)
                      setOpenBefore(true)
                    }}
                    onClose={() => setOpenBefore(false)}
                    className={classes.picker}
                    format={'d MMM yyyy'}
                    value={beforeValue}
                    onChange={date => {
                      setDateFilter(1)
                      setBeforeValue(date)
                      setFilterDate(date)
                      setOpenBefore(false)
                    }}
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        InputProps: { disableUnderline: true },
                      },
                    }}
                  />
                </div>
              </div>
            }
          />
          <FormControlLabel
            data-test="after-end"
            className={classes.controlLabel}
            value={2}
            control={<Radio color="primary" />}
            label={
              <div className={classes.flexRow}>
                <Typography>{t('On or after')}</Typography>
                <div className={classes.afterPickerWrapper}>
                  <MuiDatePicker
                    open={openAfter}
                    onOpen={() => {
                      setDateFilter(2)
                      setOpenAfter(true)
                    }}
                    onClose={() => setOpenAfter(false)}
                    className={classes.picker}
                    format={'d MMM yyyy'}
                    value={afterValue}
                    onChange={date => {
                      setDateFilter(2)
                      setOpenAfter(false)
                      setAfterValue(date)
                      setFilterDate(date)
                    }}
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        InputProps: { disableUnderline: true },
                      },
                    }}
                  />
                </div>
              </div>
            }
          />
          <FormControlLabel
            data-test="no-end"
            className={classes.controlLabel}
            value={3}
            control={<Radio color="primary" />}
            label="No end date"
          />
        </RadioGroup>
      </Popover>
    </>
  )
}
export default ListDateFilter
