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

import { Avatar, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import { formatClientInitials } from '../../../services/user/helper/user-format-service'
import rawColours from '../../../theme/raw-colours'

const styles = theme => ({
  root: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    backgroundColor: rawColours.primary.blue.dark,
    color: 'white',
    display: 'inline-flex',
  },
  compact: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    border: `2px solid ${theme.palette.common.white}`,
  },
  large: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    border: `2px solid ${theme.palette.common.white}`,
  },
})

const ClientAvatar = props => {
  return (
    <Avatar
      className={classNames(props.classes.root, {
        [props.classes.compact]: props.compact,
        [props.classes.large]: props.large,
      })}
      data-test="client-avatar"
    >
      <Typography variant="caption">
        {formatClientInitials(props.clientName)}
      </Typography>
    </Avatar>
  )
}
export default withStyles(ClientAvatar, styles)
