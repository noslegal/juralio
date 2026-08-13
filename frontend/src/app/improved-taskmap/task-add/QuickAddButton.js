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

import AddIcon from '@mui/icons-material/Add'
import { Link, Tooltip, Typography } from '@mui/material'
import Grow from '@mui/material/Grow'
import classNames from 'classnames'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import { useDispatch } from 'react-redux'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'
import { useTranslation } from 'react-i18next'

const HOVER_BUTTON_SIZE = 28
const styles = makeStyles()(theme => ({
  wrapper: {
    boxSizing: 'border-box',
    width: HOVER_BUTTON_SIZE,
    height: HOVER_BUTTON_SIZE,
    background: 'white',
    borderRadius: 4,
    border: `${juralioColours.darkText.secondary} solid 2px`,
    color: juralioColours.darkText.secondary,
    zIndex: 16, // Fails if theme is used.
    cursor: 'pointer',
    pointerEvents: 'auto',
    position: 'absolute',
  },
  disabled: {
    cursor: 'auto',
    background: rawColours.primary.grey.main,
  },
  top: {
    left: '50%',
    right: '50%',
    bottom: `calc( 100% - ${HOVER_BUTTON_SIZE / 2}px)`,
  },
  bottom: {
    left: '50%',
    right: '50%',
    top: `calc( 100% - ${HOVER_BUTTON_SIZE / 2}px)`,
  },
  right: {
    left: `calc( 100% - ${HOVER_BUTTON_SIZE / 2}px)`,
    top: `calc( 50% - ${HOVER_BUTTON_SIZE / 2}px)`,
  },
}))

const QuickAddbutton = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { classes } = styles()
  const getExtraClass = () => {
    switch (props.position) {
      case 'top':
        return classes.top
      case 'bottom':
        return classes.bottom
      case 'right':
        return classes.right
      default:
        return null
    }
  }
  return (
    <Grow in={true}>
      <Tooltip
        title={
          <div>
            <Typography
              style={props.selectionMode ? {} : { whiteSpace: 'nowrap' }}
            >
              {props.disabledText}
            </Typography>
            {props.resetOption && (
              <Link
                underline="always"
                style={{
                  color: 'white',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => {
                  if (props.resetLevel) {
                    dispatch(taskFilterActions.setLevelFilter(0))
                  } else {
                    dispatch(taskFilterActions.resetFiltersQuickAdd())
                  }
                }}
              >
                {props.resetLevel
                  ? t('taskCellHoverButton.resetLevel')
                  : t('taskCellHoverButton.resetTaskmap')}
              </Link>
            )}
          </div>
        }
        disableHoverListener={!props.disabled || !props.disabledText}
        disableInteractive={false}
      >
        <div
          className={classNames(
            classes.wrapper,
            getExtraClass(),
            props.disabled ? classes.disabled : null
          )}
          onClick={() => props.onClick(props.position, props.disabled)}
          data-test={`hover-button-${props.position}`}
          is-disabled={props.disabled ? 'true' : null}
          id={props.disabled ? 'disabled-hover-button' : ''}
        >
          <AddIcon />
        </div>
      </Tooltip>
    </Grow>
  )
}
export default QuickAddbutton
