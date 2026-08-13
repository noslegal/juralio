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

import { Dialog, FormControlLabel, Switch } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  DESKTOP_DIALOG_HEIGHT,
  DESKTOP_DIALOG_WIDTH,
} from '../../../app/constants'
import logo from '../../../assets/images/juralio-logo-70-opacity.svg'
import { default as juralioTheme } from '../../../theme/juralio-theme'
import JuralioLinearProgress from '../../feedback/juralio-linear-progress/JuralioLinearProgress'
import DialogActions from '../common/DialogActions'
import DialogIconHeader from '../dialog-icon-header/DialogIconHeader'
const useStyles = makeStyles()(theme => ({
  paper: {
    maxHeight: DESKTOP_DIALOG_HEIGHT,
    minHeight: DESKTOP_DIALOG_HEIGHT,
    overflow: 'hidden',
  },
  largePaper: {
    maxHeight: '90%',
    minHeight: '90%',
    minWidth: '90%',
    overflow: 'hidden',
  },
  short: {
    minHeight: theme.spacing(35),
  },
  mobilePaper: {
    overflow: 'hidden',
  },
  loadingState: {
    width: '83.5%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
  },
  actionButtons: {
    marginTop: 'auto',
  },
  logoImage: {
    position: 'absolute',
    bottom: -65,
    left: -110,
    width: theme.spacing(25),
    height: theme.spacing(25),
  },
  content: {
    overflowX: 'hidden',
    maxHeight: theme.spacing(44),
  },
  largeContent: {
    overflowX: 'hidden',
    maxHeight: 'calc(90% - 600px)',
  },
  noScroll: {
    overflow: 'hidden',
    maxHeight: theme.spacing(44),
  },
  switch: {
    paddingLeft: 3 * theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
}))

const JuralioDialog = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const handleKeyPress = e => {
    if (e.key === 'Enter' && props.disabled !== true && props.handleAction) {
      e.preventDefault()
      props.handleAction()
    }
    if (e.key === 'Escape') {
      props.handleCancel && props.handleCancel(e.key)
    }
  }
  const switchDataTest = props.switchValue
    ? 'dialog-actions-switch-on'
    : 'dialog-actions-switch-off'

  const toggleSwitch = () => {
    props.switchToggler()
  }

  const renderSwitch = () => (
    <div className={classes.switch}>
      {props.switchToggler ? (
        <FormControlLabel
          value="bottom"
          control={
            <Switch
              data-test={switchDataTest}
              color="primary"
              checked={props.switchValue}
              onChange={toggleSwitch}
            />
          }
          data-test="switch-label"
          label={props.switchLabel}
          labelPlacement="end"
        />
      ) : null}
    </div>
  )

  const getDialogCssClass = () => {
    if (props.largeSize) {
      return classes.largePaper
    }
    return classNames(classes.paper, {
      [classes.short]: props.dialogHeightShort,
    })
  }
  return (
    <ThemeProvider theme={juralioTheme}>
      <Dialog
        data-test="juralio-dialog"
        classes={{
          paper: props.fullScreen ? classes.mobilePaper : getDialogCssClass(),
        }}
        width={DESKTOP_DIALOG_WIDTH}
        open={props.open}
        onClose={props.onClose}
        fullScreen={props.fullScreen}
        onKeyDown={handleKeyPress}
        fullWidth
        style={props.isKnockOnDialog ? { zIndex: 2001 } : {}}
      >
        <DialogIconHeader
          text={props.titleText}
          icon={props.titleIcon}
          subtitle={props.subtitleText}
        />
        <div
          className={
            props.noScroll
              ? classes.noScroll
              : props.largeSize
                ? classes.largeContent
                : classes.content
          }
        >
          {props.children}
        </div>
        {renderSwitch()}
        <div className={classes.loadingState}>
          <JuralioLinearProgress
            show={props.showLoadingBar}
            text={props.loadingText}
            progress={props.progress}
          />
        </div>
        <div className={classes.actionButtons}>
          <DialogActions
            hideAction={props.hideAction}
            showExtraAction={props.showExtraAction}
            hideCancel={props.hideCancel}
            handleCancel={props.handleCancel}
            actionLabel={props.actionLabel}
            extraActionLabel={props.extraActionLabel}
            handleAction={props.handleAction}
            handleExtraAction={props.handleExtraAction}
            switchValue={props.switchValue}
            switchToggler={props.switchToggler}
            switchLabel={props.switchLabel}
            disabled={props.disabled}
            disabledExtra={props.disabledExtra}
            usageContext={props.usageContext}
            cancelText={props.cancelText}
            context={props.context}
            disableSingleClickAction={props.disableSingleClickAction}
          />
        </div>
        <img
          src={logo}
          alt={t('notificationIcon.notificationIconAlt')}
          className={classes.logoImage}
        />
      </Dialog>
    </ThemeProvider>
  )
}

JuralioDialog.propTypes = {
  actionLabel: PropTypes.string.isRequired,
  extraActionLabel: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.array.isRequired,
  ]),
  handleAction: PropTypes.func.isRequired,
  handleExtraAction: PropTypes.func,
  open: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  disabledExtra: PropTypes.bool,
  fullScreen: PropTypes.bool,
  handleCancel: PropTypes.func,
  hideCancel: PropTypes.bool,
  hideAction: PropTypes.bool,
  showExtraAction: PropTypes.bool,
  switchLabel: PropTypes.string,
  switchToggler: PropTypes.func,
  switchValue: PropTypes.any,
  titleIcon: PropTypes.any,
  titleText: PropTypes.any,
  usageContext: PropTypes.string,
  showLoadingBar: PropTypes.bool,
  loadingText: PropTypes.string,
  largeSize: PropTypes.bool,
}

export default JuralioDialog
