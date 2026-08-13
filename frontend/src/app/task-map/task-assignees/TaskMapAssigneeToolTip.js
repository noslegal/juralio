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

import { Link, Tooltip, Typography } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import PlaceholderAvatar from '../../../components/data-display/placeholders/PlaceholderAvatar'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import juralioTheme from '../../../theme/juralio-theme'
import {
  getMatterIdFromLocation,
  getTaskDetailsUrl,
} from '../../../components/navigation/common/location-context-helper'
import juralioColours from '../../../theme/juralio-colours'
import UserHover from '../../../components/data-display/user/UserHover'

const styles = theme => ({
  assigneeTooltipWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  userWrapper: {
    display: 'flex',
    maxWidth: '160px', //theme.spacing(20),
    textOverflow: 'ellipsis',
    paddingTop: '2.8px', //theme.spacing(0.35),
    paddingBottom: '2.8px', //theme.spacing(0.35),
  },

  userName: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginLeft: '4px', //theme.spacing(0.5),
    marginTop: '8px', //theme.spacing(0.5),
  },
  andMore: {
    color: juralioColours.whiteText.primary,
    marginLeft: 'auto',
    marginRight: 'auto',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.8,
    },
  },
})

const maxMemberRender = 5

const TaskMapAssigneeToolTip = props => {
  let teamMembers = props.teamMembers
  const { classes } = makeStyles()(styles)()

  if (teamMembers && teamMembers.length > 1) {
    teamMembers = teamMembers
      .sort((a, b) => {
        if (!a.lastname || !a.firstname) {
          return 1
        }
        if (!b.lastname || !b.firstname) {
          return 1
        }
        if (a.enabled !== b.enabled) {
          return a.enabled ? -1 : 1
        }
        if (a.lastname.toLowerCase() < b.lastname.toLowerCase()) return -1
        if (a.lastname.toLowerCase() > b.lastname.toLowerCase()) return 1
        if (a.firstname.toLowerCase() < b.firstname.toLowerCase()) return -1
        if (a.firstname.toLowerCase() > b.firstname.toLowerCase()) return 1
        return 0
      })
      .sort((a, b) => {
        if (a.isPlaceholder && b.isPlaceholder) {
          return 0
        } else if (a.isPlaceholder && !b.isPlaceholder) {
          return 1
        } else if (!a.isPlaceholder && b.isPlaceholder) {
          return -1
        }
        return 0
      })
  }
  const { t } = useTranslation()

  if (props.viewOnly) {
    return t('matter.viewOnly')
  }

  if (!teamMembers?.length) {
    if (props.viewOnly) {
      return t('matter.viewOnly')
    }
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={juralioTheme}>
          <Typography>{t('taskmapPopover.addTeamMember')}</Typography>
        </ThemeProvider>
      </StyledEngineProvider>
    )
  } else {
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={juralioTheme}>
          <div className={classes.assigneeTooltipWrapper}>
            {teamMembers.slice(0, maxMemberRender).map(member => {
              return (
                <div key={member.id} className={classes.userWrapper}>
                  {member.isPlaceholder ? (
                    <PlaceholderAvatar
                      placeholderName={member.firstname + ' ' + member.lastname}
                    />
                  ) : (
                    <UserAvatar user={member} />
                  )}
                  <Tooltip
                    placement="right"
                    slotProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: 'transparent',
                        },
                      },
                    }}
                    title={<UserHover user={member} />}
                  >
                    <Typography noWrap className={classes.userName}>
                      {member.firstname} {member.lastname}
                      {member.firstname == null && member.lastname == null
                        ? member.username
                        : null}
                    </Typography>
                  </Tooltip>
                </div>
              )
            })}
            {teamMembers.length > maxMemberRender && (
              <Link
                className={classes.andMore}
                href={
                  '#' +
                  getTaskDetailsUrl(
                    getMatterIdFromLocation({ pathname: window.location.href }),
                    props.task.projectId,
                    props.task.id
                  )
                }
              >
                <Typography>
                  {t('taskmapPopover.andMore', {
                    count: teamMembers.length - maxMemberRender,
                  })}
                </Typography>
              </Link>
            )}
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    )
  }
}

export default TaskMapAssigneeToolTip
