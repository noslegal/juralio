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
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { Button, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const EXPANDED = 'expanded'
const COLLAPSED = 'collapsed'
const TRANSITION_TIME = 250

const style = makeStyles()(theme => ({
  wrapper: {
    position: 'absolute',
    top: theme.spacing(7.75),
    left: theme.spacing(1.5),
    zIndex: 999,
    width: theme.spacing(19),
    height: theme.spacing(3.5),
  },
  button: {
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      background: `${rawColours.primary.white.secondary} !important`,
    },
    color: juralioColours.darkText.secondary,
    letterSpacing: '1.25px',
    width: '100%',
    boxShadow:
      '0px 3px 4px 0px rgba(0, 0, 0, 0.14),0px 3px 3px -2px rgba(0, 0, 0, 0.12), 0px 1px 8px 0px rgba(0, 0, 0, 0.2)',
  },
  iconWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: theme.spacing(0),
    right: theme.spacing(0.5),
  },
  icon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  iconTransitionTop: {
    transform: 'rotate(180deg)',
    transition: `transform ${TRANSITION_TIME}ms ease`,
  },
  iconTransitionBottom: {
    transform: 'rotate(-180deg)',
    transition: `transform ${TRANSITION_TIME}ms ease`,
  },
  buttonText: {
    position: 'absolute',
    top: theme.spacing(0.75),
    right: theme.spacing(2.5),
  },
  hiddenText: {
    display: 'none',
    opacity: 0,
  },
  textTransitionOut: {
    transition: `opacity ${TRANSITION_TIME}ms ease`,
    opacity: 0,
  },
  textTransitionIn: {
    display: 'unset !important',
    transition: `opacity ${TRANSITION_TIME}ms ease`,
    opacity: 1,
  },
  buttonTextWrapper: {
    height: theme.spacing(2.5),
  },
}))

const ExpandButton = props => {
  const { classes } = style()
  const { t } = useTranslation()

  const getExpansionState = tasks => {
    return tasks.length && tasks.find(t => t.level > 1) !== undefined
      ? EXPANDED
      : COLLAPSED
  }

  const [expansionState, setExpansionState] = useState(
    getExpansionState(props.tasks)
  )
  const [preventingSpamClicking, setPreventingSpamClicking] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setExpansionState(getExpansionState(props.tasks))
  }, [props.tasks])

  const getText = () => {
    return expansionState === EXPANDED
      ? t('common.collapseAll')
      : t('common.expandAll')
  }

  const getTextOpposite = () => {
    return expansionState === COLLAPSED
      ? t('common.collapseAll')
      : t('common.expandAll')
  }

  const getIcon = () => {
    return (
      <div className={classes.iconWrapper}>
        {expansionState === EXPANDED ? (
          <KeyboardArrowDownIcon
            className={`${classes.icon} ${
              isTransitioning && classes.iconTransitionTop
            }`}
          />
        ) : (
          <KeyboardArrowUpIcon
            className={`${classes.icon} ${
              isTransitioning && classes.iconTransitionTop
            }`}
          />
        )}
        {expansionState === COLLAPSED ? (
          <KeyboardArrowDownIcon
            className={`${classes.icon} ${
              isTransitioning && classes.iconTransitionBottom
            }`}
          />
        ) : (
          <KeyboardArrowUpIcon
            className={`${classes.icon} ${
              isTransitioning && classes.iconTransitionBottom
            }`}
          />
        )}
      </div>
    )
  }

  const handleClick = () => {
    setIsTransitioning(true)

    if (!preventingSpamClicking) {
      setPreventingSpamClicking(true)
      setTimeout(() => {
        setIsTransitioning(false)
        setExpansionState(expansionState === EXPANDED ? COLLAPSED : EXPANDED)
        if (expansionState === EXPANDED) {
          props.collapseAllSubtasks()
        } else {
          props.expandAllSubtasks()
        }
        setTimeout(() => setPreventingSpamClicking(false), TRANSITION_TIME)
      }, TRANSITION_TIME)
    }
  }

  if (!props.tasks.length) {
    return null // don't show the button if there are no tasks
  }
  if (props.tasks.filter(t => t.level === 1).length === props.tasks.length) {
    //only level A tasks are being shown
    if (!props.tasks.map(t => t.tasks).flat().length) {
      //No subtasks exist, so don't render
      return null
    }
  }

  return (
    <div className={classes.wrapper}>
      <Button
        data-test={`roadmap-expand-collapse-button-${expansionState}`}
        className={classes.button}
        endIcon={getIcon()}
        onClick={handleClick}
      >
        <div className={classes.buttonTextWrapper}>
          <Typography
            data-test="roadmap-expand-collapse-button-text"
            className={`${classes.buttonText} ${
              isTransitioning && classes.textTransitionOut
            }`}
          >
            {getText()}
          </Typography>
          <Typography
            data-test="roadmap-expand-collapse-button-text"
            className={`${classes.buttonText} ${classes.hiddenText} ${
              isTransitioning && classes.textTransitionIn
            }`}
          >
            {getTextOpposite()}
          </Typography>
        </div>
      </Button>
    </div>
  )
}

export default ExpandButton
