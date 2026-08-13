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
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import InfoTooltip from '../../../components/data-display/info-tooltip/InfoTooltip'
import {
  isAdmin,
  isEditor,
  isViewer,
} from '../../../services/helpers/user/user-roles-helper'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    paddingBottom: theme.spacing(2),
  },
  paddingLeft: {
    paddingLeft: theme.spacing(0.4),
  },
}))

const MatterPeopleHeading = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const { team } = props

  const initialTeamCounts = {
    editors: 0,
    activeEditors: 0,
    admins: 0,
    activeAdmins: 0,
    viewers: 0,
    activeViewers: 0,
  }

  const [teamCount, setTeamCounts] = useState(initialTeamCounts)

  useEffect(() => {
    let editors, admins, activeEditors, activeAdmins, viewers, activeViewers
    editors =
      admins =
      activeEditors =
      activeAdmins =
      viewers =
      activeViewers =
        0
    team.forEach(user => {
      if (isEditor(user)) {
        editors += 1
        if (user.user.enabled) activeEditors += 1
      }
      if (isAdmin(user)) {
        admins += 1
        if (user.user.enabled) activeAdmins += 1
      }
      if (isViewer(user)) {
        viewers += 1
        if (user.user.enabled) activeViewers += 1
      }
    })
    setTeamCounts({
      editors: editors,
      activeEditors: activeEditors,
      admins: admins,
      activeAdmins: activeAdmins,
      viewers: viewers,
      activeViewers: activeViewers,
    })
  }, [team, props.teamIsLoaded])

  return (
    <div className={classes.root}>
      <Typography>
        {t('matterAdmin.usersDescription.editors', {
          count: teamCount.editors,
          context: `${teamCount.editors}`,
        })}
      </Typography>
      <Typography className={classes.paddingLeft}>
        {t('matterAdmin.usersDescription.activeEditors', {
          count: teamCount.activeEditors,
          context: `${teamCount.activeEditors}`,
        })}
      </Typography>
      <Typography className={classes.paddingLeft}>
        {t('matterAdmin.usersDescription.viewers', {
          count: teamCount.viewers,
          context: `${teamCount.viewers}`,
        })}
      </Typography>
      <Typography className={classes.paddingLeft}>
        {t('matterAdmin.usersDescription.activeViewers', {
          count: teamCount.activeViewers,
          context: `${teamCount.activeViewers}`,
        })}
      </Typography>
      <Typography className={classes.paddingLeft}>
        {t('matterAdmin.usersDescription.admins', {
          count: teamCount.admins,
          context: `${teamCount.admins}`,
        })}
      </Typography>
      <Typography className={classes.paddingLeft}>
        {t('matterAdmin.usersDescription.activeAdmins', {
          count: teamCount.activeAdmins,
          context: `${teamCount.activeAdmins}`,
        })}
      </Typography>
      <div className={classes.paddingLeft}>
        <InfoTooltip text={t('matterAdmin.usersDescription.tooltip')} />
      </div>
    </div>
  )
}

export default MatterPeopleHeading
