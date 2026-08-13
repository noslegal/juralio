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

import { mdiFilter } from '@mdi/js'
import CancelIcon from '@mui/icons-material/Cancel'
import LimitIcon from '@mui/icons-material/ReportProblem'
import {
  Button,
  ButtonGroup,
  Card,
  Fade,
  IconButton,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import classNames from 'classnames'
import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ACTIVITIES, CONFIG } from '../../../../app/constants'
import { fetchMatterDetails } from '../../../../app/matter-details/matter-details-actions'
import LabelFilterContainer from '../../../../app/task-map/task-filter/LabelFilterContainer'
import TaskFilterContainer from '../../../../app/task-map/task-filter/TaskFilterContainer'
import TaskStatusFilterContainer from '../../../../app/task-map/task-filter/TaskStatusFilterContainer'
import {
  setViewedOnceAfterCreation,
  showExportTemplateDialog,
} from '../../../../app/template/template-actions'
import { draftPublishHighlight } from '../../../../services/template/template-draft-publish-highlight'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../../services/tour/tour-actions'
import tourService from '../../../../services/tour/tour-service'
import WorkstreamExportDialog from '../../../dialog/workstream-export-dialog/WorkstreamExportDialog'
import {
  getMatterAdminUrl,
  getMatterIdFromLocation,
  getOverviewUrl,
  locationContextHelper,
} from '../../common/location-context-helper'
import { fadeConfig, getTooltipText } from './global-sub-header-helpers'
import { useStyles } from './global-sub-header-style'
import rawColours from '../../../../theme/raw-colours'
import JurOverview from '../../../../assets/images/JurOverview'
import JurTaskmap from '../../../../assets/images/JurTaskmap'
import JurRoadmap from '../../../../assets/images/JurRoadmap'
import JurTasklist from '../../../../assets/images/JurTasklist'
import JurCosts from '../../../../assets/images/JurCostsIcon'
import { Settings } from '@mui/icons-material'

