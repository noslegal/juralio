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

import ClearIcon from '@mui/icons-material/Clear'
import { Chip } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { formatUserDisplayName } from '../../../services/user/helper/user-format-service'
import UserAvatar from '../user/user-avatar/UserAvatar'

const useStyles = makeStyles()(theme => ({
  root: {
    borderRadius: 4,
    paddingLeft: theme.spacing(1),
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'space-between',
  },
  userChips: {
    display: 'flex',
    flexDirection: 'column',
  },
  chip: {
    padding: theme.spacing(1),
    textAlign: 'left',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const JuralioChip = props => {
  const { classes } = useStyles()

  const { user, compactAvatar } = props

  return (
    <Chip
      classes={{ root: classes.root, label: classes.chip }}
      avatar={<UserAvatar noBorder user={user} compact={compactAvatar} />}
      label={formatUserDisplayName(user)}
      onDelete={props.handleChipDelete}
      variant="outlined"
      deleteIcon={<ClearIcon data-test="juralio-chip-delete" />}
    />
  )
}

export default JuralioChip
