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
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import ClientAvatar from '../../components/data-display/client/ClientAvatar'
import juralioColours from '../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: theme.spacing(40),
  },
  matterItemDetails: {
    paddingLeft: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
  },
  clientName: {
    color: juralioColours.darkText.secondary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: theme.spacing(1.5),
  },
  matterName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    fontSize: theme.spacing(1.5),
  },
}))

const ClientMatterAvatar = props => {
  const { classes } = useStyles()
  const { matter } = props

  if (!matter) return null

  return (
    <div className={classes.root}>
      <ClientAvatar
        clientName={
          matter?.clientName ? matter.clientName : matter?.matterClient
        }
      />
      <div className={classes.matterItemDetails}>
        <Typography variant="caption" className={classes.clientName}>
          {matter?.clientName ? matter.clientName : matter?.matterClient}
        </Typography>
        <Typography variant="subtitle1" className={classes.matterName}>
          {matter?.name ? matter.name : matter?.matterName}
        </Typography>
      </div>
    </div>
  )
}

export default ClientMatterAvatar
