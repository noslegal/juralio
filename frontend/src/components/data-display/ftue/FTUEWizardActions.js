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

import { ClickAwayListener, Popover, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  option: {
    cursor: 'pointer',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: rawColours.dialog.backgroundDark,
    },
  },
  text: {
    margin: theme.spacing(),
    textAlign: 'center',
  },
}))

const FTUEWizardActions = props => {
  const { classes } = styles()
  const { t } = useTranslation()
  return (
    <Popover
      open={true}
      anchorEl={props.anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      onKeyDown={e => {
        e.stopPropagation()
        if (e.keyCode === 27) {
          props.onClose()
        }
      }}
      slotProps={{
        paper: { style: { borderRadius: props.isMobileView ? '' : '20px' } },
      }}
    >
      <ClickAwayListener onClickAway={props.onClose}>
        <div className={classes.wrapper}>
          <div
            className={classes.option}
            onClick={props.onFinish}
            data-test="ftueFinishButton"
          >
            <Typography className={classes.text} variant={'subtitle1'}>
              {t('ftue.buttons.finishLater')}
            </Typography>
          </div>
          <div
            className={classes.option}
            onClick={props.onSkip}
            data-test="ftueSkipButton"
          >
            <Typography className={classes.text} variant={'subtitle1'}>
              {t('ftue.buttons.skipCompletely')}
            </Typography>
          </div>
        </div>
      </ClickAwayListener>
    </Popover>
  )
}

export default FTUEWizardActions
