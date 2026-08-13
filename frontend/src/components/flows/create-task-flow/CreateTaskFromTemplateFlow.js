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
  Link,
  List,
  ListItem,
  Radio,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import {
  OpenInNewIcon,
  TaskIcon,
  WorkstreamIcon,
} from '../../../theme/navigation/CommonIcons'
import ErrorBox from '../../data-display/error-box/ErrorBox'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import juralioColours from '../../../theme/juralio-colours'
import TemplateCard from '../../../app/template-list/template-card/TemplateCard'
import { MATTER_CREATION } from '../../../app/matter-create/matter-dialog-helper'
import TemplateFilterButton from '../../../app/template-list/TemplateFilterButton'
import { CONFIG, USER_ROLES } from '../../../app/constants'
import SearchFilter from '../../../app/template-list/SearchFilter'
import LoadingScreen from '../../loading-screen/LoadingScreen'
import { makeStyles } from 'tss-react/mui'
import { fetchTemplates } from '../../../app/template-list/template-list-actions'
import UseFullSvg from '../../../assets/images/template-creation-helper1.svg'
import UsePartialsvg from '../../../assets/images/template-creation-helper2.svg'
import taskService from '../../../services/task/task-service'
import templateService from '../../../services/template/template-service'
import { enterSelectionMode } from '../../../app/template/template-actions'
import {
  getOverviewUrl,
  getSingleWorkstreamTaskMapUrl,
  getTaskMapUrl,
  getTemplateTaskMapUrl,
} from '../../navigation/common/location-context-helper'
import { useLocation, useNavigate } from 'react-router'
import {
  createTaskFromTemplateTask,
  fetchTaskmapStructure,
} from '../../../redux/ducks/improved-taskmap'
import { fetchProjectWithPostsAndTaskTeam } from '../../../app/project/project-actions'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import WorkstreamList from '../../navigation/global-header/matter-switcher/WorkstreamList'
import projectService from '../../../services/project/project-service'

const useStyles = makeStyles()(theme => ({
  dialogContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  list: {
    backgroundColor: juralioColours.offWhite.b,
  },
  content: {
    height: theme.spacing(38),
    overflowY: 'scroll',
  },
  link: {
    cursor: 'pointer',
    paddingRight: '8px',
    paddingLeft: '280px',
    paddingBottom: '2px',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  optionContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  radioButton: {
    alignSelf: 'center',
  },
  templateImage: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    cursor: 'pointer',
  },
  caption: {
    alignSelf: 'center',
    textAlign: 'center',
    maxWidth: theme.spacing(18),
    color: juralioColours.darkText.secondary,
  },
  postsCheckboxPanel: {
    zIndex: 10,
    left: theme.spacing(8.75),
    display: 'flex',
    flexDirection: 'column',
  },
}))

