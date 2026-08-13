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

import { Menu, MenuItem, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { NOTE_TYPES } from '../../../../app/constants'
import juralioColours from '../../../../theme/juralio-colours'
import {
  DocumentLinkAddIcon,
  MeetingNoteAddIcon,
  NoteAddIcon,
  WebLinkAddIcon,
} from '../../../../theme/navigation/CommonIcons'

const style = makeStyles()(theme => ({
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fabIcon: {
    paddingTop: theme.spacing(0.5),
    marginLeft: 11,
    marginRight: 13,
  },
  fabIconImg: {
    paddingTop: theme.spacing(0.5),
    marginLeft: theme.spacing(),
    marginRight: 13,
  },
  labelTypography: {
    opacity: '0.7',
  },
  icon: {
    color: juralioColours.navigation.background,
    opacity: '0.7',
  },
}))

const SubMenu = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const menuOptions = [
    {
      title: t('fabItems.aNoteBlank'),
      icon: NoteAddIcon,
      type: NOTE_TYPES.BLANK,
      dataTest: 'blank-note',
    },
    {
      title: t('fabItems.meetingNote'),
      icon: MeetingNoteAddIcon,
      type: NOTE_TYPES.MEETING,
      dataTest: 'meeting-note',
    },
    {
      title: t('fabItems.documentLink'),
      icon: DocumentLinkAddIcon,
      type: NOTE_TYPES.DOCUMENT,
      dataTest: 'document-link',
    },
    {
      title: t('fabItems.webLink'),
      icon: WebLinkAddIcon,
      type: NOTE_TYPES.WEB,
      dataTest: 'web-link',
    },
  ]
  return (
    <Menu
      open={true}
      onClick={props.close}
      anchorEl={props.anchor}
      anchorOrigin={props.anchorOrigin}
      style={props.style}
      transformOrigin={props.transformOrigin}
    >
      {menuOptions.map(item =>
        window.location.href.includes('template') &&
        item.title === t('fabItems.meetingNote') ? (
          ''
        ) : (
          <MenuItem
            key={item.title}
            className={classes.action}
            onClick={() => {
              props.select(item.type)
            }}
            data-test={item.dataTest}
          >
            <div
              className={
                item.type === NOTE_TYPES.WEB ||
                item.type === NOTE_TYPES.DOCUMENT
                  ? classes.fabIconImg
                  : classes.fabIcon
              }
            >
              <item.icon className={classes.icon} />
            </div>
            <Typography variant="body2" className={classes.labelTypography}>
              {item.title}
            </Typography>
          </MenuItem>
        )
      )}
    </Menu>
  )
}

export default SubMenu
