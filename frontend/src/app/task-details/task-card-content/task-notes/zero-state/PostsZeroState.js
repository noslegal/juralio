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
import React, { useState } from 'react'
import AddButton from '../../../../../components/inputs/add-button/AddButton'
import NewPostMenu from '../post/list/NewPostMenu'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

const style = makeStyles()(theme => ({
  title: {
    marginTop: theme.spacing(2),
  },
  caption: {
    marginTop: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '75%',
    marginBottom: theme.spacing(2),
  },
  zeroStateContainer: {
    height: '100%',
    paddingTop: theme.spacing(3),
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  content: {
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  image: {
    width: '229px',
  },
}))

const PostsZeroState = props => {
  const { classes } = style()
  const [anchorEl, setAnchorEl] = useState(null)
  const { t } = useTranslation()

  const handleAddButtonClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenu = () => {
    setAnchorEl(null)
  }

  return (
    <div
      className={classes.zeroStateContainer}
      style={{
        paddingTop: props.isSmallScreen ? '0px' : '',
        height: !props.isSmallPanel && props.isSmallScreen ? 'auto' : '',
      }}
      data-test="no-notes-prompt"
    >
      <div
        style={{
          display: props.isSmallScreen ? 'contents' : 'block',
        }}
      >
        {!props.isSmallScreen && (
          <img
            src={props.image}
            alt="Zero state graphic"
            data-test="zero-state-image"
            className={classes.image}
            style={{
              scale: props.isSmallScreen ? '0.75' : '0.85',
            }}
          />
        )}

        <div className={classes.content}>
          <Typography
            className={classes.title}
            color="textSecondary"
            variant="h5"
            data-test="zero-state-title"
          >
            {props.title}
          </Typography>
          {!props.isReadOnly && (
            <Typography
              className={classes.caption}
              color="textSecondary"
              variant="body1"
              data-test="zero-state-caption"
            >
              {props.caption}
            </Typography>
          )}

          {!props.isReadOnly && (
            <div className={classes.buttonWrapper}>
              <AddButton
                text={t('postsList.createAPost')}
                onClick={handleAddButtonClick}
                data-test="create-post-button"
                trackingId="PostsZeroState"
                trackingValue="PostSomethingNew"
                width={120}
              />
            </div>
          )}
          <NewPostMenu
            menuItemClickCallback={handleMenu}
            anchorEl={anchorEl}
            origin="center"
            isTemplate={props.isTemplate}
            isPostListHeaderBtn={false}
          />
        </div>
      </div>
    </div>
  )
}

PostsZeroState.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
  isSmallScreen: PropTypes.bool,
}

export default PostsZeroState
