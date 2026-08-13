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

import Icon from '@mdi/react'
import { DialogTitle, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    color: JuralioNamedColours.black[200],
  },
  smallIcon: {
    width: theme.spacing(3.75),
    height: theme.spacing(3.75),
  },
  titleText: {
    marginLeft: theme.spacing(1.5),
    color: juralioColours.darkText.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitleText: {
    marginLeft: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  svgStyle: {
    width: theme.spacing(3.5),
  },
})

const renderHeaderIcon = props => {
  const { classes } = makeStyles()(styles)()

  const HeaderIcon = props.icon // Uppercase Name to prevent warning.
  if (!HeaderIcon) return null
  if (typeof HeaderIcon === 'string') {
    if (HeaderIcon.indexOf('.svg') > -1) {
      return (
        <img
          className={classes.svgStyle}
          src={HeaderIcon}
          alt="dialog-header-icon"
        />
      )
    }
    return <Icon path={HeaderIcon} className={classes.smallIcon} />
  }
  return <HeaderIcon className={classes.icon} />
}

const DialogIconHeader = props => {
  const { classes } = makeStyles()(styles)()
  return (
    <DialogTitle className={classes.root}>
      <div className={classes.titleWrapper}>
        {renderHeaderIcon(props)}
        <Typography
          variant="h6"
          className={props.icon ? classes.titleText : null}
          data-test="dialog-header-title-text"
        >
          {props.text}
        </Typography>
      </div>
      {props.subtitle && (
        <Typography
          data-test="dialog-header-subtitle-text"
          variant="subtitle1"
          className={classes.subtitleText}
        >
          {props.subtitle}
        </Typography>
      )}
    </DialogTitle>
  )
}

DialogIconHeader.propTypes = {
  /** icon */
  // icon: PropTypes.oneOfType([
  //   PropTypes.string.isRequired,
  //   PropTypes.object.isRequired,
  // ]),
  /** text */
  text: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]),
  subtitle: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]),
}

export default DialogIconHeader
