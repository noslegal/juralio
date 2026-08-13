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

import { useMediaQuery, useTheme } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import UsersControl from '../../components/data-display/users-control/UsersControl'
import { useUserDetailsData } from '../../hooks/user-hooks'

const generateVisibleAvatars = (users, max_avatars) => {
  if (!users) return []
  const visibleAvatars = users.slice(0, max_avatars)
  visibleAvatars.map(a => {
    return { ...a, hovered: false }
  })
  return visibleAvatars
}

const UsersControlContainer = props => {
  const { users } = props
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const MAX_AVATARS = props.maxAvatars ? props.maxAvatars : isMobile ? 4 : 8
  const userData = useUserDetailsData()

  const [avatars, setAvatars] = useState([])
  const [overflowAvatars, setOverflowAvatars] = useState([])
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    setAvatars(generateVisibleAvatars(users, MAX_AVATARS))
    setOverflowAvatars(users?.slice(MAX_AVATARS, users.length))
  }, [users, isMobile, props.maxAvatars]) // eslint-disable-line

  useEffect(() => {
    if (props.forceClose) {
      setShowList(false)
    }
  }, [props.forceClose])

  if (!users || users.length === 0) {
    return null
  }

  return (
    <UsersControl
      avatars={avatars}
      setAvatars={setAvatars}
      showList={showList}
      setShowList={setShowList}
      overflowAvatars={overflowAvatars}
      renderUsersList={props.renderUsersList}
      currentUserId={userData.id}
      floatLeft={props.floatLeft}
      showRoles={props.showRoles}
      showAvatarList={props.showAvatarList}
    />
  )
}

UsersControlContainer.propTypes = {
  users: PropTypes.array,
  floatLeft: PropTypes.bool,
}

export default UsersControlContainer
