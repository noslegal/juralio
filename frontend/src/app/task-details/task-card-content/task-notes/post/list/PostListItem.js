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

import { ListItemButton, Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import {
  getDateDisplayString,
  getDatePostList,
} from '../../../../../../services/helpers/date-helper'
import { getPostTypeIcon } from '../../../../../../services/helpers/post/post-icon-helper'
import { formatUserDisplayName } from '../../../../../../services/user/helper/user-format-service'
import juralioColours from '../../../../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../../../../theme/juralio-named-colours'
import { NoteIcon } from '../../../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../../../theme/raw-colours'
import { NOTE_TYPES } from '../../../../../constants'
import { renderDraftFinalChip } from './draft-final-chip-helper'

const styles = theme => ({
  root: {
    display: 'flex',
    flexGrow: 0,
    // MUI 9 dropped the default `width: 100%` from ListItemButton's root, so
    // restore it here — otherwise the button shrinks to content width and the
    // parent List's `alignItems: center` leaves it narrow and centred.
    width: '100%',
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    backgroundColor: JuralioNamedColours.beige[100],
    borderBottom: '1px solid ' + juralioColours.control.border,
    alignItems: 'start',
  },
  selectedRoot: {
    backgroundColor: JuralioNamedColours.black[200],
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: juralioColours.darkText.primary,
    },
  },
  privateIcon: {
    color: juralioColours.darkControl.backgroundSecondary,
  },
  noteName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: juralioColours.darkText.primary,
  },
  noteNameSelected: {
    color: juralioColours.whiteText.primary,
  },
  detailBlock: {
    width: '100%',
  },
  icon: {
    color: juralioColours.darkText.secondary,
    marginRight: theme.spacing(0.5),
  },
  postNameContainer: {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    flex: 1,
  },
  noteSummaryField: {
    //whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    lineHeight: theme.spacing(2),
    color: juralioColours.darkText.secondary,
    letterSpacing: 0.4,
  },
  noteSummaryFieldSelected: {
    color: theme.palette.common.white,
  },
  posticon: {
    color: juralioColours.control.borderLight,
    paddingRight: theme.spacing(),
  },
  iconSelected: {
    color: theme.palette.common.white,
  },
  privateIconSelected: {
    color: theme.palette.common.white,
  },
  iconColumn: {
    marginRight: theme.spacing(0.5),
    width: theme.spacing(8.25),
  },
  finalisedItem: {
    whitespace: 'nowrap',
    color: theme.palette.text.secondary,
  },
  finalisedItemSelected: {
    color: theme.palette.common.white,
  },
  postColumn: {
    maxWidth: '80%',
    textOverflow: 'ellipsis',
    marginLeft: 'auto',
  },
  postColumnWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(0.5),
    marginLeft: '-22px',
    textAlign: 'center',
  },
  offsetIcon: {
    marginLeft: '-2px',
  },
  dateColumn: {
    marginLeft: '5px',
  },
  privateText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: '0.75rem',
  },
  privateLozenge: {
    backgroundColor: rawColours.primary.black.black,
    borderRadius: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    color: rawColours.primary.white.primary,
    width: '50px',
    position: 'relative',
    marginLeft: 'auto',
    marginTop: '-20px',
  },
  noteListItem: { width: '90%', display: 'grid' },
})

