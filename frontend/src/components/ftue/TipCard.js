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

import CloseIcon from '@mui/icons-material/Close'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../theme/color-modifiers'
import rawColours from '../../theme/raw-colours'
import { generateTipImageByName } from './tip-card-content'
const style = makeStyles()(theme => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    display: 'flex',
    height: theme.spacing(15.5),
    borderRadius: theme.spacing(0.5),
    position: 'relative',
  },
  titleRow: {
    backgroundColor: 'white',
    height: theme.spacing(4),
    borderTopRightRadius: theme.spacing(4),
    borderBottomRightRadius: theme.spacing(4),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
  },
  descriptionText: {
    color: 'white',
    fontSize: theme.spacing(2),
  },
  titleText: {
    marginLeft: theme.spacing(2),
    fontSize: theme.spacing(2),
    fontWeight: '600',
  },
  description: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  imageWrapper: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2),
    height: theme.spacing(11.625),
    width: theme.spacing(11.625),
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  closeWrapper: {
    height: '100%',
    position: 'absolute',
    backgroundColor: rawColours.primary.grey.main,
    right: theme.spacing(0),
    borderTopRightRadius: theme.spacing(0.5),
    borderBottomRightRadius: theme.spacing(0.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'width .25s ease-in-out',
    width: theme.spacing(0),
    overflow: 'hidden',
  },
  closeIcon: {
    marginBottom: theme.spacing(1),
    fill: colorModifiers.secondaryText(rawColours.primary.black.black),
  },
  clearText: {
    color: colorModifiers.primaryText(rawColours.primary.black.black),
  },
  showWrapper: {
    width: theme.spacing(8),
  },
}))

const Closebutton = props => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <div
      className={classNames([
        classes.closeWrapper,
        props.isHovering ? classes.showWrapper : null,
      ])}
      onClick={props.closeTip}
      data-test="tip-close-button"
    >
      <CloseIcon className={classes.closeIcon} />
      <Typography variant="subtitle1" className={classes.clearText}>
        {t('common.clear')}
      </Typography>
    </div>
  )
}

const TipCard = props => {
  const { classes } = style()
  const backGroundColour = props.backgroundColour
  return (
    <div
      className={classes.wrapper}
      style={{ backgroundColor: backGroundColour }}
      data-test="tip-card"
    >
      <div className={classes.column} style={{ width: 'calc(100% - 32px)' }}>
        <div className={classes.titleRow}>
          <Typography
            style={{ color: backGroundColour }}
            className={classes.titleText}
          >
            {props.title}
          </Typography>
        </div>
        <div className={classes.description}>
          <Typography className={classes.descriptionText}>
            {props.description}
          </Typography>
        </div>
      </div>
      <div className={classes.column}>
        <div className={classes.imageWrapper}>
          {generateTipImageByName(props.name)}
        </div>
      </div>
      <Closebutton closeTip={props.closeTip} isHovering={props.isHovering} />
    </div>
  )
}

export default TipCard
