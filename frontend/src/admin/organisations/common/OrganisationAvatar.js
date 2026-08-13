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
import { Avatar } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import organisationService from '../../../services/organisation/organisation-service'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { OrganisationsIcon } from '../../../theme/navigation/CommonIcons'
import { showOrganisationEditModal } from '../organisation-actions'

const useStyles = makeStyles()(theme => ({
  organisationIconWrapper: {
    borderWidth: theme.spacing(0.5),
    borderStyle: 'solid',
    boxSizing: 'border-box',
    color: JuralioNamedColours.black[200],
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
  editIcon: {
    fill: 'white',
    zIndex: 1,
    backgroundColor: juralioColours.avatar.hoverBackground,
    width: '80%',
    height: '80%',
    padding: '10%',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
  organisationIconHover: {
    borderColor: juralioColours.avatar.hover,
    cursor: 'pointer',
  },
}))

const OrganisationAvatar = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [hover, setHover] = useState(false)
  const [logo, setLogo] = useState(null)
  const organisation = props.organisation ? props.organisation : {}

  useEffect(() => {
    if (organisation.id !== null && organisation.customLogo) {
      organisationService
        .getOrganisationLogo(organisation.id)
        .then(response => {
          if (response.status === 200) {
            let blobUrl = URL.createObjectURL(response.body)
            setLogo(blobUrl)
          } else {
            setLogo(null)
          }
        })
    }
    return () => setLogo(null)
  }, [organisation.customLogo, organisation.id])

  const handleClick = e => {
    if (props.editable) {
      e.stopPropagation()
      dispatch(showOrganisationEditModal(organisation))
    }
  }

  return (
    <Avatar
      data-test="organisation-avatar"
      className={classNames([
        classes.organisationIconWrapper,
        hover ? classes.organisationIconHover : null,
      ])}
      onClick={handleClick}
      onMouseOver={() => (props.editable ? setHover(true) : null)}
      onMouseLeave={() => (props.editable ? setHover(false) : null)}
    >
      {logo ? <Avatar src={logo} /> : <OrganisationsIcon />}
      {hover && <CreateIcon className={classes.editIcon} />}
    </Avatar>
  )
}

OrganisationAvatar.propTypes = {
  editable: PropTypes.bool,
  organisation: PropTypes.object,
}

export default OrganisationAvatar
