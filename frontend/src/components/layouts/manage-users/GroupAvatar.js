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

import CreateIcon from '@mui/icons-material/Create'
import { Avatar, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import organisationService from '../../../services/organisation/organisation-service'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

export const logoCache = new Map()

const useStyles = makeStyles()(theme => ({
  avatarWrapper: {
    borderWidth: theme.spacing(0.25),
    borderStyle: 'solid',
    boxSizing: 'border-box',
    color: JuralioNamedColours.black[200],
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(0.5),
    overflow: 'hidden',
  },
  initialAvatar: {
    backgroundColor: juralioColours.greenBlue.primary,
    color: theme.palette.common.white,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  initialText: {
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1.1rem',
    lineHeight: 1,
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: juralioColours.greenBlue.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fill: 'white',
  },
  avatarHover: {
    borderColor: juralioColours.avatar.hover,
    cursor: 'pointer',
  },
}))

const GroupAvatar = props => {
  const { classes } = useStyles()
  const [hover, setHover] = useState(false)
  const [logo, setLogo] = useState(null)
  const group = props.group || {}
  const logoUrlRef = useRef(null)

  useEffect(() => {
    if (group.id && group.customLogo) {
      const cacheKey = `${props.orgId}-${group.id}`
      if (logoCache.has(cacheKey)) {
        const cachedUrl = logoCache.get(cacheKey)
        logoUrlRef.current = cachedUrl
        setLogo(cachedUrl)
      } else {
        organisationService
          .getGroupLogo(props.orgId, group.id)
          .then(response => {
            if (response.status === 200) {
              const url = URL.createObjectURL(response.body)
              logoCache.set(cacheKey, url)
              logoUrlRef.current = url
              setLogo(url)
            } else {
              setLogo(null)
            }
          })
      }
    } else {
      setLogo(null)
    }
    return () => {
      if (logoUrlRef.current && !logoCache.has(`${props.orgId}-${group.id}`)) {
        URL.revokeObjectURL(logoUrlRef.current)
      }
      logoUrlRef.current = null
    }
  }, [group.customLogo, group.id, props.orgId])

  const handleClick = e => {
    if (props.editable) {
      e.stopPropagation()
      props.onEdit(group)
    }
  }

  return (
    <Avatar
      data-test="group-avatar"
      className={classNames([
        classes.avatarWrapper,
        hover ? classes.avatarHover : null,
      ])}
      sx={props.sx}
      onClick={handleClick}
      onMouseOver={() => (props.editable ? setHover(true) : null)}
      onMouseLeave={() => (props.editable ? setHover(false) : null)}
    >
      {!hover &&
        (logo ? (
          <Avatar
            src={logo}
            sx={{
              borderRadius: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
            }}
          />
        ) : (
          <div className={classes.initialAvatar}>
            <Typography className={classes.initialText}>
              {group.name?.charAt(0).toUpperCase() ?? ''}
            </Typography>
          </div>
        ))}
      {hover && (
        <div className={classes.hoverOverlay}>
          <CreateIcon className={classes.editIcon} />
        </div>
      )}
    </Avatar>
  )
}

GroupAvatar.propTypes = {
  group: PropTypes.object.isRequired,
  orgId: PropTypes.number.isRequired,
  editable: PropTypes.bool,
  onEdit: PropTypes.func,
}

export default GroupAvatar