const CreateTaskFromTemplateFlow = props => {
  const history = useNavigate()
  const location = useLocation()
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const templates = useSelector(state => state.templates)
  const projectNum = useSelector(
    state => state.matterDetails?.matter?.numProjects
  )
  const [postError, setPostError] = useState(false)
  const [highlightedTemplate, setHighlightedTemplate] = useState(undefined)
  const [filterString, setFilterString] = useState('')
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState(0)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const templateTypeEnum = {
    0: t('templates.filter.all'),
    1: t('templates.filter.organisation'),
    2: t('templates.filter.community'),
  }
  const screens = {
    WORKSTREAM_CHOICE: 'WORKSTREAM_CHOICE',
    TEMPLATE_CHOICE: 'TEMPLATE_CHOICE',
    DEFAULT_LOADING_SCREEN: 'DEFAULT_LOADING_SCREEN',
    TEMPLATE_FLOW_TYPE: 'TEMPLATE_FLOW_TYPE',
  }
  const [screen, setScreen] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const handleUseTemplate = () => {
    templateService.getTemplate(highlightedTemplate.id).then(res => {
      props.setSelectedTemplate(res.body)
      props.showSelectTemplate(false)
      setScreen(screens.TEMPLATE_FLOW_TYPE)
      return
    })
  }

  const includePosts = useSelector(
    state => state.templateToProject.includePosts
  )
  const includeDescriptions = useSelector(
    state => state.templateToProject.includeDescriptions
  )

  const [checkedIncludePosts, setCheckedIncludePosts] = useState(true)
  const [useFullPartial, setUseFullPartial] = useState(true)
  const [checkedIncludeDescriptions, setCheckedIncludeDescriptions] =
    useState(true)
  const [isInWorkstream, setIsInWorkstream] = useState(false)

  const handleIncludePostsChange = event => {
    setCheckedIncludePosts(!checkedIncludePosts)
  }

  const handleIncludeDescriptionsChange = event => {
    setCheckedIncludeDescriptions(!checkedIncludeDescriptions)
  }

  useEffect(() => {
    if (
      useFullPartial &&
      checkedIncludePosts &&
      props.selectedTemplate &&
      props.project
    ) {
      const t = templates.templates?.find(
        t => t.id === props.selectedTemplate.id
      )
      if (t.publishedPostCount + props.project.postCount > CONFIG.POSTS_LIMIT) {
        setPostError(true)
      } else {
        setPostError(false)
      }
    }
    if (!checkedIncludePosts || !useFullPartial) {
      setPostError(false)
    }
  }, [
    props.selectedTemplate,
    props.project,
    checkedIncludePosts,
    useFullPartial,
    templates,
  ])

  const isInFilterList = template => {
    switch (parseInt(selectedTemplateFilter)) {
      case 0:
        return true
      case 1:
        return !template.isSystemTemplate
      case 2:
        return template.isSystemTemplate
      default:
        return true
    }
  }

  const handleCreateFromTemplate = () => {
    if (useFullPartial) {
      setShowLoadingBar(true)
      if (selectedProjectId === 'new') {
        let newProjectName = 'Workstream ' + (props.matter.projects.length + 1)
        projectService
          .createProjectFromTemplate(
            props.matterId,
            { name: newProjectName, isPrivate: false },
            props.selectedTemplate.id,
            includePosts,
            includeDescriptions
          )
          .then(res => {
            if (res.status === 201) {
              props.cancelHandler()
              history(getOverviewUrl(props.matterId, res.body.id))
            }
          })
      } else {
        taskService
          .createTasksFromTemplateProject(
            props.matterId,
            props.project.id,
            null,
            props.selectedTemplate.id,
            includePosts,
            includeDescriptions
          )
          .then(res => {
            if (res.status === 201) {
              dispatch(
                fetchProjectWithPostsAndTaskTeam(
                  props.matterId,
                  props.project.id
                )
              )
              dispatch(fetchTaskmapStructure(props.matterId, props.project.id))
              props.cancelHandler()
              if (props.project.id) {
                history(
                  getTaskMapUrl(
                    res.body[res.body.length - 1].id,
                    props.matterId,
                    props.project.id
                  ) + 'h'
                )
              } else {
                history(
                  getSingleWorkstreamTaskMapUrl(props.matterId) +
                    '?id=' +
                    res.body[res.body.length - 1].id +
                    'h'
                )
              }
            } else {
              dispatch(
                displaySnackbar('Something went wrong when creating your tasks')
              )
              setScreen(screens.TEMPLATE_FLOW_TYPE)
            }
          })
      }
    } else {
      dispatch(enterSelectionMode())
      dispatch(
        createTaskFromTemplateTask(
          props.matterId,
          selectedProjectId ? selectedProjectId : props.project.id,
          includeDescriptions,
          includePosts,
          props.project.tasks ? props.project.tasks.length : null
        )
      )
      history(getTemplateTaskMapUrl(props.selectedTemplate.id))
      props.cancelHandler()
    }
  }

  const filterTemplateBySearchString = template => {
    return (
      template.name.toLowerCase().includes(filterString.toLowerCase()) ||
      (template.providedBy &&
        template.providedBy
          .toLowerCase()
          .includes(filterString.toLowerCase())) ||
      (template.urlTags &&
        template.urlTags
          .map(t => t.toLowerCase())
          .includes(filterString.toLowerCase()))
    )
  }

  const openTemplateGalleryNewTab = () => {
    const temp = window.location.href.split('/#/')
    const url = temp.at(0) + '/#/templates'
    window.open(url, '_blank').focus()
  }

  const templateList = templates.templates
    ?.filter(
      template =>
        template.published &&
        isInFilterList(template) &&
        filterTemplateBySearchString(template)
    )
    .map(template => (
      <ListItem key={template.id}>
        <TemplateCard
          template={template}
          disableFavouriting={true}
          showFavourite={template.isFavourited}
          clickHandler={() => setHighlightedTemplate(template)}
          isFavourited={template.isFavourited}
          isHighlighted={highlightedTemplate?.id === template.id}
          listContext={true}
          useFullWidth={true}
        />
      </ListItem>
    ))

  useEffect(() => {
    if (
      window.location.href.includes('/workstream/') &&
      window.location.href.includes('/matter/') &&
      (props.project.isLoaded || props.project.workstreamOverview) &&
      projectNum > 1
    ) {
      setIsInWorkstream(true)
      setScreen(screens.TEMPLATE_CHOICE)
    } else {
      if (projectNum === 1) {
        setIsInWorkstream(true)
        setScreen(screens.TEMPLATE_CHOICE)
      } else {
        setIsInWorkstream(false)
      }
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    dispatch(fetchTemplates())
  }, []) //eslint-disable-line

  const isActionDisabled = () => {
    switch (screen) {
      case screens.WORKSTREAM_CHOICE:
        return selectedProjectId ? false : true
      case screens.TEMPLATE_CHOICE:
        return highlightedTemplate ? false : true
      case screens.TEMPLATE_FLOW_TYPE:
        if (selectedProjectId !== 'new') {
          if (props.selectedTemplate.levelATasks) {
            if (
              props.project.tasks.length +
                props.selectedTemplate.levelATasks.length >
                16 &&
              useFullPartial
            ) {
              return true
            } else {
              return false
            }
          } else {
            if (
              props.project.tasks.length +
                props.selectedTemplate.levelATaskCount >
                16 &&
              useFullPartial
            ) {
              return true
            } else {
              return false
            }
          }
        } else {
          return false
        }

      default:
        return false
    }
  }
  const getTitle = () => {
    switch (screen) {
      case screens.WORKSTREAM_CHOICE:
        return 'Choose a workstream'
      case screens.TEMPLATE_CHOICE:
        return 'Choose a template'
      case screens.TEMPLATE_FLOW_TYPE:
        return 'Whole or part of template?'
      default:
        return 'Create task from template'
    }
  }
  const handleCancelAction = () => {
    switch (screen) {
      case screens.WORKSTREAM_CHOICE:
        props.cancelHandler()
        break
      case screens.TEMPLATE_CHOICE:
        if (isInWorkstream) {
          props.cancelHandler()
        } else {
          setSelectedProjectId(null)
          setScreen(screens.WORKSTREAM_CHOICE)
        }
        break
      case screens.TEMPLATE_FLOW_TYPE:
        props.setSelectedTemplate(null)
        setScreen(screens.TEMPLATE_CHOICE)
        break
      default:
        props.cancelHandler()
    }
  }

  const handleConfirmAction = screen => {
    switch (screen) {
      case screens.WORKSTREAM_CHOICE:
        if (selectedProjectId !== 'new') {
          dispatch(
            fetchProjectWithPostsAndTaskTeam(props.matter.id, selectedProjectId)
          )
        }
        setScreen(screens.TEMPLATE_CHOICE)
        break
      case screens.MATTER_TYPE:
        setScreen(MATTER_CREATION.WORKFLOW_TYPE)
        break
      case screens.TEMPLATE_CHOICE:
        handleUseTemplate()
        break
      case screens.TEMPLATE_FLOW_TYPE:
        handleCreateFromTemplate()
        setScreen(MATTER_CREATION.DEFAULT_LOADING_SCREEN)
        break
      default:
        setScreen(screen + 1)
    }
  }
  const getConfirmButtonText = () => {
    switch (screen) {
      case screens.TEMPLATE_CHOICE:
        return t('common.next')
      case screens.TEMPLATE_FLOW_TYPE:
        if (useFullPartial) {
          return t('common.add')
        } else {
          return t('common.next')
        }

      default:
        return t('common.next')
    }
  }
  const getCancelButtonText = () => {
    switch (screen) {
      case screens.TEMPLATE_CHOICE:
        if (isInWorkstream) {
          return 'cancel'
        } else {
          return 'back'
        }
      case screens.TEMPLATE_FLOW_TYPE:
        return 'back'
      default:
        return 'cancel'
    }
  }

  const getErrorText = () => {
    switch (screen) {
      case screens.TEMPLATE_CHOICE:
        return false
      case screens.TEMPLATE_FLOW_TYPE:
        if (props.selectedTemplate.levelATasks) {
          if (selectedProjectId !== 'new') {
            if (
              props.project.tasks.length +
                props.selectedTemplate.levelATasks.length >
                16 &&
              useFullPartial
            ) {
              return 'Whole template will be above level A limit'
            } else {
              return false
            }
          } else {
            return false
          }
        } else {
          if (selectedProjectId !== 'new') {
            if (
              props.project.tasks.length +
                props.selectedTemplate.levelATaskCount >
                16 &&
              useFullPartial
            ) {
              return 'Whole template will be above level A limit'
            } else {
              return false
            }
          } else {
            return false
          }
        }
      default:
        return false
    }
  }

  const handleExtraAction = () => {
    setShowLoadingBar(true)
    let newProjectName = 'Workstream ' + (props.matter.projects.length + 1)
    projectService
      .createProjectFromTemplate(
        props.matterId,
        { name: newProjectName, isPrivate: false },
        props.selectedTemplate.id,
        includePosts,
        includeDescriptions
      )
      .then(res => {
        if (res.status === 201) {
          props.cancelHandler()
          history(getOverviewUrl(props.matterId, res.body.id))
        }
      })
  }

  const getScreen = () => {
    if (templateList && screen === '') {
      if (isInWorkstream) {
        setScreen(MATTER_CREATION.TEMPLATE_CHOICE)
      } else {
        setScreen(screens.WORKSTREAM_CHOICE)
      }
    } else if (screen === '') {
      setScreen(MATTER_CREATION.DEFAULT_LOADING_SCREEN)
    }

    switch (screen) {
      case screens.WORKSTREAM_CHOICE:
        return (
          <>
            <WorkstreamList
              matter={props.matter}
              projects={props.matter.projects.filter(
                workstream =>
                  (workstream.active && !workstream.isPrivate) ||
                  (workstream.active &&
                    workstream.isPrivate &&
                    workstream.isPrivateMember)
              )}
              selectProject={setSelectedProjectId}
              selectedProject={selectedProjectId}
            />
          </>
        )
      case screens.TEMPLATE_CHOICE:
        return (
          <>
            <div style={{ margin: '8px' }}>
              <TemplateFilterButton
                templatesEnum={templateTypeEnum}
                selectedTemplateFilter={selectedTemplateFilter}
                setSelectedTemplateFilter={setSelectedTemplateFilter}
                isKnowledgeManager={userRoles.includes(
                  USER_ROLES.ROLE_KNOWLEDGE_MANAGER
                )}
              />
              <SearchFilter
                filterString={filterString}
                setFilterString={setFilterString}
                helperText={t('templates.filter.findATemplate')}
              />
            </div>
            <div className={classes.goToTemplateLink}>
              <Link
                className={classes.link}
                onClick={() => {
                  openTemplateGalleryNewTab()
                }}
              >
                <div style={{ display: '-webkit-inline-flex' }}>
                  <Typography>{t('templateOverview.goToTemplates')}</Typography>
                  <OpenInNewIcon
                    style={{
                      width: '10%',
                      height: 'auto',
                    }}
                  />
                </div>
              </Link>
            </div>
            <div className={classes.content}>
              <List className={classes.list}>{templateList}</List>
            </div>
          </>
        )
      case screens.TEMPLATE_FLOW_TYPE:
        return (
          <>
            <DialogContent className={classes.dialogContent}>
              <div className={classes.optionContainer}>
                <Typography
                  variant="body1"
                  data-test="use-full-template-heading"
                  className={classes.caption}
                >
                  {t('templates.useEntireTemplate')}
                </Typography>

                <img
                  src={UseFullSvg}
                  alt={t('templates.fullTemplateAlt')}
                  className={classes.templateImage}
                  onClick={() => {
                    setUseFullPartial(true)
                  }}
                />
                <Radio
                  className={classes.radioButton}
                  checked={useFullPartial}
                  onChange={() => setUseFullPartial(true)}
                  value="full"
                  name="radio-button-full"
                  data-test="use-full-template-radio"
                />
              </div>
              <div className={classes.optionContainer}>
                <Typography
                  variant="body1"
                  data-test="use-partial-template-heading"
                  className={classes.caption}
                >
                  {t('templates.usePartialTemplate')}
                </Typography>

                <img
                  src={UsePartialsvg}
                  alt={t('templates.partialTemplateAlt')}
                  className={classes.templateImage}
                  onClick={() => {
                    setUseFullPartial(false)
                  }}
                />
                <Radio
                  className={classes.radioButton}
                  checked={!useFullPartial}
                  onChange={() => setUseFullPartial(false)}
                  value="partial"
                  name="radio-button-partial"
                  data-test="use-partial-template-radio"
                />
              </div>
            </DialogContent>

            <div className={classes.postsCheckboxPanel}>
              <FormControlLabel
                control={
                  <Checkbox
                    data-test="include-descriptions"
                    color="primary"
                    checked={checkedIncludeDescriptions}
                    onChange={handleIncludeDescriptionsChange}
                  />
                }
                label={t('templates.includeDescriptions')}
              ></FormControlLabel>
              <div className={classes.row}>
                <FormControlLabel
                  control={
                    <Checkbox
                      data-test="include-posts"
                      color="primary"
                      checked={checkedIncludePosts}
                      onChange={handleIncludePostsChange}
                    />
                  }
                  label={t('templates.includePosts')}
                ></FormControlLabel>
              </div>
            </div>
          </>
        )
      case screens.DEFAULT_LOADING_SCREEN:
        return <LoadingScreen />
      default:
        return <LoadingScreen />
    }
  }

  return (
    <JuralioDialog
      disabled={isActionDisabled() || postError}
      disabeldExtra={false}
      showExtraAction={
        isActionDisabled() && screen === screens.TEMPLATE_FLOW_TYPE
      }
      open={true}
      titleText={getTitle(t, classes, screen)}
      titleIcon={screens.WORKSTREAM_CHOICE ? WorkstreamIcon : TaskIcon}
      handleCancel={handleCancelAction}
      onClose={props.closeHandler}
      fullScreen={isMobileView}
      handleAction={() => {
        handleConfirmAction(screen)
      }}
      handleExtraAction={() => {
        handleExtraAction()
      }}
      actionLabel={getConfirmButtonText(t, screen)}
      extraActionLabel={'create new workstream'}
      cancelText={getCancelButtonText(t, screen, props, templateList)}
      showLoadingBar={showLoadingBar}
      loadingText={t('taskActions.tasksCreating')}
      context={getTitle(t, classes, screen)}
      hideAction={screen === MATTER_CREATION.DEFAULT_LOADING_SCREEN}
      hideCancel={screen === MATTER_CREATION.DEFAULT_LOADING_SCREEN}
      progress={props.progress}
      disableSingleClickAction={true}
    >
      <DialogContent data-test="dialog-content">
        {getScreen()}
        {postError && (
          <ErrorBox
            error={t('postArchive.restoreDialog.maxPostsExceeded')}
            padding={true}
          />
        )}

        <Typography color="error">{getErrorText()}</Typography>
      </DialogContent>
    </JuralioDialog>
  )
}
export default CreateTaskFromTemplateFlow
