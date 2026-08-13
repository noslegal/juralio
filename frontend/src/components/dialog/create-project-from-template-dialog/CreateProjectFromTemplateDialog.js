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

import {
  Checkbox,
  DialogContent,
  FormControlLabel,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { CONFIG, POSITIONS, USER_ROLES } from '../../../app/constants'
import { fetchProjects } from '../../../app/matter-list/matter-list-actions'
import {
  enterSelectionMode,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../app/project/project-actions'
import { templateToProject } from '../../../app/template/project-creation/template-to-project-actions'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import { getLevelATaskCount } from '../../../services/helpers/task/task-util-helper'
import juralioColours from '../../../theme/juralio-colours'
import JuralioDialog from '../juralio-dialog/JuralioDialog'
import LoadingScreen from '../../loading-screen/LoadingScreen'
import matterService from '../../../services/matter/matter-service'
import MattersList from '../../navigation/global-header/matter-switcher/MattersList'
import MatterSwitcherFilter from '../../navigation/global-header/matter-switcher/filter/MatterSwitcherFilter'
import WorkstreamList from '../../navigation/global-header/matter-switcher/WorkstreamList'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import {
  getOverviewUrl,
  getSingleWorkstreamTaskMapUrl,
  getTaskMapUrl,
} from '../../navigation/common/location-context-helper'
import {
  completeCreateTaskFromTemplateTask,
  createTaskFromTemplateTask,
  fetchTaskmapStructure,
  storeSelectedTasksFromTemplate,
} from '../../../redux/ducks/improved-taskmap'
import taskService from '../../../services/task/task-service'
import projectService from '../../../services/project/project-service'
import { useNavigate } from 'react-router'
import { reset } from '../../../app/template/template-actions'
import rawColours from '../../../theme/raw-colours'
import { AddMattersIcon } from '../../../theme/navigation/CommonIcons'
import ErrorBox from '../../data-display/error-box/ErrorBox'
import NewMatterDetailsDialog from '../../../app/matter-create/NewMatterDetailsDialog'

const useStyles = makeStyles()(theme => ({
  textEntryField: {
    paddingTop: theme.spacing(3),
    width: '100%',
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
  },
  matterItemTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  clientName: {
    marginRight: theme.spacing(4),
    lineHeight: '20px',
    fontSize: theme.spacing(1.5),
    maxWidth: theme.spacing(38),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: rawColours.primary.white.primary,
  },
  matterName: {
    marginRight: theme.spacing(4),
    fontSize: theme.spacing(1.5),
    fontWeight: 500,
    maxWidth: theme.spacing(31),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: rawColours.primary.white.primary,
  },
  matterItemContainer: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: 'pointer',
    margin: '4px 16px',
    paddingLeft: theme.spacing(2),
    '&:hover': {
      backgroundColor: juralioColours.matterSwitcher.workstreamChip.hover,
    },
    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='5' ry='5' stroke='%233F799B80' strokeWidth='4' strokeDasharray='18' strokeDashoffset='0' strokeLinecap='square'/%3e%3c/svg%3e")`,
    borderRadius: '5px',
  },
}))

const NEW_MATTER = 'NEW_MATTER'
const EXISTING_MATTER = 'EXISTING_MATTER'

/** Dialog that allows user to specify a Matter and new Project name. */
const CreateProjectFromTemplateDialog = props => {
  const { t } = useTranslation()
  const history = useNavigate()
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const [value, setValue] = useState(NEW_MATTER)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [selectedMatterId, setSelectedMatterId] = useState()
  const [matters, setMatters] = useState([])
  const [selectedMatter, setSelectedMatter] = useState(null)
  const [filteredMatterIds, setFilteredMatterIds] = useState(null)
  const [selectedProjectId, setSelectedProjectId] = useState()
  const [clientName, setClientName] = useState('')
  const [department, setDepartment] = useState('')
  const [matterName, setMatterName] = useState('')
  const [position, setPosition] = useState('')
  const [matterRef, setMatterRef] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [isSearching, setIsSearching] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [postError, setPostError] = useState(false)
  const template = useSelector(state => state.template.template)
  const highlightList = useSelector(state => state.template.highlightList)
  const role = useSelector(state => state.auth.data.auth)
  const projects = useSelector(state => state.projects)
  const isMatterCreator = role.roles.includes(USER_ROLES.ROLE_MATTER_CREATOR)
  const includeResources = useSelector(
    state => state.templateToProject.includeResources
  )
  const templateToProjectSettings = useSelector(
    state => state.templateToProject
  )
  const userData = useSelector(state => state.auth.data.details)

  const [screen, setScreen] = useState('LOADING')
  const screens = {
    LOADING: 'LOADING',
    MATTER_CHOICE: 'MATTER_CHOICE',
    WORKSTREAM_CHOICE: 'WORKSTREAM_CHOICE',
    NEW_MATTER: 'NEW_MATTER',
  }
  const [checkedIncludeResources, setCheckedIncludeResources] =
    useState(includeResources)

  if (!isMatterCreator && value === NEW_MATTER) {
    setValue(EXISTING_MATTER)
  }

  useEffect(() => {
    if (userData.organisationGroup.position === POSITIONS.CLIENT.name) {
      setPosition(0)
      setClientName(userData.organisationGroup.name)
    } else if (userData.organisationGroup.position === POSITIONS.ADVISOR.name) {
      setPosition(1)
    }
    //eslint-disable-next-line
  }, [])

  useEffect(() => {
    matterService.getMatters(true).then(res => {
      if (res.status === 200) {
        setMatters(res.body)
        setScreen(screens.MATTER_CHOICE)
      }
    })
  }, []) //eslint-disable-line

  let filteredMatters = filteredMatterIds
    ? matters.filter(matter => filteredMatterIds.includes(matter.id))
    : matters

  useEffect(() => {
    let projectPostCount = 0
    let taskPostCount = 0
    if (
      selectedMatterId &&
      selectedProjectId &&
      selectedProjectId !== 'new' &&
      templateToProjectSettings.includePosts
    ) {
      projectPostCount = projects.items.find(
        p => p.id === selectedProjectId
      )?.postCount

      if (
        props.useFullTemplate &&
        template.publishedPostCount + projectPostCount > CONFIG.POSTS_LIMIT
      ) {
      } else {
        props.selectedTemplateTasks.forEach(
          task =>
            (taskPostCount =
              taskPostCount + task.posts.filter(t => t.finalised).length)
        )
        if (taskPostCount + projectPostCount > CONFIG.POSTS_LIMIT) {
          setPostError(true)
        }
      }
    } else {
      setPostError(false)
    }
  }, [selectedMatterId, selectedProjectId]) //eslint-disable-line

  const setFilter = results => {
    setFilteredMatterIds(results)
  }

  const handleMatterChange = matter => {
    const selectedMatterId = matter
    setSelectedMatterId(selectedMatterId)
    setSelectedProjectId(undefined)
    props.clearErrorMessage()
    setShowLoadingBar(false)
    dispatch(fetchTeam(selectedMatterId))
    dispatch(fetchProjects({ id: selectedMatterId })).then(response => {
      if (response.projects.length === 1) {
        setSelectedProjectId(response.projects[0].id)
      }
    })
  }

  const handleIncludeResources = event => {
    setCheckedIncludeResources(!checkedIncludeResources)
    dispatch(
      templateToProject.updateIncludeResourcesOption(!checkedIncludeResources)
    )
  }

  const onClientName = e => setClientName(e.target.value)
  const onDepartmentChange = e => setDepartment(e.target.value)
  const onMatterChange = e => setMatterName(e.target.value)
  const onMatterRefChange = e => setMatterRef(e.target.value)

  const handleExtraAction = () => {
    if (props.useFullTemplate) {
      const selectedMatter = matters.find(m => m.id === selectedMatterId)
      let newProjectName = 'Workstream ' + (selectedMatter.numProjects + 1)
      projectService
        .createProjectFromTemplate(
          selectedMatterId,
          { name: newProjectName, isPrivate: false },
          template.id,
          true,
          true
        )
        .then(res => {
          if (res.status === 201) {
            props.cancelHandler()
            history(getOverviewUrl(selectedMatterId, res.body.id))
          }
        })
    } else {
      projectService
        .createProjectFromTemplateTask(
          selectedMatterId,
          { name: 'Workstream ' + (projects.items.length + 1) },
          highlightList[0].id,
          templateToProjectSettings.includePosts,
          templateToProjectSettings.includeDescriptions
        )
        .then(res => {
          if (res.status === 201) {
            props.cancelHandler()
            dispatch(completeCreateTaskFromTemplateTask())
            dispatch(reset())
            history(getOverviewUrl(selectedMatterId, res.body.id))
          }
        })
    }
  }

  const actionButtonHandler = () => {
    switch (screen) {
      case screens.MATTER_CHOICE:
        if (selectedMatterId === 'new') {
          setScreen(screens.NEW_MATTER)
        } else {
          const selectedMatter = matters.find(m => m.id === selectedMatterId)
          setSelectedMatter(selectedMatter)
          if (selectedMatter.numProjects > 1) {
            setScreen(screens.WORKSTREAM_CHOICE)
          } else {
            if (props.useFullTemplate) {
              taskService
                .createTasksFromTemplateProject(
                  selectedMatterId,
                  projects.items[0].id,
                  null,
                  template.id,
                  templateToProjectSettings.includePosts,
                  templateToProjectSettings.includeDescriptions
                )
                .then(res => {
                  if (res.status === 201) {
                    props.cancelHandler()

                    history(
                      getSingleWorkstreamTaskMapUrl(selectedMatterId) +
                        'id=' +
                        res.body[res.body.length - 1].id +
                        'h'
                    )
                  } else {
                    dispatch(
                      displaySnackbar(
                        'Something went wrong when creating your tasks'
                      )
                    )
                  }
                })
            } else {
              if (projects?.items[0]?.tasks.length > 0) {
                dispatch(enterSelectionMode())
                dispatch(
                  createTaskFromTemplateTask(
                    selectedMatterId,
                    projects.items[0].id,
                    templateToProjectSettings.includePosts,
                    templateToProjectSettings.includeDescriptions,
                    projects.items[0].tasks
                      ? projects.items[0].tasks.length
                      : null
                  )
                )
                dispatch(storeSelectedTasksFromTemplate(highlightList))
                history(getSingleWorkstreamTaskMapUrl(selectedMatterId))
                props.cancelHandler(true)
              } else {
                taskService
                  .createTaskFromTemplateTask(
                    selectedMatterId,
                    projects.items[0].id,
                    highlightList[0].id,
                    undefined,
                    templateToProjectSettings.includePosts,
                    templateToProjectSettings.includeDescriptions
                  )
                  .then(res => {
                    if (res.status === 201) {
                      dispatch(completeCreateTaskFromTemplateTask())
                      dispatch(reset())
                      history(
                        getSingleWorkstreamTaskMapUrl(selectedMatterId) +
                          'id=' +
                          res.body.id +
                          'h'
                      )
                    }
                  })
              }
            }
          }
        }
        break
      case screens.WORKSTREAM_CHOICE:
        const selectedMatter = matters.find(m => m.id === selectedMatterId)
        if (props.useFullTemplate) {
          if (selectedProjectId === 'new') {
            let newProjectName =
              'Workstream ' + (selectedMatter.numProjects + 1)
            projectService
              .createProjectFromTemplate(
                selectedMatterId,
                { name: newProjectName, isPrivate: false },
                template.id,
                templateToProjectSettings.includePosts,
                templateToProjectSettings.includeDescriptions
              )
              .then(res => {
                if (res.status === 201) {
                  props.cancelHandler()
                  history(getOverviewUrl(selectedMatterId, res.body.id))
                }
              })
          } else {
            taskService
              .createTasksFromTemplateProject(
                selectedMatterId,
                selectedProjectId,
                null,
                template.id,
                templateToProjectSettings.includePosts,
                templateToProjectSettings.includeDescriptions
              )
              .then(res => {
                if (res.status === 201) {
                  dispatch(
                    fetchProjectWithPostsAndTaskTeam(
                      selectedMatterId,
                      selectedProjectId
                    )
                  )
                  dispatch(
                    fetchTaskmapStructure(selectedMatterId, selectedProjectId)
                  )
                  props.cancelHandler()
                  if (selectedProjectId) {
                    history(
                      getTaskMapUrl(
                        res.body[res.body.length - 1].id,
                        selectedMatterId,
                        selectedProjectId
                      ) + 'h'
                    )
                  }
                } else {
                  dispatch(
                    displaySnackbar(
                      'Something went wrong when creating your tasks'
                    )
                  )
                }
              })
          }
        } else {
          if (selectedProjectId === 'new') {
            projectService
              .createProjectFromTemplateTask(
                selectedMatterId,
                { name: 'Workstream ' + (projects.items.length + 1) },
                highlightList[0].id,
                templateToProjectSettings.includePosts,
                templateToProjectSettings.includeDescriptions
              )
              .then(res => {
                if (res.status === 201) {
                  props.cancelHandler()
                  dispatch(completeCreateTaskFromTemplateTask())
                  dispatch(reset())
                  history(getOverviewUrl(selectedMatterId, res.body.id))
                }
              })
          } else {
            const selectedProject = projects.items.find(
              p => p.id === selectedProjectId
            )
            if (selectedProject.tasks.length > 0) {
              dispatch(enterSelectionMode())
              dispatch(
                createTaskFromTemplateTask(
                  selectedMatterId,
                  selectedProjectId,
                  templateToProjectSettings.includePosts,
                  templateToProjectSettings.includeDescriptions,
                  selectedProject.tasks ? selectedProject.tasks.length : null
                )
              )
              dispatch(storeSelectedTasksFromTemplate(highlightList))
              history(getTaskMapUrl(null, selectedMatterId, selectedProjectId))
              props.cancelHandler(true)
            } else {
              taskService
                .createTaskFromTemplateTask(
                  selectedMatterId,
                  selectedProjectId,
                  highlightList[0].id,
                  undefined,
                  templateToProjectSettings.includePosts,
                  templateToProjectSettings.includeDescriptions
                )
                .then(res => {
                  if (res.status === 201) {
                    dispatch(completeCreateTaskFromTemplateTask())
                    dispatch(reset())
                    history(
                      getTaskMapUrl(
                        res.body[res.body.length - 1].id,
                        selectedMatterId,
                        selectedProjectId
                      ) + 'h'
                    )
                    props.cancelHandler()
                  }
                })
            }
          }
        }
        break
      case screens.NEW_MATTER:
        props.createMatter(
          clientName,
          matterName,
          matterRef,
          true,
          position,
          department
        )
        break
      default:
        break
    }
  }

  const isCreateDisabled = () => {
    switch (screen) {
      case screens.MATTER_CHOICE:
        if (selectedMatterId) {
          if (selectedMatterId === 'new' || !props.useFullTemplate) {
            return false
          }
          if (projects.items.length === 1) {
            let levelACount = getLevelATaskCount(projects.items[0])
            let templateLevelACount = template.tasks.length
            if (props.useFullTemplate) {
              if (levelACount + templateLevelACount > 16) {
                return true
              } else {
                return false
              }
            } else {
              if (levelACount + 1 > 16) {
                return true
              } else {
                return false
              }
            }
          } else {
            return false
          }
        } else {
          return true
        }
      case screens.WORKSTREAM_CHOICE:
        if (selectedProjectId) {
          const selectedProject = projects.items.find(
            p => p.id === selectedProjectId
          )
          let levelACount = getLevelATaskCount(selectedProject)
          let templateLevelACount = template.tasks.length
          if (props.useFullTemplate) {
            if (levelACount + templateLevelACount > 16) {
              return true
            } else {
              return false
            }
          } else {
            if (levelACount + 1 > 16) {
              return true
            } else {
              return false
            }
          }
        } else {
          return true
        }
      case screens.NEW_MATTER:
        if (clientName !== '' && matterName !== '' && matterRef !== '') {
          return false
        } else {
          return true
        }
      case screens.LOADING:
        return true
      default:
        break
    }
    if (showLoadingBar) {
      return true
    }
  }

  const checkMatterTaskLimit = () => {
    if (selectedMatterId) {
      if (selectedMatterId === 'new') {
        return false
      }
      if (projects.items.length === 1) {
        let levelACount = getLevelATaskCount(projects.items[0])
        let templateLevelACount = template.tasks.length
        if (props.useFullTemplate) {
          if (levelACount + templateLevelACount > 16) {
            return true
          } else {
            return false
          }
        } else {
          if (levelACount + 1 > 16) {
            return true
          } else {
            return false
          }
        }
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const checkWorkstreamTaskLimit = () => {
    if (selectedProjectId) {
      const selectedProject = projects.items.find(
        p => p.id === selectedProjectId
      )
      let levelACount = getLevelATaskCount(selectedProject)
      let templateLevelACount = template.tasks.length
      if (props.useFullTemplate) {
        if (levelACount + templateLevelACount > 16) {
          return true
        } else {
          return false
        }
      } else {
        if (levelACount + 1 > 16) {
          return true
        } else {
          return false
        }
      }
    } else {
      return false
    }
  }

  const renderResourcesCheckbox = () => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            data-test="include-resources"
            color="primary"
            checked={checkedIncludeResources}
            onChange={handleIncludeResources}
          />
        }
        label={t('templates.includeResources')}
      ></FormControlLabel>
    )
  }

  const newMatterDetails = () => {
    return (
      <>
        <NewMatterDetailsDialog
          clientName={clientName}
          department={department}
          matterName={matterName}
          matterReferenceNumber={matterRef}
          onClientChange={onClientName}
          onDepartmentChange={onDepartmentChange}
          onMatterChange={onMatterChange}
          onMatterReferenceNumberChange={onMatterRefChange}
          position={position}
          setPosition={setPosition}
          userData={userData}
        />
        {/* <TextField
          className={classes.textEntryField}
          placeholder={t('matterDetails.placeholderClient')}
          data-test="matter-client-name"
          onChange={onClientName}
          value={clientName}
          slotProps={{
            htmlInput: projectNameInputProps,
          }}
        />
        <TextField
          className={classes.textEntryField}
          placeholder={t('matterDetails.placeholderMatter')}
          data-test="matter-name"
          onChange={onMatterChange}
          value={matterName}
          slotProps={{
            htmlInput: projectNameInputProps,
          }}
        />
        <TextField
          className={classes.textEntryField}
          placeholder={t('templates.matterRef')}
          data-test="matter-reference-number"
          onChange={onMatterRefChange}
          value={matterRef}
          slotProps={{
            htmlInput: matterRefInputProps,
          }}
        />
        <Typography className={classes.subtitle} variant="caption">
          {t('matterDetails.guidancePlaceholderMatterReferenceNumber')}
        </Typography> */}
        {renderResourcesCheckbox()}
      </>
    )
  }

  const handleScroll = e => {
    const scrollTop = e.target.scrollTop
    if (scrollTop > 0 && !isScrolling) {
      setIsScrolling(true)
    } else if (scrollTop === 0 && isScrolling) {
      setIsScrolling(false)
    }
  }

  const getProgressText = () => {
    switch (props.progress) {
      case 0:
        return t('templates.loading1')
      case 25:
        return t('templates.loading2')
      case 55:
        return t('templates.loading3')
      case 100:
        return t('templates.loading4')
      default:
        return t('templates.loading3')
    }
  }

  const getTitle = () => {
    if (screen === screens.LOADING) {
      return t('templates.dialogPart2LoadingTitle')
    } else if (screen === screens.NEW_MATTER) {
      return t('templates.newMatterTitle')
    } else {
      return props.titleText
    }
  }

  const getScreen = () => {
    switch (screen) {
      case screens.LOADING:
        return <LoadingScreen />
      case screens.MATTER_CHOICE:
        return (
          <div>
            {isMatterCreator && (
              <div
                className={classes.matterItemContainer}
                style={
                  selectedMatterId === 'new'
                    ? {
                        backgroundColor:
                          juralioColours.matterSwitcher.workstreamChip.hover,
                      }
                    : {}
                }
                onClick={() => {
                  setSelectedMatterId('new')
                }}
                data-test="new-matter-button"
              >
                <div className={classes.matterItemTextWrapper}>
                  <Typography
                    style={{
                      color: rawColours.primary.primary.main,
                      marginRight: 'auto',
                      marginLeft: '2px',
                    }}
                    className={classes.clientName}
                    data-test="matter-item-client-name"
                    variant="body2"
                  >
                    {'Client name'}
                  </Typography>
                  <Typography
                    style={{ color: rawColours.primary.primary.main }}
                    className={classes.matterName}
                    data-test="matter-item-matter-name"
                    variant="subtitle2"
                  >
                    {'Matter name'}
                  </Typography>
                </div>
                <div
                  style={{
                    marginRight: 8,
                    marginLeft: 'auto',
                    color: rawColours.primary.primary.main,
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      marginTop: 'auto',
                      marginBottom: 'auto',
                      scale: '0.75',
                    }}
                  >
                    <AddMattersIcon />
                  </div>

                  <div style={{ marginTop: '7px', marginBottom: 'auto' }}>
                    <Typography variant="h6">{'New Matter'}</Typography>
                  </div>
                </div>
              </div>
            )}

            <MatterSwitcherFilter
              setFilter={setFilter}
              setIsSearching={setIsSearching}
              matters={matters}
            />
            <div
              style={
                checkMatterTaskLimit() && props.useFullTemplate
                  ? { width: '100%', height: '220px' }
                  : { width: '100%', height: '270px' }
              }
            >
              <MattersList
                showClosed={false}
                isLoaded={matters.length > 0 ? true : false}
                matters={filteredMatters}
                onClick={handleMatterChange}
                onScroll={handleScroll}
                selectedMatterId={selectedMatterId}
                handleClose={props.handleClickAway}
                setSelectedMatterToTop={() => {}}
                searchInProgress={isSearching}
                isLazyLoading={false}
              />
            </div>
            {postError && (
              <ErrorBox
                error={t('postArchive.restoreDialog.maxPosts')}
                padding={true}
              />
            )}
            {checkMatterTaskLimit() && props.useFullTemplate && (
              <div>
                <Typography color={'error'}>
                  {t('commonValidationMessages.levelATaskLimit', {
                    limit: CONFIG.LEVEL_A_TASK_LIMIT,
                  })}
                </Typography>
              </div>
            )}
          </div>
        )
      case screens.WORKSTREAM_CHOICE:
        return (
          <>
            {projects.meta.isLoaded && (
              <div>
                <WorkstreamList
                  matter={selectedMatter}
                  projects={projects.items}
                  selectProject={setSelectedProjectId}
                  selectedProject={selectedProjectId}
                />
              </div>
            )}
            {postError && (
              <ErrorBox
                error={t('postArchive.restoreDialog.maxPosts')}
                padding={true}
              />
            )}
            {checkWorkstreamTaskLimit() && (
              <div>
                <Typography color={'error'}>
                  {t('commonValidationMessages.levelATaskLimit', {
                    limit: CONFIG.LEVEL_A_TASK_LIMIT,
                  })}
                </Typography>
              </div>
            )}
          </>
        )
      case screens.NEW_MATTER:
        return newMatterDetails()
      default:
        break
    }
  }

  const getActionLabel = () => {
    switch (screen) {
      case screens.LOADING:
        return null
      case screens.MATTER_CHOICE:
        if (projects.items.length > 1 || selectedMatterId === 'new') {
          return t('common.next')
        } else {
          return t('common.add')
        }
      case screens.WORKSTREAM_CHOICE:
        return t('common.add')
      case screens.NEW_MATTER:
        return t('common.create')
      default:
        break
    }
  }
  const getCancelButtonText = () => {
    switch (screen) {
      case screens.LOADING:
        return null
      case screens.MATTER_CHOICE:
        return t('common.cancel')
      case screens.WORKSTREAM_CHOICE:
        return t('common.back')
      case screens.NEW_MATTER:
        return t('common.back')
      default:
        return t('common.cancel')
    }
  }

  const handleCancelClick = () => {
    switch (screen) {
      case screens.LOADING:
        break
      case screens.MATTER_CHOICE:
        props.cancelHandler()
        break
      case screens.WORKSTREAM_CHOICE:
        setScreen(screens.MATTER_CHOICE)
        setSelectedMatterId(null)
        break
      case screens.NEW_MATTER:
        setScreen(screens.MATTER_CHOICE)
        setSelectedMatterId(null)
        break
      default:
        props.cancelHandler()
        break
    }
  }

  const checkSelectedMatterAdmin = () => {
    if (selectedMatterId) {
      const selectedMatter = matters.find(m => m.id === selectedMatterId)
      return selectedMatter.activities.includes('MATTER_ADMIN')
    } else {
      return false
    }
  }

  return (
    <JuralioDialog
      data-test="create-project-from-template-dialog"
      open={true}
      onClose={props.cancelHandler}
      fullScreen={props.fullScreen}
      titleText={getTitle()}
      titleIcon={props.titleIcon}
      handleAction={actionButtonHandler}
      showExtraAction={
        checkMatterTaskLimit() &&
        checkSelectedMatterAdmin() &&
        props.useFullTemplate
      }
      handleExtraAction={() => {
        handleExtraAction()
      }}
      handleCancel={handleCancelClick}
      cancelText={getCancelButtonText()}
      actionLabel={getActionLabel()}
      extraActionLabel={'create new workstream'}
      disabled={isCreateDisabled() || postError}
      usageContext="ProjectFromTemplateDialog"
      showLoadingBar={showLoadingBar || screen === screens.LOADING}
      loadingText={
        screen === screens.LOADING
          ? t('templates.dialogPart2Loading')
          : props.progress
            ? getProgressText()
            : t('templates.loadingText')
      }
      largeSize={false}
      progress={props.progress}
      disableSingleClickAction={true}
    >
      <DialogContent>
        {getScreen()}
        {showLoadingBar && <LoadingScreen />}
      </DialogContent>
    </JuralioDialog>
  )
}

CreateProjectFromTemplateDialog.propTypes = {
  /** fullScreen */
  fullScreen: PropTypes.bool.isRequired,
  /** titleText */
  titleText: PropTypes.string.isRequired,
  /** titleIcon */
  titleIcon: PropTypes.object.isRequired,
  /** createHandler */
  createHandler: PropTypes.func.isRequired,
  /** cancelHandler */
  cancelHandler: PropTypes.func.isRequired,
  /** errorMessage */
  errorMessage: PropTypes.string,
}

export default CreateProjectFromTemplateDialog
