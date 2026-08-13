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

import classNames from 'classnames'
import HideImageIcon from '@mui/icons-material/HideImage'
import InboxIcon from '@mui/icons-material/Inbox'
import LinkIcon from '@mui/icons-material/Link'
import MapIcon from '@mui/icons-material/Map'
import PeopleIcon from '@mui/icons-material/People'
import { IconButton, Link, List, Paper, Tooltip } from '@mui/material'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import CardCarousel from '../../../components/data-display/card-carousel/CardCarousel'
import GroupAvatar from '../../../components/layouts/manage-users/GroupAvatar'
import PrivateLozenge from '../../../components/data-display/private-lozenge/PrivateLozenge'
import RolesUsersList from '../../../components/data-display/roles-users-list/RolesUsersList'
import RichTextInlineEditor from '../../../components/inputs/rich-text-inline-editor/RichTextInlineEditor'
import UserList from '../../../components/layouts/user-list/UserList'
import {
  getOverviewPeopleUrl,
  getOverviewTasksUrl,
  getOverviewUrl,
  getTemplateIdFromLocation,
  getTemplateOverviewTasksUrl,
  getTemplateOverviewUrl,
} from '../../../components/navigation/common/location-context-helper'
import { getPostCountAndLabelText } from '../../../helpers/post-helpers'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import { fetchWorkstreamResources } from '../../../redux/ducks/workstream-resources'
import { checkIfPrivateWorkstreamMember } from '../../../services/helpers/user/user-roles-helper'
import matterService from '../../../services/matter/matter-service'
import projectService from '../../../services/project/project-service'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import templateService from '../../../services/template/template-service'
import {
  MattersIcon,
  MultiplePostsIcon,
  MultipleTasksIcon,
  Progress,
  WorkstreamIcon,
} from '../../../theme/navigation/CommonIcons'
import { MAX_FIELD_LENGTHS } from '../../constants'
import MatterDetails from '../../matter-details/MatterDetails'
import {
  fetchTemplateOverviewWithPosts,
  updateTemplateNameNoFetch,
} from '../../template/template-actions'
import SchemeOptionsContainer from '../../template/template-options/SchemeOptionsContainer'
import UsersControlContainer from '../../users/UsersControlContainer'
import {
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
  fetchProjectWithTaskTeams,
  updateWorksreamNameNoFetch,
} from '../project-actions'
import ProjectPeopleContainer from './items/project-people/ProjectPeopleContainer'
import PositionPlaceholder from './items/project-people/PositionPlaceholder'
import { shouldUseClientNamePlaceholder } from './items/project-people/project-people-data-helper'
import TaskCountPips from './items/TaskCountPips'
import ProjectContentContainer from './items/workstream-content/ProjectContentContainer'
import MatterCreatedDialog from './MatterCreatedDialog'
import {
  constants,
  PEOPLE_URL_PARTIAL,
  TASKS_URL_PARTIAL,
} from './overview-constants'
import { buildMenuItem, getTab, getTaskCountTooltip } from './overview-helpers'
import { useStyles } from './overview-style'
import ProjectOverviewRoadmapContainer from './ProjectOverviewRoadmapContainer'
import ProjectOverviewTaskMapContainer from './ProjectOverviewTaskMapContainer'
import {
  fetchMatterOverview,
  updateMatterDetails,
} from '../../matter-details/matter-details-actions'
import { isKnowledgeManager } from '../../../services/user/helper/user-role-service'
import OverviewOptionsContainer from '../../matter/OverviewOptionsContainer'

