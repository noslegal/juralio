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

import React, { useState } from 'react'
import { Menu, MenuItem, Button, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  buttonStyle: {
    width: '50%',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    backgroundColor: rawColours.primary.grey[200],
    borderColor: '#D0D5DD',
    borderRadius: 8,
    padding: '4px 8px',
    '&: hover': {
      borderColor: '#D0D5DD',
    },
  },
}))

const CalendarPickerButton = props => {
  const { classes } = useStyles()
  const value = props.value
  const nullText = props.nullText
  const [anchorEL, setAnchorEl] = useState()

  const updateValue = e => {
    const value =
      props.type === 1 ? dayjs(e).endOf('month').endOf('day').toDate() : e
    props.setValue(value)
    setAnchorEl(null)
  }

  const isOpen = anchorEL ? true : false

  const getDefaultValue = () => {
    if (value !== null) {
      return value
    } else if (props.type === 0) {
      if (dayjs(props.maxDate).isValid()) {
        return props.maxDate
      } else {
        return null
      }
    } else {
      if (dayjs(props.minDate).isValid()) {
        return props.minDate
      } else {
        return null
      }
    }
  }

  return (
    <div>
      <Button
        disabled={props.disabled}
        className={classes.buttonStyle}
        variant="outlined"
        onClick={e => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {value ? dayjs(value).format('MMM YYYY') : nullText}
      </Button>
      <Typography style={{ color: 'green', paddingLeft: '8px' }}>
        {props.helperText}
      </Typography>
      <div style={{ visibility: 'hidden' }}>
        <Menu
          anchorEl={anchorEL}
          onClose={() => {
            setAnchorEl(null)
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          getContentAnchorEl={null}
          open={isOpen}
        >
          <MenuItem style={{ height: 'fit-content' }}>
            <div>
              <DateCalendar
                openTo="month"
                name={'startDate'}
                defaultValue={getDefaultValue()}
                minDate={props.minDate}
                maxDate={props.maxDate}
                views={['year', 'month']}
                format="yyyy-MM"
                closeOnSelect={false}
                onMonthChange={e => {
                  updateValue(e)
                }}
              />
            </div>
          </MenuItem>
        </Menu>
      </div>
    </div>
  )
}
export default CalendarPickerButton
