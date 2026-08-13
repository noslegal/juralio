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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import InboxIcon from '@mui/icons-material/Inbox'
import Skeleton from '@mui/material/Skeleton'
import classNames from 'classnames'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import JurWebLink from '../../assets/images/JurWebLink'
import CardCarousel from '../../components/data-display/card-carousel/CardCarousel'
import RolesUsersList from '../../components/data-display/roles-users-list/RolesUsersList'
import RichTextInlineEditor from '../../components/inputs/rich-text-inline-editor/RichTextInlineEditor'
import navigationBackgroundStyles from '../../components/navigation/common/navigation-background-styles'
import { getPostCountAndLabelText } from '../../helpers/post-helpers'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import { fetchMatterResources } from '../../redux/ducks/matter-resources'
import colorModifiers from '../../theme/color-modifiers'
import juralioColours from '../../theme/juralio-colours'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'
import {
  MattersIcon,
  MultiplePostsIcon,
  MultipleTasksIcon,
  PeopleIcon,
  Progress,
  TaskIcon,
} from '../../theme/navigation/CommonIcons'
import rawColours from '../../theme/raw-colours'
import { MAX_FIELD_LENGTHS } from '../constants'
import { fetchMatterDetails } from '../matter-details/matter-details-actions'
import { fetchProjects } from '../matter-details/projects/projects-actions'
import ProjectPeopleContainer from '../project/overview/items/project-people/ProjectPeopleContainer'
import PositionPlaceholder from '../project/overview/items/project-people/PositionPlaceholder'
import { shouldUseClientNamePlaceholder } from '../project/overview/items/project-people/project-people-data-helper'
import GroupAvatar from '../../components/layouts/manage-users/GroupAvatar'
import UsersControlContainer from '../users/UsersControlContainer'
import MatterContentOverview from './MatterContentOverview'
import MatterOverviewRoadmap from './MatterOverviewRoadmap'
import OverviewOptionsContainer from './OverviewOptionsContainer'
import { List, ListItemButton, Tooltip, Typography } from '@mui/material'
const columnWidth = 400

const style = makeStyles()(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    //marginTop: '58px',
    background: `url(${navigationBackgroundStyles.image})`,
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.overview.matter
    ),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    marginRight: theme.spacing(),
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    marginLeft: theme.spacing(0.5),
  },
  leftColumn: {
    flex: `1 1 ${columnWidth}px`,
    paddingTop: theme.spacing(1.5),
    minWidth: columnWidth,
    maxWidth: columnWidth,
    marginTop: '5px',

    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(2),
    overflowY: 'auto',
    paddingBottom: theme.spacing(11),
  },
  rightColum: {
    flex: '1 1 649px',
    height: '100%',
    display: 'flex',
    background: theme.palette.common.white,
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
    marginRight: theme.spacing(2),
    marginTop: '5px',
    flexDirection: 'column',
  },
  matterIcon: {
    marginRight: theme.spacing(1),
  },
  editTextFieldWrapper: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    border: `1px solid ${colorModifiers.opaque(rawColours.divider.dark)}`,
    borderRadius: theme.spacing(0.5),
  },
  menuItemNotSelected: {
    cursor: 'pointer',
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      backgroundColor: colorModifiers.hoverAction(rawColours.action.dark),
    },
  },
  menuItemSelected: {
    backgroundColor: rawColours.primary.white.secondary,
    '&:hover': {
      backgroundColor: rawColours.primary.white.secondary,
    },
  },
  menuItemHeader: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(),
    width: '100%',
    alignItems: 'center',
  },
  menuItemArrow: {
    marginTop: 'auto',
    marginBottom: 'auto',
    color: juralioColours.arrow,
    marginLeft: 'auto',
  },
  menuItemArrowSelected: {
    color: rawColours.primary.primary.main,
  },
  donePip: {
    backgroundColor: rawColours.status.done.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  inProgressPip: {
    backgroundColor: rawColours.status.inProgress.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  notStartedPip: {
    backgroundColor: rawColours.status.notStarted.dark,
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  taskCountForTab: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },

  menuItemBodyWrapper: {
    marginLeft: theme.spacing(2),
    width: '100%',
  },
  peopleRow: {
    width: 'fit-content',
  },
  carouselWrapper: {
    overflowX: 'auto',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  flexRow: {
    display: 'flex',
  },
  refRow: {
    display: 'flex',
    width: 'fit-content',
  },
  list: {
    paddingTop: '0px',
  },
  taskCountText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(1),
    fontSize: theme.spacing(2),
  },
  tasksIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    height: theme.spacing(3),
  },
  taskIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(),
  },
  counterIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  goToAdminButton: {
    marginTop: theme.spacing(1),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
    textTransform: 'none',
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      backgroundColor: colorModifiers.hoverAction(rawColours.action.dark),
    },
  },
  cardCarousel: {
    overflowX: 'auto',
    width: '100%',
    marginTop: theme.spacing(1),
  },
  textWrapper: {
    display: 'flex',
  },
  matterTextWrapper: {
    display: 'flex',
    width: 'fit-content',
  },
  positionsRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  positionColumn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '2px',
    gap: '4px',
  },
  groupColumn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
  },
  groupColumnClient: {
    marginLeft: '12px',
  },
  rightColumOverview: {
    background: `repeating-linear-gradient(90deg, ${colorModifiers.divider(
      rawColours.divider.dark
    )},  ${colorModifiers.divider(
      rawColours.divider.dark
    )} 1px, #fff 2px, #fff 100px)`,
  },
}))
const CONSTANTS = {
  OVERVIEW: 'OVERVIEW',
  PEOPLE: 'PEOPLE',
  POST: 'POST',
}

