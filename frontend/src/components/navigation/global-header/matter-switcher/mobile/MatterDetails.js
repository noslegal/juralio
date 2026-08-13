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

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import { Button, Fade, Grow, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import debounce from 'lodash/debounce'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { fetchProjects } from '../../../../../app/matter-details/projects/projects-actions'
import UsersControlContainer from '../../../../../app/users/UsersControlContainer'
import { fetchTeam, MATTER_TEAM } from '../../../../../redux/ducks/matter-team'
import juralioColours from '../../../../../theme/juralio-colours'
import { MultipleWorkstreamsIcon } from '../../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../../theme/raw-colours'
import RolesUsersList from '../../../../data-display/roles-users-list/RolesUsersList'
import { SkeletonPeopleChip } from '../PeopleChip'
import WorkstreamChip, { SkeletonWorkstreamChip } from '../WorkstreamChip'

const style = makeStyles()(theme => ({
  container: {
    width: '100%',
    height: 'calc(100% - 57px)',
    backgroundColor: rawColours.primary.blue.light,
    position: 'absolute',
    top: theme.spacing(7),
    left: theme.spacing(0),
    zIndex: 100,
    borderRadius: '0px 4px 4px 0px',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflowY: 'auto',
    width: '100%',
    maxHeight: theme.spacing(74),
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  scrollShadow: {
    boxShadow: '0px -4px 3px rgba(50, 50, 50, 0.15)',
  },
  workstreamsTitleContainer: {
    display: 'flex',
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  workstreamTitle: {
    marginLeft: theme.spacing(1),
    color: juralioColours.darkText.primary,
    fontSize: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
    paddingBottom: theme.spacing(1),
  },
  adminButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    color: juralioColours.greenBlue.primary,
    backgroundColor: 'white',
    width: theme.spacing(38),
  },
  adminPanel: {
    height: theme.spacing(8),
    display: 'flex',
    position: 'absolute',
    bottom: '0px',
    width: '100%',
  },
  noActiveWorkstreams: {
    marginBottom: theme.spacing(2),
    color: juralioColours.darkText.primary,
    fontSize: theme.spacing(1.5),
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
  },
  matterNameContainer: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  matterName: {
    marginTop: theme.spacing(2),
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: theme.spacing(25),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  backButton: {
    color: juralioColours.greenBlue.primary,
    backgroundColor: rawColours.primary.white.primary,
    fontSize: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    marginBottom: 'auto',
    position: 'absolute',
    textTransform: 'capitalize',
  },
  backIcon: {
    fill: juralioColours.greenBlue.primary,
  },
  matterNameSkeleton: {
    width: theme.spacing(10),
    height: theme.spacing(2),
  },
  peopleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(4),
  },
}))

const MatterDetails = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const history = useNavigate()
  const projects = useSelector(state => state.projects)
  const team = useSelector(state => state.matterTeam.matterSwitcher)
  const [isLoaded, setIsLoaded] = useState(projects.meta.isLoaded)
  const [showAdminScroll, setShowAdminScroll] = useState(false)
  const [hoverId, setHoverId] = useState(null)
  const user = useSelector(state => state.auth.data.details)
  const activeUsers = team.team.filter(user => user.user.enabled)

  const [isMatterAdmin, setIsMatterAdmin] = useState(false)
  const [isMatterEditor, setIsMatterEditor] = useState(false)
  const [isMatterViewer, setIsMatterViewer] = useState(false)

  useEffect(() => {
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

  //eslint-disable-next-line
  const db = useCallback(
    debounce(value => setIsLoaded(value), 1000),
    []
  )

  useEffect(() => {
    //need a delay to smooth out the loading transitions
    const bothLoaded =
      projects.meta.isLoaded &&
      team.isLoaded &&
      projects.meta.matterId === props.matterId
    if (isLoaded) {
      setIsLoaded(bothLoaded)
    } else {
      db(bothLoaded)
    }
  }, [projects.meta.isLoaded, team.isLoaded]) //eslint-disable-line

  useEffect(() => {
    const limitToMtM = false
    dispatch(fetchProjects(props.matterId, limitToMtM, true, true))
    const includeTaskCount = false
    dispatch(
      fetchTeam(
        props.matterId,
        includeTaskCount,
        MATTER_TEAM.STATE_DESTINATION.MATTER_SWITCHER
      )
    )
  }, [props.matterId]) //eslint-disable-line

  useEffect(() => {
    const contentHeight = document.querySelector(
      '[data-test="matter-details-content"]'
    ).scrollHeight
    const availableHeight = 592
    if (contentHeight > availableHeight) {
      setShowAdminScroll(true)
    } else {
      setShowAdminScroll(false)
    }
  }, [isLoaded])

  const renderPeople = () => {
    return (
      <div className={classes.peopleContainer}>
        <UsersControlContainer
          users={activeUsers}
          renderUsersList={() => <RolesUsersList users={activeUsers} />}
          showRoles={true}
          floatLeft={false}
          showAvatarList={true}
        />
      </div>
    )
  }

  const getWorkstreamsTitle = () => {
    if (projects.items.length !== 1) {
      return (
        <Fade in={true}>
          <div
            className={classes.workstreamsTitleContainer}
            data-test="matter-details-workstreams-title"
          >
            <MultipleWorkstreamsIcon />
            <Typography className={classes.workstreamTitle}>
              {t('projectSelector.workstreams')}
            </Typography>
          </div>
        </Fade>
      )
    } else {
      return null
    }
  }
  const getPeopleTitle = () => {
    return (
      <Fade in={true}>
        <div
          className={classes.workstreamsTitleContainer}
          data-test="matter-details-people-title"
        >
          <PeopleIcon />
          <Typography className={classes.workstreamTitle}>
            {t('projectSelector.peopleTitle')}
          </Typography>
        </div>
      </Fade>
    )
  }

  const getNoWorkstreams = isMatterEditor => {
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

  const administerMatter = () => {
    props.handleBack()
    props.handleClose()
    history(`/matteradmin/${props.matterId}`)
  }

  return (
    <Grow in={true}>
      <div
        className={classes.container}
        data-test="matter-switcher-matter-details"
      >
        <div className={classes.content} data-test="matter-details-content">
          <div className={classes.matterNameContainer}>
            <Button
              startIcon={<ArrowBackIcon className={classes.backIcon} />}
              className={classes.backButton}
              variant="contained"
              onClick={props.handleBack}
              data-test="all-matters-button"
            >
              <Typography variant={'subtitle2'}>
                {t('entity.matters')}
              </Typography>
            </Button>
            <Typography variant="h6" className={classes.matterName}>
              {isLoaded ? (
                props.matterName
              ) : (
                <Skeleton
                  variant="text"
                  className={classes.matterNameSkeleton}
                />
              )}
            </Typography>
          </div>
          {isLoaded && getPeopleTitle()}
          {isLoaded && renderPeople()}
          {!isLoaded && <SkeletonPeopleChip title="admins" />}
          {isLoaded && getWorkstreamsTitle()}
          {isLoaded &&
            (projects.items.length === 0 || !isMatterEditor) &&
            getNoWorkstreams(isMatterEditor)}
          {isLoaded &&
            isMatterEditor &&
            projects.items
              .sort(
                (a, b) =>
                  a?.referenceNumber?.slice(1) - b?.referenceNumber?.slice(1)
              )
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
        {isMatterAdmin && (
          <div
            className={`${classes.adminPanel}  ${
              showAdminScroll && classes.scrollShadow
            }`}
            data-test="matter-detials-admin-panel"
          >
            <Fade in={true}>
              <Button
                startIcon={<SettingsIcon />}
                variant="contained"
                className={`${classes.adminButton}`}
                onClick={administerMatter}
                data-test="matter-details-admin-button"
              >
                {t('matterAdmin.prompt')}
              </Button>
            </Fade>
          </div>
        )}
      </div>
    </Grow>
  )
}

export default MatterDetails
