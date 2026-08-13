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
import { avatarImages } from '../../../components/data-display/user/avatars/avatar-helper'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import { JuralioAvatarColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  colourSphere: {
    marginTop: theme.spacing(),

    width: theme.spacing(5),
    height: theme.spacing(5),
    borderRadius: theme.spacing(3),
    cursor: 'pointer',
    marginRight: theme.spacing(2),
  },
  illustration: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundSize: `${theme.spacing(6)} ${theme.spacing(6)}`,
    borderRadius: theme.spacing(),
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8,40px)',
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2),
    marginTop: theme.spacing(),
  },
}))

const UserAvatarEditDialog = props => {
  const { classes } = style()

  const generateColorSpheres = selectedColour => {
    const colours = JuralioAvatarColours.map(c => c.backgroundColor)
    return (
      <div className={classes.row}>
        {colours.map((c, i) => {
          return (
            <div
              className={classes.colourSphere}
              data-test="avatar-colour"
              style={{
                backgroundColor: c,
                border:
                  i === selectedColour
                    ? `solid ${rawColours.avatars.selected} 4px`
                    : 'solid white 4px',
              }}
              onClick={() => props.setColour(i)}
            />
          )
        })}
      </div>
    )
  }

  const generateIllustrations = () => {
    return (
      <div className={classes.grid}>
        {avatarImages.map((avatarImage, i) => (
          <div
            className={classes.illustration}
            data-test="avatar-illustration"
            style={{
              backgroundImage: `url(${avatarImage})`,
              backgroundColor:
                i === props.image ? rawColours.primary.primary.light : '',
            }}
            onClick={() => props.setImage(i)}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className={classes.row}>
        <div className={classes.column} style={{ width: '80%' }}>
          <Typography>Colour</Typography>
          {generateColorSpheres(props.colour)}
        </div>
        <div className={classes.column}>
          <UserAvatar
            user={{
              firstname: props.user.firstname,
              lastname: props.user.lastname,
              avatarColorIndex: props.colour,
              avatarImageIndex: props.image,
            }}
            extraLarge
          />
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.column}>
          <Typography>Illustration</Typography>
          {generateIllustrations()}
        </div>
      </div>
    </div>
  )
}

export default UserAvatarEditDialog
