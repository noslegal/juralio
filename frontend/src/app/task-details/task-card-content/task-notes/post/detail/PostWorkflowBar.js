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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import InfoIcon from '@mui/icons-material/Info'
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import SimpleChip from '../../../../../../components/data-display/simple-chip/SimpleChip'
import colorModifiers from '../../../../../../theme/color-modifiers'
import juralioColours from '../../../../../../theme/juralio-colours'
import rawColours from '../../../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  statusDiv: {
    marginLeft: '-24px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
    height: theme.spacing(6.25),
    width: '-webkit-fill-available',
    minWidth: '100%',
    display: 'flex',
    alignContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  workflowBarContent: {
    display: 'flex',
    marginLeft: theme.spacing(3),
    alignItems: 'center',
    width: '100%',
    height: theme.spacing(13),
  },
  workflowBarText: {
    marginLeft: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
    marginRight: 'auto',
  },
  privacyAsText: {
    color: juralioColours.darkText.secondary,
    lineHeight: theme.spacing(3),
  },
  savedText: {
    color: juralioColours.darkText.secondary,
    display: 'flex',
    lineHeight: theme.spacing(3),
    marginLeft: 'auto',
    position: 'absolute',
    zIndex: '1',
  },
  statusButton: {
    backgroundColor: juralioColours.named.blue.main,
    color: juralioColours.whiteText.primary,
    height: theme.spacing(4),
    marginRight: theme.spacing(),
    '&:hover': {
      backgroundColor: rawColours.primary.primary.dark,
    },
  },
  tooltip: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    fontSize: theme.spacing(2.5),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  menuOption: {
    textTransform: 'capitalize',
  },
  privacyButton: {
    background: colorModifiers.secondaryText(rawColours.primary.white.primary),
    color: colorModifiers.filterIn(rawColours.primary.black.black),

    width: theme.spacing(15),
    height: theme.spacing(2.5),
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    textTransform: 'capitalize',
    fontSize: theme.spacing(1.5),
    marginRight: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  privacyChip: {
    marginLeft: theme.spacing(2),
    textTransform: 'capitalize',
  },
  editStatusButton: {
    color: juralioColours.named.blue.main,
    height: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: theme.spacing(2),
    '&:hover': {
      backgroundColor: juralioColours.named.blue.main,
      color: juralioColours.whiteText.primary,
    },
  },
  savedTextDiv: {
    position: 'relative',
    marginLeft: 'auto',
  },
  visible: {
    color: colorModifiers.filterIn(rawColours.primary.black.black),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    display: 'flex',
  },
  visibleText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(0.5),
  },
}))