const MatterOverview = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const history = useNavigate()
  const matterDetails = useSelector(state => state.matterDetails)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const currentUser = useSelector(state => state.auth.data.details)
  const matterResources = useSelector(state => state.matterResources)
  const workstreamResources = useSelector(state => state.workstreamResources)
  const fullProjects = useSelector(state => state.projects)
  const projects = props.projects
  const resources = props.projectId ? workstreamResources : matterResources
  const { isMatterAdmin, isReadOnly } = props
  const dispatch = useDispatch()
  const [selectedMenuItem, setSelectedMenuItem] = useState(CONSTANTS.OVERVIEW)

  const flatTasks = fullProjects.items
    .map(p =>
      p.tasks
        ? p.tasks.flat().map(t => {
            t.project = { id: p.id }
            return t
          })
        : []
    )
    .flat()
    .sort((a, b) => (a.level < b.level ? -1 : 1))

  const postList = []
  if (selectedMenuItem === CONSTANTS.POST) {
    flatTasks.map(p => {
      if (p.posts) {
        p.posts.map(t => {
          t.taskId = p.id
          t.project = { id: p.project.id }
          return t
        })
      }
    })
    const flatPosts = flatTasks.map(p => p.posts).flat()
    if (flatPosts.length > 0 && flatPosts[0] !== undefined) {
      flatPosts.forEach(p => {
        if (p.authors.map(a => a.username).includes(currentUser.username)) {
          postList.push(p)
        } else if (p.finalised && !p.private) {
          postList.push(p)
        }
      })
    }
  }

  useEffect(() => {
    if (selectedMenuItem === CONSTANTS.POST) {
      dispatch(fetchMatterResources(props.matterId))
      dispatch(fetchMatterDetails(props.matterId, false))
      dispatch(fetchProjects(props.matterId, false, false, true))
    }
  }, [selectedMenuItem]) //eslint-disable-line

  const buildMenuItem = (header, body, type, tooltip) => {
    const isSelected = selectedMenuItem === type
    return (
      <Tooltip
        title={tooltip}
        disableHoverListener={typeof tooltip !== 'string'}
        disableFocusListener={typeof tooltip !== 'string'}
      >
        <ListItemButton
          className={classNames(
            classes.menuItem,
            isSelected ? classes.menuItemSelected : classes.menuItemNotSelected
          )}
          data-test="menuItem"
          onClick={() => setSelectedMenuItem(CONSTANTS[type])}
        >
          <div className={classes.menuItemHeader}>
            {!matterDetails.isLoaded ? (
              <>
                <Skeleton data-test="project-overview-skeleton-icon">
                  <TaskIcon className={classes.tasksIcon} />
                </Skeleton>
                <Skeleton
                  width="30%"
                  className={classes.skeletonText}
                  data-test="project-overview-skeleton-title"
                >
                  <Typography className={classes.taskCountText} />
                </Skeleton>
              </>
            ) : (
              header
            )}
            <ArrowForwardIcon
              className={classNames(
                classes.menuItemArrow,
                isSelected ? classes.menuItemArrowSelected : ''
              )}
            />
          </div>
          <div className={classes.menuItemBodyWrapper}>
            {!matterDetails.isLoaded ? (
              <Skeleton
                className={classes.skeletonBody}
                data-test="project-overview-skeleton-body"
              />
            ) : (
              body
            )}
          </div>
        </ListItemButton>
      </Tooltip>
    )
  }

  const generateOverviewTab = () => {
    const doneTasks = projects.reduce((acc, item) => {
      return acc + item.taskCounts.doneCount
    }, 0)
    const inProgressTasks = projects.reduce((acc, item) => {
      return acc + item.taskCounts.inProgressCount
    }, 0)
    const notStartedTasks = projects.reduce((acc, item) => {
      return acc + item.taskCounts.notStartedCount
    }, 0)
    return buildMenuItem(
      <>
        <Progress className={classes.icon} />
        <Typography variant="body2">{t('common.progress')}</Typography>
      </>,
      <div className={classes.row}>
        <div className={classes.notStartedPip} />
        <Typography
          data-test="not-started-tasks"
          className={classes.taskCountForTab}
        >
          {notStartedTasks}
        </Typography>

        <div className={classes.inProgressPip} />
        <Typography
          data-test="in-progress-tasks"
          className={classes.taskCountForTab}
        >
          {inProgressTasks}
        </Typography>
        <div className={classes.donePip} />
        <Typography data-test="done-tasks" className={classes.taskCountForTab}>
          {doneTasks}
        </Typography>
      </div>,
      CONSTANTS.OVERVIEW
    )
  }

  const generatePeopleTab = () => {
    return buildMenuItem(
      <>
        <PeopleIcon className={classes.icon} data-test="peopleTab" />
        <Typography variant="body2">{t('common.people')}</Typography>
      </>,
      <div>
        <div className={classes.positionsRow}>
          {[...matterDetails.overview.positionsForMatter]
            .sort((a, b) => b.positionId - a.positionId)
            .map(position => {
              const groupsInPosition =
                matterDetails.overview.positionsOfGroups.filter(
                  o => o.position.id === position.positionId
                )
              const useClientNamePlaceholder = shouldUseClientNamePlaceholder(
                matterDetails.overview,
                position.name
              )
              return (
                <div
                  key={position.positionId}
                  className={classes.positionColumn}
                >
                  <Typography variant="subtitle1">{position.name}:</Typography>
                  {groupsInPosition.length > 0 ? (
                    groupsInPosition.map(o => (
                      <div
                        key={o.group.id}
                        className={classNames(
                          classes.groupColumn,
                          position.name.toLowerCase() === 'client' &&
                            classes.groupColumnClient
                        )}
                      >
                        <GroupAvatar
                          group={o.group}
                          orgId={o.group.organisationId}
                          editable={false}
                          sx={{ width: 20, height: 20, marginTop: '2px' }}
                        />
                        <Typography variant="subtitle2">
                          {o.group.name}
                        </Typography>
                      </div>
                    ))
                  ) : useClientNamePlaceholder ? (
                    <PositionPlaceholder
                      className={classNames(
                        classes.groupColumn,
                        classes.groupColumnClient
                      )}
                      text={matterDetails.matter?.clientName}
                      tooltipKey="project.overview.people.positions.placeholderTooltipClientName"
                    />
                  ) : (
                    <Typography>
                      {t('matter.overview.groupPositionNotSelected')}
                    </Typography>
                  )}
                </div>
              )
            })}
        </div>
        <div className={classes.peopleRow}>
          {matterTeam.length === 0 && (
            <Typography data-test="people-tab-zero-state">
              {t('project.overview.peopleZeroStateMessage')}
            </Typography>
          )}
          {matterTeam && matterTeam.length > 0 && (
            <div
              onClick={e => e.stopPropagation()}
              className={classes.userControllWrapper}
            >
              <UsersControlContainer
                users={matterTeam}
                renderUsersList={() => <RolesUsersList users={matterTeam} />}
                floatLeft={false}
                showAvatarList={true}
                showRoles={true}
              />
            </div>
          )}
        </div>
      </div>,
      CONSTANTS.PEOPLE
    )
  }
  const getTaskCountTooltip = (taskCount, postCount) => {
    const overviewType = 'matter'
    if (taskCount === 1 || postCount === 1) {
      return t('project.overview.counts', {
        taskCount: taskCount === 1 ? 'one' : taskCount,
        postCount: postCount === 1 ? 'one' : postCount,
        tasks: taskCount !== 1 ? 'tasks' : 'task',
        posts: postCount !== 1 ? 'posts' : 'post',
        isWorkstream: overviewType,
      })
    }
    if (taskCount === 0) {
      return t('project.overview.countsNoTasks', {
        isWorkstream: overviewType,
      })
    }
    if (postCount === 0) {
      return t('project.overview.countsNoPosts', {
        taskCount: taskCount,
        tasks: taskCount !== 1 ? 'tasks' : 'task',
        isWorkstream: overviewType,
      })
    }
    return t('project.overview.counts', {
      taskCount: taskCount,
      postCount: postCount,
      tasks: taskCount !== 1 ? 'tasks' : 'task',
      posts: postCount !== 1 ? 'posts' : 'post',
      isWorkstream: overviewType,
    })
  }
  const getTaskAndPostTab = () => {
    const taskCount = props.taskCount
    const postCount = props.postCount
    const resourceCount = resources.isLoaded
      ? resources.resources.length
      : matterDetails.overview.resourceCount
    let knownResources = resources.isLoaded
      ? resources.resources
      : matterDetails.overview.resources
    return buildMenuItem(
      <>
        <InboxIcon className={classes.icon} />
        <Typography data-test="workstream-content" variant="body2">
          {t('common.content')}
        </Typography>
      </>,
      <div className={classes.column}>
        <div className={classes.row}>
          <MultipleTasksIcon className={classes.taskIcon} />
          <Typography data-test="task-count">{`${taskCount} ${t(
            'common.tasks'
          )}`}</Typography>

          <MultiplePostsIcon className={classes.counterIcon} />
          <Typography data-test="post-count">
            {getPostCountAndLabelText(t, postCount)}
          </Typography>

          <JurWebLink className={classes.counterIcon} />
          <Typography data-test="resource-count">{`${resourceCount} ${t(
            resourceCount === 1 ? 'common.resource' : 'common.resources'
          )}`}</Typography>
        </div>
        {knownResources?.length > 0 && (
          <div className={classes.carouselWrapper}>
            <CardCarousel
              resources={knownResources}
              limit={3}
              disableTooltips={true}
              searchQuery={''}
              matterId={props.matterId}
              viewOnly={isViewOnly}
            />
          </div>
        )}
      </div>,
      CONSTANTS.POST,
      getTaskCountTooltip(taskCount, postCount)
    )
  }

  const teamMembers = matterTeam.map(u => {
    let user = u.user
    user.taskCount = u.taskCount
    user.matterViewerId = u.matterViewerId
    user.matterAdminId = u.matterAdminId
    user.teamMemberId = u.teamMemberId
    return user
  })

  const isViewOnly = useIsViewOnly(matterDetails.overview)

  return (
    <div className={classes.root}>
      <div className={classes.leftColumn}>
        <div className={classes.flexRow}>
          <Typography variant="h6">
            {t('navigationLinks.matterOverview')}
          </Typography>

          <OverviewOptionsContainer
            isMatterOverview={true}
            matterId={props.matterId}
            isViewOnly={isViewOnly}
          />
        </div>
        {matterDetails?.matter?.userDefinedReferenceNumber && (
          <Tooltip title={t('entity.matterNumber')}>
            <div className={classes.refRow}>
              <MattersIcon fontSize="small" className={classes.matterIcon} />{' '}
              <Typography data-test={'matter-ref-number'}>
                {matterDetails?.matter?.userDefinedReferenceNumber}
              </Typography>
            </div>
          </Tooltip>
        )}
        <div className={classes.column}>
          <div
            data-test="matter-description"
            className={classes.editTextFieldWrapper}
          >
            <RichTextInlineEditor
              text={matterDetails.overview.description}
              placeholder={t('matterOverview.descriptionPlaceholder')}
              isReadOnly={isReadOnly}
              saveHandler={description => props.updateMatter({ description })}
              collapseProps={{ collapsedHeight: 128 }}
              maxChars={MAX_FIELD_LENGTHS.PROJECT_DESCRIPTION.toString()}
              showCharCount={true}
              disabled={isViewOnly}
              compact
            />
          </div>
        </div>
        <List className={classes.list}>
          {generateOverviewTab()}
          {generatePeopleTab()}
          {getTaskAndPostTab()}
        </List>
      </div>
      <div
        className={classNames(
          classes.rightColum,
          selectedMenuItem === CONSTANTS.OVERVIEW && classes.rightColumOverview
        )}
      >
        {selectedMenuItem === CONSTANTS.OVERVIEW && (
          <MatterOverviewRoadmap
            earliestDate={props.earliestDate}
            latestDate={props.latestDate}
            projects={projects}
          />
        )}
        {selectedMenuItem === CONSTANTS.PEOPLE && (
          <ProjectPeopleContainer
            matterId={props.matterId}
            teamOnProject={teamMembers}
            isMatterOverview={true}
          />
        )}
        {selectedMenuItem === CONSTANTS.POST && (
          <MatterContentOverview
            matterId={props.matterId}
            tasks={flatTasks}
            projects={props.projects}
            posts={postList}
          />
        )}
      </div>
    </div>
  )
}

export default MatterOverview
