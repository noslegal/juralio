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
import ErrorIcon from '@mui/icons-material/Error'
import {
  Card,
  CardContent,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import CreateProjectButtons from '../../../../components/flows/create-project-flow/CreateProjectButtons'
import CreateWorkstreamFromWorkstreamFlowContainer from '../../../../components/flows/use-workstream-flow/CreateWorkstreamFromWorkstreamFlowContainer'
import { getMatterIdFromLocation } from '../../../../components/navigation/common/location-context-helper'
import { addMember } from '../../../../redux/ducks/private-workstream-team'
import { checkTextHasNonWhitespaceContent } from '../../../../services/helpers/text/text-util-helper'
import { canInteractWithPrivateWorkstream } from '../../../../services/helpers/user/user-helper'
import juralioColours from '../../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'
import {
  MattersIcon,
  WorkstreamIcon,
} from '../../../../theme/navigation/CommonIcons'
import {
  MAX_FIELD_LENGTHS,
  USER_ROLES,
  WORKSTREAM_TYPE,
} from '../../../constants'
import TemplateCard from '../../../template-list/template-card/TemplateCard'
import { fetchTemplates } from '../../../template-list/template-list-actions'
import TemplateFilterButton from '../../../template-list/TemplateFilterButton'
import SearchFilter from '../../../template-list/SearchFilter'
import {
  createProject,
  createProjectFromTemplate,
  //fetchProjectWithTasks,
  fetchProjects,
  updateProject,
} from '../projects-actions'
import CreatePrivateWorkstreamContainer from './CreatePrivateWorkstreamContainer'

const useStyles = makeStyles()(theme => ({
  content: {
    height: theme.spacing(40),
    overflowY: 'scroll',
  },
  list: {
    backgroundColor: juralioColours.offWhite.b,
  },
  ProjectCard: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    '&:hover': {
      backgroundColor: `${juralioColours.hover.hover}`,
    },
    textAlign: 'center',
    cursor: 'pointer',
  },
  cardSelected: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    backgroundColor: `${juralioColours.hover.hover}`,
    textAlign: 'center',
    cursor: 'pointer',
  },
  disabledTemplateProjectCard: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    textAlign: 'center',
  },
  Textbox: {
    width: '95%',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  dialogHeaderTitle: {
    paddingLeft: theme.spacing(1),
  },
  error: {
    color: juralioColours.error,
  },
  errorMessage: {
    display: 'flex',
  },
  errorIcon: {
    paddingRight: theme.spacing(1),
    color: juralioColours.error,
  },
  disabled: {
    color: JuralioNamedColours.grey[200],
    backgroundColor: JuralioNamedColours.grey[100],
  },
  disabledText: {
    color: juralioColours.darkText.secondary,
    textAlign: 'center',
  },
  workstreamNameInput: {
    width: '100%',
  },
  workstreamButtons: {
    marginTop: theme.spacing(2),
  },
  originalWorkStreamContainer: {
    marginTop: 0,
  },
  dialogContent: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
  },
  card: {
    paddingTop: '0 !important',
  },
  cardContent: {
    '&:last-child': {
      paddingBottom: `${theme.spacing(1)} !important`,
    },
  },
  title: {
    color: juralioColours.darkText.primary,
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
  },
  projectSelectDiv: {
    width: '95%',
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}))

