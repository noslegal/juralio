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
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { canInteractWithPrivateWorkstream } from '../../../../services/helpers/user/user-helper'
import juralioColours from '../../../../theme/juralio-colours'
import { WorkstreamIcon } from '../../../../theme/navigation/CommonIcons'
import { MAX_FIELD_LENGTHS, USER_ROLES } from '../../../constants'
import TemplateCard from '../../../template-list/template-card/TemplateCard'
import { fetchTemplates } from '../../../template-list/template-list-actions'
import TemplateFilterButton from '../../../template-list/TemplateFilterButton'
import CreatePrivateWorkstreamContainer from './CreatePrivateWorkstreamContainer'
import SearchFilter from '../../../template-list/SearchFilter'

const useStyles = makeStyles()(theme => ({
  content: {
    maxHeight: theme.spacing(40),
    overflowY: 'auto',
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
  projectSelectDiv: {
    width: '95%',
  },
  link: {
    cursor: 'pointer',
    paddingRight: '8px',
    paddingLeft: '280px',
  },
}))

const PROJECT_TYPE = {
  BLANK: 'BLANK',
  FROM_TEMPLATE: 'FROM_TEMPLATE',
  SPLIT: 'SPLIT',
}

const CreateProjectDialog = props => {
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const templates = useSelector(state => state.templates.templates)
  const workstreams = useSelector(state => state.projects.items)
  const currentUser = useSelector(state => state.auth.data.details)
  const [highlightedTemplate, setHighlightedTemplate] = useState(undefined)
  const [filterString, setFilterString] = useState('')
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState(0)
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
        if (workstream.tasks) {
          taskCount = workstream.tasks.length
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

  const handleSplit = e => {
    props.setSelectedWorkstream(e.target.value.id)
  }

  const handleUseTemplate = () => {
    props.setSelectedTemplate(highlightedTemplate)
    props.setSelectTemplate(false)
    props.setProjectName(highlightedTemplate.name)
  }

  const isDisabled = () => {
    if (props.projectName === '') {
      return true
    }
    if (
      props.workstreamIsPrivate === true &&
      props.privateWorkstreamUsers.length === 0
    ) {
      return true
    } else {
      return false
    }
  }

  useEffect(() => {
    dispatch(fetchTemplates())
  }, [dispatch])

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

  const templateList = templates
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

  return (
    <div>
      {props.projectType === PROJECT_TYPE.FROM_TEMPLATE &&
        props.selectTemplate === true && (
          <JuralioDialog
            open={props.showDialog}
            titleText={t('projectCreation.dialogTitleTemplate')}
            titleIcon={WorkstreamIcon}
            handleCancel={props.handleCloseDialog}
            onClose={props.handleCloseDialog}
            actionLabel={t('projectCreation.buttonTemp')}
            handleAction={handleUseTemplate}
            fullScreen={isMobileView}
            disabled={highlightedTemplate === undefined}
          >
            <DialogContent>
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
                  <List className={classes.list}>{templateList}</List>
                </div>
              </>
            </DialogContent>
          </JuralioDialog>
        )}
      {props.projectType === PROJECT_TYPE.FROM_TEMPLATE &&
        props.selectTemplate === false && (
          <JuralioDialog
            largeSize={true}
            open={props.showDialog}
            titleText={
              <div className={classes.dialogHeader}>
                <IconButton
                  data-test="back-button"
                  className={classes.backButton}
                  onClick={() => {
                    props.setSelectedTemplate(undefined)
                    setHighlightedTemplate(undefined)
                    props.setSelectTemplate(true)
                    props.setNameError(false)
                  }}
                  size="large"
                >
                  <ArrowBackIcon />
                </IconButton>
                <WorkstreamIcon fontSize="large" />
                <Typography className={classes.dialogHeaderTitle} variant="h6">
                  {t('projectCreation.dialogTitleName')}
                </Typography>
              </div>
            }
            handleCancel={props.handleCloseDialog}
            onClose={props.handleCloseDialog}
            disabled={props.projectName === ''}
            actionLabel={t('projectCreation.button')}
            handleAction={props.handleAction}
            fullScreen={isMobileView}
            showLoadingBar={!props.nameError && props.showLoadingBar}
            loadingText={t('projectCreation.loadingText')}
          >
            <DialogContent data-test="dialog-content">
              <TextField
                value={props.projectName}
                className={classes.Textbox}
                onChange={props.onProjectNameChange}
                label={t('projectCreation.projectName')}
                placeholder={t('projectCreation.projectPlaceholder')}
                data-test="name"
                slotProps={{
                  htmlInput: {
                    maxLength: MAX_FIELD_LENGTHS.PROJECT_NAME,
                  },
                }}
              />
              {props.nameError && (
                <div className={classes.errorMessage}>
                  <ErrorIcon fontSize="small" className={classes.errorIcon} />
                  <Typography className={classes.error}>
                    {t('projectCreation.projectNameUniquePerMatter')}
                  </Typography>
                </div>
              )}
              <CreatePrivateWorkstreamContainer
                setPrivateWorkstreamUsers={props.setPrivateWorkstreamUsers}
                handleWorkstreamIsPrivateChange={
                  props.handleWorkstreamIsPrivateChange
                }
                workstreamIsPrivate={props.workstreamIsPrivate}
              />
            </DialogContent>
          </JuralioDialog>
        )}
      {props.projectType === PROJECT_TYPE.BLANK && (
        <JuralioDialog
          largeSize={true}
          open={props.showDialog}
          titleText={t('projectCreation.dialogTitleName')}
          titleIcon={WorkstreamIcon}
          handleCancel={props.handleCloseDialog}
          onClose={props.handleCloseDialog}
          actionLabel={t('projectCreation.button')}
          handleAction={props.handleAction}
          disabled={isDisabled()}
          fullScreen={isMobileView}
          showLoadingBar={!props.nameError && props.showLoadingBar}
          loadingText={t('projectCreation.loadingText')}
        >
          <DialogContent data-test="dialog-content">
            <TextField
              value={props.projectName}
              className={classes.Textbox}
              onChange={props.onProjectNameChange}
              label={t('projectCreation.projectName')}
              placeholder={t('projectCreation.projectPlaceholder')}
              data-test="name"
              slotProps={{
                htmlInput: {
                  maxLength: MAX_FIELD_LENGTHS.PROJECT_NAME,
                },
              }}
            />
            {props.nameError && (
              <div className={classes.errorMessage}>
                <ErrorIcon fontSize="small" className={classes.errorIcon} />
                <Typography className={classes.error}>
                  {t('projectCreation.projectNameUniquePerMatter')}
                </Typography>
              </div>
            )}
            <CreatePrivateWorkstreamContainer
              setPrivateWorkstreamUsers={props.setPrivateWorkstreamUsers}
              handleWorkstreamIsPrivateChange={
                props.handleWorkstreamIsPrivateChange
              }
              workstreamIsPrivate={props.workstreamIsPrivate}
            />
          </DialogContent>
        </JuralioDialog>
      )}
      {props.projectType === PROJECT_TYPE.SPLIT && (
        <JuralioDialog
          largeSize={true}
          open={props.showDialog}
          titleText={t('projectCreation.dialogSplitTitle')}
          titleIcon={WorkstreamIcon}
          handleCancel={props.handleCloseDialog}
          onClose={props.handleCloseDialog}
          actionLabel={t('projectCreation.button')}
          handleAction={props.handleAction}
          disabled={!props.selectedWorkstream || props.projectName === ''}
          fullScreen={isMobileView}
          showLoadingBar={!props.nameError && props.showLoadingBar}
          loadingText={t('projectCreation.loadingText')}
        >
          <DialogContent data-test="dialog-content">
            <Select
              defaultValue={'default'}
              className={classes.projectSelectDiv}
              onChange={handleSplit}
              value={props.selectedWorkstream.name}
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
            <TextField
              value={props.projectName}
              className={classes.Textbox}
              onChange={props.onProjectNameChange}
              label={t('projectCreation.projectName')}
              placeholder={t('projectCreation.projectPlaceholder')}
              data-test="name"
              slotProps={{
                htmlInput: {
                  maxLength: MAX_FIELD_LENGTHS.PROJECT_NAME,
                },
              }}
            />
            {props.nameError && (
              <div className={classes.errorMessage}>
                <ErrorIcon fontSize="small" className={classes.errorIcon} />
                <Typography className={classes.error}>
                  {t('projectCreation.projectNameUniquePerMatter')}
                </Typography>
              </div>
            )}
            <CreatePrivateWorkstreamContainer
              setPrivateWorkstreamUsers={props.setPrivateWorkstreamUsers}
              handleWorkstreamIsPrivateChange={
                props.handleWorkstreamIsPrivateChange
              }
              workstreamIsPrivate={props.workstreamIsPrivate}
            />
          </DialogContent>
        </JuralioDialog>
      )}
    </div>
  )
}

export default CreateProjectDialog