const GlobalSubHeader = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const location = useLocation()
  const { classes } = useStyles()
  const { isMobile } = props
  const [showLimitTip, setShowLimitTip] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [isHover, setIsHover] = useState(null)
  const project = useSelector(state => state.project)
  const taskmapTasks = useSelector(state => state.improvedTaskmap.tasks)
  const selectionMode = useSelector(state => state.project.selectionMode)
  const viewedOnce = useSelector(
    state => state.templates.viewedOnceAfterCreation
  )
  const showTemplateExportDialog = useSelector(
    state => state.template.showExportDialog
  )
  const tour = useSelector(state => state.tour)
  const matter = useSelector(state => state.matterDetails)
  const isMatterAdmin = matter?.matter?.activities?.includes(
    ACTIVITIES.MATTER_ADMIN
  )
  const matterId = locationContextHelper.getMatterIdFromLocation(location)
  const workstreamId = locationContextHelper.getProjectIdFromLocation(location)

  useEffect(() => {
    if (
      (location.pathname.includes('/matter') && !matter.isLoaded && matterId) ||
      (location.pathname.includes('/matter') &&
        matter?.matter?.id?.toString() !== matterId &&
        !matter.isForbidden)
    ) {
      dispatch(fetchMatterDetails(matterId))
    }
    //eslint-disable-next-line
  }, [dispatch, matter.isLoaded, matterId])

  const projectId = locationContextHelper.getProjectIdFromLocation(location)
  const selectedTaskId = locationContextHelper.getTaskIdFromLocation(location)
  const templateId = locationContextHelper.getTemplateIdFromLocation(location)
  const history = useNavigate()
  const isOverview = location.pathname.includes('/overview')
  const isRoadmap = location.pathname.includes('/roadmap')
  const isTaskDetails = location.pathname.includes('/task/')
  const isTaskMap =
    location.pathname.includes('/taskmap') ||
    location.pathname.includes('/improvedTaskmap')
  const isTaskList = location.pathname.includes('/taskList')
  const isTemplate = location.pathname.includes('/template')
  const isWorkstream = location.pathname.includes('/workstream')
  const isMatterOverview = !(isTemplate || isWorkstream)

  const isSingleWorkstreamMatter = matter.overview
    ? matter?.overview?.workstreams.length === 1
    : matter?.matter?.numProjects === 1

  const inboxLink = locationContextHelper.getInboxUrl(
    undefined,
    matterId,
    projectId
  )
  const roadmapLink = locationContextHelper.getRoadmapUrl(
    matterId,
    projectId,
    selectedTaskId
  )
  const timelineLink = locationContextHelper.getTimelineUrl(
    selectedTaskId,
    matterId,
    projectId
  )
  const matterOverviewLink =
    locationContextHelper.getMatterOverviewUrl(matterId)

  const templateOverviewLink =
    locationContextHelper.getTemplateOverviewUrl(templateId)
  const taskMapLink = locationContextHelper.getTaskMapUrl(
    selectedTaskId,
    matterId,
    projectId
  )
  const matterTaskMapLink = locationContextHelper.getMatterTaskMapLink(
    matterId,
    selectedTaskId
  )
  const matterTaskListLink = locationContextHelper.getMatterTaskListLink(
    matterId,
    projectId,
    isSingleWorkstreamMatter
  )
  const matterRoadMapLink = locationContextHelper.getMatterRoadMapLink(
    matterId,
    selectedTaskId
  )
  const matterInboxLink = locationContextHelper.getMatterInboxLink(matterId)
  const templateTaskMapLink = locationContextHelper.getTemplateTaskMapUrl(
    templateId,
    selectedTaskId
  )

  const templateTaskListLink =
    locationContextHelper.getTemplateTaskListLink(templateId)

  const taskCount =
    project?.taskCounts?.doneCount +
    project?.taskCounts?.inProgressCount +
    project?.taskCounts?.notStartedCount

  const matterCostsLink = locationContextHelper.getMatterCostsLink(matterId)
  const hasMatterCostsAccess = matter?.matter?.activities?.includes(
    ACTIVITIES.MATTER_COSTS
  )

  const handleHover = () => setShowLimitTip(!showLimitTip)

  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const toggleFilters = () => setShowMobileFilters(!showMobileFilters)

  const clearTours = () => {
    if (
      tour.currentTour === 'statusFilter' ||
      tour.currentTour === 'hiddenTask'
    ) {
      dispatch(clearTour())
    }
  }
  useEffect(() => {
    if (
      (window.location.href.includes(
        t('/template/' + templateId + '/overview')
      ) ||
        window.location.href.includes(
          t('/template/' + templateId + '/taskmap')
        )) &&
      viewedOnce === false
    ) {
      dispatch(
        setTour('templateCreate', draftPublishHighlight(t, closeTourForever))
      )
      //set viewed to true so it will never be seen after first view after creation
      dispatch(setViewedOnceAfterCreation())
    } else if (tour.currentTour === 'templateCreate') {
      dispatch(clearTour())
    }
  }, [window.location.href]) //eslint-disable-line

  const closeTourForever = () => {
    tourService.completeTour('templateCreate').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }

  const renderTaskMapFilters = () =>
    isMobile ? (
      <Fragment>
        <div
          className={classNames(
            showMobileFilters && classes.animatedItem,
            !showMobileFilters && classes.animatedItemExiting
          )}
        >
          <IconButton
            onClick={() => toggleFilters()}
            data-test="toggle-filters-button"
            size="large"
          >
            <SvgIcon>
              <path d={mdiFilter} />
            </SvgIcon>
          </IconButton>
        </div>
        <Fade timeout={fadeConfig} in={showMobileFilters}>
          <div
            data-test="mobile-filter-button-wrapper"
            className={classes.filterButtons}
            style={{
              width: window.innerWidth - 40,
              marginLeft: '40px',
              overflowX: 'auto',
            }}
          >
            <LabelFilterContainer />
            <TaskStatusFilterContainer
              shouldShowNotRequired={true}
              isMobile={isMobile}
            />
            <TaskFilterContainer matterId={matterId} projectId={projectId} />
            <IconButton
              onClick={() => toggleFilters()}
              data-test="close-filters-button"
              size="large"
            >
              <CancelIcon />
            </IconButton>
          </div>
        </Fade>
      </Fragment>
    ) : (
      ''
    )

  const renderMobileNavigation = () => {
    return (
      <Fade timeout={fadeConfig} in={!showMobileFilters}>
        <div className={classes.mobileTabWrapper}>
          <Button
            data-test="taskmap-navigation-button"
            className={
              location.pathname.includes('/taskmap')
                ? classes.selectedButton
                : classes.button
            }
            component={NavLink}
            to={
              isTemplate
                ? templateTaskMapLink
                : isMatterOverview
                  ? matterTaskMapLink
                  : taskMapLink
            }
          >
            <Typography
              className={classes.subtitleOption}
              data-test="subheader-location-name"
            >
              {t('navigationLinks.taskmap')}
            </Typography>
          </Button>
          {!isTemplate && (
            <>
              <Button
                data-test="timeline-navigation-button"
                className={
                  location.pathname.includes('/timeline') &&
                  !location.search.includes('view=inbox')
                    ? classes.selectedButton
                    : classes.button
                }
                component={NavLink}
                to={isMatterOverview ? matterInboxLink : timelineLink}
              >
                <Typography
                  className={classes.subtitleOption}
                  data-test="subheader-location-name"
                >
                  {t('navigationLinks.timeline')}
                </Typography>
              </Button>
              {!isMobile && (
                <Button
                  variant="outlined"
                  data-test="timeline-navigation-button"
                  className={
                    location.pathname.includes('/roadmap') &&
                    !location.search.includes('view=inbox')
                      ? classes.selectedButton
                      : classes.button
                  }
                  component={NavLink}
                  to={isMatterOverview ? matterRoadMapLink : roadmapLink}
                >
                  <Typography
                    className={classes.subtitleOption}
                    data-test="subheader-location-name"
                  >
                    {t('navigationLinks.roadmap')}
                  </Typography>
                </Button>
              )}
            </>
          )}
          <Button
            data-test="inbox-navigation"
            className={
              location.search.includes('view=inbox')
                ? classes.selectedButton
                : classes.button
            }
            component={NavLink}
            to={
              isTemplate ? '' : isMatterOverview ? matterInboxLink : inboxLink
            }
          >
            <Typography
              className={classes.subtitleOption}
              data-test="subheader-location-type"
            >
              {t('navigationLinks.inbox')}
            </Typography>
          </Button>
        </div>
      </Fade>
    )
  }

  const getOverviewButtonLabel = () => {
    if (location.pathname.includes('/workstream')) {
      return t('navigationLinks.overview')
    } else {
      return t('navigationLinks.matterOverview')
    }
  }

  const renderDesktopNavigation = () => {
    return (
      <Fragment>
        <ButtonGroup disableElevation={true} variant="outlined">
          <>
            {!isTemplate && (
              <Button
                onMouseEnter={() => setIsHover('overview')}
                onMouseLeave={() => setIsHover(null)}
                startIcon={
                  <JurOverview
                    colour={
                      location.pathname.includes('/overview') ||
                      isHover === 'overview'
                        ? rawColours.primary.grey.main
                        : rawColours.primary.black[200]
                    }
                  />
                }
                data-test="overview-button"
                className={
                  location.pathname.includes('/overview')
                    ? classes.selectedButton
                    : classes.button
                }
                disableElevation={true}
                variant="outlined"
                onClick={() => {
                  if (!location.pathname.includes('/overview')) {
                    if (
                      !isSingleWorkstreamMatter &&
                      !location.pathname.includes('/costs')
                    ) {
                      history(getOverviewUrl(matterId, workstreamId))
                    } else {
                      history(matterOverviewLink)
                    }
                  }
                }}
              >
                {t('navigationLinks.overviewButton')}
              </Button>
            )}
            {isTemplate && (
              <Button
                onMouseEnter={() => setIsHover('templateOverview')}
                onMouseLeave={() => setIsHover(null)}
                startIcon={
                  <JurOverview
                    colour={
                      location.pathname.includes('/overview') ||
                      isHover === 'templateOverview'
                        ? rawColours.primary.grey.main
                        : rawColours.primary.black[200]
                    }
                  />
                }
                data-test="overview-button"
                className={
                  location.pathname.includes('/overview')
                    ? classes.selectedButton
                    : classes.button
                }
                disableElevation={true}
                variant="outlined"
                onClick={() => {
                  history(templateOverviewLink)
                }}
              >
                {t('navigationLinks.overviewButton')}
              </Button>
            )}
          </>
          {(!isMatterOverview ||
            (isMatterOverview && isSingleWorkstreamMatter)) && (
            <Button
              onMouseEnter={() => setIsHover('taskmap')}
              onMouseLeave={() => setIsHover(null)}
              startIcon={
                <JurTaskmap
                  colour={
                    location.pathname.includes('/taskmap') ||
                    isHover === 'taskmap'
                      ? rawColours.primary.grey.main
                      : rawColours.primary.black[200]
                  }
                />
              }
              variant="outlined"
              data-test="taskmap-navigation"
              className={
                location.pathname.includes('/taskmap')
                  ? classes.selectedButton
                  : classes.button
              }
              component={NavLink}
              to={
                isTemplate
                  ? templateTaskMapLink
                  : isSingleWorkstreamMatter
                    ? matterTaskMapLink
                    : taskMapLink
              }
            >
              <Typography
                style={
                  location.pathname.includes('/taskmap')
                    ? { fontWeight: 'bold' }
                    : {}
                }
                className={classes.subtitleOption}
                data-test="subheader-location-name"
              >
                {t('navigationLinks.taskmap')}
              </Typography>
            </Button>
          )}
          {/*
            add this back in when we are ready to fully add template tasklists
      {isTemplate && (
          <Button
            data-test="taskmap-navigation"
            className={
              location.pathname.includes('/taskList')
                ? classes.selectedButton
                : classes.button
            }
            component={NavLink}
            to={templateTaskListLink}
          >
            <Typography
              style={
                location.pathname.includes('/taskList')
                  ? { fontWeight: 'bold' }
                  : {}
              }
              className={classes.subtitleOption}
              data-test="subheader-location-name"
            >
              {t('navigationLinks.listView')}
            </Typography>
          </Button>
        )} */}
          {!isTemplate &&
            (!isMatterOverview ||
              (isMatterOverview && isSingleWorkstreamMatter)) && (
              <>
                <Button
                  onMouseEnter={() => setIsHover('roadmap')}
                  onMouseLeave={() => setIsHover(null)}
                  startIcon={
                    <JurRoadmap
                      colour={
                        location.pathname.includes('/roadmap') ||
                        isHover === 'roadmap'
                          ? rawColours.primary.grey.main
                          : rawColours.primary.black[200]
                      }
                    />
                  }
                  variant="outlined"
                  data-test="timeline-navigation-button"
                  className={
                    location.pathname.includes('/roadmap') &&
                    !location.search.includes('view=inbox')
                      ? classes.selectedButton
                      : classes.button
                  }
                  component={NavLink}
                  to={
                    isSingleWorkstreamMatter ? matterRoadMapLink : roadmapLink
                  }
                >
                  <Typography
                    style={
                      location.pathname.includes('/roadmap')
                        ? { fontWeight: 'bold' }
                        : {}
                    }
                    className={classes.subtitleOption}
                    data-test="subheader-location-name"
                  >
                    {t('navigationLinks.roadmap')}
                  </Typography>
                </Button>
                {showDownloadDialog && (
                  <WorkstreamExportDialog
                    onClose={() => setShowDownloadDialog(false)}
                  />
                )}
              </>
            )}
          {!isTemplate &&
            (!isMatterOverview ||
              (isMatterOverview && isSingleWorkstreamMatter)) && (
              <>
                <Button
                  onMouseEnter={() => setIsHover('taskList')}
                  onMouseLeave={() => setIsHover(null)}
                  startIcon={
                    <JurTasklist
                      colour={
                        location.pathname.includes('/taskList') ||
                        isHover === 'taskList'
                          ? rawColours.primary.grey.main
                          : rawColours.primary.black[200]
                      }
                    />
                  }
                  variant="outlined"
                  data-test="tasklist-navigation"
                  className={
                    location.pathname.includes('/taskList')
                      ? classes.selectedButton
                      : classes.button
                  }
                  component={NavLink}
                  to={matterTaskListLink}
                >
                  <Typography
                    style={
                      location.pathname.includes('/taskList')
                        ? { fontWeight: 'bold' }
                        : {}
                    }
                    className={classes.subtitleOption}
                    data-test="subheader-location-name"
                  >
                    {t('navigationLinks.listView')}
                  </Typography>
                </Button>
              </>
            )}
          {showTemplateExportDialog && (
            <WorkstreamExportDialog
              onClose={() => dispatch(showExportTemplateDialog())}
              isTemplate={isTemplate}
            />
          )}
          {hasMatterCostsAccess &&
            !isTemplate &&
            (isMatterOverview ||
              (!isMatterOverview && isSingleWorkstreamMatter)) && (
              <Button
                onMouseEnter={() => setIsHover('costs')}
                onMouseLeave={() => setIsHover(null)}
                startIcon={
                  <JurCosts
                    colour={
                      location.pathname.includes('/costs') ||
                      isHover === 'costs'
                        ? rawColours.primary.grey.main
                        : rawColours.primary.black[200]
                    }
                  />
                }
                variant="outlined"
                style={{ textTransform: 'none' }}
                data-test="costs-navigation-button"
                className={
                  location.pathname.includes('/costs')
                    ? classes.selectedButton
                    : classes.button
                }
                component={NavLink}
                to={matterCostsLink}
              >
                <Typography
                  style={
                    location.pathname.includes('/costs')
                      ? { fontWeight: 'bold' }
                      : {}
                  }
                  className={classes.subtitleOption}
                  data-test="subheader-location-name"
                >
                  {t('navigationLinks.costs')}
                </Typography>
              </Button>
            )}
          {isMatterAdmin && !isTemplate && (
            <Tooltip title="Go to matter admin">
              <Button
                variant="outlined"
                style={{ textTransform: 'none' }}
                data-test="go-to-matter-admin"
                className={
                  location.pathname.includes('/matteradmin')
                    ? classes.selectedButton
                    : classes.button
                }
                onClick={() => {
                  history(getMatterAdminUrl(getMatterIdFromLocation(location)))
                }}
              >
                <Settings />
              </Button>
            </Tooltip>
          )}
        </ButtonGroup>
      </Fragment>
    )
  }
  return (
    <div
      className={classNames(
        classes.globalSubHeader,
        showMobileFilters && classes.globalSubHeaderHighlighted
      )}
      data-test="global-sub-header"
    >
      {!showMobileFilters && (
        <Fragment>
          {isMobile ? renderMobileNavigation() : renderDesktopNavigation()}
        </Fragment>
      )}
      {isTaskMap && taskCount >= CONFIG.PROJECT_TASK_LIMIT - 10 && (
        <React.Fragment>
          <LimitIcon
            onMouseOver={handleHover}
            onMouseOut={handleHover}
            className={classes.taskCountIcon}
          />
          <Card
            onMouseOver={handleHover}
            onMouseOut={handleHover}
            hidden={taskCount < CONFIG.PROJECT_TASK_LIMIT - 11 || !showLimitTip}
            className={classes.limitCard}
          >
            <Typography className={classes.cardTooltip}>
              {getTooltipText(t, taskCount)}
            </Typography>
            <Typography className={classes.cardTooltip}>
              {t('taskmapTaskAlert.tooltipP2')}
            </Typography>
          </Card>
        </React.Fragment>
      )}
      <div className={classes.userButtons}>
        {(isTaskMap || isRoadmap || isTaskList) &&
          !isTemplate &&
          !selectionMode &&
          (project.tasks?.length > 0 || taskmapTasks.length > 0) &&
          renderTaskMapFilters()}
      </div>
    </div>
  )
}

export default GlobalSubHeader