const CreateWorkstreamAdminDialog = props => {
  const theme = useTheme()
  const history = useNavigate()
  const location = useLocation()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const templates = useSelector(state => state.templates.templates)
  const workstreams = useSelector(state => state.projects.items)
  const currentUser = useSelector(state => state.auth.data.details)

  const [workstreamType, setWorkstreamType] = useState('')
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(undefined)
  const [highlightedTemplate, setHighlightedTemplate] = useState(undefined)
  const [showSelectTemplate, setShowSelectTemplate] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [originalWorkstreamName, setOriginalWorkstreamName] = useState(
    t('common.workstream') + ' 1'
  )
  const [showSplitOriginalWorkstreamFlow, setShowSplitOriginalWorkstreamFlow] =
    useState(false)
  const [newWorkstreamName, setNewWorkstreamName] = useState(
    t('common.workstream') + ' ' + (workstreams.length + 1)
  )
  const [originalWorkstreamNameError, setOriginalWorkstreamNameError] =
    useState('')
  const [newWorkstreamNameError, setNewWorkstreamNameError] = useState('')
  const [showSplit, setShowSplit] = useState(false)
  const [makePrivate, setMakePrivate] = useState(false)
  const [privateWorkstreamUsers, setPrivateWorkstreamUsers] = useState([])
  const [filterString, setFilterString] = useState('')
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState(0)
  const [selectedSplitWorkstream, setSelectedSplitWorkstream] = useState()

  const templateTypeEnum = {
    0: t('templates.filter.all'),
    1: t('templates.filter.organisation'),
    2: t('templates.filter.community'),
  }

  const [availableWorkstreams, setAvailableworkstreams] = useState([])

  useEffect(() => {
    setAvailableworkstreams(
      workstreams.filter(workstream => {
        let taskCount = 0
        if (workstream.tasks?.body) {
          taskCount = workstream.tasks.body.length
        } else if (workstream.taskCounts != null) {
          taskCount = Object.values(workstream.taskCounts).reduce(
            (a, b) => a + b,
            0
          )
        }
        return (
          canInteractWithPrivateWorkstream(currentUser, workstream) &&
          taskCount > 0
        )
      })
    )
  }, [workstreams]) //eslint-disable-line

  const handleUseTemplate = () => {
    setSelectedTemplate(highlightedTemplate)
    setNewWorkstreamName(highlightedTemplate.name)
    setShowSelectTemplate(false)
  }
  const resetTemplateSettings = () => {
    setSelectedTemplate(undefined)
    setHighlightedTemplate(undefined)
  }

  const workstreamBlank = () => {
    setSelectedSplitWorkstream()
    setWorkstreamType(WORKSTREAM_TYPE.BLANK)
    resetTemplateSettings()
    setNameError(false)
  }

  const workstreamTemplate = () => {
    setSelectedSplitWorkstream()
    setWorkstreamType(WORKSTREAM_TYPE.FROM_TEMPLATE)
    setShowSelectTemplate(true)
    setNameError(false)
  }

  const goBack = () => {
    resetTemplateSettings()
    setWorkstreamType('')
    setShowSelectTemplate(false)
    setNameError(false)
  }

  const workstreamSplit = () => {
    setWorkstreamType(WORKSTREAM_TYPE.SPLIT)
    setNameError(false)
  }

  useEffect(() => {
    setShowSplit(availableWorkstreams.length > 0)
  }, [workstreams]) //eslint-disable-line

  useEffect(() => {
    dispatch(fetchTemplates())
    //dispatch(fetchProjectWithTasks(getMatterIdFromLocation(location))
    dispatch(
      fetchProjects(getMatterIdFromLocation(location), false, false, true)
    )
  }, [dispatch]) //eslint-disable-line

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

  const list = templates
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
          clickHandler={() => setHighlightedTemplate(template)}
          isFavourited={template.isFavourited}
          disableFavouriting={true}
          showFavourite={template.isFavourited}
          isHighlighted={highlightedTemplate?.id === template.id}
          useFullWidth={true}
        />
      </ListItem>
    ))

  const openTemplateGalleryNewTab = () => {
    const temp = window.location.href.split('/#/')
    const url = temp.at(0) + '/#/templates'
    window.open(url, '_blank').focus()
  }

  const cancelHandler = () => {
    setShowSplitOriginalWorkstreamFlow(false)
  }

  const areFieldsFilledIn = () =>
    originalWorkstreamName &&
    checkTextHasNonWhitespaceContent(originalWorkstreamName) &&
    newWorkstreamName &&
    checkTextHasNonWhitespaceContent(newWorkstreamName)

  const validateInput = value => {
    return value.lengh !== 0
  }

  const shouldBeDisabled =
    newWorkstreamNameError ||
    originalWorkstreamNameError ||
    !areFieldsFilledIn() ||
    workstreamType?.length === 0 ||
    (workstreamType === WORKSTREAM_TYPE.SPLIT && !selectedSplitWorkstream)

  const renameWorkstream = () =>
    dispatch(
      updateProject(getMatterIdFromLocation(location), workstreams[0].id, {
        name: originalWorkstreamName,
      })
    )

  const handleAction = () => {
    const workstreamNameList = workstreams.map(workstream => {
      return workstream.name
    })
    if (workstreamNameList.includes(newWorkstreamName)) {
      setNameError(true)
      return
    }
    setShowLoadingBar(true)
    if (selectedTemplate && workstreamType === WORKSTREAM_TYPE.FROM_TEMPLATE) {
      dispatch(
        createProjectFromTemplate(
          getMatterIdFromLocation(location),
          selectedTemplate.id,
          { name: newWorkstreamName, isPrivate: makePrivate },
          true
        )
      )
        .then(response => {
          if (privateWorkstreamUsers.length > 0)
            dispatch(
              addMember(
                getMatterIdFromLocation(location),
                response.project.id,
                privateWorkstreamUsers
              )
            )
        })
        .then(() => {
          history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
            replace: true,
            state: { tabItem: 2 },
          })
          props.handleCloseDialog()
        })
    } else if (workstreamType === WORKSTREAM_TYPE.BLANK) {
      dispatch(
        createProject(getMatterIdFromLocation(location), {
          name: newWorkstreamName,
          isPrivate: makePrivate,
        })
      )
        .then(response => {
          if (privateWorkstreamUsers.length > 0)
            dispatch(
              addMember(
                getMatterIdFromLocation(location),
                response.project.id,
                privateWorkstreamUsers
              )
            )
        })
        .then(() => {
          history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
            replace: true,
            state: { tabItem: 2 },
          })
          props.handleCloseDialog()
        })
    } else if (workstreamType === WORKSTREAM_TYPE.SPLIT) {
      props.setTaskmapFilters()
      setShowSplitOriginalWorkstreamFlow(true)
    }
  }

  const firstCreationHandleAction = () => {
    setShowLoadingBar(true)
    if (originalWorkstreamName === newWorkstreamName) {
      setNewWorkstreamNameError(t('projectCreation.error'))
      setShowLoadingBar(false)
    } else {
      if (
        selectedTemplate &&
        workstreamType === WORKSTREAM_TYPE.FROM_TEMPLATE
      ) {
        renameWorkstream().then(() => {
          dispatch(
            createProjectFromTemplate(
              getMatterIdFromLocation(location),
              selectedTemplate.id,
              { name: newWorkstreamName, isPrivate: makePrivate },
              true
            )
          )
            .then(response => {
              if (privateWorkstreamUsers.length > 0)
                dispatch(
                  addMember(
                    getMatterIdFromLocation(location),
                    response.project.id,
                    privateWorkstreamUsers
                  )
                )
            })
            .then(() => {
              history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
                replace: true,
                state: { tabItem: 2 },
              })
              props.handleCloseDialog()
            })
        })
      } else if (workstreamType === WORKSTREAM_TYPE.BLANK) {
        renameWorkstream().then(() => {
          dispatch(
            createProject(getMatterIdFromLocation(location), {
              name: newWorkstreamName,
              isPrivate: makePrivate,
            })
          )
            .then(response => {
              if (privateWorkstreamUsers.length > 0)
                dispatch(
                  addMember(
                    getMatterIdFromLocation(location),
                    response.project.id,
                    privateWorkstreamUsers
                  )
                )
            })
            .then(() => {
              history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
                replace: true,
                state: { tabItem: 2 },
              })
              props.handleCloseDialog()
            })
        })
      } else if (workstreamType === WORKSTREAM_TYPE.SPLIT) {
        props.setTaskmapFilters()
        setShowSplitOriginalWorkstreamFlow(true)
      }
    }
  }

  return (
    <div>
      {!showSelectTemplate && (
        <JuralioDialog
          handleAction={() =>
            props.firstCreation ? firstCreationHandleAction() : handleAction()
          }
          handleCancel={props.handleCloseDialog}
          onClose={props.handleCloseDialog}
          open={true}
          disabled={shouldBeDisabled}
          actionLabel={t('common.confirm')}
          titleIcon={WorkstreamIcon}
          titleText={t('projectCreation.dialogTitle')}
          fullScreen={isMobileView}
          showLoadingBar={!nameError && showLoadingBar}
          loadingText={t('projectCreation.loadingText')}
          context={originalWorkstreamName}
          largeSize={true}
        >
          <DialogContent classes={{ root: classes.dialogContent }}>
            {props.firstCreation && (
              <Card classes={{ root: classes.card }} variant="outlined">
                <CardContent classes={{ root: classes.cardContent }}>
                  <Typography
                    variant="overline"
                    className={classes.title}
                    gutterBottom
                  >
                    {t('projectCreation.originalWorkstream')}
                  </Typography>
                  <Typography
                    variant="caption"
                    gutterBottom
                    className={classes.subtitle}
                  >
                    {t('projectCreation.originalWorkstreamHelperText')}
                  </Typography>
                  <TextField
                    error={originalWorkstreamNameError}
                    helperText={originalWorkstreamNameError}
                    className={classes.workstreamNameInput}
                    value={originalWorkstreamName}
                    onChange={e => {
                      setOriginalWorkstreamName(e.target.value)
                      setOriginalWorkstreamNameError(
                        validateInput(e.target.value) ? null : 'Error'
                      )
                    }}
                    label={t('projectCreation.workstreamNamePrompt')}
                    data-test="workstream-name"
                    slotProps={{
                      htmlInput: {
                        maxLength: MAX_FIELD_LENGTHS.PROJECT_NAME,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card
              classes={{ root: classes.card }}
              variant="outlined"
              className={classes.workstreamButtons}
            >
              <CardContent classes={{ root: classes.cardContent }}>
                <Typography
                  variant="overline"
                  gutterBottom
                  className={classes.title}
                >
                  {t('projectCreation.newWorkstream')}
                </Typography>{' '}
                <TextField
                  error={newWorkstreamNameError}
                  helperText={newWorkstreamNameError}
                  className={classes.workstreamNameInput}
                  value={newWorkstreamName}
                  onChange={e => {
                    setNewWorkstreamName(e.target.value)
                    setNewWorkstreamNameError(
                      validateInput(e.target.value) ? null : 'Error'
                    )
                    setNameError(false)
                  }}
                  label={t('projectCreation.workstreamNamePrompt')}
                  data-test="workstream-name"
                  slotProps={{
                    htmlInput: {
                      maxLength: MAX_FIELD_LENGTHS.PROJECT_NAME,
                    },
                  }}
                />
                {nameError && (
                  <div className={classes.errorMessage}>
                    <ErrorIcon fontSize="small" className={classes.errorIcon} />
                    <Typography className={classes.error}>
                      {t('projectCreation.projectNameUniquePerMatter')}
                    </Typography>
                  </div>
                )}
                <CreateProjectButtons
                  projectType={workstreamType}
                  projectBlank={workstreamBlank}
                  projectTemplate={workstreamTemplate}
                  projectSplit={workstreamSplit}
                  templates={templates}
                  classes={classes}
                  showSplit={showSplit}
                  disabled={shouldBeDisabled}
                  isFirstWorkstreamToBeCreated={workstreams.length === 1}
                  cardSize="small"
                />
              </CardContent>
              {workstreamType === WORKSTREAM_TYPE.SPLIT && (
                <>
                  <Divider />
                  <Select
                    defaultValue={'default'}
                    className={classes.projectSelectDiv}
                    onChange={e => {
                      setOriginalWorkstreamName(e.target.value.name)
                      setSelectedSplitWorkstream(e.target.value)
                    }}
                    value={selectedSplitWorkstream}
                    data-test="split-workstream-select"
                  >
                    <MenuItem value={'default'} disabled>
                      {t('projectCreation.projectSplitSelect')}
                    </MenuItem>
                    {availableWorkstreams.map(workstream => (
                      <MenuItem
                        key={workstream.id}
                        value={workstream}
                        data-test="split-workstream-option"
                      >
                        {workstream.name}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            </Card>
            <div>
              <CreatePrivateWorkstreamContainer
                setPrivateWorkstreamUsers={setPrivateWorkstreamUsers}
                handleWorkstreamIsPrivateChange={setMakePrivate}
                workstreamIsPrivate={makePrivate}
              />
            </div>
          </DialogContent>
        </JuralioDialog>
      )}
      {showSelectTemplate && (
        <JuralioDialog
          disabled={!highlightedTemplate}
          open={true}
          titleText={
            <div className={classes.dialogHeader}>
              <IconButton
                data-test="back-button"
                className={classes.backButton}
                onClick={() => goBack()}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
              <MattersIcon fontSize="large" />
              <Typography className={classes.dialogHeaderTitle} variant="h6">
                {t('matterDetails.dialogTitle')}
              </Typography>
            </div>
          }
          titleIcon={null}
          handleCancel={props.handleCloseDialog}
          onClose={props.handleCloseDialog}
          actionLabel={t('matterDetails.useButton')}
          handleAction={handleUseTemplate}
          fullScreen={isMobileView}
          context={'templatelistselection'}
        >
          <DialogContent data-test="dialog-content">
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
                  {t('templateOverview.goToTemplates')}
                </Link>
              </div>
              <div className={classes.content}>
                <List className={classes.list}>{list}</List>
              </div>
            </>
          </DialogContent>
        </JuralioDialog>
      )}
      {showSplitOriginalWorkstreamFlow && (
        <CreateWorkstreamFromWorkstreamFlowContainer
          cancelHandler={cancelHandler}
          originalWorkstreamName={originalWorkstreamName}
          newWorkstreamName={newWorkstreamName}
          privateWorkstreamUsers={privateWorkstreamUsers}
          isWorkstreamPrivate={makePrivate}
          workstreamId={selectedSplitWorkstream.id}
        />
      )}
    </div>
  )
}

export default CreateWorkstreamAdminDialog
