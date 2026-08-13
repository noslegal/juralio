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
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    height: 'fit-content',
    borderRadius: theme.spacing(0.5),
    position: 'relative',
    overflow: 'hidden',
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
    zIndex: 10,
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
      data-test={`${props.dataTest}-close-button`}
    >
      <CloseIcon className={classes.closeIcon} />
      <Typography variant="subtitle1" className={classes.clearText}>
        {t('common.clear')}
      </Typography>
    </div>
  )
}

const ClosableMasonryItem = props => {
  const { classes } = style()
  const backGroundColour = props.backgroundColour
  return (
    <div
      className={classes.wrapper}
      style={{ backgroundColor: backGroundColour }}
      data-test={props.dataTest + '-card'}
    >
      {props.content}
      <Closebutton
        closeTip={props.closeTip}
        isHovering={props.isHovering}
        dataTest={props.dataTest}
      />
    </div>
  )
}

export default ClosableMasonryItem
