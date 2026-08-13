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
import rawColours from '../../../../theme/raw-colours'
const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    height: '100%',
    position: 'absolute',
    right: 0,
  },
  closeWrapper: {
    height: '100%',
    position: 'absolute',
    backgroundColor: rawColours.status.done.light,
    right: '-8px',
    top: '-8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'width .25s ease-in-out',
    width: theme.spacing(0),
    overflow: 'hidden',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  closeIcon: {
    fill: rawColours.primary.black.black,
  },
  showWrapper: {
    width: theme.spacing(10),
    height: '100%',
  },
  clearFont: {
    fontWeight: theme.typography.fontWeightLight,
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
      onClick={props.closeNotification}
      data-test={`${props.dataTest}-close-button`}
    >
      <CloseIcon className={classes.closeIcon} />
      <div className={classes.clearFont}>
        <Typography variant="caption">
          {t('common.clear').toLowerCase()}
        </Typography>
      </div>
    </div>
  )
}

const ClosableItem = props => {
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
        closeNotification={props.closeNotification}
        isHovering={props.isHovering}
        dataTest={props.dataTest}
      />
    </div>
  )
}

export default ClosableItem
