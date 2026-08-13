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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import { Dialog, Typography, useMediaQuery } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { updateFtueStatus } from '../../../services/user/auth/auth-actions'
import colorModifiers from '../../../theme/color-modifiers'
import juralioTheme from '../../../theme/juralio-theme'
import rawColours from '../../../theme/raw-colours'
import FTUEWizardActions from './FTUEWizardActions'

const styles = makeStyles()(theme => ({
  contentWrapper: {},
  content: {
    display: 'flex',
  },
  nextCircle: {
    height: theme.spacing(4),
    width: theme.spacing(4),
    backgroundColor: rawColours.ftue.next,
    borderRadius: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  chevron: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    color: colorModifiers.secondaryText(rawColours.text.black),
  },
  titleWrapper: {
    backgroundColor: rawColours.status.done.dark,
    display: 'flex',
    height: theme.spacing(7.5),
    alignItems: 'center',
  },
  title: {
    color: 'white',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  closeCircle: {
    position: 'absolute',
    height: theme.spacing(4),
    width: theme.spacing(4),
    backgroundColor: colorModifiers.textBackground(
      rawColours.primary.white.primary
    ),
    borderRadius: theme.spacing(4),
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    right: theme.spacing(2),
  },
  circleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(6.25),
  },
  pipWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  pip: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(),
    backgroundColor: rawColours.status.inProgress.light,
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    cursor: 'pointer',
  },
  selectedPip: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(),
    backgroundColor: rawColours.status.inProgress.dark,
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    cursor: 'pointer',
  },
  swipableWrapper: {
    width: 'calc(100% - 100px)',
  },
}))

const FTUEWizard = props => {
  const { classes } = styles()
  const [open, setOpen] = useState(true)
  const [index, setIndex] = useState(0)
  const [anchorEl, setanchorEl] = useState(null)
  const ref = useRef()

  useEffect(() => {
    props.indexUpdate(index)
  }, [index]) //eslint-disable-line

  useEffect(() => {
    if (props.forceIndexIncrement) {
      setIndex(index + 1)
    }
  }, [props.forceIndexIncrement]) //eslint-disable-line

  const dispatch = useDispatch()
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  const onFinish = () => {
    // only show the templates FTUE again in the context it was closed in
    if (props.ftueFlagName === 'hasSeenTemplates') {
      dispatch(updateFtueStatus('hasSeenTemplateOverview', true)).then(() => {
        setOpen(false)
      })
    } else if (props.ftueFlagName === 'hasSeenTemplateOverview') {
      dispatch(updateFtueStatus('hasSeenTemplates', true)).then(() => {
        setOpen(false)
      })
    } else {
      setOpen(false)
    }
    props.onClose()
  }

  const onSkip = () => {
    if (
      props.ftueFlagName === 'hasSeenTemplates' ||
      props.ftueFlagName === 'hasSeenTemplateOverview'
    ) {
      dispatch(updateFtueStatus('hasSeenTemplates', true)).then(() => {
        dispatch(updateFtueStatus('hasSeenTemplateOverview', true)).then(() => {
          setOpen(false)
        })
      })
    } else {
      dispatch(updateFtueStatus(props.ftueFlagName, true)).then(() => {
        setOpen(false)
      })
    }
    props.onClose()
  }

  const getLeftHandArrow = () => {
    return (
      <div className={classes.circleWrapper}>
        {index > 0 && (
          <div
            className={classes.nextCircle}
            style={{ marginLeft: '16px' }}
            onClick={() => {
              setIndex(index - 1)
            }}
          >
            <ChevronLeftIcon className={classes.chevron} />
          </div>
        )}
      </div>
    )
  }
  const getRightHandArrow = () => {
    return (
      <div className={classes.circleWrapper}>
        {index < props.titles.length - 1 && !props.disableNext && (
          <div
            className={classes.nextCircle}
            style={{ marginRight: '16px' }}
            data-test="next-ftue-card"
            onClick={() => {
              setIndex(index + 1)
            }}
          >
            <ChevronRightIcon className={classes.chevron} />
          </div>
        )}
      </div>
    )
  }

  const getPipIndicator = () => {
    return (
      <div className={classes.pipWrapper}>
        {props.titles.map((title, i) => {
          return (
            <div
              className={i === index ? classes.selectedPip : classes.pip}
              onClick={() => {
                if (!props.disableNext || i <= index) {
                  setIndex(i)
                }
              }}
            />
          )
        })}
      </div>
    )
  }

  const getCloseButton = () => {
    const handleClick = e => {
      //allow close means if on last card it will hide dialog if statement needed due to entering of name on homescreen
      let allowClose = 1
      if (props.ftueFlagName === 'hasSeenHomePage') {
        allowClose = 2
      }
      const isFinalScreen = index === props.children.length - allowClose
      if (!props.disableClose) {
        if (isFinalScreen) {
          onSkip()
        } else {
          setanchorEl(e.currentTarget)
        }
      }
    }

    return (
      !props.disableClose && (
        <div
          className={classes.closeCircle}
          ref={ref}
          data-test="close-icon"
          onClick={handleClick}
        >
          <CloseIcon className={classes.chevron} />
        </div>
      )
    )
  }

  const getTitle = () => {
    return (
      <div className={classes.titleWrapper}>
        <Typography variant="h6" className={classes.title}>
          {props.titles[index]}
        </Typography>
        {getCloseButton()}
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      fullScreen={props.fullScreen}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.keyCode === 27 && !props.disableClose) {
          if (index === props.titles.length - 1) {
            onSkip()
          } else {
            setanchorEl(ref.current)
          }
        }
        if (e.keyCode === 37 && index > 0) {
          setIndex(index - 1)
        }
        if (
          e.keyCode === 39 &&
          index < props.titles.length - 1 &&
          !props.disableNext
        ) {
          setIndex(index + 1)
        }
      }}
      slotProps={{
        paper: { style: { borderRadius: isMobileView ? '' : '40px' } },
      }}
    >
      <div data-test={props['data-test']} className={classes.contentWrapper}>
        {getTitle()}
        <div className={classes.content}>
          {getLeftHandArrow()}
          <div className={classes.swipableWrapper}>
            {props.children.filter(
              t =>
                t !== false &&
                props.children.filter(t => t !== false).indexOf(t) === index
            )}
          </div>
          {getRightHandArrow()}
        </div>
        {getPipIndicator()}
      </div>
      {anchorEl && (
        <FTUEWizardActions
          onFinish={onFinish}
          onSkip={() => {
            onSkip()
          }}
          anchorEl={anchorEl}
          onClose={() => setanchorEl(null)}
          isMobileView={isMobileView}
        />
      )}
    </Dialog>
  )
}

// export default withMobileDialog()(FTUEWizard)
export default FTUEWizard
