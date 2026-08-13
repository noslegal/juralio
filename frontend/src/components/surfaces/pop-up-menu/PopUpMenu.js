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

import { Card, CardContent, ClickAwayListener } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(theme => ({
  cardWrapper: {
    position: 'absolute',
    zIndex: theme.zIndex.appBar + 1,
    minWidth: theme.spacing(43),
    maxWidth: theme.spacing(50),
    minHeight: theme.spacing(8),
    maxHeight: theme.spacing(50),
    overflowX: 'hidden',
    overflowY: 'auto',
    right: 0,
    width: '100%',
  },
  content: {
    height: '100%',
    overflow: 'hidden',
    padding: '0 !important',
    width: '100%',
  },
}))

const PopUpMenu = React.forwardRef((props, ref) => {
  const { children, onCloseClick, customCss } = props

  const { classes } = useStyles()

  if (!children) return null

  return (
    <ClickAwayListener onClickAway={props.onClick}>
      <Card
        data-test="pop-up-menu"
        className={classNames(classes.cardWrapper, customCss)}
      >
        <CardContent className={classes.content}>
          {React.Children.map(children, child =>
            React.cloneElement(child, {
              closeHandler: onCloseClick,
              ref: ref,
            })
          )}
        </CardContent>
      </Card>
    </ClickAwayListener>
  )
})

PopUpMenu.propTypes = {
  customCss: PropTypes.string,
}

export default PopUpMenu
