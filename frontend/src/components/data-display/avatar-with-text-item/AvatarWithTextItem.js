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

import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import UserAvatar from '../user/user-avatar/UserAvatar'
import rawColours from '../../../theme/raw-colours'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  root: {
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    justifyItems: 'center',
    flexDirection: 'row',
    height: theme.spacing(4),
    width: `calc(100% + ${theme.spacing(2)})`, // Used to stretch over padding.
    marginLeft: '-8px',
    marginBottom: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
  },
  optionItem: {
    alignItems: 'center',
    display: 'flex',
    width: '100%',
    height: theme.spacing(3),
  },
  optionItemIcon: {
    textAlign: 'center',
    width: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    scale: '0.75',
  },
  optionDescription: {
    padding: theme.spacing(),
  },
  optionTextDescription: {
    color: juralioColours.darkText.secondary,
  },
}))

const AvatarWithTextItem = props => {
  const {
    dataTest,
    avatarUser,
    title,
    subtitle,
    onClickHandler,
    subtitleBlack,
    titleDataTest,
    subtitleDataTest,
    icon,
    darkMode,
  } = props
  const { classes } = useStyles()
  const Icon = icon

  const selectionText = useSelector(
    state => state.taskMapFilter.filterSelectionText
  )

  return (
    <div
      style={
        title === selectionText || darkMode
          ? { backgroundColor: rawColours.primary.grey[200] }
          : {}
      }
      className={classes.root}
      onClick={() => {
        if (onClickHandler) {
          onClickHandler()
        }
      }}
      data-test={dataTest ? dataTest : ''}
    >
      <div className={classes.optionItem}>
        <div className={classes.optionDescription}>
          {title && (
            <Typography data-test={titleDataTest} variant="caption">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              data-test={subtitleDataTest}
              className={subtitleBlack ? '' : classes.optionTextDescription}
              variant="caption"
            >
              {subtitle}
            </Typography>
          )}
        </div>
        {!props.hideAvatar && (
          <div className={classes.optionItemIcon}>
            {icon ? (
              <Icon className={classes.icon} />
            ) : (
              <UserAvatar small user={avatarUser} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

AvatarWithTextItem.propTypes = {
  avatarUser: PropTypes.object,
  icon: PropTypes.object,
  title: PropTypes.string,
  titleDataTest: PropTypes.string,
  subtitle: PropTypes.string,
  subtitleDataTest: PropTypes.string,
  onClickHandler: PropTypes.func.isRequired,
}

export default AvatarWithTextItem
