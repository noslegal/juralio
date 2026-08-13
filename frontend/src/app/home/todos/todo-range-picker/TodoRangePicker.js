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
import TodayIcon from '@mui/icons-material/Today'
import { Button, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'
const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(),
  },
  icon: {
    color: rawColours.primary.primary.main,
    marginTop: 'auto',
    marginBottom: 'auto',
    height: theme.spacing(4),
  },
  button: {
    backgroundColor: rawColours.primary.blue.light,
    color: rawColours.primary.primary.main,
    marginLeft: theme.spacing(),
    width: theme.spacing(20),
    textTransform: 'unset',
    '&:hover': {
      backgroundColor: '#C3D0D7',
    },
  },
  overdue: {
    color: rawColours.error.primary,
  },
  menu: {
    width: theme.spacing(20),
  },
  loadingSkeleton: {
    width: theme.spacing(10),
  },
}))

const TodoRangePicker = props => {
  const rangeEnums = props.rangeEnums
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = styles()

  const { t } = useTranslation()
  const selectItem = rangeKey => {
    setAnchorEl(null)
    props.changeRange(rangeKey)
  }

  const getButtonText = () => {
    if (props.isLoading) {
      return <Skeleton className={classes.loadingSkeleton} />
    }
    return `${rangeEnums[props.selectedRange]} (${
      props.todos[props.selectedRange].length
    })`
  }

  return (
    <div className={classes.wrapper}>
      <Tooltip title={t('home.todos.rangePicker.tooltip')}>
        <TodayIcon className={classNames(classes.icon)} />
      </Tooltip>
      <div>
        <Button
          className={classNames(classes.button)}
          variant="contained"
          data-test="todo-range-picker-button"
          onClick={e => setAnchorEl(e.currentTarget)}
          endIcon={<KeyboardArrowDownIcon />}
          disabled={props.isLoading}
        >
          {getButtonText()}
        </Button>
        <Menu
          data-test="todo-rrange=menu"
          anchorEl={anchorEl}
          dense={true}
          open={anchorEl != null}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          getContentAnchorEl={null}
          PopoverClasses={classes.popover}
          slotProps={{
            list: { className: classes.menu },
          }}
        >
          {Object.keys(rangeEnums)
            .filter(k => parseInt(k) !== props.selectedRange)
            .map(rangeKey => (
              <MenuItem
                key={rangeKey}
                onClick={() => selectItem(parseInt(rangeKey))}
                data-test={`todo-option-${rangeEnums[rangeKey]
                  .toLowerCase()
                  .replaceAll(' ', '-')}`}
              >
                <Typography className={rangeKey === 0 ? classes.overdue : null}>
                  {rangeEnums[rangeKey]} ({props.todos[rangeKey].length})
                </Typography>
              </MenuItem>
            ))}
        </Menu>
      </div>
    </div>
  )
}
export default TodoRangePicker
