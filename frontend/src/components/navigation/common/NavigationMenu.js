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

import { List } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { useUserAuthData } from '../../../hooks/user-hooks'
import { hasRole } from '../../../services/user/helper/user-role-service'
import NavigationItem from './NavigationItem'

const useStyles = makeStyles()(() => ({
  upper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'space-around',
  },
  lower: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
}))

const NavigationMenu = props => {
  const userAuthData = useUserAuthData()
  const { classes } = useStyles()

  const permittedItems = props.links.filter(link => {
    const hasRequiredRole =
      !link.requiresRole || hasRole(link.requiresRole, userAuthData)
    const doesNotHaveExcludedRole =
      !link.excludesRole || !hasRole(link.excludesRole, userAuthData)

    return hasRequiredRole && doesNotHaveExcludedRole && link
  })

  return (
    <List className={props.lower ? classes.lower : classes.upper}>
      {permittedItems.map(link => {
        return (
          <NavigationItem
            displayTooltips={props.displayTooltips}
            key={link.linkText}
            link={link}
            lower={props.lower}
            {...props}
          />
        )
      })}
    </List>
  )
}

export default NavigationMenu