const PostWorkflowBar = props => {
  const { post, isTemplate } = props
  const theme = useTheme()
  const { classes } = useStyles()
  const { t } = useTranslation()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false)
  const [privacyAnchor, setPrivacyAnhor] = useState(null)
  const currentUser = useSelector(state => state.auth.data.details)
  const editingPost = useSelector(
    state => state.selectedTaskPostList.postDetails.editMode
  )
  const editingTemplatePost = useSelector(
    state => state.templateTaskPostList.postDetails
  )
  const isAuthor =
    post.authors !== undefined &&
    post.authors.find(author => author.user.id === currentUser.id)
      ? true
      : false

  const renderPrivacyButton = () => {
    return (
      <>
        <Button
          disableElevation={true}
          variant="contained"
          data-test="post-privacy-button"
          onClick={e => {
            setPrivacyAnhor(e.currentTarget)
            setShowPrivacyMenu(!showPrivacyMenu)
          }}
          className={classes.privacyButton}
        >
          {post.privatePost ? t('common.private') : t('postMenu.visibleToAll')}
          <ArrowDropDownIcon />
        </Button>
        <Menu
          id="post-privacy-menu"
          open={showPrivacyMenu}
          anchorEl={privacyAnchor}
          onClose={() => setShowPrivacyMenu(false)}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {!post.privatePost && (
            <MenuItem
              data-test="post-privacy-dropdown-set-private"
              className={classes.menuOption}
              onClick={() => {
                props.handlePostPrivacyChange(true)
                setShowPrivacyMenu(false)
              }}
            >
              {t('common.private')}
            </MenuItem>
          )}
          {post.privatePost && (
            <MenuItem
              data-test="post-privacy-dropdown-set-public"
              className={classes.menuOption}
              onClick={() => {
                props.handlePostPrivacyChange(false)
                setShowPrivacyMenu(false)
              }}
            >
              {t('postMenu.visibleToAll')}
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  return (
    <div
      style={{
        backgroundColor: post.finalised
          ? juralioColours.taskCell.background.filteredOut.done
          : juralioColours.taskCell.background.filteredOut.inProgress,
      }}
      className={classes.statusDiv}
    >
      <div className={classes.workflowBarContent}>
        <div>
          <SimpleChip
            text={post.finalised ? t('postMenu.final') : t('postMenu.draft')}
            options={{
              dataTest: 'status-chip',
              color: juralioColours.darkText.secondary,
              backgroundColor: post.finalised
                ? juralioColours.taskCell.background.filteredIn.done
                : juralioColours.taskCell.background.filteredIn.inProgress,
              minWidth: 57,
              maxWidth: 75,
              height: 18,
            }}
          />
        </div>
        {props.post.finalised && props.post.privatePost && (
          <Tooltip title={t('postDetails.postFinalPrivate')}>
            <div className={classes.privacyChip}>
              <SimpleChip
                text={t('common.private')}
                options={{
                  dataTest: 'finalised-post-privacy-chip',
                  color: rawColours.primary.white.primary,
                  backgroundColor: colorModifiers.primaryText(
                    rawColours.primary.black.black
                  ),
                  minWidth: 47,
                  maxWidth: 75,
                  height: 18,
                }}
              />
            </div>
          </Tooltip>
        )}

        {props.post.finalised && !props.post.privatePost && (
          <Tooltip
            title={
              props.isTemplate
                ? t('postDetails.postTemplateVisible')
                : t('postDetails.visibleToAll')
            }
          >
            <div className={classes.privacyChip}>
              <div
                data-test="finalised-post-privacy-chip"
                className={classes.visible}
              >
                <Typography className={classes.visibleText} variant="caption">
                  {t('postMenu.visibleToAll')}
                </Typography>
                <InfoIcon fontSize="small" />
              </div>
            </div>
          </Tooltip>
        )}
        {!isMobileView && (
          <Typography
            className={classes.workflowBarText}
            data-test="post-visible-to"
          >
            {isTemplate && !post.finalised
              ? t('postDetails.postTemplateKm')
              : !isTemplate && !post.finalised
                ? t('postDetails.postVisible')
                : ''}
          </Typography>
        )}

        <div style={{ marginLeft: 'auto' }} />
        {!post.finalised &&
          !isMobileView &&
          (editingPost || editingTemplatePost.editMode) && (
            <div className={classes.savedTextDiv}>
              <div
                //case1=template,case2=meetingnote,case3=anything else
                style={
                  editingTemplatePost.isLoaded
                    ? { left: '30px', top: '55px' }
                    : post.type === 'Meeting'
                      ? { left: '180px', top: '130px' }
                      : { top: '55px', left: '180px' }
                }
                className={classes.savedText}
              >
                <Typography>{t('postDetails.saved')}</Typography>
                <Tooltip
                  className={classes.tooltip}
                  title={t('postDetails.savedTooltip')}
                >
                  <InfoIcon fontSize="small" />
                </Tooltip>
              </div>
            </div>
          )}

        {!props.isNotRequired &&
          !props.viewOnly &&
          post.authors !== undefined &&
          (isAuthor || isTemplate) && (
            <Tooltip
              title={
                !props.post.finalised && props.post.privatePost
                  ? t('postDetails.finalisePrivateTooltip')
                  : !props.post.finalised && !props.post.privatePost
                    ? t('postDetails.finaliseTooltip')
                    : ''
              }
            >
              <Button
                style={isMobileView ? { marginLeft: 'auto' } : {}}
                data-test="finalise-button"
                variant={post.finalised ? 'outlined' : 'contained'}
                disableElevation={true}
                onClick={() => props.handlePostStatusChange(post.finalised)}
                className={
                  post.finalised
                    ? classes.editStatusButton
                    : classes.statusButton
                }
              >
                {post.finalised ? t('common.edit') : t('common.finalise')}
              </Button>
            </Tooltip>
          )}
        {!post.finalised && !isTemplate && !props.viewOnly && (
          <>
            <Typography className={classes.privacyAsText}>
              {t('privacyBar.as')}
            </Typography>
            {renderPrivacyButton()}
          </>
        )}
      </div>
    </div>
  )
}

export default PostWorkflowBar