const ProjectOverview = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const {
    isMatterAdmin,
    isMatterOverview,
    isTemplate,
    loading,
    project,
    projects,
  } = props
  const dispatch = useDispatch()
  const isWorkstream = !isTemplate && !isMatterOverview
  const matterDetails = useSelector(state => state.matterDetails)
  const isMultiWorkstreamMatter = props.isMatterOverview
    ? matterDetails?.overview.workstreams.filter(w => w.active).length > 1
    : true
  const fullProject = useSelector(state => state.project)
  const fullTemplate = useSelector(state => state.template)
  const isPrivate = isMatterOverview
    ? matterDetails.overview.workstreams.filter(w => w.active)[0].isPrivate
    : fullProject.workstreamOverview?.isPrivate
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const workstreamResources = useSelector(state => state.workstreamResources)
  const matterResources = useSelector(state => state.matterResources)
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const taskCount = tasks.filter(t => t.id !== -1).length
  const resources = isTemplate
    ? project
    : isWorkstream
      ? workstreamResources
      : matterResources

  const isMatterViewer = useIsViewOnly(matterDetails.matter)
  const isMatterCreatedDialogVisible = project && props.isMatterJustCreated
  const isReadOnly =
    props.isReadOnly !== undefined
      ? props.isReadOnly
      : !isMatterAdmin || isMatterViewer

  const history = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (
      !isTemplate &&
      taskCount &&
      project &&
      taskCount.length >
        project.taskCounts.doneCount +
          project.taskCounts.inProgressCount +
          project.taskCounts.notRequiredCount +
          project.taskCounts.notStartedCount
    ) {
      if (isMatterOverview) {
        dispatch(fetchMatterOverview(project.matterId))
      } else {
        dispatch(fetchProjectWithPostsAndTaskTeam(project.matterId, project.id))
        dispatch(fetchWorkstreamResources(project.matterId, project.id))
        dispatch(fetchProjectOverview(project.matterId, project.id))
      }
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    setSelectedMenuItem(constants.OVERVIEW)
  }, [])

  const [selectedMenuItem, setSelectedMenuItem] = useState(getTab())

  useEffect(() => {
    setSelectedMenuItem(getTab())
  }, [])

  useEffect(() => {
    if (project.matterId && isWorkstream) {
      if (
        selectedMenuItem === constants.OVERVIEW &&
        !window.location.href.slice(-9).includes('overview')
      ) {
        history(getOverviewUrl(project.matterId, project.id))
      }
      if (
        selectedMenuItem === constants.PEOPLE &&
        !window.location.href.includes(PEOPLE_URL_PARTIAL)
      ) {
        history(getOverviewPeopleUrl(project.matterId, project.id))
      }
      if (
        selectedMenuItem === constants.POST &&
        !window.location.href.includes(TASKS_URL_PARTIAL)
      ) {
        history(getOverviewTasksUrl(project.matterId, project.id))
      }
    }
    if (isTemplate) {
      if (
        selectedMenuItem === constants.OVERVIEW &&
        !window.location.href.slice(-9).includes('overview')
      ) {
        history(getTemplateOverviewUrl(getTemplateIdFromLocation(location)))
      }

      if (
        selectedMenuItem === constants.POST &&
        !window.location.href.includes(TASKS_URL_PARTIAL)
      ) {
        history(
          getTemplateOverviewTasksUrl(getTemplateIdFromLocation(location))
        )
      }
    }
  }, [selectedMenuItem]) //eslint-disable-line

  useEffect(() => {
    setSelectedMenuItem(getTab())
  }, [window.location.href]) //eslint-disable-line

  useEffect(() => {
    if (selectedMenuItem === constants.POST) {
      if (!isTemplate && !project.isLoaded) {
        dispatch(
          fetchProjectWithPostsAndTaskTeam(
            props.project.matterId,
            props.project.id
          )
        )
      }
    }
    if (selectedMenuItem === constants.PEOPLE) {
      dispatch(fetchTeam(project.matterId, false, true))
      if (props.project) {
        dispatch(fetchProjectWithTaskTeams(project.matterId, project.id))
      }
    }
    if (selectedMenuItem === constants.POST) {
      if (!props.isMatterOverview && !isTemplate) {
        dispatch(fetchProjectWithPostsAndTaskTeam(project.matterId, project.id))
        dispatch(fetchWorkstreamResources(project.matterId, project.id))
        dispatch(fetchProjectOverview(project.matterId, project.id))
      } else if (isTemplate) {
        dispatch(
          fetchTemplateOverviewWithPosts(getTemplateIdFromLocation(location))
        )
      }
    }
  }, [selectedMenuItem]) //eslint-disable-line

  const updateDescription = description =>
    isMatterOverview
      ? dispatch(
          updateMatterDetails(matterDetails.overview.id, {
            description: description,
          })
        )
      : props.updateProject({ description })

  const getOverviewTab = () => {
    return buildMenuItem(
      classes,
      loading,
      selectedMenuItem,
      setSelectedMenuItem,
      isMatterOverview,
      <>
        {!isTemplate && <Progress className={classes.progressIcon} />}
        {isTemplate && <MapIcon className={classes.icon} />}
        <Typography variant="body2">
          {isTemplate
            ? t('project.overview.templateMap')
            : t('common.progress')}
        </Typography>
      </>,
      !isTemplate && (
        <div className={classes.row}>
          <TaskCountPips project={project} />
        </div>
      ),
      constants.OVERVIEW
    )
  }

  const getGroupList = (positionId, positionName) => {
    // A freshly created matter (e.g. one whose creator has no organisation
    // group) can have group-position entries with a null group or position.
    // Filter those out so the overview falls back to the placeholder rather
    // than crashing on o.position.id / o.group.id.
    let groupsInPosition = (
      matterDetails.overview?.positionsOfGroups || []
    ).filter(o => o.position?.id === positionId && o.group)

    if (groupsInPosition.length > 0) {
      return (
        <>
          {groupsInPosition.map(o => (
            <div
              key={o.group.id}
              className={classNames(
                classes.groupColumn,
                positionName?.toLowerCase() === 'client' &&
                  classes.groupColumnClient
              )}
            >
              <GroupAvatar
                group={o.group}
                orgId={o.group.organisationId}
                editable={false}
                sx={{ width: 20, height: 20, marginTop: '2px' }}
              />
              <Typography variant="subtitle2">{o.group.name}</Typography>
            </div>
          ))}
        </>
      )
    } else {
      if (
        shouldUseClientNamePlaceholder(matterDetails.overview, positionName)
      ) {
        return (
          <PositionPlaceholder
            className={classNames(
              classes.groupColumn,
              classes.groupColumnClient
            )}
            text={matterDetails?.matter?.clientName}
            tooltipKey="project.overview.people.positions.placeholderTooltipClientName"
          />
        )
      }
      return (
        <>
          <Typography>
            {t('matter.overview.groupPositionNotSelected')}
          </Typography>
        </>
      )
    }
  }

  const getPeopleTab = () => {
    const people = isMatterOverview
      ? matterTeam
      : props.people.map(member => {
          member.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
            props.project,
            member
          )
          return member
        })
    return buildMenuItem(
      classes,
      loading,
      selectedMenuItem,
      setSelectedMenuItem,
      isMatterOverview,
      <>
        <PeopleIcon className={classes.icon} data-test="peopleTab" />
        <Typography variant="body2">{t('common.people')}</Typography>
      </>,
      <div>
        <div className={classes.positionsRow}>
          {[...(matterDetails?.overview?.positionsForMatter || [])]
            .sort((a, b) => b.positionId - a.positionId)
            .map(position => {
              return (
                <div
                  key={position.positionId}
                  className={classes.positionColumn}
                >
                  <Typography variant="subtitle1">{position.name}:</Typography>
                  <div>{getGroupList(position.positionId, position.name)}</div>
                </div>
              )
            })}
        </div>
        <div className={classes.peopleRow} data-test="people-menu-item">
          {people?.length === 0 && (
            <Typography data-test="people-tab-zero-state">
              {isMatterOverview
                ? t('matter.overview.peopleZeroStateMessage')
                : isPrivate
                  ? t(
                      'project.overview.privateWorkstreamPeopleZeroStateMessage'
                    )
                  : t('project.overview.peopleZeroStateMessage')}
            </Typography>
          )}
          {people && people.length > 0 && (
            <div onClick={e => e.stopPropagation()}>
              <UsersControlContainer
                users={people}
                renderUsersList={() => {
                  if (isPrivate) {
                    return (
                      <UserList
                        users={people}
                        hideItemRole={true}
                        isPrivate={true}
                        onRemoveClick={null}
                        canRemoveSelf={true}
                      />
                    )
                  } else {
                    return <RolesUsersList users={people} />
                  }
                }}
                floatLeft={false}
                showAvatarList={true}
              />
            </div>
          )}
        </div>
      </div>,
      constants.PEOPLE
    )
  }

  const getTaskAndPostTab = () => {
    const knownResources =
      resources.isLoaded || props.isTemplate
        ? resources?.resources
        : isMatterOverview
          ? matterDetails?.overview?.resources
          : fullProject.workstreamOverview?.resources

    return buildMenuItem(
      classes,
      loading,
      selectedMenuItem,
      setSelectedMenuItem,
      isMatterOverview,
      <>
        <InboxIcon className={classes.icon} />
        <Typography data-test="workstream-content" variant="body2">
          {isTemplate
            ? t('project.overview.templateContent')
            : t('common.content')}
        </Typography>
      </>,
      <div className={classes.column}>
        <div className={classes.row}>
          <MultipleTasksIcon className={classes.taskIcon} />
          <Typography data-test="task-count">
            {`${props.itemCounts.taskCount} ${t('common.tasks')}`}
          </Typography>

          <MultiplePostsIcon className={classes.counterIcon} />
          <Typography data-test="post-count">
            {getPostCountAndLabelText(t, props.itemCounts.postCount)}
          </Typography>

          <LinkIcon className={classes.counterIcon} />
          <Typography data-test="resource-count">{`${
            props.itemCounts.resourceCount
          } ${t(
            props.itemCounts.resourceCount === 1
              ? 'common.resource'
              : 'common.resources'
          )}`}</Typography>
        </div>
        {knownResources && knownResources.length > 0 && (
          <div className={classes.carouselWrapper}>
            <CardCarousel
              resources={knownResources}
              limit={3}
              disableTooltips={true}
              searchQuery={''}
              matterId={props.matterId}
              projectId={project.id}
              isTemplate={isTemplate}
              viewOnly={
                isTemplate
                  ? !isKnowledgeManager() || props.project.isSystemTemplate
                  : isMatterViewer
              }
            />
          </div>
        )}
      </div>,
      constants.POST,
      getTaskCountTooltip(t, props.itemCounts, isMatterOverview)
    )
  }

  const getDescriptionEditor = () => {
    return (
      <div
        data-test="project-description"
        className={classes.editTextFieldWrapper}
      >
        <RichTextInlineEditor
          text={
            isMatterOverview
              ? matterDetails?.matter?.description
              : project.description
          }
          placeholder={
            props.descriptionPlaceholder
              ? props.descriptionPlaceholder
              : t('projectOverview.descriptionPlaceholder')
          }
          isReadOnly={isTemplate ? props.isReadOnly : isReadOnly}
          saveHandler={updateDescription}
          collapseProps={{ collapsedHeight: 128 }}
          maxChars={MAX_FIELD_LENGTHS.PROJECT_DESCRIPTION.toString()}
          showCharCount={true}
          compact
        />
      </div>
    )
  }

  const SWM =
    !isTemplate &&
    (isMatterOverview || matterDetails?.overview?.workstreams?.length < 2)

  const [editNameError, setEditNameError] = useState(null)

  const updateMatterName = value => {
    setEditNameError(null)
    if (isTemplate) {
      if (value === project.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.TEMPLATE_NAME
      if (isValid) {
        templateService
          .updateTemplate(project.id, { name: value })
          .then(res => {
            if (res.status !== 200) {
              setEditNameError(res?.body?.errors[0]?.message)
            } else {
              dispatch(updateTemplateNameNoFetch(value))
            }
          })
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.template.noEmptyTemplateName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.template.templateNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.template.unknownError'))
        }
      }
      return
    }
    if (SWM) {
      //matter
      if (value === matterDetails.overview.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.MATTER_NAME
      if (isValid) {
        matterService.updateMatter(matterDetails.overview.id, { name: value })
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.matter.noEmptyMatterName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.matter.matterNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.matter.unknownError'))
        }
      }
    } else {
      //workstream
      if (value === project.name) {
        return
      }
      let isValid =
        value.length > 0 && value.length <= MAX_FIELD_LENGTHS.PROJECT_NAME
      if (isValid) {
        projectService
          .updateProject(matterDetails.matter.id, project.id, {
            name: value,
          })
          .then(res => {
            if (res.status !== 200) {
              setEditNameError(res?.body?.errors[0]?.message)
            } else {
              dispatch(updateWorksreamNameNoFetch(value))
            }
          })
      } else {
        if (value.length === 0) {
          setEditNameError(t('simpleEdit.workstream.noEmptyWorkstreamName'))
        } else if (value.length > MAX_FIELD_LENGTHS.MATTER_NAME) {
          setEditNameError(t('simpleEdit.workstream.workstreamNameTooLong'))
        } else {
          setEditNameError(t('simpleEdit.workstream.unknownError'))
        }
      }
    }
  }
  return (
    <div
      className={classNames(
        classes.root,
        props.isMatterOverview && classes.rootMatterOverview
      )}
    >
      {isMatterCreatedDialogVisible && (
        <MatterCreatedDialog
          projectId={project.id}
          isMatterOverview={isMatterOverview}
          taskCount={Object.values(project.taskCounts).reduce(
            (a, b) => a + b,
            0
          )}
        />
      )}
      <div className={classes.leftColumn}>
        {props.backButton}
        <div className={classes.overviewTitleRow}>
          <Typography variant="h6">
            {isTemplate
              ? t('navigationLinks.templateOverview')
              : isMatterOverview
                ? t('navigationLinks.matterOverview')
                : t('navigationLinks.overview')}
          </Typography>
          <OverviewOptionsContainer
            isMatterOverview={isMatterOverview ? true : false}
            matterId={props.matterId}
            projectId={project.id}
            isTemplate={isTemplate}
            isViewOnly={isMatterViewer}
          />
        </div>
        {isTemplate && project.url && (
          <div
            className={classes.backgroundImage}
            style={{
              backgroundImage: `url(${project.url})`,
            }}
            data-test="background-preview"
          >
            <Typography className={classes.unsplashText}>
              {t('templates.unsplash.photoBy')}&nbsp;
              <Link
                target="_blank"
                rel="noopener"
                href={project.urlCredit}
                className={classes.artistLink}
                onClick={e => e.stopPropagation()}
              >
                {project.urlCreditName}
              </Link>
              &nbsp; {t('templates.unsplash.on')}&nbsp;
              <Link
                target="_blank"
                rel="noopener"
                href={
                  'https://unsplash.com?umt_source=Juralio+Template+Card+Background+Images&utm_medium=referral'
                }
                className={classes.artistLink}
                onClick={e => e.stopPropagation()}
              >
                {t('templates.unsplash.unsplash')}
              </Link>
            </Typography>
          </div>
        )}
        {!isMultiWorkstreamMatter && (
          <MatterDetails
            isTemplate={isTemplate}
            project={project}
            matterDetails={matterDetails}
            showLinkToMatterOverview={isWorkstream}
            isPrivate={isPrivate}
          />
        )}
        {isWorkstream && !isTemplate && (
          <>
            {matterDetails?.matter?.userDefinedReferenceNumber && (
              <Tooltip title={t('entity.matterNumber')}>
                <div className={classes.refNumberRow}>
                  <MattersIcon fontSize="small" />
                  <Typography
                    className={classes.workstreamRef}
                    data-test={'matter-ref-number'}
                  >
                    {matterDetails?.matter?.userDefinedReferenceNumber}
                  </Typography>
                </div>
              </Tooltip>
            )}
          </>
        )}
        {!isWorkstream &&
          !isTemplate &&
          matterDetails?.matter?.userDefinedReferenceNumber && (
            <Tooltip title={t('entity.matterNumber')}>
              <div className={classes.refNumberRow}>
                <MattersIcon fontSize="small" />
                <Typography
                  className={classes.workstreamRef}
                  data-test={'matter-ref-number'}
                >
                  {matterDetails?.matter?.userDefinedReferenceNumber}
                </Typography>
              </div>
            </Tooltip>
          )}
        <div className={classes.workstreamNameWrapper}>
          {isWorkstream && (
            <Tooltip title={t('entity.workstreamNumber')}>
              <div className={classes.refNumberRow}>
                <WorkstreamIcon fontSize="small" />
                <Typography
                  className={classes.workstreamRef}
                  data-test={'workstream-ref-number'}
                >
                  {project?.referenceNumber?.slice(1)}
                </Typography>
              </div>
            </Tooltip>
          )}
          {isTemplate && !isReadOnly && project.url && (
            <Tooltip title={t('templates.unsplash.removeTooltip')}>
              <IconButton
                onClick={props.removeImage}
                className={classes.unsplashIcon}
                data-test="remove-image-button"
              >
                <HideImageIcon />
              </IconButton>
            </Tooltip>
          )}
          {isPrivate && !isTemplate && (
            <Tooltip
              title={t('project.overview.private', {
                item: !isMatterOverview ? 'workstream' : 'matter',
              })}
            >
              <PrivateLozenge />
            </Tooltip>
          )}
        </div>

        {getDescriptionEditor()}

        <List className={classes.list}>
          {getOverviewTab()}
          {!isTemplate && getPeopleTab()}
          {getTaskAndPostTab()}
        </List>
      </div>
      <Paper className={classes.middlePanel} elevation={2}>
        <div
          className={
            selectedMenuItem === constants.OVERVIEW && !isTemplate
              ? classes.roadmapFrame
              : classes.mapFrame
          }
        >
          {selectedMenuItem === constants.OVERVIEW && !isTemplate && (
            <ProjectOverviewRoadmapContainer
              isTemplate={isTemplate}
              project={project}
              isMatterOverview={isMatterOverview}
            />
          )}
          {selectedMenuItem === constants.OVERVIEW && isTemplate && (
            <ProjectOverviewTaskMapContainer
              zeroStateText={props.zeroStateText}
              isForbidden={props.isForbidden}
              isReadOnly={isReadOnly}
            />
          )}

          {selectedMenuItem === constants.PEOPLE && (
            <ProjectPeopleContainer
              matterId={project.matterId}
              teamOnProject={props.people}
              privateTeamMembers={props.people.map(member => {
                member.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
                  props.project,
                  member
                )
                return member
              })}
              isMatterOverview={isMatterOverview}
              isPrivate={isPrivate}
            />
          )}

          {selectedMenuItem === constants.POST &&
            (isTemplate ? true : fullProject.isLoaded) &&
            (isTemplate ? fullTemplate.template.posts : fullProject.posts) && (
              <ProjectContentContainer
                matterId={isTemplate ? undefined : fullProject.matterId}
                projectId={
                  isTemplate ? fullTemplate.template.id : fullProject.id
                }
                project={isTemplate ? fullTemplate.template : fullProject}
                posts={
                  isTemplate ? fullTemplate.template.posts : fullProject.posts
                }
                tasks={flatTaskListFromTree(
                  isTemplate ? fullTemplate.template : fullProject
                )}
                isTemplate={isTemplate}
                isMatterOverview={isMatterOverview}
              />
            )}
        </div>
      </Paper>
      <SchemeOptionsContainer
        isTemplate={isTemplate ? isTemplate : false}
        isEditingName={props.editing.isEditingName}
        name={project.name}
        project={project}
        projects={projects}
        editing={props.editing}
        showCopyDialog={props.showCopyDialog}
        showDeleteDialog={props.showDeleteDialog}
        setShowCopyDialog={props.setShowCopyDialog}
        setShowDeleteDialog={props.setShowDeleteDialog}
        deleteTemplate={props.deleteTemplate}
      />
    </div>
  )
}

ProjectOverview.propTypes = {
  children: PropTypes.array,
  clearErrorMessages: PropTypes.func.isRequired,
  descriptionPlaceholder: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  isTemplate: PropTypes.bool,
  itemCounts: PropTypes.object,
  project: PropTypes.object.isRequired,
  updateProject: PropTypes.func.isRequired,
  zeroStateText: PropTypes.string.isRequired,
  loading: PropTypes.bool,
}

export default ProjectOverview
