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

import { Tooltip, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import UsersControlContainer from '../../../../app/users/UsersControlContainer'
import juralioColours from '../../../../theme/juralio-colours'
import UserList from '../../../layouts/user-list/UserList'

const style = makeStyles()(theme => ({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(0.5),
    width: '90%',
    height: theme.spacing(8),
    borderColor: 'rgba(206, 206, 206, 1)',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: theme.spacing(1),
  },
  title: {
    color: juralioColours.darkText.secondary,
    textTransform: 'uppercase',
    fontSize: theme.spacing(1.5),
    fontWeight: 400,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  skeletonAvatarContainer: {
    display: 'flex',
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  skeletonAvatar: {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
  noMembers: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  tooltipTitle: {
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: theme.spacing(1.5),
  },
  tooltipUser: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(0.25),
    marginBottom: theme.spacing(0.25),
  },
  tooltipAndMore: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(0.25),
    marginBottom: theme.spacing(0.25),
  },
}))

const PeopleChip = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const tooltipText = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="overline" className={classes.tooltipTitle} key={1}>
        {props.title}
      </Typography>
      {props.users.slice(0, 8).map(user => (
        <Typography className={classes.tooltipUser} key={2}>
          {user.user.firstname} {user.user.lastname}
        </Typography>
      ))}
      {props.users.length > 8 && (
        <Typography className={classes.tooltipAndMore} key={3}>
          and {props.users.length - 8} more
        </Typography>
      )}
    </div>
  )
  return (
    <Tooltip title={tooltipText}>
      <div
        className={classes.container}
        data-test="matter-switcher-people-chip"
      >
        <Typography
          variant="overline"
          className={classes.title}
          data-test="matter-switcher-people-chip-title"
        >
          {props.title}
        </Typography>
        <UsersControlContainer
          users={props.users}
          renderUsersList={() => (
            <UserList
              users={props.users}
              onRemoveClick={null}
              canRemoveSelf={true}
            />
          )}
          floatLeft={false}
          showAvatarList={true}
        />
        {props.users.length === 0 && (
          <Typography
            className={classes.noMembers}
            data-test="matter-switcher-people-chip-no-members"
          >
            {t('projectSelector.noMembers') + props.title}
          </Typography>
        )}
      </div>
    </Tooltip>
  )
}

export const SkeletonPeopleChip = () => {
  const { classes } = style()
  return (
    <div className={classes.skeletonAvatarContainer}>
      <Skeleton variant="circular" className={classes.skeletonAvatar} />
      <Skeleton variant="circular" className={classes.skeletonAvatar} />
      <Skeleton variant="circular" className={classes.skeletonAvatar} />
      <Skeleton variant="circular" className={classes.skeletonAvatar} />
      <Skeleton variant="circular" className={classes.skeletonAvatar} />
    </div>
  )
}

export default PeopleChip