const PostListItem = React.forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { classes, post, selected, isTemplate } = props
  return (
    <Tooltip
      title={
        post.type === undefined && post.privatePost
          ? t('postList.privateTooltip', { type: t('entity.note') })
          : post.type === undefined && !post.privatePost
            ? t('postList.postTooltip', { type: t('entity.note') })
            : post.privatePost
              ? t('postList.privateTooltip', { type: post.type })
              : t('postList.postTooltip', { type: post.type })
      }
    >
      <ListItemButton
        data-test={`note-list-item${selected ? '-selected' : ''}`}
        className={classNames(classes.root, {
          [classes.selectedRoot]: selected,
          [classes.finalisedItem]: post.finalised,
        })}
        onClick={props.clickHandler}
        ref={ref}
      >
        <div className={classes.postNameContainer}>
          <div
            className={classNames(classes.icon, {
              [classes.iconSelected]: selected,
            })}
          >
            {renderIcon(post, t)}
          </div>

          <div className={classes.noteListItem}>
            <Typography
              data-test="note-listitem-name"
              variant="subtitle2"
              className={classNames(classes.noteName, {
                [classes.noteNameSelected]: selected,
                [classes.finalisedItem]: props.noteNameSelected,
              })}
            >
              {post.name}
            </Typography>

            {post.privatePost && (
              <div
                data-test="note-listitem-private"
                className={classes.privateLozenge}
              >
                <Typography>{t('postList.private')}</Typography>
              </div>
            )}

            <div className={classes.postColumnWrapper}>
              {renderNoteIcons(t, post, selected, classes)}
              <div className={classes.postColumn}>
                {post.type === NOTE_TYPES.MEETING ? (
                  <Typography
                    variant="caption"
                    data-test="note-listitem-creator"
                    className={classNames(classes.noteSummaryField, {
                      [classes.noteSummaryFieldSelected]: selected,
                      [classes.finalisedItem]: post.finalised,
                      [classes.finalisedItemSelected]:
                        post.finalised && selected,
                    })}
                  >
                    {post.type === NOTE_TYPES.MEETING && post.finalised
                      ? t('postList.meetingHeld')
                      : formatUserDisplayName(post.creator) + ' edited'}
                  </Typography>
                ) : (
                  <Typography
                    variant="caption"
                    data-test="note-listitem-creator"
                    className={classNames(classes.noteSummaryField, {
                      [classes.noteSummaryFieldSelected]: selected,
                      [classes.finalisedItem]: post.finalised,
                      [classes.finalisedItemSelected]:
                        post.finalised && selected,
                    })}
                  >
                    {isTemplate
                      ? !post.finalised
                        ? t('postList.lastEdited')
                        : t('postList.finalisedOn')
                      : post.finalised
                        ? t('postList.by') + formatUserDisplayName(post.creator)
                        : formatUserDisplayName(post.creator) +
                          t('postList.edited')}
                  </Typography>
                )}
              </div>
              <div className={classes.dateColumn}>
                <Typography variant="caption">
                  {renderNoteDateDisplay(t, classes, post, selected)}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </ListItemButton>
    </Tooltip>
  )
})

const renderIcon = (post, t) => {
  if (post) {
    return getPostTypeIcon(t, post, { height: 24, width: 24 })
  }
  return <NoteIcon />
}

const renderNoteDateDisplay = (t, classes, post, selected) =>
  post.finalised ? (
    <Typography
      data-test="note-listitem-finalised-date"
      variant="caption"
      className={classNames({
        [classes.finalisedItem]: post.finalised,
        [classes.finalisedItemSelected]: post.finalised && selected,
      })}
    >
      {getDateDisplayString(post.startTime, undefined, true)}
    </Typography>
  ) : (
    <Typography
      data-test="note-listitem-creation-date"
      variant="caption"
      className={classNames(classes.noteSummaryField, {
        [classes.noteSummaryFieldSelected]: selected,
      })}
    >
      {getDatePostList(post.lastUpdated, t)}
    </Typography>
  )

const renderNoteIcons = (t, post, selected, classes) => {
  return (
    <div className={classes.iconColumn}>
      {renderDraftFinalChip(t, post.finalised, selected)}
    </div>
  )
}

PostListItem.propTypes = {
  /** The post item that this list entry represents */
  post: PropTypes.object.isRequired,
  /** Flag indicating if list item is selected or not */
  selected: PropTypes.bool.isRequired,
  /** Called when post clicked */
  clickHandler: PropTypes.func.isRequired,
  /** Total number of Posts count */
  count: PropTypes.number.isRequired,
}

export default withStyles(PostListItem, styles)
