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

import { mdiArchive, mdiFileWord } from '@mdi/js'
import Icon from '@mdi/react'
import ArchiveIcon from '@mui/icons-material/Archive'
import CallMadeIcon from '@mui/icons-material/CallMade'
import HighlightIcon from '@mui/icons-material/Highlight'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { Menu, MenuItem, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  MeetingNoteIcon,
  NoteIcon,
} from '../../../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../../../theme/raw-colours'
import { NOTE_TYPES } from '../../../../../constants'

const MEETING = 'Meeting'

const useStyles = makeStyles()(theme => ({
  menuIcon: {
    color: rawColours.primary.black.black,
    marginRight: theme.spacing(),
    opacity: 0.7,
  },
}))

/** Menu in the Post detail view */
const TaskPostOptionMenu = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const isMenuOpen = () => Boolean(props.anchor)

  const renderArchiveOption = () => (
    <MenuItem
      onClick={props.archivePostHandler}
      data-test="task-post-archive"
      key={'archive'}
      disabled={props.viewOnly}
    >
      {<ArchiveIcon className={classes.menuIcon} />}
      {t('postMenu.archive')}
    </MenuItem>
  )

  const renderDeleteOption = () => (
    <MenuItem
      onClick={props.deletePostHandler}
      data-test="task-post-delete"
      key={'archive'}
      disabled={props.viewOnly}
    >
      {<Icon path={mdiArchive} size={1} className={classes.menuIcon} />}
      {t('postMenu.delete')}
    </MenuItem>
  )

  const renderDownloadOption = () => (
    <MenuItem
      onClick={props.downloadHandler}
      data-test="task-note-download-word"
      key={'download'}
    >
      {<Icon path={mdiFileWord} size={1} className={classes.menuIcon} />}
      {t('postMenu.downloadWord')}
    </MenuItem>
  )

  const renderMoveOption = () => (
    <MenuItem
      onClick={props.movePost}
      data-test="task-note-move"
      disabled={props.viewOnly}
    >
      <CallMadeIcon className={classes.menuIcon} />
      {t('postMenu.move')}
    </MenuItem>
  )

  const renderMakeVisible = () => (
    <MenuItem
      onClick={props.makeVisible}
      data-test="task-note-make-visible"
      disabled={props.viewOnly}
    >
      {props.post.privatePost ? (
        <HighlightIcon className={classes.menuIcon} />
      ) : (
        <VisibilityOffIcon className={classes.menuIcon} />
      )}
      {props.post.privatePost
        ? t('postMenu.makeVisible')
        : t('postMenu.makePrivate')}
    </MenuItem>
  )

  const renderConvertToFromMeeting = type => (
    <MenuItem
      onClick={props.convertPostHandler}
      data-test="task-note-convert"
      disabled={props.viewOnly}
      key={'convert-type'}
    >
      {type === MEETING ? (
        <NoteIcon className={classes.menuIcon} />
      ) : (
        <MeetingNoteIcon className={classes.menuIcon} />
      )}
      <Typography>
        {t('postMenu.convertTo', {
          type: type === MEETING ? '' : t('common.meeting').toLowerCase(),
        })}
      </Typography>
    </MenuItem>
  )

  const renderTemplateOnlyOptions = () => {
    return renderDeleteOption()
  }

  const renderProjectOnlyOptions = props => {
    return (
      <div>
        {!props.isReadOnly &&
          [null, MEETING].includes(props.post.type) &&
          renderConvertToFromMeeting(props.post.type)}
        {![
          NOTE_TYPES.GOOGLE_DOC,
          NOTE_TYPES.GOOGLE_SHEET,
          NOTE_TYPES.GOOGLE_SLIDES,
        ].includes(props.post.type) && renderDownloadOption()}
        {!props.isReadOnly && !props.isExternal && renderArchiveOption()}
      </div>
    )
  }

  return (
    <Menu
      disableAutoFocusItem={true}
      anchorEl={props.anchor}
      open={isMenuOpen()}
      data-test="task-note-option-menu"
      onClose={props.closeHandler}
    >
      {!props.isReadOnly && !props.isExternal && renderMoveOption()}
      {!props.isReadOnly &&
        props.post.finalised &&
        props.isPostEditor &&
        renderMakeVisible()}
      {props.isTemplate
        ? renderTemplateOnlyOptions()
        : renderProjectOnlyOptions(props)}
    </Menu>
  )
}

TaskPostOptionMenu.propTypes = {
  /** The post object */
  post: PropTypes.object,
  /** Close menu handler */
  closeHandler: PropTypes.func.isRequired,
  /** Element where menu is placed */
  anchor: PropTypes.object,
  /** Update Post */
  updatePostHandler: PropTypes.func.isRequired,
  /** Delete Post */
  deletePostHandler: PropTypes.func,
  /** Archive a post */
  archivePostHandler: PropTypes.func,
}

export default TaskPostOptionMenu
