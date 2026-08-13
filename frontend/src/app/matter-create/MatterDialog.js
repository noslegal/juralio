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
  List,
  ListItem,
  useMediaQuery,
  useTheme,
  Link,
  Typography,
} from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import CreateProjectButtons from '../../components/flows/create-project-flow/CreateProjectButtons'
import LoadingScreen from '../../components/loading-screen/LoadingScreen'
import juralioColours from '../../theme/juralio-colours'
import { MattersIcon } from '../../theme/navigation/CommonIcons'
import TemplateCard from '../template-list/template-card/TemplateCard'
import { fetchTemplates } from '../template-list/template-list-actions'
import TemplateFilterButton from '../template-list/TemplateFilterButton'
import { USER_ROLES } from '../constants'
import { OpenInNewIcon } from '../../theme/navigation/CommonIcons'
import {
  getCancelButtonText,
  getConfirmButtonText,
  getTitle,
  MATTER_CREATION,
  PROJECT_TYPE,
} from './matter-dialog-helper'
import SearchFilter from '../template-list/SearchFilter'
import NewMatterDetailsDialog from './NewMatterDetailsDialog'

const useStyles = makeStyles()(theme => ({
  Textbox: {
    width: '95%',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  ProjectCard: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${juralioColours.hover.hover}`,
    },
  },
  cardSelected: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    backgroundColor: `${juralioColours.hover.hover}`,
  },

  disabledTemplateProjectCard: {
    width: '50%',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  dialogHeaderTitle: {
    paddingLeft: theme.spacing(1),
  },
  list: {
    backgroundColor: juralioColours.offWhite.b,
  },
  content: {
    height: theme.spacing(38),
    overflowY: 'scroll',
  },
  disabledText: {
    color: juralioColours.darkText.secondary,
    textAlign: 'center',
  },
  subTitle: {
    marginTop: '-24px',
    color: juralioColours.darkText.secondary,
  },
  link: {
    cursor: 'pointer',
    paddingRight: '8px',
    paddingLeft: '280px',
    paddingBottom: '2px',
  },
}))

const MatterDialog = props => {
  const {
    clientName,
    department,
    matterName,
    matterReferenceNumber,
    onClientChange,
    onDepartmentChange,
    onMatterChange,
    onMatterReferenceNumberChange,
    position,
    setPosition,
  } = props
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const templates = useSelector(state => state.templates)
  const [highlightedTemplate, setHighlightedTemplate] = useState(undefined)
  const [filterString, setFilterString] = useState('')
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState(0)
  const templateTypeEnum = {
    0: t('templates.filter.all'),
    1: t('templates.filter.organisation'),
    2: t('templates.filter.community'),
  }

  const [screen, setScreen] = useState('')
  const handleUseTemplate = () => {
    props.setSelectedTemplate(highlightedTemplate)
    props.showSelectTemplate(false)
    props.setProjectName(highlightedTemplate.name)
  }

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
    dispatch(fetchTemplates())
  }, [dispatch])

  useEffect(() => {
    if (screen === MATTER_CREATION.DEFAULT_LOADING_SCREEN) {
      props.onSubmit()
    }
  }, [screen]) //eslint-disable-line

  const createProjectFromBlank = () => {
    props.setProjectType(PROJECT_TYPE.BLANK)
    props.setProjectName(t('entity.workstream'))
    props.setSelectedTemplate(undefined)
    setHighlightedTemplate(undefined)
    setScreen(MATTER_CREATION.DEFAULT_LOADING_SCREEN)
  }

  const createFromTemplate = () => {
    setScreen(MATTER_CREATION.TEMPLATE_CHOICE)
    props.setProjectType(PROJECT_TYPE.FROM_TEMPLATE)
    props.showSelectTemplate(true)
  }

  const selectBlank = () => {
    setScreen(MATTER_CREATION.MATTER_DETAILS)
    props.setProjectType(PROJECT_TYPE.BLANK)
    props.setSelectedTemplate(undefined)
    setHighlightedTemplate(undefined)
  }

  const getScreen = () => {
    if (templateList.length !== 0 && screen === '') {
      setScreen(MATTER_CREATION.WORKFLOW_TYPE)
    } else if (screen === '') {
      setScreen(MATTER_CREATION.MATTER_DETAILS)
    }

    switch (screen) {
      case MATTER_CREATION.WORKFLOW_TYPE:
        return (
          <CreateProjectButtons
            projectType={props.projectType}
            projectBlank={selectBlank}
            projectTemplate={createFromTemplate}
            templates={templates.templates}
            classes={classes}
            showSplit={false}
            isFirstWorkstreamToBeCreated={true}
          />
        )
      case MATTER_CREATION.TEMPLATE_CHOICE:
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
      case MATTER_CREATION.DEFAULT_LOADING_SCREEN:
        return <LoadingScreen />
      case MATTER_CREATION.MATTER_DETAILS:
        return (
          <NewMatterDetailsDialog
            clientName={clientName}
            department={department}
            matterName={matterName}
            matterReferenceNumber={matterReferenceNumber}
            onClientChange={onClientChange}
            onDepartmentChange={onDepartmentChange}
            onMatterChange={onMatterChange}
            onMatterReferenceNumberChange={onMatterReferenceNumberChange}
            position={position}
            setPosition={setPosition}
            userData={props.userData}
          />
        )
      default:
        return <LoadingScreen />
    }
  }

  const handleCancelAction = () => {
    switch (screen) {
      case MATTER_CREATION.MATTER_TYPE:
        props.closeHandler()
        break
      case MATTER_CREATION.WORKFLOW_TYPE:
        props.closeHandler()
        break
      case MATTER_CREATION.TEMPLATE_CHOICE:
        setScreen(MATTER_CREATION.WORKFLOW_TYPE)
        props.setSelectedTemplate(undefined)
        setHighlightedTemplate(undefined)
        props.setProjectType('')
        props.showSelectTemplate(false)
        break
      case MATTER_CREATION.MATTER_DETAILS:
        if (templateList.length === 0) {
          props.closeHandler()
        } else {
          setScreen(MATTER_CREATION.WORKFLOW_TYPE)
          props.setProjectType('')
          props.setSelectedTemplate(undefined)
          setHighlightedTemplate(undefined)
          props.showSelectTemplate(false)
        }
        break
      default:
        setScreen(screen - 1)
        break
    }
  }

  const handleConfirmAction = () => {
    switch (screen) {
      case MATTER_CREATION.MATTER_TYPE:
        setScreen(MATTER_CREATION.WORKFLOW_TYPE)
        break

      case MATTER_CREATION.TEMPLATE_CHOICE:
        setScreen(MATTER_CREATION.MATTER_DETAILS)
        handleUseTemplate()
        break
      case MATTER_CREATION.MATTER_DETAILS:
        if (props.selectedTemplate) {
          setScreen(MATTER_CREATION.DEFAULT_LOADING_SCREEN)
        } else {
          createProjectFromBlank()
        }

        break
      default:
        setScreen(screen + 1)
    }
  }

  const isActionDisabled = () => {
    switch (screen) {
      case MATTER_CREATION.MATTER_TYPE:
        return false
      case MATTER_CREATION.DEFAULT_LOADING_SCREEN:
        return true
      case MATTER_CREATION.WORKFLOW_TYPE:
        return true
      case MATTER_CREATION.TEMPLATE_CHOICE:
        return highlightedTemplate === undefined
      case MATTER_CREATION.MATTER_DETAILS:
        return clientName === '' || matterName === ''
      default:
        return false
    }
  }

  const getProgressText = () => {
    switch (props.progress) {
      case 0:
        return t('templates.loading1')
      case 66:
        return t('templates.loading3')
      case 50:
        return t('templates.loading2')
      case 100:
        return t('templates.loading4')
      default:
        return t('matterCreation.creatingMatter')
    }
  }

  return templates.isLoaded === false ? (
    ''
  ) : (
    <JuralioDialog
      disabled={isActionDisabled()}
      open={true}
      titleText={getTitle(t, classes, screen)}
      titleIcon={MattersIcon}
      handleCancel={handleCancelAction}
      onClose={props.closeHandler}
      fullScreen={isMobileView}
      handleAction={handleConfirmAction}
      actionLabel={getConfirmButtonText(t, screen)}
      cancelText={getCancelButtonText(t, screen, props, templateList)}
      showLoadingBar={props.showLoadingBar}
      loadingText={
        props.progress ? getProgressText() : t('matterCreation.creatingMatter')
      }
      context={getTitle(t, classes, screen)}
      hideAction={
        screen === MATTER_CREATION.DEFAULT_LOADING_SCREEN ||
        screen === MATTER_CREATION.WORKFLOW_TYPE
      }
      hideCancel={screen === MATTER_CREATION.DEFAULT_LOADING_SCREEN}
      progress={props.progress}
    >
      <DialogContent data-test="dialog-content">{getScreen()}</DialogContent>
    </JuralioDialog>
  )
}

export default MatterDialog
