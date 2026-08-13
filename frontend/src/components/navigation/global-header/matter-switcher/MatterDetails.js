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

import SettingsIcon from '@mui/icons-material/Settings'
import { Fade, Grow, IconButton, Tooltip, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { STATUS_TYPE } from '../../../../app/constants'
import { fetchMatterDetails } from '../../../../app/matter-details/matter-details-actions'
import UsersControlContainer from '../../../../app/users/UsersControlContainer'
import { fetchProjectsWithPostsAndTaskTeam } from '../../../../redux/actions/global-projects-actions'
import { fetchTeam, MATTER_TEAM } from '../../../../redux/ducks/matter-team'
import juralioColours from '../../../../theme/juralio-colours'
import {
  MattersIcon,
  MultipleWorkstreamsIcon,
  WorkstreamIcon,
} from '../../../../theme/navigation/CommonIcons'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import rawColours from '../../../../theme/raw-colours'
import RolesUsersList from '../../../data-display/roles-users-list/RolesUsersList'
import { SkeletonPeopleChip } from './PeopleChip'
import WorkstreamChip, { SkeletonWorkstreamChip } from './WorkstreamChip'

const style = makeStyles()(theme => ({
  container: {
    width: theme.spacing(42),
    height: Math.min(window.innerHeight - 72, 656),
    backgroundColor: rawColours.primary.blue.light,
    position: 'absolute',
    top: theme.spacing(0),
    left: theme.spacing(60),
    zIndex: 100,
    borderRadius: '0px 4px 4px 0px',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflowY: 'auto',
    width: '100%',
    height: '100%',

    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    whiteSpace: 'pre-line',
  },
  workstreamsTitleContainer: {
    display: 'flex',
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(0.5),
    marginTop: theme.spacing(),
  },
  workstreamTitle: {
    marginLeft: theme.spacing(1),
    color: rawColours.primary.headerColours.blue,
    fontSize: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  adminButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
  },
  addPeopleButton: {
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },
  adminButtonIcon: {
    color: rawColours.text.darkText,
  },
  adminPanel: {
    display: 'flex',
    position: 'absolute',
    top: theme.spacing(),
    right: theme.spacing(),
  },
  noActiveWorkstreams: {
    marginBottom: theme.spacing(2),
    color: juralioColours.darkText.primary,
    fontSize: theme.spacing(1.5),
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  peopleContainer: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginRight: 'auto',
  },
  workstreamTitleSkeleton: {
    width: theme.spacing(20),
    height: theme.spacing(5),
    marginLeft: theme.spacing(),
    color: rawColours.primary.headerColours.blue,
  },
  workstreamListwrapper: {
    maxHeight: `calc(100% - 100px)`,
    overflowY: 'auto',
  },
}))

const MatterDetails = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()
  const projects = useSelector(state => state.globalProjects)
  const team = useSelector(state => state.matterTeam.matterSwitcher)
  const [isLoaded, setIsLoaded] = useState(projects.meta.isLoaded)
  const [hoverId, setHoverId] = useState(null)
  const user = useSelector(state => state.auth.data.details)
  const activeUsers = team.team.filter(user => user.user.enabled)
  const [isMatterAdmin, setIsMatterAdmin] = useState(false)
  const [isMatterEditor, setIsMatterEditor] = useState(false)
  const [isMatterViewer, setIsMatterViewer] = useState(false)
  const [forceClose, setForceClose] = useState(false)

  useEffect(() => {
    setForceClose(false)

    setIsMatterAdmin(
      team.team &&
        team.team.find(teamMember => teamMember.user.id === user.id)
          ?.matterAdminId > 0
    )

    setIsMatterEditor(
      isLoaded &&
        team.team &&
        team.team.find(teamMember => teamMember.user.id === user.id)
          ?.teamMemberId > 0
    )

    setIsMatterViewer(
      isLoaded &&
        team.team &&
        team.team.find(teamMember => teamMember.user.id === user.id)
          ?.matterViewerId > 0
    )
  }, [team, isLoaded]) //eslint-disable-line

  useEffect(() => {
    setForceClose(false)
    //need a delay to smooth out the loading transitions
    const bothLoaded =
      projects.meta.isLoaded &&
      team.isLoaded &&
      projects.meta.matterId === props.matterId
    if (isLoaded !== bothLoaded) {
      setIsLoaded(bothLoaded)
    }
  }, [projects.meta.isLoaded, team.isLoaded]) //eslint-disable-line

  useEffect(() => {
    setForceClose(props.forceClose)
  }, [props.forceClose])
  useEffect(() => {
    const limitToMtM = false
    dispatch(
      fetchProjectsWithPostsAndTaskTeam(props.matterId, limitToMtM, true, true)
    )
    const includeTaskCount = false
    dispatch(
      fetchTeam(
        props.matterId,
        includeTaskCount,
        false,
        MATTER_TEAM.STATE_DESTINATION.MATTER_SWITCHER
      )
    )
  }, [props.matterId]) //eslint-disable-line

  useEffect(() => {
    setForceClose(false)
  }, [isLoaded])

  const renderPeople = () => {
    return (
      <div className={classes.peopleContainer}>
        <UsersControlContainer
          users={activeUsers}
          floatLeft={true}
          renderUsersList={() => <RolesUsersList users={activeUsers} />}
          showRoles={true}
          forceClose={forceClose}
          showAvatarList={true}
        />
      </div>
    )
  }

  const getIcon = projects => {
    if (projects.length === 1) {
      return <MattersIcon />
    }
    if (projects.filter(p => p.active).length === 1) {
      return <WorkstreamIcon />
    } else {
      return <MultipleWorkstreamsIcon />
    }
  }

  const getTitle = projects => {
    if (projects.length === 1) {
      return t('projectSelector.thisMattersWork')
    }
    if (projects.filter(p => p.active).length === 1) {
      return t('projectSelector.workstream')
    } else {
      return t('projectSelector.workstreams', { count: projects.length })
    }
  }

  const getWorkstreamsTitle = () => {
    return (
      <Fade in={true}>
        <div
          className={classes.workstreamsTitleContainer}
          data-test="matter-details-workstreams-title"
        >
          {isLoaded && (
            <Typography
              className={classes.workstreamTitle}
              data-test="workstreams-title"
            >
              {getTitle(projects.items)}
            </Typography>
          )}
          {!isLoaded && (
            <Skeleton className={classes.workstreamTitleSkeleton} />
          )}
        </div>
      </Fade>
    )
  }
  const getPeopleTitle = () => {
    return (
      <Fade in={true}>
        <div
          className={classes.workstreamsTitleContainer}
          data-test="matter-details-people-title"
        >
          <Typography className={classes.workstreamTitle}>
            {t('projectSelector.peopleTitle')}
          </Typography>
          {isMatterAdmin && (
            <Tooltip title={t('addUsersDialog.dialogTitle')}>
              <IconButton
                startIcon={<PersonAddIcon />}
                className={`${classes.addPeopleButton}`}
                onClick={addPeople}
                data-test="add-users-admin-button"
              >
                <PersonAddIcon className={classes.adminButtonIcon} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Fade>
    )
  }

  const getNoWorkstreams = () => {
    let text = ''

    if (isMatterEditor) {
      text = t('projectSelector.noActiveWorkstreams')
    } else if (isMatterViewer && !isMatterAdmin) {
      text = t('projectSelector.noActiveWorkstreamsViewer')
    } else {
      text = t('projectSelector.notEditor')
    }

    return (
      <Typography
        className={classes.noActiveWorkstreams}
        data-test="matter-details-no-workstreams"
      >
        {text}
      </Typography>
    )
  }

  const getClosedMatter = () => {
    return (
      <Typography
        className={classes.noActiveWorkstreams}
        data-test="matter-details-no-workstreams"
      >
        {isMatterAdmin && t('projectSelector.noActiveWorkstreamsAdmin')}
      </Typography>
    )
  }

  const administerMatter = () => {
    if (!props.matterId) {
      return
    }
    dispatch(fetchMatterDetails(props.matterId)).then(() => {
      props.handleClose()
      history(`/matteradmin/${props.matterId}`, {
        state: {
          tabItem: 0,
        },
      })
    })
  }

  const addPeople = () => {
    if (!props.matterId) {
      return
    }
    props.handleClose()
    history(`/matteradmin/${props.matterId}`, {
      state: { tabItem: 1, immediateAddTeamMembers: true },
    })
  }
  return (
    <Grow in={true}>
      <div
        className={classes.container}
        data-test="matter-switcher-matter-details"
        onClick={() => {
          setForceClose(true)
        }}
        style={{ height: props.forceHeight ? props.forceHeight : '' }}
      >
        {isMatterAdmin && (
          <div
            className={classes.adminPanel}
            data-test="matter-detials-admin-panel"
          >
            <Fade in={true}>
              <Tooltip title={t('matterAdmin.prompt')}>
                <IconButton
                  startIcon={<SettingsIcon />}
                  className={`${classes.adminButton}`}
                  onClick={administerMatter}
                  data-test="matter-details-admin-button"
                >
                  <SettingsIcon className={classes.adminButtonIcon} />
                </IconButton>
              </Tooltip>
            </Fade>
          </div>
        )}
        <div className={classes.content} data-test="matter-details-content">
          {getWorkstreamsTitle()}
          <div className={classes.workstreamListwrapper}>
            {isLoaded &&
              (projects.items.filter(p => p.active).length === 0 ||
                (!isMatterEditor && !isMatterViewer)) &&
              props.matter?.matterStatus === STATUS_TYPE.ACTIVE &&
              getNoWorkstreams(isMatterEditor)}
            {isLoaded &&
              props.matter?.matterStatus === STATUS_TYPE.CLOSED &&
              getClosedMatter()}
            {isLoaded &&
              props.matter?.matterStatus === STATUS_TYPE.ACTIVE &&
              (isMatterEditor || isMatterViewer) &&
              projects.items
                .sort((a, b) => {
                  if (!a?.mostRecentVisit && !b?.mostRecentVisit)
                    return (
                      a?.referenceNumber?.slice(1) -
                      b?.referenceNumber?.slice(1)
                    )
                  if (!b?.mostRecentVisit) return -1
                  if (!a?.mostRecentVisit) return 1
                  return (
                    new Date(a?.mostRecentVisit).getTime() <=
                    new Date(b?.mostRecentVisit).getTime()
                  )
                })
                .filter(p => p.active)
                .map((project, i) => (
                  <WorkstreamChip
                    showGoToText={true}
                    masonry={false}
                    key={i}
                    workstream={project}
                    matter={props.matter}
                    isDefaultWorkstream={
                      projects.items.length === 1 && project.isPrivate === false
                    }
                    handleRedirect={props.handleRedirect}
                    isExpanded={project.id === hoverId}
                    handleMouseOver={id => {
                      setHoverId(id)
                    }}
                    handleMouseLeave={() => {
                      setHoverId(null)
                    }}
                  />
                ))}
            {!isLoaded && <SkeletonWorkstreamChip />}
          </div>
          {getPeopleTitle()}
          {isLoaded && renderPeople()}
          {!isLoaded && <SkeletonPeopleChip title="admins" />}
        </div>
      </div>
    </Grow>
  )
}

export default MatterDetails
